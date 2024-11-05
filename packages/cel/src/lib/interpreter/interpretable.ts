/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import { isFunction, isNil, isObject } from '@bearclaw/is';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { TypeAdapter } from '../common/ref/adapter';
import { FieldType } from '../common/ref/field-type';
import { boolValue } from '../common/types/bool';
import { equalValue } from '../common/types/traits/equaler';
import { receiver } from '../common/types/traits/receiver';
import { Trait } from '../common/types/traits/trait';
import { isZeroValue } from '../common/types/traits/zeroer';
import { isUnknownValue } from '../common/types/unknown';
import { valueHasTrait } from '../common/types/value';
import { LOGICAL_OR_OPERATOR } from '../operators';
import { Activation } from './activation';
import { Attribute, Qualifier } from './attribute-factory';
import { Cost, Coster } from './coster';
import { FunctionOp, UnaryOp } from './overload';

export interface Interpretable {
  // ID value corresponding to the expression node.
  id(): bigint;

  // Eval an Activation to produce an output.
  eval: (ctx: Activation) => Value | Error;
}

function isInterpretable(val: any): val is Interpretable {
  return isObject(val) && isFunction(val['id']) && isFunction(val['eval']);
}

/**
 * InterpretableConst interface for tracking whether the Interpretable is a
 * constant value.
 */
export interface InterpretableConst extends Interpretable {
  /**
   * Value returns the constant value of the instruction.
   */
  value(): Value;
}

function isInterpretableConst(val: any): val is InterpretableConst {
  return isFunction(val['value']) && isInterpretable(val);
}

/**
 * InterpretableAttribute interface for tracking whether the Interpretable is
 * an attribute.
 */
export interface InterpretableAttribute
  extends Interpretable,
    Qualifier,
    Attribute {
  /**
   * Attr returns the Attribute value.
   */
  attr(): Attribute;

  /**
   * Adapter returns the type adapter to be used for adapting resolved
   * Attribute values.
   */
  adapter(): TypeAdapter;
}

function isInterpretableAttribute(val: any): val is InterpretableAttribute {
  return (
    isFunction(val['attr']) &&
    isFunction(val['adapter']) &&
    isInterpretable(val)
  );
}

/**
 * InterpretableCall interface for inspecting Interpretable instructions
 * related to function calls.
 */
export interface InterpretableCall extends Interpretable {
  /**
   * Function returns the function name as it appears in text or mangled
   * operator name as it appears in the operators.go file.
   */
  function(): string;

  /**
   * OverloadID returns the overload id associated with the function
   * specialization. Overload ids are stable across language boundaries and can
   * be treated as synonymous with a unique function signature.
   */
  overloadID(): string;

  /**
   * Args returns the normalized arguments to the function overload. For
   * receiver-style functions, the receiver target is arg 0.
   */
  args(): Interpretable[];
}

function isInterpretableCall(val: any) {
  return (
    isFunction(val['function']) &&
    isFunction(val['overloadID']) &&
    isFunction(val['args']) &&
    isInterpretable(val)
  );
}

// Core Interpretable implementations used during the program planning phase.

export class EvalTestOnly implements Interpretable, Coster {
  readonly #id: bigint;
  readonly #op: Interpretable;
  readonly #field: Value; // string
  readonly #fieldType: FieldType;

  constructor(
    id: bigint,
    op: Interpretable,
    field: Value,
    fieldType: FieldType
  ) {
    this.#id = id;
    this.#op = op;
    this.#field = field;
    this.#fieldType = fieldType;
  }

  id() {
    return this.#id;
  }

  cost() {
    const c = Cost.estimateCost(this.#op);
    return c.add(Cost.OneOne);
  }

  eval(ctx: Activation) {
    // Handle field selection on a proto in the most efficient way possible.
    if (!isNil(this.#fieldType)) {
      if (isInterpretableAttribute(this.#op)) {
        const opVal = this.#op.resolve(ctx);
        if (opVal instanceof Error) {
          return opVal;
        }
        if (this.#fieldType.isSet(opVal)) {
          return boolValue(true);
        }
        return boolValue(false);
      }
    }
    const obj = this.#op.eval(ctx);
    if (obj instanceof Error) {
      return obj;
    }
    switch (obj.kind.case) {
      case 'listValue':
        return boolValue(
          obj.kind.value.values.some((v) => equalValue(v, this.#field))
        );
      case 'mapValue':
        return boolValue(
          obj.kind.value.entries.some(
            (f) => equalValue(f.key!, this.#field) && !isZeroValue(f.value)
          )
        );
      default:
        return new Error('invalid type for field selection');
    }
  }
}

export class EvalConst implements InterpretableConst, Coster {
  readonly #id: bigint;
  readonly #val: Value;

  constructor(id: bigint, val: Value) {
    this.#id = id;
    this.#val = val;
  }

  id() {
    return this.#id;
  }

  cost() {
    return Cost.None;
  }

  eval() {
    return this.#val;
  }

  value() {
    return this.#val;
  }
}

export class EvalOr implements Interpretable, Coster {
  readonly #id: bigint;
  readonly #left: Interpretable;
  readonly #right: Interpretable;

  constructor(id: bigint, left: Interpretable, right: Interpretable) {
    this.#id = id;
    this.#left = left;
    this.#right = right;
  }

  id() {
    return this.#id;
  }

  cost() {
    const l = Cost.estimateCost(this.#left);
    const r = Cost.estimateCost(this.#right);
    return new Cost(l.min, l.max + r.max + 1);
  }

  eval(ctx: Activation) {
    // Short-circuit lhs.
    const l = this.#left.eval(ctx);
    if (l instanceof Error) {
      return l;
    }
    if (l.kind.value === true) {
      return l;
    }
    // Short-circuit rhs.
    const r = this.#right.eval(ctx);
    if (r instanceof Error) {
      return r;
    }
    if (r.kind.value === true) {
      return r;
    }
    // Return false if both sides are false.
    if (l.kind.value === false && r.kind.value === false) {
      return boolValue(false);
    }
    // Check for unknown values
    if (isUnknownValue(l)) {
      return l;
    }
    if (isUnknownValue(r)) {
      return r;
    }
    return new Error(`no such overload for '${LOGICAL_OR_OPERATOR}`);
  }
}

export class EvalAnd implements Interpretable, Coster {
  readonly #id: bigint;
  readonly #left: Interpretable;
  readonly #right: Interpretable;

  constructor(id: bigint, left: Interpretable, right: Interpretable) {
    this.#id = id;
    this.#left = left;
    this.#right = right;
  }

  id() {
    return this.#id;
  }

  cost() {
    const l = Cost.estimateCost(this.#left);
    const r = Cost.estimateCost(this.#right);
    return new Cost(l.min, l.max + r.max + 1);
  }

  eval(ctx: Activation) {
    // Short-circuit lhs.
    const l = this.#left.eval(ctx);
    if (l instanceof Error) {
      return l;
    }
    if (l.kind.value === false) {
      return l;
    }
    // Short-circuit rhs.
    const r = this.#right.eval(ctx);
    if (r instanceof Error) {
      return r;
    }
    if (r.kind.value === false) {
      return r;
    }
    // Return true if both sides are true.
    if (l.kind.value === true && r.kind.value === true) {
      return boolValue(true);
    }
    // Check for unknown values
    if (isUnknownValue(l)) {
      return l;
    }
    if (isUnknownValue(r)) {
      return r;
    }
    return new Error(`no such overload for '${LOGICAL_OR_OPERATOR}`);
  }
}

export class EvalEq implements Interpretable, Coster {
  readonly #id: bigint;
  readonly #left: Interpretable;
  readonly #right: Interpretable;

  constructor(id: bigint, left: Interpretable, right: Interpretable) {
    this.#id = id;
    this.#left = left;
    this.#right = right;
  }

  id() {
    return this.#id;
  }

  cost() {
    const l = Cost.estimateCost(this.#left);
    const r = Cost.estimateCost(this.#right);
    return Cost.OneOne.add(l).add(r);
  }

  eval(ctx: Activation) {
    const l = this.#left.eval(ctx);
    if (l instanceof Error) {
      return l;
    }
    const r = this.#right.eval(ctx);
    if (r instanceof Error) {
      return r;
    }
    return equalValue(l, r);
  }
}

export class EvalNe implements Interpretable, Coster {
  readonly #id: bigint;
  readonly #left: Interpretable;
  readonly #right: Interpretable;

  constructor(id: bigint, left: Interpretable, right: Interpretable) {
    this.#id = id;
    this.#left = left;
    this.#right = right;
  }

  id() {
    return this.#id;
  }

  cost() {
    const l = Cost.estimateCost(this.#left);
    const r = Cost.estimateCost(this.#right);
    return Cost.OneOne.add(l).add(r);
  }

  eval(ctx: Activation) {
    const l = this.#left.eval(ctx);
    if (l instanceof Error) {
      return l;
    }
    const r = this.#right.eval(ctx);
    if (r instanceof Error) {
      return r;
    }
    const isEqual = equalValue(l, r);
    if (isEqual instanceof Error) {
      return isEqual;
    }
    return boolValue(!isEqual.kind.value);
  }
}

export class EvalZeroArity implements InterpretableCall, Coster {
  readonly #id: bigint;
  readonly #fn: string;
  readonly #overloadID: string;
  readonly #impl: FunctionOp;

  constructor(id: bigint, fn: string, overloadID: string, impl: FunctionOp) {
    this.#id = id;
    this.#fn = fn;
    this.#overloadID = overloadID;
    this.#impl = impl;
  }

  id() {
    return this.#id;
  }

  cost() {
    return Cost.OneOne;
  }

  eval() {
    return this.#impl();
  }

  function() {
    return this.#fn;
  }

  overloadID() {
    return this.#overloadID;
  }

  args() {
    return [];
  }
}

export class EvalUnary implements InterpretableCall, Coster {
  readonly #id: bigint;
  readonly #fn: string;
  readonly #overloadID: string;
  readonly #arg: Interpretable;
  readonly #trait: Trait;
  readonly #impl: UnaryOp;

  constructor(
    id: bigint,
    fn: string,
    overloadID: string,
    arg: Interpretable,
    trait: Trait,
    impl: FunctionOp
  ) {
    this.#id = id;
    this.#fn = fn;
    this.#overloadID = overloadID;
    this.#arg = arg;
    this.#trait = trait;
    this.#impl = impl;
  }

  id() {
    return this.#id;
  }

  cost() {
    return Cost.OneOne.add(Cost.estimateCost(this.#arg));
  }

  eval(ctx: Activation) {
    const arg = this.#arg.eval(ctx);
    if (arg instanceof Error) {
      return arg;
    }
    if (isUnknownValue(arg)) {
      return arg;
    }
    // If the implementation is bound and the argument value has the right
    // traits required to invoke it, then call the implementation.
    if (
      !isNil(this.#impl) &&
      (isNil(this.#trait) || valueHasTrait(arg, this.#trait))
    ) {
      return this.#impl(arg);
    }
    // Otherwise, if the argument is a ReceiverType attempt to invoke the
    // receiver method on the operand (arg0).
    if (valueHasTrait(arg, Trait.RECEIVER_TYPE)) {
      return receiver(arg, this.#fn, this.#overloadID);
    }
    return new Error(`no such overload for '${this.#fn}'`);
  }

  function() {
    return this.#fn;
  }

  overloadID() {
    return this.#overloadID;
  }

  args() {
    return [this.#arg];
  }
}
