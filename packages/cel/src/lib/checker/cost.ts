/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
// WARNING: Any changes to cost calculations in this file require a corresponding change in interpreter/runtimecost.go

import { isNil } from '@bearclaw/is';
import { Expr } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { AST } from '../common/ast';
import {
  ConstCost,
  ListCreateBaseCost,
  MapCreateBaseCost,
  RegexStringLengthCostFactor,
  SelectAndIdentCost,
  StringTraversalCostFactor,
  StructCreateBaseCost,
} from '../common/cost';
import {
  ADD_BYTES_OVERLOAD,
  ADD_LIST_OVERLOAD,
  ADD_STRING_OVERLOAD,
  BYTES_TO_STRING_OVERLOAD,
  CONDITIONAL_OVERLOAD,
  CONTAINS_STRING_OVERLOAD,
  ENDS_WITH_STRING_OVERLOAD,
  EQUALS_OVERLOAD,
  EXT_FORMAT_STRING_OVERLOAD,
  EXT_QUOTE_STRING_OVERLOAD,
  GREATER_BYTES_OVERLOAD,
  GREATER_EQUALS_BYTES_OVERLOAD,
  GREATER_EQUALS_STRING_OVERLOAD,
  GREATER_STRING_OVERLOAD,
  IN_LIST_OVERLOAD,
  INDEX_LIST_OVERLOAD,
  INDEX_MAP_OVERLOAD,
  LESS_BYTES_OVERLOAD,
  LESS_EQUALS_BYTES_OVERLOAD,
  LESS_EQUALS_STRING_OVERLOAD,
  LESS_STRING_OVERLOAD,
  LOGICAL_AND_OVERLOAD,
  LOGICAL_OR_OVERLOAD,
  MATCHES_STRING_OVERLOAD,
  NOT_EQUALS_OVERLOAD,
  STARTS_WITH_STRING_OVERLOAD,
  STRING_TO_BYTES_OVERLOAD,
} from '../common/overloads';
import {
  isMapProtoExpr,
  isMessageProtoExpr,
  unwrapCallProtoExpr,
  unwrapComprehensionProtoExpr,
  unwrapIdentProtoExpr,
  unwrapListProtoExpr,
  unwrapMapProtoExpr,
  unwrapMessageFieldProtoExpr,
  unwrapSelectProtoExpr,
  unwrapStructProtoExpr,
} from '../common/pb/expressions';
import { Kind, Type } from '../common/types/types';
import { MAX_UINT64 } from '../common/types/uint';
import { AccumulatorName } from '../parser/macro';

/**
 * CostEstimator estimates the sizes of variable length input data and the
 * costs of functions.
 */
export interface CostEstimator {
  /**
   * EstimateSize returns a SizeEstimate for the given AstNode, or nil if the
   * estimator has no estimate to provide. The size is equivalent to the result
   * of the CEL `size()` function: length of strings and bytes, number of map
   * entries or number of list items. EstimateSize is only called for AstNodes
   * where CEL does not know the size; EstimateSize is not called for values
   * defined inline in CEL where the size is already obvious to CEL.
   */
  estimateSize(element: AstNode): SizeEstimate | null;

  /**
   * EstimateCallCost returns the estimated cost of an invocation, or nil if the estimator has no estimate to provide.
   */
  estimateCallCost(
    fn: string,
    overloadID: string,
    target: AstNode,
    args: AstNode[]
  ): CallEstimate | null;
}

/**
 * CallEstimate includes a CostEstimate for the call, and an optional estimate
 * of the result object size. The ResultSize should only be provided if the
 * call results in a map, list, string or bytes.
 */
export class CallEstimate {
  constructor(public cost: CostEstimate, public resultSize?: SizeEstimate) {}
}

/**
 * AstNode represents an AST node for the purpose of cost estimations.
 */
export class AstNode {
  private _path: string[];
  private _type: Type;
  private _expr: Expr;
  private _derivedSize?: SizeEstimate;

  constructor(
    path: string[],
    type: Type,
    expr: Expr,
    derivedSize?: SizeEstimate
  ) {
    this._path = path;
    this._type = type;
    this._expr = expr;
    this._derivedSize = derivedSize;
  }

  /**
   * Path returns a field path through the provided type declarations to the
   * type of the AstNode, or nil if the AstNode does not represent type
   * directly reachable from the provided type declarations. The first path
   * element is a variable. All subsequent path elements are one of: field
   * name, '@items', '@keys', '@values'.
   */
  path(): string[] {
    return this._path;
  }

  /**
   * Type returns the deduced type of the AstNode.
   */
  type(): Type {
    return this._type;
  }

  /**
   * Expr returns the expression of the AstNode.
   */
  expr(): Expr {
    return this._expr;
  }

  /**
   * ComputedSize returns a size estimate of the AstNode derived from
   * information available in the CEL expression. For constants and inline list
   * and map declarations, the exact size is returned. For concatenated list,
   * strings and bytes, the size is derived from the size estimates of the
   * operands. nil is returned if there is no computed size available.
   */
  computedSize(): SizeEstimate | null {
    if (!isNil(this._derivedSize)) {
      return this._derivedSize;
    }

    let v: bigint;
    switch (this._expr.exprKind.case) {
      case 'constExpr':
        switch (this._expr.exprKind.value.constantKind.case) {
          case 'stringValue':
            v = BigInt(this._expr.exprKind.value.constantKind.value.length);
            break;
          case 'bytesValue':
            v = BigInt(this._expr.exprKind.value.constantKind.value.length);
            break;
          case 'boolValue':
          case 'doubleValue':
          case 'durationValue':
          case 'int64Value':
          case 'nullValue':
          case 'timestampValue':
          case 'uint64Value':
            v = BigInt(1);
            break;
          default:
            return null;
        }
        break;
      case 'listExpr':
        v = BigInt(this._expr.exprKind.value.elements.length);
        break;
      case 'structExpr':
        if (isMapProtoExpr(this._expr)) {
          v = BigInt(this._expr.exprKind.value.entries.length);
        } else {
          return null;
        }
        break;
      default:
        return null;
    }
    return new SizeEstimate(v, v);
  }
}

/**
 * SizeEstimate represents an estimated size of a variable length string,
 * bytes, map or list.
 */
export class SizeEstimate {
  constructor(public min: bigint, public max: bigint) {}

  /**
   *  Add adds to another SizeEstimate and returns the sum.
   *
   * If add would result in an uint64 overflow, the result is math.MaxUint64.
   */
  add(other: SizeEstimate): SizeEstimate {
    return new SizeEstimate(
      addUint64NoOverflow(this.min, other.min),
      addUint64NoOverflow(this.max, other.max)
    );
  }

  /**
   * Multiply multiplies by another SizeEstimate and returns the product.
   *
   * If multiply would result in an uint64 overflow, the result is
   * math.MaxUint64.
   */
  multiply(other: SizeEstimate): SizeEstimate {
    return new SizeEstimate(
      multiplyUint64NoOverflow(this.min, other.min),
      multiplyUint64NoOverflow(this.max, other.max)
    );
  }

  /**
   * MultiplyByCostFactor multiplies a SizeEstimate by a cost factor and
   * returns the CostEstimate with the nearest integer of the result, rounded
   * up.
   */
  multiplyByCostFactor(factor: number): SizeEstimate {
    return new SizeEstimate(
      multiplyByCostFactor(this.min, factor),
      multiplyByCostFactor(this.max, factor)
    );
  }

  /**
   * MultiplyByCost multiplies by the cost and returns the product.
   *
   * If multiply would result in an uint64 overflow, the result is
   * math.MaxUint64.
   */
  multiplyByCost(cost: CostEstimate): CostEstimate {
    return new CostEstimate(
      multiplyUint64NoOverflow(this.min, cost.min),
      multiplyUint64NoOverflow(this.max, cost.max)
    );
  }

  /**
   * Union returns a SizeEstimate that encompasses both input the SizeEstimate.
   */
  union(other: SizeEstimate): SizeEstimate {
    return new SizeEstimate(
      this.min < other.min ? this.min : other.min,
      this.max > other.max ? this.max : other.max
    );
  }
}

/**
 * CostEstimate represents an estimated cost range and provides add and
 * multiply operations that do not overflow.
 */
export class CostEstimate {
  constructor(public min: bigint, public max: bigint) {}

  /**
   * Add adds the costs and returns the sum.
   *
   * If add would result in an uint64 overflow for the min or max, the value is
   * set to math.MaxUint64.
   */
  add(other: CostEstimate): CostEstimate {
    return new CostEstimate(
      addUint64NoOverflow(this.min, other.min),
      addUint64NoOverflow(this.max, other.max)
    );
  }

  /**
   * Multiply multiplies by the cost and returns the product.
   *
   * If multiply would result in an uint64 overflow, the result is math.MaxUint64.
   */
  multiply(factor: number): CostEstimate {
    return new CostEstimate(
      multiplyByCostFactor(this.min, factor),
      multiplyByCostFactor(this.max, factor)
    );
  }

  /**
   * MultiplyByCostFactor multiplies a CostEstimate by a cost factor and
   * returns the CostEstimate with the nearest integer of the result, rounded
   * up.
   */
  multiplyByCostFactor(factor: number): CostEstimate {
    return new CostEstimate(
      multiplyByCostFactor(this.min, factor),
      multiplyByCostFactor(this.max, factor)
    );
  }

  /**
   * Union returns a CostEstimate that encompasses both input the CostEstimates.
   */
  union(other: CostEstimate): CostEstimate {
    return new CostEstimate(
      this.min < other.min ? this.min : other.min,
      this.max > other.max ? this.max : other.max
    );
  }
}

/**
 * addUint64NoOverflow adds non-negative ints. If the result is exceeds math
 * MaxUint64, math.MaxUint64 is returned.
 */
function addUint64NoOverflow(x: bigint, y: bigint): bigint {
  if (x > MAX_UINT64 - y) {
    return MAX_UINT64;
  }
  return x + y;
}

/**
 * multiplyUint64NoOverflow multiplies non-negative ints. If the result is
 * exceeds math.MaxUint64, math.MaxUint64 is returned.
 */
function multiplyUint64NoOverflow(x: bigint, y: bigint): bigint {
  if (x > 0 && y > 0 && x > MAX_UINT64 / y) {
    return MAX_UINT64;
  }
  return x * y;
}

/**
 * multiplyByFactor multiplies an integer by a cost factor float and returns
 * the nearest integer value, rounded up.
 */
function multiplyByCostFactor(x: bigint, y: number): bigint {
  // TODO: don't love this. Will probably lose precision.
  const xFloat = Number(x);
  if (xFloat > 0 && y > 0 && xFloat > Number(MAX_UINT64) / y) {
    return MAX_UINT64;
  }
  const ceil = Math.ceil(xFloat * y);
  if (ceil >= MAX_UINT64) {
    return MAX_UINT64;
  }
  return BigInt(ceil);
}

/**
 * Use a stack of iterVar -> iterRange Expr Ids to handle shadowed variable names.
 */
class IterRangeScopes {
  constructor(public value: Map<string, bigint[]> = new Map()) {}

  push(varName: string, expr: Expr) {
    const vs = this.value.get(varName) ?? [];
    vs.push(expr.id);
    this.value.set(varName, vs);
  }

  pop(varName: string) {
    const vs = this.value.get(varName);
    if (!isNil(vs)) {
      // Remove the last element of the array
      this.value.set(varName, vs.slice(0, vs.length - 1));
    }
  }

  peek(varName: string): bigint | null {
    const vs = this.value.get(varName);
    if (!isNil(vs) && vs.length > 0) {
      return vs[vs.length - 1];
    }
    return null;
  }
}

/**
 * FunctionEstimator provides a CallEstimate given the target and arguments for
 * a specific function, overload pair.
 */
type FunctionEstimator = (
  estimator: CostEstimator,
  target: AstNode,
  args: AstNode[]
) => CallEstimate;

export const selectAndIdentCost = new CostEstimate(
  BigInt(SelectAndIdentCost),
  BigInt(SelectAndIdentCost)
);
export const constCost = new CostEstimate(BigInt(ConstCost), BigInt(ConstCost));

export const createListBaseCost = new CostEstimate(
  BigInt(ListCreateBaseCost),
  BigInt(ListCreateBaseCost)
);
export const createMapBaseCost = new CostEstimate(
  BigInt(MapCreateBaseCost),
  BigInt(MapCreateBaseCost)
);
export const createMessageBaseCost = new CostEstimate(
  BigInt(StructCreateBaseCost),
  BigInt(StructCreateBaseCost)
);

export interface CosterOptions {
  /**
   * PresenceTestHasCost determines whether presence testing has a cost of one
   * or zero.
   *
   * Defaults to presence test has a cost of one.
   */
  presenceTestHasCost?: boolean;

  /**
   * OverloadCostEstimate binds a FunctionCoster to a specific function
   * overload ID.
   *
   * When a OverloadCostEstimate is provided, it will override the cost
   * calculation of the CostEstimator provided to the Cost() call.
   */
  overloadCostEstimates?: Map<string, FunctionEstimator>;
}

/**
 * Cost estimates the cost of the parsed and type checked CEL expression.
 */
export class Coster {
  /**
   * exprPath maps from Expr Id to field path.
   */
  #exprPath: Map<bigint, string[]>;
  /**
   * iterRanges tracks the iterRange of each iterVar.
   */
  #iterRanges: IterRangeScopes;
  /**
   * computedSizes tracks the computed sizes of call results.
   */
  #computedSizes: Map<bigint, SizeEstimate>;
  #checkedAst: AST;
  #estimator: CostEstimator;
  #overloadEstimators: Map<string, FunctionEstimator>;
  /**
   * presenceTestCost will either be a zero or one based on whether has()
   * macros count against cost computations.
   */
  #presenceTestCost: CostEstimate;
  #cachedCost?: CostEstimate;

  constructor(checked: AST, estimator: CostEstimator, options?: CosterOptions) {
    this.#checkedAst = checked;
    this.#estimator = estimator;
    this.#overloadEstimators = new Map();
    this.#exprPath = new Map();
    this.#iterRanges = new IterRangeScopes();
    this.#computedSizes = new Map();

    if (options?.presenceTestHasCost === false) {
      this.#presenceTestCost = new CostEstimate(BigInt(0), BigInt(0));
    } else {
      this.#presenceTestCost = new CostEstimate(BigInt(1), BigInt(1));
    }

    const overloadCostEstimates = options?.overloadCostEstimates ?? new Map();
    for (const [overloadID, estimator] of overloadCostEstimates) {
      this.#overloadEstimators.set(overloadID, estimator);
    }
  }

  cost(): CostEstimate {
    if (isNil(this.#cachedCost)) {
      this.#cachedCost = this.#costExpr(this.#checkedAst.expr());
    }
    return this.#cachedCost;
  }

  #costExpr(e: Expr): CostEstimate {
    let cost: CostEstimate;
    switch (e.exprKind.case) {
      case 'constExpr':
        cost = constCost;
        break;
      case 'identExpr':
        cost = this.#costIdent(e);
        break;
      case 'selectExpr':
        cost = this.#costSelect(e);
        break;
      case 'callExpr':
        cost = this.#costCall(e);
        break;
      case 'listExpr':
        cost = this.#costCreateList(e);
        break;
      case 'structExpr':
        if (isMapProtoExpr(e)) {
          cost = this.#costCreateMap(e);
          break;
        }
        if (isMessageProtoExpr(e)) {
          cost = this.#costCreateStruct(e);
          break;
        }
        throw new Error('costExpr: expected map or struct');
      case 'comprehensionExpr':
        cost = this.#costComprehension(e);
        break;
      default:
        return new CostEstimate(BigInt(0), BigInt(0));
    }
    return cost;
  }

  #costIdent(e: Expr): CostEstimate {
    const ident = unwrapIdentProtoExpr(e);
    if (isNil(ident)) {
      throw new Error('costIdent: expected ident');
    }
    const identName = ident.name;
    // build and track the field path
    const iterRange = this.#iterRanges.peek(identName);
    if (!isNil(iterRange)) {
      switch (this.#checkedAst.getType(iterRange)?.kind()) {
        case Kind.LIST:
          this.#addPath(e, [
            ...(this.#exprPath?.get(iterRange) ?? []),
            '@items',
          ]);
          break;
        case Kind.MAP:
          this.#addPath(e, [
            ...(this.#exprPath?.get(iterRange) ?? []),
            '@keys',
          ]);
          break;
        default:
          break;
      }
    } else {
      this.#addPath(e, [identName]);
    }
    return selectAndIdentCost;
  }

  #costSelect(e: Expr): CostEstimate {
    const sel = unwrapSelectProtoExpr(e);
    if (isNil(sel)) {
      throw new Error('costSelect: expected select');
    }
    let sum = new CostEstimate(BigInt(0), BigInt(0));
    if (sel.testOnly) {
      // recurse, but do not add any cost
      // this is equivalent to how evalTestOnly increments the runtime cost
      // counter but does not add any additional cost for the qualifier, except
      // here we do the reverse (ident adds cost)
      sum = sum.add(this.#presenceTestCost);
      sum = sum.add(this.#costExpr(sel.operand!));
      return sum;
    }
    sum = sum.add(this.#costExpr(sel.operand!));
    const targetType = this.#getType(sel.operand!);
    switch (targetType?.kind()) {
      case Kind.MAP:
      case Kind.STRUCT:
      case Kind.TYPEPARAM:
        sum = sum.add(selectAndIdentCost);
        break;
      default:
        break;
    }

    // build and track the field path
    this.#addPath(e, [...(this.#getPath(sel.operand!) ?? []), sel.field]);

    return sum;
  }

  #costCall(e: Expr): CostEstimate {
    const call = unwrapCallProtoExpr(e);
    if (isNil(call)) {
      throw new Error('costCall: expected call');
    }
    const args = call.args;

    let sum = new CostEstimate(BigInt(0), BigInt(0));

    const argTypes: AstNode[] = [];
    const argCosts: CostEstimate[] = [];
    for (const arg of args) {
      argCosts.push(this.#costExpr(arg));
      argTypes.push(this.#newAstNode(arg));
    }

    const overloadIDs = this.#checkedAst.getOverloadIDs(e.id);
    if (overloadIDs.length === 0) {
      return new CostEstimate(BigInt(0), BigInt(0));
    }

    let targetType: AstNode | null = null;
    if (!isNil(call.target)) {
      sum = sum.add(this.#costExpr(call.target));
      targetType = this.#newAstNode(call.target);
    }
    // Pick a cost estimate range that covers all the overload cost estimation
    // ranges
    let fnCost = new CostEstimate(MAX_UINT64, BigInt(0));
    let resultSize = new SizeEstimate(BigInt(0), BigInt(0));
    for (const overload of overloadIDs) {
      const overloadCost = this.#functionCost(
        call.function!,
        overload,
        targetType!,
        argTypes,
        argCosts
      );
      fnCost = fnCost.union(overloadCost.cost);
      if (!isNil(overloadCost.resultSize)) {
        if (isNil(resultSize)) {
          resultSize = overloadCost.resultSize;
        } else {
          resultSize = resultSize.union(overloadCost.resultSize);
        }
      }
      // build and track the field path for index operations
      switch (overload) {
        case INDEX_LIST_OVERLOAD:
          if (args.length > 0) {
            this.#addPath(e, [...(this.#getPath(args[0]) ?? []), '@items']);
          }
          break;
        case INDEX_MAP_OVERLOAD:
          if (args.length > 0) {
            this.#addPath(e, [...(this.#getPath(args[0]) ?? []), '@keys']);
          }
          break;
        default:
          break;
      }
    }
    if (!isNil(resultSize)) {
      this.#computedSizes.set(e.id, resultSize);
    }
    return sum.add(fnCost);
  }

  #costCreateList(e: Expr): CostEstimate {
    const create = unwrapListProtoExpr(e);
    if (isNil(create)) {
      throw new Error('costCreateList: expected list');
    }
    let sum = new CostEstimate(BigInt(0), BigInt(0));
    for (const elem of create.elements) {
      sum = sum.add(this.#costExpr(elem));
    }
    return sum.add(createListBaseCost);
  }

  #costCreateMap(e: Expr): CostEstimate {
    const mapVal = unwrapMapProtoExpr(e);
    if (isNil(mapVal)) {
      throw new Error('costCreateMap: expected map');
    }
    let sum = new CostEstimate(BigInt(0), BigInt(0));
    for (const entry of mapVal.entries) {
      sum = sum.add(this.#costExpr(entry.keyKind.value));
      if (!isNil(entry.value)) {
        sum = sum.add(this.#costExpr(entry.value));
      }
    }
    return sum.add(createMapBaseCost);
  }

  #costCreateStruct(e: Expr): CostEstimate {
    const msgVal = unwrapStructProtoExpr(e);
    if (isNil(msgVal)) {
      throw new Error('costCreateStruct: expected struct');
    }
    let sum = new CostEstimate(BigInt(0), BigInt(0));
    for (const entry of msgVal.entries) {
      const field = unwrapMessageFieldProtoExpr(entry);
      if (!isNil(field?.value)) {
        sum = sum.add(this.#costExpr(field.value));
      }
    }
    return sum.add(createMessageBaseCost);
  }

  #costComprehension(e: Expr): CostEstimate {
    const comp = unwrapComprehensionProtoExpr(e);
    if (isNil(comp)) {
      throw new Error('costComprehension: expected comprehension');
    }
    let sum = new CostEstimate(BigInt(0), BigInt(0));
    sum = sum.add(this.#costExpr(comp.iterRange!));
    sum = sum.add(this.#costExpr(comp.accuInit!));

    // Track the iterRange of each IterVar for field path construction
    this.#iterRanges.push(comp.iterVar, comp.iterRange!);
    const loopCost = this.#costExpr(comp.loopCondition!);
    const stepCost = this.#costExpr(comp.loopStep!);
    this.#iterRanges.pop(comp.iterVar);
    sum = sum.add(this.#costExpr(comp.result!));
    const rangeCnt = this.#sizeEstimate(this.#newAstNode(comp.iterRange!));

    this.#computedSizes.set(e.id, rangeCnt);

    const rangeCost = rangeCnt.multiplyByCost(stepCost.add(loopCost));
    sum = sum.add(rangeCost);

    return sum;
  }

  #sizeEstimate(t: AstNode): SizeEstimate {
    const computed = t.computedSize();
    if (!isNil(computed)) {
      return computed;
    }
    const estimated = this.#estimator.estimateSize(t);
    if (!isNil(estimated)) {
      return estimated;
    }
    // return an estimate of 1 for return types of set lengths, since strings
    // bytes/more complex objects could be of variable length
    if (isScalar(t.type())) {
      // TODO: since the logic for size estimation is split between
      // ComputedSize and isScalar, changing one will likely require changing
      // the other, so they should be merged in the future if possible
      return new SizeEstimate(BigInt(1), BigInt(1));
    }
    return new SizeEstimate(BigInt(0), MAX_UINT64);
  }

  #functionCost(
    fn: string,
    overloadID: string,
    target: AstNode,
    args: AstNode[],
    argCosts: CostEstimate[]
  ): CallEstimate {
    function argCostSum() {
      let sum = new CostEstimate(BigInt(0), BigInt(0));
      for (const argCost of argCosts) {
        sum = sum.add(argCost);
      }
      return sum;
    }
    if (this.#overloadEstimators.size !== 0) {
      const estimator = this.#overloadEstimators.get(overloadID);
      if (!isNil(estimator)) {
        const callEst = estimator(this.#estimator, target, args);
        return new CallEstimate(
          callEst.cost.add(argCostSum()),
          callEst.resultSize
        );
      }
    }
    const callEst = this.#estimator.estimateCallCost(
      fn,
      overloadID,
      target,
      args
    );
    if (!isNil(callEst)) {
      return new CallEstimate(
        callEst.cost.add(argCostSum()),
        callEst.resultSize
      );
    }
    switch (overloadID) {
      // O(n) functions
      case EXT_FORMAT_STRING_OVERLOAD:
        if (!isNil(target)) {
          // ResultSize not calculated because we can't bound the max size.
          // TODO: don't love this type casting
          return new CallEstimate(
            this.#sizeEstimate(target)
              .multiplyByCostFactor(StringTraversalCostFactor)
              .add(
                argCostSum() as unknown as SizeEstimate
              ) as unknown as CostEstimate
          );
        }
        break;
      case STRING_TO_BYTES_OVERLOAD:
        if (args.length === 1) {
          const sz = this.#sizeEstimate(args[0]);
          // ResultSize max is when each char converts to 4 bytes.
          return new CallEstimate(
            sz
              .multiplyByCostFactor(StringTraversalCostFactor)
              .add(
                argCostSum() as unknown as SizeEstimate
              ) as unknown as CostEstimate,
            new SizeEstimate(sz.min, sz.max * BigInt(4))
          );
        }
        break;
      case BYTES_TO_STRING_OVERLOAD:
        if (args.length === 1) {
          const sz = this.#sizeEstimate(args[0]);
          // ResultSize min is when 4 bytes convert to 1 char.
          return new CallEstimate(
            sz
              .multiplyByCostFactor(StringTraversalCostFactor)
              .add(
                argCostSum() as unknown as SizeEstimate
              ) as unknown as CostEstimate,
            new SizeEstimate(sz.min / BigInt(4), sz.max)
          );
        }
        break;
      case EXT_QUOTE_STRING_OVERLOAD:
        if (args.length === 1) {
          const sz = this.#sizeEstimate(args[0]);
          // ResultSize max is when each char is escaped. 2 quote chars always added.
          return new CallEstimate(
            sz
              .multiplyByCostFactor(StringTraversalCostFactor)
              .add(
                argCostSum() as unknown as SizeEstimate
              ) as unknown as CostEstimate,
            new SizeEstimate(sz.min + BigInt(2), sz.max + BigInt(2))
          );
        }
        break;
      case STARTS_WITH_STRING_OVERLOAD:
      case ENDS_WITH_STRING_OVERLOAD:
        if (args.length === 1) {
          // ResultSize max is when each char is escaped. 2 quote chars always added.
          return new CallEstimate(
            this.#sizeEstimate(args[0])
              .multiplyByCostFactor(StringTraversalCostFactor)
              .add(
                argCostSum() as unknown as SizeEstimate
              ) as unknown as CostEstimate
          );
        }
        break;
      case IN_LIST_OVERLOAD:
        // If a list is composed entirely of constant values this is O(1), but
        // we don't account for that here. We just assume all list containment
        // checks are O(n).
        if (args.length === 2) {
          return new CallEstimate(
            this.#sizeEstimate(args[1])
              .multiplyByCostFactor(1)
              .add(
                argCostSum() as unknown as SizeEstimate
              ) as unknown as CostEstimate
          );
        }
        break;
      // O(nm) functions
      case MATCHES_STRING_OVERLOAD:
        // https://swtch.com/~rsc/regexp/regexp1.html applies to RE2
        // implementation supported by CEL
        if (!isNil(target) && args.length === 1) {
          // Add one to string length for purposes of cost calculation to
          // prevent product of string and regex to be 0 in case where string
          // is empty but regex is still expensive.
          const strCost = this.#sizeEstimate(target)
            .add(new SizeEstimate(BigInt(1), BigInt(1)))
            .multiplyByCostFactor(StringTraversalCostFactor);
          // We don't know how many expressions are in the regex, just the
          // string length (a huge improvement here would be to somehow get a
          // count the number of expressions in the regex or how many states
          // are in the regex state machine and use that to measure regex
          // cost). For now, we're making a guess that each expression in a
          // regex is typically at least 4 chars in length.
          const regexCost = this.#sizeEstimate(args[0]).multiplyByCostFactor(
            RegexStringLengthCostFactor
          );
          return new CallEstimate(
            strCost
              .multiply(regexCost)
              .add(
                argCostSum() as unknown as SizeEstimate
              ) as unknown as CostEstimate
          );
        }
        break;
      case CONTAINS_STRING_OVERLOAD:
        if (!isNil(target) && args.length === 1) {
          const strCost = this.#sizeEstimate(target).multiplyByCostFactor(
            StringTraversalCostFactor
          );
          const substrCost = this.#sizeEstimate(args[0]).multiplyByCostFactor(
            StringTraversalCostFactor
          );
          return new CallEstimate(
            strCost
              .multiply(substrCost)
              .add(
                argCostSum() as unknown as SizeEstimate
              ) as unknown as CostEstimate
          );
        }
        break;
      case LOGICAL_OR_OVERLOAD:
      case LOGICAL_AND_OVERLOAD:
        const lhs = argCosts[0];
        const rhs = argCosts[1];
        // min cost is min of LHS for short circuited && or ||
        const argCost = new CostEstimate(lhs.min, lhs.add(rhs).max);
        return new CallEstimate(argCost);
      case CONDITIONAL_OVERLOAD:
        const size = this.#sizeEstimate(args[1]).union(
          this.#sizeEstimate(args[2])
        );
        const conditionalCost = argCosts[0];
        const ifTrueCost = argCosts[1];
        const ifFalseCost = argCosts[2];
        const _argCost = conditionalCost.add(ifTrueCost.union(ifFalseCost));
        return new CallEstimate(_argCost, size);
      case ADD_STRING_OVERLOAD:
      case ADD_BYTES_OVERLOAD:
      case ADD_LIST_OVERLOAD:
        if (args.length === 2) {
          const lhsSize = this.#sizeEstimate(args[0]);
          const rhsSize = this.#sizeEstimate(args[1]);
          const resultSize = lhsSize.add(rhsSize);
          switch (overloadID) {
            case ADD_LIST_OVERLOAD:
              // list concatenation is O(1), but we handle it here to track size
              return new CallEstimate(
                new CostEstimate(BigInt(1), BigInt(1)).add(argCostSum()),
                resultSize
              );
            default:
              return new CallEstimate(
                resultSize
                  .multiplyByCostFactor(StringTraversalCostFactor)
                  .add(
                    argCostSum() as unknown as SizeEstimate
                  ) as unknown as CostEstimate,
                resultSize
              );
          }
        }
        break;
      case LESS_STRING_OVERLOAD:
      case GREATER_STRING_OVERLOAD:
      case LESS_EQUALS_STRING_OVERLOAD:
      case GREATER_EQUALS_STRING_OVERLOAD:
      case LESS_BYTES_OVERLOAD:
      case GREATER_BYTES_OVERLOAD:
      case LESS_EQUALS_BYTES_OVERLOAD:
      case GREATER_EQUALS_BYTES_OVERLOAD:
      case EQUALS_OVERLOAD:
      case NOT_EQUALS_OVERLOAD:
        const lhsCost = this.#sizeEstimate(args[0]);
        const rhsCost = this.#sizeEstimate(args[1]);
        let min = BigInt(0);
        let smallestMax = lhsCost.max;
        if (rhsCost.max < smallestMax) {
          smallestMax = rhsCost.max;
        }
        if (smallestMax > 0) {
          min = BigInt(1);
        }
        // equality of 2 scalar values results in a cost of 1
        return new CallEstimate(
          new CostEstimate(min, smallestMax)
            .multiplyByCostFactor(StringTraversalCostFactor)
            .add(argCostSum())
        );
      // O(1) functions
      // See CostTracker.costCall for more details about O(1) cost calculations
      default:
        break;
    }
    // Benchmarks suggest that most of the other operations take +/- 50% of a
    // base cost unit which on an Intel xeon 2.20GHz CPU is 50ns.
    return new CallEstimate(
      new CostEstimate(BigInt(1), BigInt(1)).add(argCostSum())
    );
  }

  #getType(e: Expr): Type | null {
    return this.#checkedAst.getType(e.id) ?? null;
  }

  #getPath(e: Expr): string[] | null {
    return this.#exprPath.get(e.id) ?? null;
  }

  #addPath(e: Expr, path: string[]) {
    this.#exprPath.set(e.id, path);
  }

  #newAstNode(e: Expr) {
    let path = this.#getPath(e);
    if (!isNil(path) && path.length > 0 && path[0] === AccumulatorName) {
      // only provide paths to root vars; omit accumulator vars
      path = null;
    }
    const derivedSize = this.#computedSizes.get(e.id);
    return new AstNode(path ?? [], this.#getType(e)!, e, derivedSize);
  }
}

/**
 * isScalar returns true if the given type is known to be of a constant size at
 * compile time. isScalar will return false for strings (they are
 * variable-width) in addition to protobuf.Any and protobuf.Value (their size
 * is not knowable at compile time).
 */
export function isScalar(type: Type): boolean {
  switch (type.kind()) {
    case Kind.BOOL:
    case Kind.DOUBLE:
    case Kind.DURATION:
    case Kind.INT:
    case Kind.TIMESTAMP:
    case Kind.UINT:
      return true;
    default:
      return false;
  }
}
