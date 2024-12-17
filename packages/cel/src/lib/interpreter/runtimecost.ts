/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import { isNil } from '@bearclaw/is';
import { multiplyByCostFactor } from '../checker/cost';
import {
  ListCreateBaseCost,
  MapCreateBaseCost,
  RegexStringLengthCostFactor,
  SelectAndIdentCost,
  StringTraversalCostFactor,
  StructCreateBaseCost,
} from '../common/cost';
import {
  ADD_BYTES_OVERLOAD,
  ADD_STRING_OVERLOAD,
  BYTES_TO_STRING_OVERLOAD,
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
  LESS_BYTES_OVERLOAD,
  LESS_EQUALS_BYTES_OVERLOAD,
  LESS_EQUALS_STRING_OVERLOAD,
  LESS_STRING_OVERLOAD,
  MATCHES_STRING_OVERLOAD,
  NOT_EQUALS_OVERLOAD,
  STARTS_WITH_STRING_OVERLOAD,
  STRING_TO_BYTES_OVERLOAD,
} from '../common/overloads';
import { RefVal } from '../common/ref/reference';
import { isSizer } from '../common/types/traits/sizer';
import { ListType, MapType } from '../common/types/types';
import {
  isConditionalAttribute,
  isConstantQualifier,
  isQualifier,
} from './attributes';
import {
  EvalAnd,
  EvalFold,
  EvalOr,
  EvalTestOnly,
  Interpretable,
  InterpretableCall,
  isInterpretableAttribute,
  isInterpretableCall,
  isInterpretableConst,
  isInterpretableConstructor,
} from './interpretable';
import { EvalObserver } from './interpreter';

// WARNING: Any changes to cost calculations in this file require a corresponding change in checker/cost.go

/**
 * ActualCostEstimator provides function call cost estimations at runtime
 * CallCost returns an estimated cost for the function overload invocation with
 * the given args, or nil if it has no estimate to provide. CEL attempts to
 * provide reasonable estimates for its standard function library, so CallCost
 * should typically not need to provide an estimate for CELs standard function.
 */
export interface ActualCostEstimator {
  callCost(
    fn: string,
    overloadID: string,
    args: RefVal[],
    result: RefVal
  ): bigint | null;
}

/**
 * CostObserver provides an observer that tracks runtime cost.
 */
export function costObserver(tracker: CostTracker): EvalObserver {
  return (id: bigint, programStep: any, value: RefVal) => {
    if (isConstantQualifier(programStep)) {
      // TODO: Push identifiers on to the stack before observing constant qualifiers that apply to them and enable the below pop. Once enabled this can case can be collapsed into the Qualifier case.
      tracker.cost++;
    } else if (isInterpretableConst(programStep)) {
      // zero cost
    } else if (isInterpretableAttribute(programStep)) {
      const a = programStep.attr();
      if (isConditionalAttribute(a)) {
        // Ternary has no direct cost. All cost is from the conditional and the true/false branch expressions.
        tracker.stack.drop(a.falsy.id(), a.truthy.id(), a.expr.id());
      } else {
        tracker.stack.drop(programStep.attr().id());
        tracker.cost += BigInt(SelectAndIdentCost);
      }
      if (!tracker.presenceTestHasCost) {
        if (programStep instanceof EvalTestOnly) {
          tracker.cost -= BigInt(SelectAndIdentCost);
        }
      }
      // TODO:
      // } else if (isEvalExhaustiveConditional(programStep)) {

      // }
    } else if (programStep instanceof EvalOr) {
      for (const term of programStep.terms) {
        tracker.stack.drop(term.id());
      }
    } else if (programStep instanceof EvalAnd) {
      for (const term of programStep.terms) {
        tracker.stack.drop(term.id());
      }
      // TODO: Implement exhaustive evaluation
      // } else if (programStep instanceof EvalExhaustiveAnd) {
      //   for (const term of programStep.terms) {
      //     tracker.stack.drop(term.id());
      //   }
      // } else if (programStep instanceof EvalExhaustiveOr) {
      //   for (const term of programStep.terms) {
      //     tracker.stack.drop(term.id());
      //   }
      // }
    } else if (programStep instanceof EvalFold) {
      tracker.stack.drop(programStep.iterRange.id());
    } else if (isQualifier(programStep)) {
      tracker.cost++;
    } else if (isInterpretableCall(programStep)) {
      const [argVals, ok] = tracker.stack.dropArgs(programStep.args());
      if (ok) {
        tracker.cost += tracker.costCall(programStep, argVals!, value);
      }
    } else if (isInterpretableConstructor(programStep)) {
      tracker.stack.dropArgs(programStep.initVals());
      switch (programStep.type()) {
        case ListType:
          tracker.cost += BigInt(ListCreateBaseCost);
          break;
        case MapType:
          tracker.cost += BigInt(MapCreateBaseCost);
          break;
        default:
          tracker.cost += BigInt(StructCreateBaseCost);
          break;
      }
    }
    tracker.stack.push(value, id);

    if (!isNil(tracker.limit) && tracker.cost > tracker.limit) {
      throw new Error('operation cancelled: actual cost limit exceeded');
      // TODO: panic(EvalCancelledError{Cause: CostLimitExceeded, Message: "operation cancelled: actual cost limit exceeded"})
    }
  };
}

/**
 * CostTrackerOption configures the behavior of CostTracker objects.
 */
export type CostTrackerOption = (t: CostTracker) => void;

/**
 * CostTrackerLimit sets the runtime limit on the evaluation cost during
 * execution and will terminate the expression evaluation if the limit is
 * exceeded.
 */
export function costTrackerLimit(limit: bigint): CostTrackerOption {
  return (t: CostTracker) => {
    t.limit = limit;
  };
}

/**
 * PresenceTestHasCost determines whether presence testing has a cost of one or
 * zero. Defaults to presence test has a cost of one.
 */
export function presenceTestHasCost(hasCost: boolean): CostTrackerOption {
  return (t: CostTracker) => {
    t.presenceTestHasCost = hasCost;
  };
}

/**
 * OverloadCostTracker binds an overload ID to a runtime FunctionTracker
 * implementation.
 *
 * OverloadCostTracker instances augment or override ActualCostEstimator
 * decisions, allowing for  versioned and/or optional cost tracking changes.
 */
export function overloadCostTracker(
  overloadID: string,
  fnTracker: FunctionTracker
): CostTrackerOption {
  return (t: CostTracker) => {
    t.overloadTrackers.set(overloadID, fnTracker);
  };
}

/**
 * FunctionTracker computes the actual cost of evaluating the functions with
 * the given arguments and result.
 */
export type FunctionTracker = (args: RefVal[], result: RefVal) => bigint;

/**
 * CostTracker represents the information needed for tracking runtime cost.
 */
export class CostTracker {
  estimator: ActualCostEstimator | null;
  overloadTrackers: Map<string, FunctionTracker>;
  limit: bigint | null;
  presenceTestHasCost: boolean;

  cost: bigint;
  stack: RefValStack;

  constructor(
    estimator: ActualCostEstimator | null,
    ...options: CostTrackerOption[]
  ) {
    this.estimator = estimator;
    this.overloadTrackers = new Map();
    this.limit = null;
    this.presenceTestHasCost = true;

    this.cost = BigInt(0);
    this.stack = new RefValStack();

    for (const option of options) {
      option(this);
    }
  }

  /**
   * ActualCost returns the runtime cost
   */
  actualCost() {
    return this.cost;
  }

  costCall(call: InterpretableCall, args: RefVal[], result: RefVal): bigint {
    let cost = BigInt(0);
    if (this.overloadTrackers.size > 0) {
      const overloadID = call.overloadID();
      const tracker = this.overloadTrackers.get(overloadID);
      if (tracker) {
        const callCost = tracker(args, result);
        if (!isNil(callCost)) {
          cost += callCost;
          return cost;
        }
      }
    }

    if (!isNil(this.estimator)) {
      const callCost = this.estimator.callCost(
        call.function(),
        call.overloadID(),
        args,
        result
      );
      if (!isNil(callCost)) {
        cost += callCost;
        return cost;
      }
    }

    // if user didn't specify, the default way of calculating runtime cost
    // would be used. if user has their own implementation of
    // ActualCostEstimator, make sure to cover the mapping between overloadId
    // and cost calculation
    switch (call.overloadID()) {
      // O(n) functions
      case STARTS_WITH_STRING_OVERLOAD:
      case ENDS_WITH_STRING_OVERLOAD:
      case STRING_TO_BYTES_OVERLOAD:
      case BYTES_TO_STRING_OVERLOAD:
      case EXT_QUOTE_STRING_OVERLOAD:
      case EXT_FORMAT_STRING_OVERLOAD:
        cost += multiplyByCostFactor(
          this.actualSize(args[0]),
          StringTraversalCostFactor
        );
        break;
      case IN_LIST_OVERLOAD:
        // If a list is composed entirely of constant values this is O(1), but
        // we don't account for that here. We just assume all list containment
        // checks are O(n).
        cost += this.actualSize(args[1]);
        break;
      // O(min(m, n)) functions
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
        // When we check the equality of 2 scalar values (e.g. 2 integers, 2
        // floating-point numbers, 2 booleans etc.), the
        // CostTracker.actualSize() function by definition returns 1 for each
        // operand, resulting in an overall cost of 1.
        const lhsSize = this.actualSize(args[0]);
        const rhsSize = this.actualSize(args[1]);
        let minSize = lhsSize;
        if (rhsSize < minSize) {
          minSize = rhsSize;
        }
        cost += multiplyByCostFactor(minSize, StringTraversalCostFactor);
        break;
      // O(m+n) functions
      case ADD_STRING_OVERLOAD:
      case ADD_BYTES_OVERLOAD:
        // In the worst case scenario, we would need to reallocate a new
        // backing store and copy both operands over.
        cost += multiplyByCostFactor(
          this.actualSize(args[0]) + this.actualSize(args[1]),
          StringTraversalCostFactor
        );
        break;
      // O(nm) functions
      case MATCHES_STRING_OVERLOAD:
        // https://swtch.com/~rsc/regexp/regexp1.html applies to RE2
        // implementation supported by CEL. Add one to string length for
        // purposes of cost calculation to prevent product of string and regex
        // to be 0 in case where string is empty but regex is still expensive.
        const strCost = multiplyByCostFactor(
          BigInt(1) + this.actualSize(args[0]),
          StringTraversalCostFactor
        );
        // We don't know how many expressions are in the regex, just the string
        // length (a huge improvement here would be to somehow get a count the
        // number of expressions in the regex or how many states are in the
        // regex state machine and use that to measure regex cost). For now,
        // we're making a guess that each expression in a regex is typically at
        // least 4 chars in length.
        const regexCost = multiplyByCostFactor(
          this.actualSize(args[1]),
          RegexStringLengthCostFactor
        );
        cost += strCost * regexCost;
        break;
      case CONTAINS_STRING_OVERLOAD:
        const _strCost = multiplyByCostFactor(
          this.actualSize(args[0]),
          StringTraversalCostFactor
        );
        const substrCost = multiplyByCostFactor(
          this.actualSize(args[1]),
          StringTraversalCostFactor
        );
        cost += _strCost * substrCost;
        break;
      default:
        // The following operations are assumed to have O(1) complexity.
        // - AddList due to the implementation. Index lookup can be O(c) the
        // number of concatenated lists, but we don't track that is cost
        // calculations.
        // - Conversions, since none perform a traversal of a type of unbound
        // length.
        // - Computing the size of strings, byte sequences, lists and maps.
        // - Logical operations and all operators on fixed width scalars
        // (comparisons, equality)
        // - Any functions that don't have a declared cost either here or in
        // provided ActualCostEstimator.
        cost++;
        break;
    }
    return cost;
  }

  /**
   * actualSize returns the size of value
   */
  actualSize(value: RefVal) {
    if (isSizer(value)) {
      return value.size().value() as bigint;
    }
    return BigInt(1);
  }
}

interface StackVal {
  val: RefVal;
  id: bigint;
}

class RefValStack {
  #value: StackVal[] = [];

  push(val: RefVal, id: bigint) {
    this.#value.push({ val, id });
  }

  // TODO: Allowing drop and dropArgs to remove stack items above the IDs they are provided is a workaround. drop and dropArgs should find and remove only the stack items matching the provided IDs once all attributes are properly pushed and popped from stack.

  /**
   * drop searches the stack for each ID and removes the ID and all stack items
   * above it. If none of the IDs are found, the stack is not modified.
   *
   * WARNING: It is possible for multiple expressions with the same ID to exist
   * (due to how macros are implemented) so it's  possible that a dropped ID
   * will remain on the stack.  They should be removed when IDs on the stack
   * are popped.
   */
  drop(...ids: bigint[]) {
    for (const id of ids) {
      for (let i = this.#value.length - 1; i >= 0; i--) {
        if (this.#value[i].id === id) {
          this.#value = this.#value.slice(0, i);
          break;
        }
      }
    }
  }

  /**
   * dropArgs searches the stack for all the args by their IDs, accumulates
   * their associated ref.Vals and drops any stack items above any of the arg
   * IDs. If any of the IDs are not found the stack, false is returned. Args
   * are assumed to be found in the stack in reverse order, i.e. the last arg
   * is expected to be found highest in the stack.
   *
   * WARNING: It is possible for multiple expressions with the same ID to
   * exist (due to how macros are implemented) so it's possible that a dropped
   * ID will remain on the stack.  They should be removed when IDs on the stack
   * are popped.
   */
  dropArgs(args: Interpretable[]): [RefVal[] | null, boolean] {
    const result: RefVal[] = new Array(args.length);
    for (let nIdx = args.length - 1; nIdx >= 0; nIdx--) {
      let found = false;
      for (let idx = this.#value.length - 1; idx >= 0; idx--) {
        if (this.#value[idx].id === args[nIdx].id()) {
          const el = this.#value[idx];
          this.#value = this.#value.slice(0, idx);
          result[nIdx] = el.val;
          found = true;
        }
      }
      if (!found) {
        return [null, false];
      }
    }
    return [result, true];
  }
}
