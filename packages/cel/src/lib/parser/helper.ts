import { OffsetRange } from './../common/ast';
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isBigInt, isEmpty, isNil } from '@bearclaw/is';
import {
  Expr,
  Expr_CreateStruct_Entry,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { ParserRuleContext, Token } from 'antlr4';
import { newSourceInfo, SourceInfo } from '../common/ast';
import { CELError } from '../common/error';
import { Location } from '../common/location';
import { refValToProtoConstant } from '../common/pb/constants';
import {
  newComprehensionProtoExpr,
  newConstantProtoExpr,
  newGlobalCallProtoExpr,
  newIdentProtoExpr,
  newListProtoExpr,
  newMapEntryProtoExpr,
  newMapProtoExpr,
  newMessageFieldProtoExpr,
  newMessageProtoExpr,
  newReceiverCallProtoExpr,
  newSelectProtoExpr,
  newTestOnlySelectProtoExpr,
  newUnspecifiedExpr,
} from '../common/pb/expressions';
import { RefVal } from '../common/ref/reference';
import { Source } from '../common/source';
import { BoolRefVal } from '../common/types/bool';
import { BytesRefVal } from '../common/types/bytes';
import { DoubleRefVal } from '../common/types/double';
import { IntRefVal } from '../common/types/int';
import { reflectNativeType } from '../common/types/native';
import { StringRefVal } from '../common/types/string';
import { UintRefVal } from '../common/types/uint';

export class ParserHelper {
  private _source: Source;
  private _sourceInfo: SourceInfo;
  private _nextID: bigint;

  constructor(source: Source) {
    this._source = source;
    this._sourceInfo = newSourceInfo(source);
    this._nextID = BigInt(1);
  }

  getSourceInfo() {
    return this._sourceInfo;
  }

  newLiteral(ctx: any, val: RefVal) {
    return newConstantProtoExpr(this.newId(ctx), refValToProtoConstant(val));
  }

  newLiteralBool(ctx: any, val: boolean) {
    return this.newLiteral(ctx, new BoolRefVal(val));
  }

  newLiteralString(ctx: any, val: string) {
    return this.newLiteral(ctx, new StringRefVal(val));
  }

  newLiteralBytes(ctx: any, val: Uint8Array) {
    return this.newLiteral(ctx, new BytesRefVal(val));
  }

  newLiteralInt(ctx: any, val: bigint) {
    return this.newLiteral(ctx, new IntRefVal(val));
  }

  newLiteralUint(ctx: any, val: bigint) {
    return this.newLiteral(ctx, new UintRefVal(val));
  }

  newLiteralDouble(ctx: any, val: number) {
    return this.newLiteral(ctx, new DoubleRefVal(val));
  }

  newIdent(ctx: any, name: string) {
    return newIdentProtoExpr(this.newId(ctx), name);
  }

  newSelect(ctx: any, operand: Expr, field: string) {
    return newSelectProtoExpr(this.newId(ctx), operand, field);
  }

  newPresenceTest(ctx: any, operand: Expr, field: string) {
    return newTestOnlySelectProtoExpr(this.newId(ctx), operand, field);
  }

  newGlobalCall(ctx: any, name: string, ...args: Expr[]) {
    return newGlobalCallProtoExpr(this.newId(ctx), name, args);
  }

  newReceiverCall(ctx: any, name: string, target: Expr, ...args: Expr[]) {
    return newReceiverCallProtoExpr(this.newId(ctx), name, target, args);
  }

  newList(ctx: any, elements: Expr[], optionalIndices: number[] = []) {
    return newListProtoExpr(this.newId(ctx), elements, optionalIndices);
  }

  newMap(ctx: any, entries: Expr_CreateStruct_Entry[]) {
    return newMapProtoExpr(this.newId(ctx), entries);
  }

  newMapEntry(
    ctx: any,
    key: Expr,
    value: Expr | null,
    optionalEntry?: boolean
  ) {
    return newMapEntryProtoExpr(this.newId(ctx), key, value, optionalEntry);
  }

  newObject(ctx: any, typeName: string, entries: Expr_CreateStruct_Entry[]) {
    return newMessageProtoExpr(this.newId(ctx), typeName, entries);
  }

  newObjectField(
    ctx: any,
    name: string,
    value: Expr | null,
    optional?: boolean
  ) {
    return newMessageFieldProtoExpr(this.newId(ctx), name, value, optional);
  }

  newComprehension(
    ctx: any,
    iterRange: Expr,
    iterVar: string,
    accuVar: string,
    accuInit: Expr,
    condition: Expr,
    step: Expr,
    result: Expr
  ) {
    return newComprehensionProtoExpr(this.newId(ctx), {
      iterRange,
      iterVar,
      accuVar,
      accuInit,
      loopCondition: condition,
      loopStep: step,
      result,
    });
  }

  newComprehensionTwoVar(
    ctx: any,
    iterRange: Expr,
    iterVar: string,
    iterVar2: string,
    accuVar: string,
    accuInit: Expr,
    condition: Expr,
    step: Expr,
    result: Expr
  ) {
    return newComprehensionProtoExpr(this.newId(ctx), {
      iterRange,
      iterVar,
      iterVar2,
      accuVar,
      accuInit,
      loopCondition: condition,
      loopStep: step,
      result,
    });
  }

  newExpr(ctx: any, exprKind?: Expr['exprKind']) {
    return create(ExprSchema, {
      id: this.newId(ctx),
      exprKind,
    });
  }

  newId(ctx: any) {
    if (isBigInt(ctx)) {
      return ctx;
    }
    return this.id(ctx);
  }

  id(ctx: any) {
    let offset: OffsetRange = new OffsetRange(-1, -1);
    // This is outside the switch because there are many classes that extend
    // ParserRuleContext and Token which we want to handle the same way.
    // `reflectNativeType` will only handle it if it is exactly a
    // ParserRuleContext or Token.
    // TODO: this would be a great place for pattern matching
    if (ctx instanceof ParserRuleContext) {
      const prc = ctx as ParserRuleContext;
      const prcStart = this._sourceInfo.computeOffset(
        prc.start.line,
        prc.start.column
      );
      offset = new OffsetRange(prcStart, prcStart + prc.getText().length);
    } else if (ctx instanceof Token) {
      const tc = ctx as Token;
      const tcStart = this._sourceInfo.computeOffset(tc.line, tc.column);
      offset = new OffsetRange(tcStart, tcStart + tc.text.length);
    }
    switch (reflectNativeType(ctx)) {
      case Location:
        const loc = ctx as Location;
        const locStart = this._sourceInfo.computeOffset(loc.line, loc.column);
        offset = new OffsetRange(locStart, locStart);
        break;
      case OffsetRange:
        offset = ctx as OffsetRange;
        break;
      default:
        break;
    }
    const id = this._nextID;
    this._sourceInfo.setOffsetRange(id, offset);
    this._nextID++;
    return id;
  }

  deleteId(id: bigint) {
    this._sourceInfo.clearOffsetRange(id);
    if (id === this._nextID - BigInt(1)) {
      this._nextID--;
    }
  }

  getLocation(id: bigint) {
    return this._sourceInfo.getStartLocation(id);
  }

  getLocationByOffset(offset: number) {
    return this._sourceInfo.getLocationByOffset(offset);
  }

  /**
   * buildMacroCallArg iterates the expression and returns a new expression
   * where all macros have been replaced by their IDs in MacroCalls
   */
  buildMacroCallArg(expr: Expr): Expr {
    if (!isNil(this._sourceInfo.getMacroCall(expr.id))) {
      return newUnspecifiedExpr(expr.id);
    }
    switch (expr.exprKind.case) {
      case 'callExpr':
        // Iterate the AST from `expr` recursively looking for macros. Because
        // we are at most starting from the top level macro, this recursion is
        // bounded by the size of the AST. This means that the depth check on
        // the AST during parsing will catch recursion overflows before we get
        // to here.
        const call = expr.exprKind.value;
        const macroArgs: Expr[] = [];
        for (const arg of call.args) {
          macroArgs.push(this.buildMacroCallArg(arg));
        }
        if (isNil(call.target)) {
          return newGlobalCallProtoExpr(expr.id, call.function, macroArgs);
        }
        const macroTarget = this.buildMacroCallArg(call.target);
        return newReceiverCallProtoExpr(
          expr.id,
          call.function,
          macroTarget,
          macroArgs
        );
      case 'listExpr':
        const list = expr.exprKind.value;
        const macroListArgs = list.elements.map((arg) =>
          this.buildMacroCallArg(arg)
        );
        return newListProtoExpr(expr.id, macroListArgs, list.optionalIndices);
      default:
        return expr;
    }
  }

  /**
   * addMacroCall adds the macro the the MacroCalls map in source info. If a
   * macro has args/subargs/target that are macros, their ID will be stored
   * instead for later self-lookups.
   */
  addMacroCall(
    exprID: bigint,
    fn: string,
    target: Expr | null,
    ...args: Expr[]
  ) {
    const macroArgs = args.map((arg) => this.buildMacroCallArg(arg));
    if (isNil(target)) {
      this._sourceInfo.setMacroCall(
        exprID,
        newGlobalCallProtoExpr(BigInt(0), fn, macroArgs)
      );
      return;
    }
    let macroTarget = target;
    if (!isNil(this._sourceInfo.getMacroCall(target.id))) {
      macroTarget = newUnspecifiedExpr(target.id);
    } else {
      macroTarget = this.buildMacroCallArg(target);
    }
    this._sourceInfo.setMacroCall(
      exprID,
      newReceiverCallProtoExpr(BigInt(0), fn, macroTarget, macroArgs)
    );
  }
}

export class LogicManager {
  private function: string;
  private terms: Expr[];
  private ops: bigint[];
  private variadicASTs: boolean;

  private constructor(functionName: string, term: Expr, variadicASTs: boolean) {
    this.function = functionName;
    this.terms = [term];
    this.ops = [];
    this.variadicASTs = variadicASTs;
  }

  static newVariadicLogicManager(
    functionName: string,
    term: Expr
  ): LogicManager {
    return new LogicManager(functionName, term, true);
  }

  static newBalancingLogicManager(
    functionName: string,
    term: Expr
  ): LogicManager {
    return new LogicManager(functionName, term, false);
  }

  addTerm(op: bigint, term: Expr): void {
    this.terms.push(term);
    this.ops.push(op);
  }

  toExpr(): Expr {
    if (this.terms.length === 1) {
      return this.terms[0];
    }
    if (this.variadicASTs) {
      return newGlobalCallProtoExpr(this.ops[0], this.function, this.terms);
    }
    return this.balancedTree(0, this.ops.length - 1);
  }

  private balancedTree(lo: number, hi: number): Expr {
    const mid = Math.floor((lo + hi + 1) / 2);
    let left: Expr;
    if (mid === lo) {
      left = this.terms[mid];
    } else {
      left = this.balancedTree(lo, mid - 1);
    }
    let right: Expr;
    if (mid === hi) {
      right = this.terms[mid + 1];
    } else {
      right = this.balancedTree(mid + 1, hi);
    }
    return newGlobalCallProtoExpr(this.ops[mid], this.function, [left, right]);
  }
}

export class ExprHelper {
  constructor(
    private readonly _id: bigint,
    private readonly _parserHelper: ParserHelper
  ) {}

  nextMacroID() {
    return this._parserHelper.id(this._parserHelper.getLocation(this._id));
  }

  /**
   * Copy implements the ExprHelper interface method by producing a copy of the
   * input Expr value with a fresh set of numeric identifiers the Expr and all
   * its descendants.
   */
  copy(expr: Expr): Expr {
    const offsetRange = this._parserHelper
      .getSourceInfo()
      .getOffsetRange(expr.id);
    const copyID = this._parserHelper.newId(offsetRange);
    switch (expr.exprKind.case) {
      case 'constExpr':
        return newConstantProtoExpr(copyID, expr.exprKind.value);
      case 'identExpr':
        return newIdentProtoExpr(copyID, expr.exprKind.value.name);
      case 'selectExpr':
        const sel = expr.exprKind.value;
        const op = this.copy(sel.operand!);
        if (sel.testOnly) {
          return newTestOnlySelectProtoExpr(copyID, op, sel.field);
        }
        return newSelectProtoExpr(copyID, op, sel.field);
      case 'callExpr':
        const call = expr.exprKind.value;
        const argsCopy = call.args.map((arg) => this.copy(arg));
        if (isNil(call.target)) {
          return newGlobalCallProtoExpr(copyID, call.function, argsCopy);
        }
        return newReceiverCallProtoExpr(
          copyID,
          call.function,
          this.copy(call.target),
          argsCopy
        );
      case 'listExpr':
        const list = expr.exprKind.value;
        const elemsCopy = list.elements.map((elem) => this.copy(elem));
        return newListProtoExpr(copyID, elemsCopy, list.optionalIndices);
      case 'structExpr':
        // Map case
        if (isEmpty(expr.exprKind.value.messageName)) {
          const m = expr.exprKind.value;
          const entriesCopy = m.entries.map((entry) => {
            if (entry.keyKind.case !== 'mapKey') {
              throw new Error('invalid map key');
            }
            const key = this.copy(entry.keyKind.value);
            const value = isNil(entry.value) ? null : this.copy(entry.value);
            return newMapEntryProtoExpr(
              copyID,
              key,
              value,
              entry.optionalEntry
            );
          });
          return newMapProtoExpr(copyID, entriesCopy);
        }
        const s = expr.exprKind.value;
        const fieldsCopy = s.entries.map((entry) => {
          if (entry.keyKind.case !== 'fieldKey') {
            throw new Error('invalid field key');
          }
          const value = isNil(entry.value) ? null : this.copy(entry.value);
          return newMessageFieldProtoExpr(copyID, entry.keyKind.value, value);
        });
        return newMessageProtoExpr(copyID, s.messageName, fieldsCopy);
      case 'comprehensionExpr':
        const compre = expr.exprKind.value;
        const iterRange = this.copy(compre.iterRange!);
        const accuInit = this.copy(compre.accuInit!);
        const cond = this.copy(compre.loopCondition!);
        const step = this.copy(compre.loopStep!);
        const result = this.copy(compre.result!);
        // All comprehensions can be represented by the two-variable
        // comprehension since the differentiation between one and two-variable
        // is whether the iterVar2 value is non-empty.
        return newComprehensionProtoExpr(copyID, {
          iterRange,
          iterVar: compre.iterVar,
          iterVar2: compre.iterVar2,
          accuVar: compre.accuVar,
          accuInit,
          loopCondition: cond,
          loopStep: step,
          result,
        });
      default:
        return newUnspecifiedExpr(copyID);
    }
  }

  newLiteral(val: RefVal) {
    return newConstantProtoExpr(this.nextMacroID(), refValToProtoConstant(val));
  }

  newList(elements: Expr[], optionalIndices: number[] = []) {
    return newListProtoExpr(this.nextMacroID(), elements, optionalIndices);
  }

  newMap(entries: Expr_CreateStruct_Entry[]) {
    return newMapProtoExpr(this.nextMacroID(), entries);
  }

  newMapEntry(key: Expr, value: Expr | null, optionalEntry?: boolean) {
    return newMapEntryProtoExpr(this.nextMacroID(), key, value, optionalEntry);
  }

  newStruct(typeName: string, entries: Expr_CreateStruct_Entry[]) {
    return newMessageProtoExpr(this.nextMacroID(), typeName, entries);
  }

  newStructField(name: string, value: Expr | null) {
    return newMessageFieldProtoExpr(this.nextMacroID(), name, value);
  }

  newComprehension(
    iterRange: Expr,
    iterVar: string,
    accuVar: string,
    accuInit: Expr,
    condition: Expr,
    step: Expr,
    result: Expr
  ) {
    return newComprehensionProtoExpr(this.nextMacroID(), {
      iterRange,
      iterVar,
      accuVar,
      accuInit,
      loopCondition: condition,
      loopStep: step,
      result,
    });
  }

  newComprehensionTwoVar(
    iterRange: Expr,
    iterVar: string,
    iterVar2: string,
    accuVar: string,
    accuInit: Expr,
    condition: Expr,
    step: Expr,
    result: Expr
  ) {
    return newComprehensionProtoExpr(this.nextMacroID(), {
      iterRange,
      iterVar,
      iterVar2,
      accuVar,
      accuInit,
      loopCondition: condition,
      loopStep: step,
      result,
    });
  }

  newIdent(name: string) {
    return newIdentProtoExpr(this.nextMacroID(), name);
  }

  newAccuIdent() {
    return newIdentProtoExpr(this.nextMacroID(), '__result__');
  }

  newCall(functionName: string, ...args: Expr[]) {
    return newGlobalCallProtoExpr(this.nextMacroID(), functionName, args);
  }

  newMemberCall(functionName: string, target: Expr, ...args: Expr[]) {
    return newReceiverCallProtoExpr(
      this.nextMacroID(),
      functionName,
      target,
      args
    );
  }

  newPresenceTest(operand: Expr, field: string) {
    return newTestOnlySelectProtoExpr(this.nextMacroID(), operand, field);
  }

  newSelect(operand: Expr, field: string) {
    return newSelectProtoExpr(this.nextMacroID(), operand, field);
  }

  offsetLocation(exprID: bigint) {
    return this._parserHelper.getSourceInfo().getStartLocation(exprID);
  }

  /**
   * NewError associates an error message with a given expression id,
   * populating the source offset location of the error if possible.
   */
  newError(exprID: bigint, message: string) {
    const location = this.offsetLocation(exprID);
    return new CELError(exprID, location, message);
  }
}
