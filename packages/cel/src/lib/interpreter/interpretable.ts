/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from '@bearclaw/is';
import { FunctionOp, UnaryOp } from '../common/functions';
import { EQUALS_OPERATOR, NOT_EQUALS_OPERATOR } from '../common/operators';
import { EQUALS_OVERLOAD, NOT_EQUALS_OVERLOAD } from '../common/overloads';
import { Adapter } from '../common/ref/provider';
import { RefVal } from '../common/ref/reference';
import { BoolRefVal } from '../common/types/bool';
import {
  ErrorRefVal,
  isErrorRefVal,
  labelErrorNode,
  wrapError,
} from '../common/types/error';
import { isOptionalRefVal } from '../common/types/optional';
import { Receiver } from '../common/types/traits/receiver';
import { Trait } from '../common/types/traits/trait';
import { BoolType, Type } from '../common/types/types';
import {
  isUnknownRefVal,
  maybeMergeUnknowns,
  UnknownRefVal,
} from '../common/types/unknown';
import { isUnknownOrError } from '../common/types/utils';
import { Activation } from './activation';
import { Attribute, isConstantQualifier, Qualifier } from './attributes';

/**
 * Interpretable can accept a given Activation and produce a value along with
 * an accompanying EvalState which can be used to inspect whether additional
 * data might be necessary to complete the evaluation.
 */
export interface Interpretable {
  /**
   * ID value corresponding to the expression node.
   */
  id(): bigint;

  /**
   * Eval an Activation to produce an output.
   */
  eval(activation: Activation): RefVal;
}

/**
 * InterpretableConst interface for tracking whether the Interpretable is a
 * constant value.
 */
export interface InterpretableConst extends Interpretable {
  /**
   * Value returns the constant value of the instruction.
   */
  value(): RefVal;
}

/**
 * InterpretableAttribute interface for tracking whether the Interpretable is
 * an attribute.
 */
export interface InterpretableAttribute extends Interpretable {
  /**
   * Attr returns the Attribute value.
   */
  attr(): Attribute;

  /**
   * Adapter returns the type adapter to be used for adapting resolved
   * Attribute values.
   */
  adapter(): Adapter;

  /**
   * AddQualifier proxies the Attribute.AddQualifier method.
   *
   * Note, this method may mutate the current attribute state. If the desire is
   * to clone the Attribute, the Attribute should first be copied before adding
   * the qualifier. Attributes are not copyable by default, so this is a
   * capability that would need to be added to the AttributeFactory or
   * specifically to the underlying Attribute implementation.
   */
  addQualifier(qual: Qualifier): Attribute | Error;

  /**
   * Qualify replicates the Attribute.Qualify method to permit extension and
   * interception of object qualification.
   */
  qualify(vars: Activation, obj: any): any | Error;

  /**
   * QualifyIfPresent qualifies the object if the qualifier is declared or
   * defined on the object. The 'presenceOnly' flag indicates that the value is
   * not necessary, just a boolean status as to whether the qualifier is
   * present.
   */
  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null];

  /**
   * IsOptional indicates whether the resulting value is an optional type.
   */
  isOptional(): boolean;

  /**
   * Resolve returns the value of the Attribute given the current Activation.
   */
  resolve(vars: Activation): any | Error;
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

/**
 * InterpretableConstructor interface for inspecting Interpretable instructions
 * that initialize a list, map or struct.
 */
export interface InterpretableConstructor extends Interpretable {
  /**
   * InitVals returns all the list elements, map key and values or struct field
   * values.
   */
  initVals(): Interpretable[];

  /**
   * Type returns the type constructed.
   */
  type(): Type;
}

// Core Interpretable implementations used during the program planning phase.

export class EvalTestOnly implements InterpretableAttribute {
  #id: bigint;
  #attr: InterpretableAttribute;

  constructor(id: bigint, attr: InterpretableAttribute) {
    this.#id = id;
    this.#attr = attr;
  }

  attr(): Attribute {
    return this.#attr.attr();
  }

  adapter(): Adapter {
    return this.#attr.adapter();
  }

  addQualifier(qual: Qualifier): Attribute | Error {
    if (!isConstantQualifier(qual)) {
      return new Error(
        `test only expressions must have constant qualifiers: ${qual}`
      );
    }
    return this.#attr.addQualifier(new TestOnlyQualifier(qual));
  }

  qualify(vars: Activation, obj: any): any | Error {
    return this.#attr.qualify(vars, obj);
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    return this.#attr.qualifyIfPresent(vars, obj, presenceOnly);
  }

  isOptional(): boolean {
    return this.#attr.isOptional();
  }

  resolve(vars: Activation): any | Error {
    return this.#attr.resolve(vars);
  }

  id(): bigint {
    return this.#id;
  }

  eval(activation: Activation): RefVal {
    const val = this.resolve(activation);
    if (val instanceof Error) {
      return labelErrorNode(this.#id, wrapError(val));
    }
    if (isOptionalRefVal(val)) {
      return new BoolRefVal(val.hasValue());
    }
    return this.adapter().nativeToValue(val);
  }
}

class TestOnlyQualifier implements Qualifier {
  #qual: Qualifier;

  constructor(qual: Qualifier) {
    this.#qual = qual;
  }

  id(): bigint {
    return this.#qual.id();
  }

  isOptional(): boolean {
    return this.#qual.isOptional();
  }

  /**
   * Qualify determines whether the test-only qualifier is present on the input
   * object.
   */
  qualify(vars: Activation, obj: any): boolean | UnknownRefVal | Error {
    const [out, present, err] = this.#qual.qualifyIfPresent(vars, obj, false);
    if (!isNil(err)) {
      return err;
    }
    if (isUnknownRefVal(out)) {
      return out;
    }
    if (isOptionalRefVal(out)) {
      return out.hasValue();
    }
    return present;
  }

  /**
   * QualifyIfPresent returns whether the target field in the test-only
   * expression is present.
   */
  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    // Only ever test for presence
    return this.#qual.qualifyIfPresent(vars, obj, true);
  }
}

export class EvalConst implements InterpretableConst {
  #id: bigint;
  #val: RefVal;

  constructor(id: bigint, val: RefVal) {
    this.#id = id;
    this.#val = val;
  }

  id(): bigint {
    return this.#id;
  }

  value(): RefVal {
    return this.#val;
  }

  eval(vars: Activation): RefVal {
    return this.#val;
  }
}

export class EvalOr implements Interpretable {
  #id: bigint;
  #terms: Interpretable[];

  constructor(id: bigint, terms: Interpretable[]) {
    this.#id = id;
    this.#terms = terms;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation): RefVal {
    let err: RefVal | null = null;
    let unk: UnknownRefVal | null = null;
    for (const term of this.#terms) {
      const val = term.eval(ctx);
      if (val.type() === BoolType) {
        // short-circuit on true.
        if (val.value() === true) {
          return BoolRefVal.True;
        }
      } else {
        if (unk && isUnknownRefVal(unk)) {
          unk = maybeMergeUnknowns(val, unk) as UnknownRefVal;
        } else if (isNil(err)) {
          if (isErrorRefVal(val)) {
            err = val;
          } else {
            err = ErrorRefVal.maybeNoSuchOverload(val);
          }
          err = labelErrorNode(this.#id, err);
        }
      }
    }
    if (!isNil(unk)) {
      return unk;
    }
    if (!isNil(err)) {
      return err;
    }
    return BoolRefVal.False;
  }
}

export class EvalAnd implements Interpretable {
  #id: bigint;
  #terms: Interpretable[];

  constructor(id: bigint, terms: Interpretable[]) {
    this.#id = id;
    this.#terms = terms;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation): RefVal {
    let err: RefVal | null = null;
    let unk: UnknownRefVal | null = null;
    for (const term of this.#terms) {
      const val = term.eval(ctx);
      if (val.type() === BoolType) {
        // short-circuit on false.
        if (val.value() === false) {
          return BoolRefVal.False;
        }
      } else {
        if (unk && isUnknownRefVal(unk)) {
          unk = maybeMergeUnknowns(val, unk) as UnknownRefVal;
        } else if (isNil(err)) {
          if (isErrorRefVal(val)) {
            err = val;
          } else {
            err = ErrorRefVal.maybeNoSuchOverload(val);
          }
          err = labelErrorNode(this.#id, err);
        }
      }
    }
    if (!isNil(unk)) {
      return unk;
    }
    if (!isNil(err)) {
      return err;
    }
    return BoolRefVal.True;
  }
}

export class EvalEq implements InterpretableCall {
  #id: bigint;
  #lhs: Interpretable;
  #rhs: Interpretable;

  constructor(id: bigint, lhs: Interpretable, rhs: Interpretable) {
    this.#id = id;
    this.#lhs = lhs;
    this.#rhs = rhs;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation) {
    const lval = this.#lhs.eval(ctx);
    const rval = this.#rhs.eval(ctx);
    if (isUnknownOrError(lval)) {
      return lval;
    }
    if (isUnknownOrError(rval)) {
      return rval;
    }
    return lval.equal(rval);
  }

  function(): string {
    return EQUALS_OPERATOR;
  }

  overloadID(): string {
    return EQUALS_OVERLOAD;
  }

  args() {
    return [this.#lhs, this.#rhs];
  }
}

export class EvalNe implements InterpretableCall {
  #id: bigint;
  #lhs: Interpretable;
  #rhs: Interpretable;

  constructor(id: bigint, lhs: Interpretable, rhs: Interpretable) {
    this.#id = id;
    this.#lhs = lhs;
    this.#rhs = rhs;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation) {
    const lval = this.#lhs.eval(ctx);
    const rval = this.#rhs.eval(ctx);
    if (isUnknownOrError(lval)) {
      return lval;
    }
    if (isUnknownOrError(rval)) {
      return rval;
    }
    return new BoolRefVal(lval.equal(rval).value() !== true);
  }

  function(): string {
    return NOT_EQUALS_OPERATOR;
  }

  overloadID(): string {
    return NOT_EQUALS_OVERLOAD;
  }

  args() {
    return [this.#lhs, this.#rhs];
  }
}

export class EvalZeroArity implements InterpretableCall {
  #id: bigint;
  #function: string;
  #overload: string;
  #impl: FunctionOp;

  constructor(id: bigint, func: string, overload: string, impl: FunctionOp) {
    this.#id = id;
    this.#function = func;
    this.#overload = overload;
    this.#impl = impl;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation) {
    return labelErrorNode(this.#id, this.#impl());
  }

  function(): string {
    return this.#function;
  }

  overloadID(): string {
    return this.#overload;
  }

  args() {
    return [];
  }
}

export class EvalUnary implements InterpretableCall {
  #id: bigint;
  #function: string;
  #overload: string;
  #arg: Interpretable;
  #trait: Trait;
  #impl: UnaryOp;
  #nonStrict: boolean;

  constructor(
    id: bigint,
    func: string,
    overload: string,
    arg: Interpretable,
    trait: Trait,
    impl: UnaryOp,
    nonStrict: boolean
  ) {
    this.#id = id;
    this.#function = func;
    this.#overload = overload;
    this.#arg = arg;
    this.#trait = trait;
    this.#impl = impl;
    this.#nonStrict = nonStrict;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation) {
    const argVal = this.#arg.eval(ctx);
    // Early return if the argument to the function is unknown or error.
    const strict = !this.#nonStrict;
    if (strict && isUnknownOrError(argVal)) {
      return argVal;
    }
    // If the implementation is bound and the argument value has the right traits required to
    // invoke it, then call the implementation.
    if (
      !isNil(this.#impl) &&
      (this.#trait === 0 ||
        (!strict && isUnknownOrError(argVal)) ||
        argVal.type().hasTrait(this.#trait))
    ) {
      return labelErrorNode(this.#id, this.#impl(argVal));
    }
    // Otherwise, if the argument is a ReceiverType attempt to invoke the receiver method on the
    // operand (arg0).
    if (argVal.type().hasTrait(Trait.RECEIVER_TYPE)) {
      return labelErrorNode(
        this.#id,
        (argVal as RefVal & Receiver).receive(
          this.#function,
          this.#overload,
          []
        )
      );
    }
    return new ErrorRefVal(`no such overload: ${this.#function}`, this.#id);
  }

  function(): string {
    return this.#function;
  }

  overloadID(): string {
    return this.#overload;
  }

  args() {
    return [this.#arg];
  }
}
