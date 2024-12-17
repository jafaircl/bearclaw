/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IN_OPERATOR } from './../common/operators';
import { MutableMap, toFoldableMap } from './../common/types/map';
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isNil } from '@bearclaw/is';
import { BinaryOp, FunctionOp, UnaryOp } from '../common/functions';
import { EQUALS_OPERATOR, NOT_EQUALS_OPERATOR } from '../common/operators';
import { EQUALS_OVERLOAD, NOT_EQUALS_OVERLOAD } from '../common/overloads';
import { Adapter, Provider } from '../common/ref/provider';
import { isRefVal, RefVal } from '../common/ref/reference';
import { BoolRefVal, isBoolRefVal } from '../common/types/bool';
import {
  ErrorRefVal,
  isErrorRefVal,
  labelErrorNode,
  wrapError,
} from '../common/types/error';
import { MutableList, toFoldableList } from '../common/types/list';
import { isOptionalRefVal } from '../common/types/optional';
import { Foldable, Iterable } from '../common/types/traits/iterator';
import { isLister, isMutableLister } from '../common/types/traits/lister';
import { isMapper, isMutableMapper } from '../common/types/traits/mapper';
import { Receiver } from '../common/types/traits/receiver';
import { Trait } from '../common/types/traits/trait';
import {
  BoolType,
  ListType,
  MapType,
  newObjectType,
  Type,
} from '../common/types/types';
import {
  isUnknownRefVal,
  maybeMergeUnknowns,
  UnknownRefVal,
} from '../common/types/unknown';
import { isUnknownOrError } from '../common/types/utils';
import { Activation } from './activation';
import { isQualifierValueEquator } from './attribute-patterns';
import {
  Attribute,
  ConstantQualifier,
  isAttribute,
  isConstantQualifier,
  Qualifier,
} from './attributes';
import { EvalObserver } from './interpreter';

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

export function isInterpretable(value: any): value is Interpretable {
  return value && isFunction(value.id) && isFunction(value.eval);
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

export function isInterpretableConst(value: any): value is InterpretableConst {
  return value && isFunction(value.value) && isInterpretable(value);
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

export function isInterpretableAttribute(
  value: any
): value is InterpretableAttribute {
  return (
    value &&
    isFunction(value.attr) &&
    isFunction(value.adapter) &&
    isFunction(value.addQualifier) &&
    isFunction(value.qualify) &&
    isFunction(value.qualifyIfPresent) &&
    isFunction(value.isOptional) &&
    isFunction(value.resolve) &&
    isInterpretable(value)
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

export function isInterpretableCall(value: any): value is InterpretableCall {
  return (
    value &&
    isFunction(value.function) &&
    isFunction(value.overloadID) &&
    isFunction(value.args) &&
    isInterpretable(value)
  );
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

export function isInterpretableConstructor(
  value: any
): value is InterpretableConstructor {
  return (
    value &&
    isFunction(value.initVals) &&
    isFunction(value.type) &&
    isInterpretable(value)
  );
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
  terms: Interpretable[];

  constructor(id: bigint, terms: Interpretable[]) {
    this.#id = id;
    this.terms = terms;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation): RefVal {
    let err: RefVal | null = null;
    let unk: UnknownRefVal | null = null;
    for (const term of this.terms) {
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
  terms: Interpretable[];

  constructor(id: bigint, terms: Interpretable[]) {
    this.#id = id;
    this.terms = terms;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation): RefVal {
    let err: RefVal | null = null;
    let unk: UnknownRefVal | null = null;
    for (const term of this.terms) {
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
  #traits: Trait[];
  #impl: UnaryOp | null;
  #nonStrict: boolean;

  constructor(
    id: bigint,
    func: string,
    overload: string,
    arg: Interpretable,
    traits: Trait[],
    impl: UnaryOp | null,
    nonStrict: boolean
  ) {
    this.#id = id;
    this.#function = func;
    this.#overload = overload;
    this.#arg = arg;
    this.#traits = traits;
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
    // If the implementation is bound and the argument value has the right
    // traits required to invoke it, then call the implementation.
    if (
      !isNil(this.#impl) &&
      (this.#traits.length === 0 ||
        (!strict && isUnknownOrError(argVal)) ||
        argVal.type().hasTraits(this.#traits))
    ) {
      return labelErrorNode(this.#id, this.#impl(argVal));
    }
    // Otherwise, if the argument is a ReceiverType attempt to invoke the
    // receiver method on the operand (arg0).
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

export class EvalBinary implements InterpretableCall {
  #id: bigint;
  #function: string;
  #overload: string;
  #lhs: Interpretable;
  #rhs: Interpretable;
  #traits: Trait[];
  #impl: BinaryOp | null;
  #nonStrict: boolean;

  constructor(
    id: bigint,
    func: string,
    overload: string,
    lhs: Interpretable,
    rhs: Interpretable,
    traits: Trait[],
    impl: BinaryOp | null,
    nonStrict: boolean
  ) {
    this.#id = id;
    this.#function = func;
    this.#overload = overload;
    this.#lhs = lhs;
    this.#rhs = rhs;
    this.#traits = traits;
    this.#impl = impl;
    this.#nonStrict = nonStrict;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation) {
    const lVal = this.#lhs.eval(ctx);
    const rVal = this.#rhs.eval(ctx);
    // Early return if any argument to the function is unknown or error.
    const strict = !this.#nonStrict;
    if (strict) {
      if (isUnknownOrError(lVal)) {
        return lVal;
      }
      if (isUnknownOrError(rVal)) {
        return rVal;
      }
    }
    // If the implementation is bound and the argument value has the right
    // traits required to invoke it, then call the implementation.
    if (
      !isNil(this.#impl) &&
      (this.#traits.length === 0 ||
        (!strict && isUnknownOrError(lVal)) ||
        lVal.type().hasTraits(this.#traits) ||
        // TODO: this is almost certainly wrong. But "in" operators throw an error without checking the rVal for the trait.
        (this.#function === IN_OPERATOR && rVal.type().hasTraits(this.#traits)))
    ) {
      return labelErrorNode(this.#id, this.#impl(lVal, rVal));
    }
    // Otherwise, if the argument is a ReceiverType attempt to invoke the
    // receiver method on the operand (arg0).
    if (lVal.type().hasTrait(Trait.RECEIVER_TYPE)) {
      return labelErrorNode(
        this.#id,
        (lVal as RefVal & Receiver).receive(this.#function, this.#overload, [
          rVal,
        ])
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
    return [this.#lhs, this.#rhs];
  }
}

export class EvalVarArgs implements InterpretableCall {
  #id: bigint;
  #function: string;
  #overload: string;
  #args: Interpretable[];
  #traits: Trait[];
  #impl: FunctionOp | null;
  #nonStrict: boolean;

  constructor(
    id: bigint,
    func: string,
    overload: string,
    args: Interpretable[],
    traits: Trait[],
    impl: FunctionOp | null,
    nonStrict: boolean
  ) {
    this.#id = id;
    this.#function = func;
    this.#overload = overload;
    this.#args = args;
    this.#traits = traits;
    this.#impl = impl;
    this.#nonStrict = nonStrict;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation) {
    const argVals: RefVal[] = [];
    // Early return if any argument to the function is unknown or error.
    const strict = !this.#nonStrict;
    for (const arg of this.#args) {
      const argVal = arg.eval(ctx);
      if (strict && isUnknownOrError(argVal)) {
        return argVal;
      }
      argVals.push(argVal);
    }
    // If the implementation is bound and the argument value has the right
    // traits required to invoke it, then call the implementation.
    const arg0 = argVals[0];
    if (
      !isNil(this.#impl) &&
      (this.#traits.length === 0 ||
        (!strict && isUnknownOrError(arg0)) ||
        arg0.type().hasTraits(this.#traits))
    ) {
      return labelErrorNode(this.#id, this.#impl(...argVals));
    }
    // Otherwise, if the argument is a ReceiverType attempt to invoke the
    // receiver method on the operand (arg0).
    if (arg0.type().hasTrait(Trait.RECEIVER_TYPE)) {
      return labelErrorNode(
        this.#id,
        (arg0 as RefVal & Receiver).receive(
          this.#function,
          this.#overload,
          argVals.slice(1)
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
    return this.#args;
  }
}

export function newCall(
  id: bigint,
  func: string,
  overload: string,
  args: Interpretable[],
  traits: Trait[],
  impl: FunctionOp,
  nonStrict: boolean
): InterpretableCall {
  return new EvalVarArgs(id, func, overload, args, traits, impl, nonStrict);
}

export class EvalList implements InterpretableConstructor {
  #id: bigint;
  #elems: Interpretable[];
  #optionals: boolean[];
  #hasOptionals: boolean;
  #adapter: Adapter;

  constructor(
    id: bigint,
    elems: Interpretable[],
    optionals: boolean[],
    hasOptionals: boolean,
    adapter: Adapter
  ) {
    this.#id = id;
    this.#elems = elems;
    this.#optionals = optionals;
    this.#hasOptionals = hasOptionals;
    this.#adapter = adapter;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation) {
    const elemVals: RefVal[] = [];
    // If any argument is unknown or error early terminate.
    for (let i = 0; i < this.#elems.length; i++) {
      const elem = this.#elems[i];
      let elemVal = elem.eval(ctx);
      if (isUnknownOrError(elemVal)) {
        return elemVal;
      }
      if (this.#hasOptionals && this.#optionals[i]) {
        if (!isOptionalRefVal(elemVal)) {
          return labelErrorNode(this.#id, invalidOptionalElementInit(elemVal));
        }
        if (!elemVal.hasValue()) {
          continue;
        }
        elemVal = elemVal.getValue();
      }
      elemVals.push(elemVal);
    }
    return this.#adapter.nativeToValue(elemVals);
  }

  initVals() {
    return this.#elems;
  }

  type() {
    return ListType;
  }
}

export class EvalMap implements InterpretableConstructor {
  #id: bigint;
  #keys: Interpretable[];
  #vals: Interpretable[];
  #optionals: boolean[];
  #hasOptionals: boolean;
  #adapter: Adapter;

  constructor(
    id: bigint,
    keys: Interpretable[],
    vals: Interpretable[],
    optionals: boolean[],
    hasOptionals: boolean,
    adapter: Adapter
  ) {
    this.#id = id;
    this.#keys = keys;
    this.#vals = vals;
    this.#optionals = optionals;
    this.#hasOptionals = hasOptionals;
    this.#adapter = adapter;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation) {
    const entries = new Map<RefVal, RefVal>();
    // If any argument is unknown or error early terminate.
    for (let i = 0; i < this.#keys.length; i++) {
      const key = this.#keys[i];
      const keyVal = key.eval(ctx);
      if (isUnknownOrError(keyVal)) {
        return keyVal;
      }
      let valVal = this.#vals[i].eval(ctx);
      if (isUnknownOrError(valVal)) {
        return valVal;
      }
      if (this.#hasOptionals && this.#optionals[i]) {
        if (!isOptionalRefVal(valVal)) {
          return labelErrorNode(
            this.#id,
            invalidOptionalEntryInit(keyVal, valVal)
          );
        }
        if (!valVal.hasValue()) {
          entries.delete(keyVal);
          continue;
        }
        valVal = valVal.getValue();
      }
      entries.set(keyVal, valVal);
    }
    return this.#adapter.nativeToValue(entries);
  }

  initVals() {
    if (this.#keys.length != this.#vals.length) {
      throw new Error('map keys and values must be of equal length');
    }
    const result: Interpretable[] = [];
    let idx = 0;
    for (let i = 0; i < this.#keys.length; i++) {
      const k = this.#keys[i];
      const v = this.#vals[i];
      result[idx] = k;
      idx++;
      result[idx] = v;
      idx++;
    }
    return result;
  }

  type() {
    return MapType;
  }
}

export class EvalObj implements InterpretableConstructor {
  #id: bigint;
  #typeName: string;
  #fields: string[];
  #vals: Interpretable[];
  #optionals: boolean[];
  #hasOptionals: boolean;
  #provider: Provider;

  constructor(
    id: bigint,
    typeName: string,
    fields: string[],
    vals: Interpretable[],
    optionals: boolean[],
    hasOptionals: boolean,
    provider: Provider
  ) {
    this.#id = id;
    this.#typeName = typeName;
    this.#fields = fields;
    this.#vals = vals;
    this.#optionals = optionals;
    this.#hasOptionals = hasOptionals;
    this.#provider = provider;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation) {
    const fieldVals = new Map<string, RefVal>();
    // If any argument is unknown or error early terminate.
    for (let i = 0; i < this.#fields.length; i++) {
      const field = this.#fields[i];
      let val = this.#vals[i].eval(ctx);
      if (isUnknownOrError(val)) {
        return val;
      }
      if (this.#hasOptionals && this.#optionals[i]) {
        if (!isOptionalRefVal(val)) {
          return labelErrorNode(this.#id, invalidOptionalEntryInit(field, val));
        }
        if (!val.hasValue()) {
          fieldVals.delete(field);
          continue;
        }
        val = val.getValue();
      }
      fieldVals.set(field, val);
    }
    return labelErrorNode(
      this.#id,
      this.#provider.newValue(this.#typeName, fieldVals)
    );
  }

  initVals(): Interpretable[] {
    return this.#vals;
  }

  type() {
    return newObjectType(this.#typeName);
  }
}

export class EvalFold implements Interpretable {
  #id: bigint;
  accuVar: string;
  iterVar: string;
  iterVar2: string;
  iterRange: Interpretable;
  accu: Interpretable;
  cond: Interpretable;
  step: Interpretable;
  result: Interpretable;
  adapter: Adapter;

  // note an exhaustive fold will ensure that all branches are evaluated
  // when using mutable values, these branches will mutate the final result
  // rather than make a throw-away computation.
  exhaustive: boolean;
  interruptable: boolean;

  constructor(
    id: bigint,
    accuVar: string,
    iterVar: string,
    iterVar2: string,
    iterRange: Interpretable,
    accu: Interpretable,
    cond: Interpretable,
    step: Interpretable,
    result: Interpretable,
    adapter: Adapter,
    exhaustive: boolean,
    interruptable: boolean
  ) {
    this.#id = id;
    this.accuVar = accuVar;
    this.iterVar = iterVar;
    this.iterVar2 = iterVar2;
    this.iterRange = iterRange;
    this.accu = accu;
    this.cond = cond;
    this.step = step;
    this.result = result;
    this.adapter = adapter;
    this.exhaustive = exhaustive;
    this.interruptable = interruptable;
  }

  id() {
    return this.#id;
  }

  eval(ctx: Activation) {
    // Initialize the folder interface
    const f = new Folder(this, ctx);

    const foldRange = this.iterRange.eval(ctx);
    if (this.iterVar2 != '') {
      let foldable: Foldable | null = null;
      if (isMapper(foldRange)) {
        foldable = toFoldableMap(foldRange);
      } else if (isLister(foldRange)) {
        foldable = toFoldableList(foldRange);
      } else {
        return new ErrorRefVal(
          `unsupported comprehension range type: ${foldRange}`,
          this.#id
        );
      }
      foldable?.fold(f);
      return f.evalResult();
    }

    if (!foldRange.type().hasTrait(Trait.ITERABLE_TYPE)) {
      return ErrorRefVal.valOrErr(
        foldRange,
        `got '${foldRange}', expected iterable type`
      );
    }
    const iterable = foldRange as RefVal & Iterable;
    return f.foldIterable(iterable);
  }
}

// TODO: add optional interpretables
// Optional Interpretable implementations that specialize, subsume, or extend
// the core evaluation plan via decorators.

/**
 * evalWatch is an Interpretable implementation that wraps the execution of a
 * given expression so that it may observe the computed value and send it to an
 * observer.
 */
export class EvalWatch implements Interpretable {
  #interpretable: Interpretable;
  #observer: EvalObserver;

  constructor(interpretable: Interpretable, observer: EvalObserver) {
    this.#interpretable = interpretable;
    this.#observer = observer;
  }

  id() {
    return this.#interpretable.id();
  }

  eval(ctx: Activation): RefVal {
    const val = this.#interpretable.eval(ctx);
    this.#observer(this.id(), this.#interpretable, val);
    return val;
  }
}

/**
 * evalWatchAttr describes a watcher of an InterpretableAttribute Interpretable.
 *
 * Since the watcher may be selected against at a later stage in program
 * planning, the watcher must implement the InterpretableAttribute interface by
 * proxy.
 */
export class EvalWatchAttr implements InterpretableAttribute {
  interpretableAttr: InterpretableAttribute;
  #observer: EvalObserver;

  constructor(
    interpretableAttr: InterpretableAttribute,
    observer: EvalObserver
  ) {
    this.interpretableAttr = interpretableAttr;
    this.#observer = observer;
  }

  id() {
    return this.interpretableAttr.id();
  }

  attr() {
    return this.interpretableAttr.attr();
  }

  adapter() {
    return this.interpretableAttr.adapter();
  }

  isOptional(): boolean {
    return this.interpretableAttr.isOptional();
  }

  qualify(vars: Activation, obj: any) {
    return this.interpretableAttr.qualify(vars, obj);
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    return this.interpretableAttr.qualifyIfPresent(vars, obj, presenceOnly);
  }

  resolve(vars: Activation) {
    return this.interpretableAttr.resolve(vars);
  }

  /**
   * AddQualifier creates a wrapper over the incoming qualifier which observes
   * the qualification result.
   */
  addQualifier(qual: Qualifier): Attribute | Error {
    let q: Qualifier;
    // By default, the qualifier is either a constant or an attribute
    // There may be some custom cases where the attribute is neither.
    if (isConstantQualifier(qual)) {
      // Expose a method to test whether the qualifier matches the input
      // pattern.
      q = new EvalWatchConstQual(qual, this.#observer, this.adapter());
    } else if (qual instanceof EvalWatchAttr) {
      // Unwrap the evalWatchAttr since the observation will be applied during
      // Qualify or QualifyIfPresent rather than Eval.
      q = new EvalWatchAttrQual(
        qual.interpretableAttr,
        this.#observer,
        this.adapter()
      );
    } else if (isAttribute(qual)) {
      // Expose methods which intercept the qualification prior to being
      // applied as a qualifier. Using this interface ensures that the
      // qualifier is converted to a constant value one time during attribute
      // pattern matching as the method embeds the Attribute interface needed
      // to trip the conversion to a constant.
      q = new EvalWatchAttrQual(qual, this.#observer, this.adapter());
    } else {
      // This is likely a custom qualifier type.
      q = new EvalWatchQual(qual, this.#observer, this.adapter());
    }
    return this.interpretableAttr.addQualifier(q);
  }

  eval(ctx: Activation): RefVal {
    const val = this.interpretableAttr.eval(ctx);
    this.#observer(this.id(), this.interpretableAttr, val);
    return val;
  }
}

/**
 * evalWatchConstQual observes the qualification of an object using a constant boolean, int, string, or uint.
 */
export class EvalWatchConstQual implements ConstantQualifier {
  #constantQualifier: ConstantQualifier;
  #observer: EvalObserver;
  #adapter: Adapter;

  constructor(
    constantQualifier: ConstantQualifier,
    observer: EvalObserver,
    adapter: Adapter
  ) {
    this.#constantQualifier = constantQualifier;
    this.#observer = observer;
    this.#adapter = adapter;
  }

  value(): RefVal {
    return this.#constantQualifier.value();
  }

  id(): bigint {
    return this.#constantQualifier.id();
  }

  isOptional(): boolean {
    return this.#constantQualifier.isOptional();
  }

  /**
   * Qualify observes the qualification of a object via a constant boolean, int, string, or uint.
   */
  qualify(vars: Activation, obj: any) {
    const out = this.#constantQualifier.qualify(vars, obj);
    let val: RefVal;
    if (out instanceof Error) {
      val = labelErrorNode(this.id(), wrapError(out));
    } else {
      val = this.#adapter.nativeToValue(out);
    }
    this.#observer(this.id(), this.#constantQualifier, val);
    return out;
  }

  /**
   * QualifyIfPresent conditionally qualifies the variable and only records a
   * value if one is present.
   */
  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    const [out, present, err] = this.#constantQualifier.qualifyIfPresent(
      vars,
      obj,
      presenceOnly
    );
    let val: RefVal;
    if (!isNil(err)) {
      val = labelErrorNode(this.id(), wrapError(err));
    } else if (!isNil(out)) {
      val = this.#adapter.nativeToValue(out);
    } else if (presenceOnly) {
      val = new BoolRefVal(present);
    }
    if (present || presenceOnly) {
      this.#observer(this.id(), this.#constantQualifier, val!);
    }
    return [out, present, err];
  }

  /**
   * QualifierValueEquals tests whether the incoming value is equal to the
   * qualifying constant.
   */
  qualifierValueEquals(val: any): boolean {
    if (isQualifierValueEquator(this.#constantQualifier)) {
      return this.#constantQualifier.qualifierValueEquals(val);
    }
    return false;
  }
}

/**
 * evalWatchAttrQual observes the qualification of an object by a value
 * computed at runtime.
 */
export class EvalWatchAttrQual implements Attribute {
  #attr: Attribute;
  #observer: EvalObserver;
  #adapter: Adapter;

  constructor(attr: Attribute, observer: EvalObserver, adapter: Adapter) {
    this.#attr = attr;
    this.#observer = observer;
    this.#adapter = adapter;
  }

  addQualifier(qualifier: Qualifier): Attribute | Error {
    return this.#attr.addQualifier(qualifier);
  }

  resolve(vars: Activation) {
    return this.#attr.resolve(vars);
  }

  id(): bigint {
    return this.#attr.id();
  }

  isOptional(): boolean {
    return this.#attr.isOptional();
  }

  /**
   * Qualify observes the qualification of a object via a value computed at
   * runtime.
   */
  qualify(vars: Activation, obj: any) {
    const out = this.#attr.qualify(vars, obj);
    let val: RefVal;
    if (out instanceof Error) {
      val = labelErrorNode(this.id(), wrapError(out));
    } else {
      val = this.#adapter.nativeToValue(out);
    }
    this.#observer(this.id(), this.#attr, val);
    return out;
  }

  /**
   * QualifyIfPresent conditionally qualifies the variable and only records a
   * value if one is present.
   */
  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    const [out, present, err] = this.#attr.qualifyIfPresent(
      vars,
      obj,
      presenceOnly
    );
    let val: RefVal;
    if (!isNil(err)) {
      val = labelErrorNode(this.id(), wrapError(err));
    } else if (!isNil(out)) {
      val = this.#adapter.nativeToValue(out);
    } else if (presenceOnly) {
      val = new BoolRefVal(present);
    }
    if (present || presenceOnly) {
      this.#observer(this.id(), this.#attr, val!);
    }
    return [out, present, err];
  }
}

/**
 * evalWatchQual observes the qualification of an object by a value computed at
 * runtime.
 */
export class EvalWatchQual implements Qualifier {
  #qual: Qualifier;
  #observer: EvalObserver;
  #adapter: Adapter;

  constructor(qual: Qualifier, observer: EvalObserver, adapter: Adapter) {
    this.#qual = qual;
    this.#observer = observer;
    this.#adapter = adapter;
  }

  id(): bigint {
    return this.#qual.id();
  }

  isOptional(): boolean {
    return this.#qual.isOptional();
  }

  /**
   * Qualify observes the qualification of a object via a value computed at
   * runtime.
   */
  qualify(vars: Activation, obj: any) {
    const out = this.#qual.qualify(vars, obj);
    let val: RefVal;
    if (out instanceof Error) {
      val = labelErrorNode(this.id(), wrapError(out));
    } else {
      val = this.#adapter.nativeToValue(out);
    }
    this.#observer(this.id(), this.#qual, val);
    return out;
  }

  /**
   * QualifyIfPresent conditionally qualifies the variable and only records a
   * value if one is present.
   */
  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    const [out, present, err] = this.#qual.qualifyIfPresent(
      vars,
      obj,
      presenceOnly
    );
    let val: RefVal;
    if (!isNil(err)) {
      val = labelErrorNode(this.id(), wrapError(err));
    } else if (!isNil(out)) {
      val = this.#adapter.nativeToValue(out);
    } else if (presenceOnly) {
      val = new BoolRefVal(present);
    }
    if (present || presenceOnly) {
      this.#observer(this.id(), this.#qual, val!);
    }
    return [out, present, err];
  }
}

/**
 * evalWatchConst describes a watcher of an instConst Interpretable.
 */
export class EvalWatchConst implements InterpretableConst {
  #const: InterpretableConst;
  #observer: EvalObserver;

  constructor(instConst: InterpretableConst, observer: EvalObserver) {
    this.#const = instConst;
    this.#observer = observer;
  }
  value(): RefVal {
    return this.#const.value();
  }

  id() {
    return this.#const.id();
  }

  eval(ctx: Activation) {
    const val = this.value();
    this.#observer(this.id(), this.#const, val);
    return val;
  }
}

/**
 * evalAttr evaluates an Attribute value.
 */
export class EvalAttr implements InterpretableAttribute {
  #adapter: Adapter;
  #attr: Attribute;
  #optional: boolean;

  constructor(adapter: Adapter, attr: Attribute, optional = false) {
    this.#adapter = adapter;
    this.#attr = attr;
    this.#optional = optional;
  }

  attr(): Attribute {
    return this.#attr;
  }

  adapter(): Adapter {
    return this.#adapter;
  }

  addQualifier(qual: Qualifier): Attribute | Error {
    const attr = this.#attr.addQualifier(qual);
    if (attr instanceof Error) {
      return attr;
    }
    this.#attr = attr;
    return attr;
  }

  qualify(vars: Activation, obj: any) {
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
    return this.#optional;
  }

  resolve(vars: Activation) {
    return this.#attr.resolve(vars);
  }

  id(): bigint {
    return this.#attr.id();
  }

  eval(activation: Activation): RefVal {
    const v = this.#attr.resolve(activation);
    if (v instanceof Error) {
      return labelErrorNode(this.#attr.id(), wrapError(v));
    }
    return this.#adapter.nativeToValue(v);
  }
}

export class EvalWatchConstructor implements InterpretableConstructor {
  #ctor: InterpretableConstructor;
  #observer: EvalObserver;

  constructor(ctor: InterpretableConstructor, observer: EvalObserver) {
    this.#ctor = ctor;
    this.#observer = observer;
  }

  initVals(): Interpretable[] {
    return this.#ctor.initVals();
  }

  type(): Type {
    return this.#ctor.type();
  }

  id(): bigint {
    return this.#ctor.id();
  }

  eval(activation: Activation): RefVal {
    const val = this.#ctor.eval(activation);
    this.#observer(this.#ctor.id(), this.#ctor, val);
    return val;
  }
}

/**
 * folder tracks the state associated with folding a list or map with a
 * comprehension v2 style macro.
 *
 * The folder embeds an interpreter.Activation and Interpretable evalFold value
 * as well as implements the traits.Folder interface methods.
 *
 * TODO: golang uses a pool of folders to reduce memory allocation overhead.
 */
export class Folder implements Activation {
  #evalFold: EvalFold;
  #activation: Activation;

  // fold state objects.
  #accuVal: RefVal | null;
  #iterVar1Val: any;
  #iterVar2Val: any;

  // bookkeeping flags to modify Activation and fold behaviors.
  #initialized: boolean;
  #mutableValue: boolean;
  #interrupted: boolean;
  #computeResult: boolean;

  constructor(evalFold: EvalFold, activation: Activation) {
    this.#evalFold = evalFold;
    this.#activation = activation;
    this.#accuVal = null;
    this.#iterVar1Val = null;
    this.#iterVar2Val = null;
    this.#initialized = false;
    this.#mutableValue = false;
    this.#interrupted = false;
    this.#computeResult = false;
  }

  parent() {
    return this.#activation.parent();
  }

  foldIterable(iterable: Iterable): RefVal {
    const it = iterable.iterator();
    while (it.hasNext().value()) {
      this.#iterVar1Val = it.next();

      const cond = this.#evalFold.cond.eval(this);
      if (isBoolRefVal(cond)) {
        if (
          this.#interrupted ||
          (!this.#evalFold.exhaustive && cond.value() !== true)
        ) {
          return this.evalResult();
        }
      }

      // Update the accumulation value and check for eval interuption.
      this.#accuVal = this.#evalFold.step.eval(this);
      this.#initialized = true;
      if (this.#evalFold.interruptable && checkInterrupt(this.#activation)) {
        this.#interrupted = true;
        return this.evalResult();
      }
    }
    return this.evalResult();
  }

  /**
   * FoldEntry will either fold comprehension v1 style macros if iterVar2 is
   * unset, or comprehension v2 style macros if both the iterVar and iterVar2
   * are set to non-empty strings.
   */
  foldEntry(key: any, val: any): boolean {
    // Default to referencing both values.
    this.#iterVar1Val = key;
    this.#iterVar2Val = val;

    // Terminate evaluation if evaluation is interrupted or the condition is
    // not true and exhaustive eval is not enabled.
    const cond = this.#evalFold.cond.eval(this);
    if (isBoolRefVal(cond)) {
      if (
        this.#interrupted ||
        (!this.#evalFold.exhaustive && cond.value() !== true)
      ) {
        return false;
      }
    }

    // Update the accumulation value and check for eval interuption.
    this.#accuVal = this.#evalFold.step.eval(this);
    this.#initialized = true;
    if (this.#evalFold.interruptable && checkInterrupt(this.#activation)) {
      this.#interrupted = true;
      return false;
    }
    return true;
  }

  /**
   * ResolveName overrides the default Activation lookup to perform lazy
   * initialization of the accumulator and specialized lookups of iteration
   * values with consideration for whether the final result is being computed
   * and the iteration variables should be ignored.
   */
  resolveName(name: string): any {
    if (name == this.#evalFold.accuVar) {
      if (!this.#initialized) {
        this.#initialized = true;
        let initVal = this.#evalFold.accu.eval(this.#activation);
        if (!this.#evalFold.exhaustive) {
          if (isLister(initVal) && initVal.size().value() === BigInt(0)) {
            initVal = new MutableList(this.#evalFold.adapter, []);
            this.#mutableValue = true;
          }
          if (isMapper(initVal) && initVal.size().value() === BigInt(0)) {
            initVal = new MutableMap(this.#evalFold.adapter, new Map());
            this.#mutableValue = true;
          }
        }
        this.#accuVal = initVal;
      }
      return this.#accuVal;
    }
    if (!this.#computeResult) {
      if (name == this.#evalFold.iterVar) {
        this.#iterVar1Val = this.#evalFold.adapter.nativeToValue(
          this.#iterVar1Val
        );
        return this.#iterVar1Val;
      }
      if (name == this.#evalFold.iterVar2) {
        this.#iterVar2Val = this.#evalFold.adapter.nativeToValue(
          this.#iterVar2Val
        );
        return this.#iterVar2Val;
      }
    }
    return this.#activation.resolveName(name);
  }

  evalResult(): RefVal {
    this.#computeResult = true;
    if (this.#interrupted) {
      return new ErrorRefVal('operation interrupted');
    }
    let res = this.#evalFold.result.eval(this);
    // Convert a mutable list or map to an immutable one if the comprehension
    // has generated a list or map as a result.
    if (!isUnknownOrError(res) && this.#mutableValue) {
      if (isMutableLister(res)) {
        res = res.toImmutableList();
      }
      if (isMutableMapper(res)) {
        res = res.toImmutableMap();
      }
    }
    return res;
  }
}

function checkInterrupt(a: Activation) {
  const stop = a.resolveName('#interrupted');
  return stop === true;
}

function invalidOptionalEntryInit(field: any, value: RefVal): ErrorRefVal {
  if (isRefVal(field)) {
    field = field.value();
  }
  return new ErrorRefVal(
    `cannot initialize optional entry '${field}' from non-optional value ${value.value()}`
  );
}

function invalidOptionalElementInit(value: RefVal): ErrorRefVal {
  return new ErrorRefVal(
    `cannot initialize optional list element from non-optional value ${value.value()}`
  );
}
