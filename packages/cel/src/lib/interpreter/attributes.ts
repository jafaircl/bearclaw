/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isNil, isString } from '@bearclaw/is';
import { Container } from '../common/container';
import { Adapter, FieldType, Provider } from '../common/ref/provider';
import { isRefVal, RefVal } from '../common/ref/reference';
import { BoolRefVal } from '../common/types/bool';
import { DoubleRefVal } from '../common/types/double';
import { ErrorRefVal, isErrorRefVal } from '../common/types/error';
import { IntRefVal } from '../common/types/int';
import { indexOrError, RefValList } from '../common/types/list';
import { RefValMap } from '../common/types/map';
import { reflectNativeType } from '../common/types/native';
import {
  isOptionalRefVal,
  OptionalNone,
  OptionalRefVal,
} from '../common/types/optional';
import { StringRefVal } from '../common/types/string';
import { isFieldTester } from '../common/types/traits/field-tester';
import { isIndexer } from '../common/types/traits/indexer';
import { isLister } from '../common/types/traits/lister';
import { isMapper } from '../common/types/traits/mapper';
import { Kind, Type } from '../common/types/types';
import { UintRefVal } from '../common/types/uint';
import { isUnknownRefVal, UnknownRefVal } from '../common/types/unknown';
import { Activation } from './activation';
import { Interpretable } from './interpretable';

/**
 * AttributeFactory provides methods creating Attribute and Qualifier values.
 */
export interface AttributeFactory {
  /**
   * AbsoluteAttribute creates an attribute that refers to a top-level variable
   * name.
   *
   * Checked expressions generate absolute attribute with a single name.
   *
   * Parse-only expressions may have more than one possible absolute identifier
   * when the expression is created within a container, e.g. package or
   * namespace.
   *
   * When there is more than one name supplied to the AbsoluteAttribute call,
   * the names must be in CEL's namespace resolution order. The name arguments
   * provided here are returned in the same order hey were provided by the
   * NamespacedAttribute CandidateVariableNames method.
   */
  absoluteAttribute(id: bigint, ...names: string[]): NamespacedAttribute;

  /**
   * ConditionalAttribute creates an attribute with two Attribute branches,
   * where the Attribute that is resolved depends on the boolean evaluation of
   * the input 'expr'.
   */
  conditionalAttribute(
    id: bigint,
    expr: Interpretable,
    t: Attribute,
    f: Attribute
  ): Attribute;

  /**
   * MaybeAttribute creates an attribute that refers to either a field
   * selection or a namespaced variable name.
   *
   * Only expressions which have not been type-checked may generate oneof
   * attributes.
   */
  maybeAttribute(id: bigint, name: string): Attribute;

  /**
   * RelativeAttribute creates an attribute whose value is a qualification of a
   * dynamic computation rather than a static variable reference.
   */
  relativeAttribute(id: bigint, operand: Interpretable): Attribute;

  /**
   * NewQualifier creates a qualifier on the target object with a given value.
   *
   * The 'val' may be an Attribute or any proto-supported map key type: bool,
   * int, string, uint.
   *
   * The qualifier may consider the object type being qualified, if present. If
   * absent, the qualification should be considered dynamic and the
   * qualification should still work, though it may be sub-optimal.
   */
  newQualifier(
    objType: Type | null,
    qualID: bigint,
    val: any,
    opt: boolean
  ): Qualifier | Error;
}

export function isAttributeFactory(value: any): value is AttributeFactory {
  return (
    value &&
    isFunction(value['absoluteAttribute']) &&
    isFunction(value['conditionalAttribute']) &&
    isFunction(value['maybeAttribute']) &&
    isFunction(value['relativeAttribute']) &&
    isFunction(value['newQualifier'])
  );
}

/**
 * Qualifier marker interface for designating different qualifier values and
 * where they appear within field selections and index call expressions
 * (`_[_]`).
 */
export interface Qualifier {
  /**
   * ID where the qualifier appears within an expression.
   */
  id(): bigint;

  /**
   * IsOptional specifies whether the qualifier is optional.
   * Instead of a direct qualification, an optional qualifier will be resolved
   * via QualifyIfPresent rather than Qualify. A non-optional qualifier may
   * also be resolved through QualifyIfPresent if the object to qualify is
   * itself optional.
   */
  isOptional(): boolean;

  /**
   * Qualify performs a qualification, e.g. field selection, on the input
   * object and returns the value of the access and whether the value was set.
   * A non-nil value with a false presence test result indicates that the value
   * being returned is the default value.
   */
  qualify(vars: Activation, obj: any): any | Error;

  /**
   * QualifyIfPresent qualifies the object if the qualifier is declared or
   * defined on the object. The 'presenceOnly' flag indicates that the value is
   * not necessary, just a boolean status o whether the qualifier is
   * present.
   */
  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null];
}

export function isQualifier(value: any): value is Qualifier {
  return (
    value &&
    isFunction(value['id']) &&
    isFunction(value['isOptional']) &&
    isFunction(value['qualify']) &&
    isFunction(value['qualifyIfPresent'])
  );
}

/**
 * ConstantQualifier interface embeds the Qualifier interface and provides an
 * option to inspect the qualifier's constant value.
 *
 * Non-constant qualifiers are of Attribute type.
 */
export interface ConstantQualifier extends Qualifier {
  /**
   * Value returns the constant value associated with the qualifier.
   */
  value(): RefVal;
}

export function isConstantQualifier(value: any): value is ConstantQualifier {
  return value && isFunction(value['value']) && isQualifier(value);
}

/**
 * Attribute values are a variable or value with an optional set of qualifiers,
 * such as field, key, or index accesses.
 */
export interface Attribute extends Qualifier {
  /**
   * AddQualifier adds a qualifier on the Attribute or error if the
   * qualification is not a valid qualifier type.
   */
  addQualifier(qualifier: Qualifier): Attribute | Error;

  /**
   * Resolve returns the value of the Attribute and whether it was present
   * given an Activation. For objects which support safe traversal, the value may be non-nil and the presence flag be false.
   *
   * If an error is encountered during attribute resolution, it will be
   * returned immediately.
   * If the attribute cannot be resolved within the Activation, the result must
   * be: `nil`, `error` with the error indicating which variable was missing.
   */
  resolve(vars: Activation): any | Error;
}

export function isAttribute(value: any): value is Attribute {
  return value && isFunction(value['addQualifier']) && isQualifier(value);
}

/**
 * NamespacedAttribute values are a variable within a namespace, and an
 * optional set of qualifiers such as field, key, or index accesses.
 */
export interface NamespacedAttribute extends Attribute {
  /**
   * CandidateVariableNames returns the possible namespaced variable names for
   * this Attribute in the CEL namespace resolution order.
   */
  candidateVariableNames(): string[];

  /**
   * Qualifiers returns the list of qualifiers associated with the Attribute.
   */
  qualifiers(): Qualifier[];
}

export function isNamespacedAttribute(
  value: any
): value is NamespacedAttribute {
  return (
    value &&
    isFunction(value['candidateVariableNames']) &&
    isFunction(value['qualifiers']) &&
    isAttribute(value)
  );
}

export interface AttrFactoryOptions {
  /**
   * EnableErrorOnBadPresenceTest error generation when a presence test or
   * optional field selection is performed on a primitive type.
   */
  enableErrorOnBadPresenceTest?: boolean;
}

export class AttrFactory implements AttributeFactory {
  #container: Container;
  #adapter: Adapter;
  #provider: Provider;
  #errorOnBadPresenceTest = false;

  constructor(
    container: Container,
    adapter: Adapter,
    provider: Provider,
    opts?: AttrFactoryOptions
  ) {
    this.#container = container;
    this.#adapter = adapter;
    this.#provider = provider;

    if (!isNil(opts)) {
      if (opts.enableErrorOnBadPresenceTest) {
        this.#errorOnBadPresenceTest = opts.enableErrorOnBadPresenceTest;
      }
    }
  }

  absoluteAttribute(id: bigint, ...names: string[]): NamespacedAttribute {
    return new AbsoluteAttribute(
      id,
      names,
      [],
      this.#adapter,
      this.#provider,
      this,
      this.#errorOnBadPresenceTest
    );
  }

  conditionalAttribute(
    id: bigint,
    expr: Interpretable,
    t: Attribute,
    f: Attribute
  ): Attribute {
    return new ConditionalAttribute(id, expr, t, f, this.#adapter, this);
  }

  maybeAttribute(id: bigint, name: string): Attribute {
    return new MaybeAttribute(
      id,
      [
        this.absoluteAttribute(
          id,
          ...this.#container.resolveCandidateNames(name)
        ),
      ],
      this.#adapter,
      this.#provider,
      this
    );
  }

  relativeAttribute(id: bigint, operand: Interpretable): Attribute {
    return new RelativeAttribute(
      id,
      operand,
      [],
      this.#adapter,
      this,
      this.#errorOnBadPresenceTest
    );
  }

  newQualifier(
    objType: Type,
    qualID: bigint,
    val: any,
    opt: boolean
  ): Qualifier | Error {
    // Before creating a new qualifier check to see if this is a protobuf
    // message field access. If so, use the precomputed GetFrom qualification
    // method rather than the standard stringQualifier.
    if (isString(val) && !isNil(objType) && objType.kind() == Kind.STRUCT) {
      const ft = this.#provider.findStructFieldType(objType.typeName(), val);
      if (!isNil(ft) && !isNil(ft.isSet) && !isNil(ft.getFrom)) {
        return new FieldQualifier(qualID, val, ft, this.#adapter, opt);
      }
    }
    return newQualifier(
      this.#adapter,
      qualID,
      val,
      opt,
      this.#errorOnBadPresenceTest
    );
  }
}

class AbsoluteAttribute implements NamespacedAttribute {
  #id: bigint;
  /**
   * namespaceNames represent the names the variable could have based on
   * declared container (package) of the expression.
   */
  #namespacedNames: string[];
  #qualifiers: Qualifier[];
  #adapter: Adapter;
  #provider: Provider;
  #fac: AttributeFactory;
  #errorOnBadPresesenceTest = false;

  constructor(
    id: bigint,
    names: string[],
    qualifiers: Qualifier[],
    adapter: Adapter,
    provider: Provider,
    fac: AttributeFactory,
    errorOnBadPresenceTest?: boolean
  ) {
    this.#id = id;
    this.#namespacedNames = names;
    this.#qualifiers = qualifiers;
    this.#adapter = adapter;
    this.#provider = provider;
    this.#fac = fac;

    if (!isNil(errorOnBadPresenceTest)) {
      this.#errorOnBadPresesenceTest = errorOnBadPresenceTest;
    }
  }

  candidateVariableNames(): string[] {
    return this.#namespacedNames;
  }

  qualifiers(): Qualifier[] {
    return this.#qualifiers;
  }

  addQualifier(qualifier: Qualifier): Attribute | Error {
    this.#qualifiers.push(qualifier);
    return this;
  }

  /**
   * Resolve returns the resolved Attribute value given the Activation, or
   * error if the Attribute variable is not found, or if its Qualifiers cannot
   * be applied successfully.
   *
   * If the variable name cannot be found as an Activation variable or in the
   * TypeProvider as a type, then the result is `nil`, `error` with the error
   * indicating the name of the first variable searched as missing.
   */
  resolve(vars: Activation): any | Error {
    for (const nm of this.#namespacedNames) {
      // If the variable is found, process it. Otherwise, wait until the checks
      // to determine whether the type is unknown before returning.
      const obj = vars.resolveName(nm);
      if (!isNil(obj)) {
        if (isErrorRefVal(obj)) {
          return obj.value();
        }
        const [_obj, isOpt, err] = applyQualifiers(vars, obj, this.#qualifiers);
        if (!isNil(err)) {
          return err;
        }
        if (isOpt) {
          const val = this.#adapter.nativeToValue(_obj);
          if (isUnknownRefVal(val)) {
            return val;
          }
          return new OptionalRefVal(val);
        }
        return _obj;
      }
      // Attempt to resolve the qualified type name if the name is not a
      // variable identifier.
      const typ = this.#provider.findIdent(nm);
      if (!isNil(typ) && this.#qualifiers.length === 0) {
        return typ;
      }
    }
    return new ResolutionError(this.#namespacedNames.join(', '));
  }

  id(): bigint {
    const qualCount = this.#qualifiers.length;
    if (qualCount === 0) {
      return this.#id;
    }
    return this.#qualifiers[qualCount - 1].id();
  }

  /**
   * IsOptional returns trivially false for an attribute he attribute
   * represents a fully qualified variable name. If the attribute is used in an
   * optional manner, then an attrQualifier is created and marks the attribute
   * as optional.
   */
  isOptional(): boolean {
    return false;
  }

  qualify(vars: Activation, obj: any): any | Error {
    return attrQualify(this.#fac, vars, obj, this);
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    return attrQualifyIfPresent(this.#fac, vars, obj, this, presenceOnly);
  }

  toString() {
    return `id: ${this.#id}, names: ${this.#namespacedNames.join('.')}`;
  }
}

class ConditionalAttribute implements Attribute {
  #id: bigint;
  #expr: Interpretable;
  #truthy: Attribute;
  #falsy: Attribute;
  #adapter: Adapter;
  #fac: AttributeFactory;

  constructor(
    id: bigint,
    expr: Interpretable,
    truthy: Attribute,
    falsy: Attribute,
    adapter: Adapter,
    fac: AttributeFactory
  ) {
    this.#id = id;
    this.#expr = expr;
    this.#truthy = truthy;
    this.#falsy = falsy;
    this.#adapter = adapter;
    this.#fac = fac;
  }

  /**
   * AddQualifier appends the same qualifier to both sides of the conditional,
   * in effect managing the qualification of alternate attributes.
   */
  addQualifier(qualifier: Qualifier): Attribute | Error {
    const truthy = this.#truthy.addQualifier(qualifier);
    if (truthy instanceof Error) {
      return truthy;
    }
    const falsy = this.#falsy.addQualifier(qualifier);
    if (falsy instanceof Error) {
      return falsy;
    }
    return this;
  }

  resolve(vars: Activation): any | Error {
    const val = this.#expr.eval(vars);
    if (val.value() === true) {
      return this.#truthy.resolve(vars);
    }
    if (val.value() === false) {
      return this.#falsy.resolve(vars);
    }
    if (isUnknownRefVal(val)) {
      return val;
    }
    return ErrorRefVal.maybeNoSuchOverload(val);
  }

  id(): bigint {
    // There's a field access after the conditional.
    if (this.#truthy.id() == this.#falsy.id()) {
      return this.#truthy.id();
    }
    // Otherwise return the conditional id he consistent id being tracked.
    return this.#id;
  }

  /**
   * IsOptional returns trivially false for an attribute he attribute
   * represents a fully qualified variable name. If the attribute is used in an
   * optional manner, then an attrQualifier is created and marks the attribute
   * as optional.
   */
  isOptional(): boolean {
    return false;
  }

  qualify(vars: Activation, obj: any): any | Error {
    return attrQualify(this.#fac, vars, obj, this);
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    return attrQualifyIfPresent(this.#fac, vars, obj, this, presenceOnly);
  }

  toString() {
    return `id: ${this.#id}, truthy attribute: ${
      this.#truthy
    }, falsy attribute: ${this.#falsy}`;
  }
}

class MaybeAttribute implements Attribute {
  #id: bigint;
  #attrs: NamespacedAttribute[];
  #adapter: Adapter;
  #provider: Provider;
  #fac: AttributeFactory;

  constructor(
    id: bigint,
    attrs: NamespacedAttribute[],
    adapter: Adapter,
    provider: Provider,
    fac: AttributeFactory
  ) {
    this.#id = id;
    this.#attrs = attrs;
    this.#adapter = adapter;
    this.#provider = provider;
    this.#fac = fac;
  }

  /**
   * AddQualifier adds a qualifier to each possible attribute variant, and also
   * creates a new namespaced variable from the qualified value.
   *
   * The algorithm for building the maybe attribute is as follows:
   *
   * 1. Create a maybe attribute from a simple identifier when it occurs in a
   * parsed-only expression
   *
   * mb = MaybeAttribute(<id>, "a")
   *
   * Initializing the maybe attribute creates an absolute attribute internally
   * which includes the possible namespaced names of the attribute. In this
   * example, let's assume we are in namespace 'ns', then the maybe is either
   * one of the following variable names:
   *
   * possible variables names -- ns.a, a
   *
   * Adding a qualifier to the maybe means that the variable name could be a
   * longer qualified name, or a field selection on one of the possible
   * variable names produced earlier:
   *
   * mb.AddQualifier("b")
   *
   * possible variables names -- ns.a.b, a.b
   *
   * possible field selection -- ns.a['b'], a['b']
   *
   * If none of the attributes within the maybe resolves a value, the result is
   * an error.
   */
  addQualifier(qual: Qualifier): Attribute | Error {
    let str = '';
    let isStr = false;
    if (isConstantQualifier(qual)) {
      str = qual.value().value();
      isStr = true;
    }
    let augmentedNames: string[] = [];
    // First add the qualifier to all existing attributes in the oneof.
    for (const attr of this.#attrs) {
      if (isStr && attr.qualifiers().length === 0) {
        const candidateVars = attr.candidateVariableNames();
        augmentedNames = candidateVars.map((name) => `${name}.${str}`);
      }
      const err = attr.addQualifier(qual);
      if (err instanceof Error) {
        return err;
      }
    }
    // Next, ensure the most specific variable / type reference is searched
    // first.
    if (augmentedNames.length > 0) {
      this.#attrs = [
        this.#fac.absoluteAttribute(this.#id, ...augmentedNames),
        ...this.#attrs,
      ];
    }
    return this;
  }

  /**
   * Resolve follows the variable resolution rules to determine whether the
   * attribute is a variable or a field selection.
   */
  resolve(vars: Activation): any | Error {
    let maybeErr: Error | null = null;
    for (const attr of this.#attrs) {
      const obj = attr.resolve(vars);
      // Return an error if one is encountered.
      if (obj instanceof Error) {
        if (!(obj instanceof ResolutionError)) {
          return obj;
        }
        // If this was not a missing variable error, return it.
        if (isNil(obj.missingAttribute)) {
          return obj;
        }
        // When the variable is missing in a maybe attribute we defer erroring.
        if (isNil(maybeErr)) {
          maybeErr = obj;
        }
        // Continue attempting to resolve possible variables.
        continue;
      }
      return obj;
    }
    // Else, produce a no such attribute error.
    return maybeErr!;
  }

  id(): bigint {
    return this.#attrs[0].id();
  }

  /**
   * IsOptional returns trivially false for an attribute he attribute
   * represents a fully qualified variable name. If the attribute is used in an
   * optional manner, then an attrQualifier is created and marks the attribute
   * as optional.
   */
  isOptional(): boolean {
    return false;
  }

  qualify(vars: Activation, obj: any): any | Error {
    return attrQualify(this.#fac, vars, obj, this);
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    return attrQualifyIfPresent(this.#fac, vars, obj, this, presenceOnly);
  }

  toString() {
    return `id: ${this.#id}, attributes: ${this.#attrs.join(', ')}`;
  }
}

class RelativeAttribute implements Attribute {
  #id: bigint;
  #operand: Interpretable;
  #qualifiers: Qualifier[];
  #adapter: Adapter;
  #fac: AttributeFactory;

  #errorOnBadPresenceTest = false;

  constructor(
    id: bigint,
    operand: Interpretable,
    qualifiers: Qualifier[],
    adapter: Adapter,
    fac: AttributeFactory,
    errorOnBadPresenceTest?: boolean
  ) {
    this.#id = id;
    this.#operand = operand;
    this.#qualifiers = qualifiers;
    this.#adapter = adapter;
    this.#fac = fac;

    if (!isNil(errorOnBadPresenceTest)) {
      this.#errorOnBadPresenceTest = errorOnBadPresenceTest;
    }
  }

  addQualifier(qualifier: Qualifier): Attribute | Error {
    this.#qualifiers.push(qualifier);
    return this;
  }

  resolve(vars: Activation): any | Error {
    // First, evaluate the operand.
    const v = this.#operand.eval(vars);
    if (isErrorRefVal(v)) {
      return v.value();
    }
    if (isUnknownRefVal(v)) {
      return v;
    }
    const [obj, isOpt, err] = applyQualifiers(vars, v, this.#qualifiers);
    if (!isNil(err)) {
      return err;
    }
    if (isOpt) {
      const val = this.#adapter.nativeToValue(obj);
      if (isUnknownRefVal(val)) {
        return val;
      }
      return new OptionalRefVal(val);
    }
    return obj;
  }

  id(): bigint {
    const qualCount = this.#qualifiers.length;
    if (qualCount === 0) {
      return this.#id;
    }
    return this.#qualifiers[qualCount - 1].id();
  }

  /**
   * IsOptional returns trivially false for an attribute he attribute
   * represents a fully qualified variable name. If the attribute is used in an
   * optional manner, then an attrQualifier  is created and marks the attribute
   * as optional.
   */
  isOptional(): boolean {
    return false;
  }

  qualify(vars: Activation, obj: any): any | Error {
    return attrQualify(this.#fac, vars, obj, this);
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    return attrQualifyIfPresent(this.#fac, vars, obj, this, presenceOnly);
  }

  toString() {
    return `id: ${this.#id}, operand: ${this.#operand}`;
  }
}

function newQualifier(
  adapter: Adapter,
  id: bigint,
  v: any,
  opt: boolean,
  errorOnBadPresenceTest: boolean
): Qualifier | Error {
  if (isAttribute(v)) {
    // Note, attributes are initially identified as non-optional since they
    // represent a top-level field access; however, when used as a relative
    // qualifier, e.g. a[?b.c], then an attrQualifier is created which
    // intercepts the IsOptional check for the attribute in order to return the
    // correct result.
    return new AttrQualifier(id, v, opt);
  }
  if (isUnknownRefVal(v)) {
    return new UnknownQualifier(id, v);
  }
  switch (reflectNativeType(v)) {
    case String:
    case StringRefVal:
      return new StringQualifier(
        id,
        isRefVal(v) ? v.value() : v,
        isRefVal(v) ? v : adapter.nativeToValue(v),
        adapter,
        opt,
        errorOnBadPresenceTest
      );
    case BigInt:
    case IntRefVal:
      return new IntQualifier(
        id,
        isRefVal(v) ? v.value() : v,
        isRefVal(v) ? v : adapter.nativeToValue(v),
        adapter,
        opt,
        errorOnBadPresenceTest
      );
    case UintRefVal:
      return new UintQualifier(
        id,
        isRefVal(v) ? v.value() : v,
        isRefVal(v) ? v : adapter.nativeToValue(v),
        adapter,
        opt,
        errorOnBadPresenceTest
      );
    case Boolean:
    case BoolRefVal:
      return new BoolQualifier(
        id,
        isRefVal(v) ? v.value() : v,
        isRefVal(v) ? v : adapter.nativeToValue(v),
        adapter,
        opt,
        errorOnBadPresenceTest
      );
    case Number:
    case DoubleRefVal:
      return new DoubleQualifier(
        id,
        isRefVal(v) ? v.value() : v,
        isRefVal(v) ? v : adapter.nativeToValue(v),
        adapter,
        opt,
        errorOnBadPresenceTest
      );
    default:
      if (isQualifier(v)) {
        return v;
      }
      return new Error(`invalid qualifier type: ${v}`);
  }
}

class AttrQualifier implements Qualifier {
  #id: bigint;
  #attr: Attribute;
  #optional: boolean;

  constructor(id: bigint, attr: Attribute, optional: boolean) {
    this.#id = id;
    this.#attr = attr;
    this.#optional = optional;
  }

  id(): bigint {
    return this.#id;
  }

  isOptional(): boolean {
    return this.#optional;
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
}

class StringQualifier implements ConstantQualifier {
  #id: bigint;
  #value: string;
  #celValue: RefVal;
  #adapter: Adapter;
  #optional: boolean;
  #errorOnBadPresenceTest: boolean;

  constructor(
    id: bigint,
    value: string,
    celValue: RefVal,
    adapter: Adapter,
    optional: boolean,
    errorOnBadPresenceTest: boolean
  ) {
    this.#id = id;
    this.#value = value;
    this.#celValue = celValue;
    this.#adapter = adapter;
    this.#optional = optional;
    this.#errorOnBadPresenceTest = errorOnBadPresenceTest;
  }

  value(): RefVal {
    return this.#celValue;
  }

  id(): bigint {
    return this.#id;
  }

  isOptional(): boolean {
    return this.#optional;
  }

  qualify(vars: Activation, obj: any): any | Error {
    const [val, _, err] = this._qualifyInternal(vars, obj, false, false);
    if (!isNil(err)) {
      return err;
    }
    return val;
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    return this._qualifyInternal(vars, obj, true, presenceOnly) as any;
  }

  private _qualifyInternal(
    vars: Activation,
    obj: any,
    presenceTest: boolean,
    presenceOnly: boolean
  ): [RefVal | null, boolean, Error | null] {
    const s = this.#value;
    switch (reflectNativeType(obj)) {
      case Map:
        if ((obj as Map<any, any>).has(s)) {
          return [(obj as Map<any, any>).get(s), true, null];
        }
        break;
      case RefValMap:
        if ((obj as RefValMap).contains(this.#celValue)) {
          return [(obj as RefValMap).get(this.#celValue), true, null];
        }
        break;
      case Object:
        if (s in obj) {
          return [obj[s], true, null];
        }
        break;
      default:
        return refQualify(
          this.#adapter,
          obj,
          this.#celValue,
          presenceTest,
          presenceOnly,
          this.#errorOnBadPresenceTest
        );
    }
    if (presenceTest) {
      return [null, false, null];
    }
    return [
      null,
      false,
      new ResolutionError(undefined, undefined, this.#celValue),
    ];
  }
}

class IntQualifier implements ConstantQualifier {
  #id: bigint;
  #value: bigint;
  #celValue: RefVal;
  #adapter: Adapter;
  #optional: boolean;
  #errorOnBadPresenceTest: boolean;

  constructor(
    id: bigint,
    value: bigint,
    celValue: RefVal,
    adapter: Adapter,
    optional: boolean,
    errorOnBadPresenceTest: boolean
  ) {
    this.#id = id;
    this.#value = value;
    this.#celValue = celValue;
    this.#adapter = adapter;
    this.#optional = optional;
    this.#errorOnBadPresenceTest = errorOnBadPresenceTest;
  }

  value(): RefVal {
    return this.#celValue;
  }

  id(): bigint {
    return this.#id;
  }

  isOptional(): boolean {
    return this.#optional;
  }

  qualify(vars: Activation, obj: any): any | Error {
    const [val, _, err] = this._qualifyInternal(vars, obj, false, false);
    if (!isNil(err)) {
      return err;
    }
    return val;
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    return this._qualifyInternal(vars, obj, true, presenceOnly) as any;
  }

  private _qualifyInternal(
    vars: Activation,
    obj: any,
    presenceTest: boolean,
    presenceOnly: boolean
  ): [RefVal | null, boolean, Error | null] {
    const i = this.#value;
    let _isMap = false;
    switch (reflectNativeType(obj)) {
      case Map:
        _isMap = true;
        if ((obj as Map<any, any>).has(i)) {
          return [(obj as Map<any, any>).get(i), true, null];
        }
        break;
      case RefValMap:
        _isMap = true;
        if ((obj as RefValMap).contains(this.#celValue)) {
          return [(obj as RefValMap).get(this.#celValue), true, null];
        }
        break;
      case Object:
        _isMap = true;
        if (Number(i) in obj) {
          return [obj[Number(i)], true, null];
        }
        break;
      case Array:
        if (Number(i) < obj.length) {
          return [obj[Number(i)], true, null];
        }
        break;
      case RefValList:
        if ((obj as RefValList).contains(this.#celValue)) {
          return [(obj as RefValList).get(this.#celValue), true, null];
        }
        break;
      default:
        return refQualify(
          this.#adapter,
          obj,
          this.#celValue,
          presenceTest,
          presenceOnly,
          this.#errorOnBadPresenceTest
        );
    }
    if (presenceTest) {
      return [null, false, null];
    }
    if (_isMap) {
      return [
        null,
        false,
        new ResolutionError(undefined, undefined, this.#celValue),
      ];
    }
    return [null, false, new ResolutionError(undefined, this.#celValue)];
  }
}

class UintQualifier implements ConstantQualifier {
  #id: bigint;
  #value: bigint;
  #celValue: RefVal;
  #adapter: Adapter;
  #optional: boolean;
  #errorOnBadPresenceTest: boolean;

  constructor(
    id: bigint,
    value: bigint,
    celValue: RefVal,
    adapter: Adapter,
    optional: boolean,
    errorOnBadPresenceTest: boolean
  ) {
    this.#id = id;
    this.#value = value;
    this.#celValue = celValue;
    this.#adapter = adapter;
    this.#optional = optional;
    this.#errorOnBadPresenceTest = errorOnBadPresenceTest;
  }

  value(): RefVal {
    return this.#celValue;
  }

  id(): bigint {
    return this.#id;
  }

  isOptional(): boolean {
    return this.#optional;
  }

  qualify(vars: Activation, obj: any): any | Error {
    const [val, _, err] = this._qualifyInternal(vars, obj, false, false);
    if (!isNil(err)) {
      return err;
    }
    return val;
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    return this._qualifyInternal(vars, obj, true, presenceOnly) as any;
  }

  private _qualifyInternal(
    vars: Activation,
    obj: any,
    presenceTest: boolean,
    presenceOnly: boolean
  ): [RefVal | null, boolean, Error | null] {
    const u = this.#value;
    let _isMap = false;
    switch (reflectNativeType(obj)) {
      case Map:
        _isMap = true;
        if ((obj as Map<any, any>).has(u)) {
          return [(obj as Map<any, any>).get(u), true, null];
        }
        break;
      case RefValMap:
        _isMap = true;
        if ((obj as RefValMap).contains(this.#celValue)) {
          return [(obj as RefValMap).get(this.#celValue), true, null];
        }
        break;
      case Object:
        _isMap = true;
        if (Number(u) in obj) {
          return [obj[Number(u)], true, null];
        }
        break;
      case Array:
        if (Number(u) < obj.length) {
          return [obj[Number(u)], true, null];
        }
        break;
      case RefValList:
        if ((obj as RefValList).contains(this.#celValue)) {
          return [(obj as RefValList).get(this.#celValue), true, null];
        }
        break;
      default:
        return refQualify(
          this.#adapter,
          obj,
          this.#celValue,
          presenceTest,
          presenceOnly,
          this.#errorOnBadPresenceTest
        );
    }
    if (presenceTest) {
      return [null, false, null];
    }
    if (_isMap) {
      return [
        null,
        false,
        new ResolutionError(undefined, undefined, this.#celValue),
      ];
    }
    return [null, false, new ResolutionError(undefined, this.#celValue)];
  }
}

class BoolQualifier implements ConstantQualifier {
  #id: bigint;
  #value: boolean;
  #celValue: RefVal;
  #adapter: Adapter;
  #optional: boolean;
  #errorOnBadPresenceTest: boolean;

  constructor(
    id: bigint,
    value: boolean,
    celValue: RefVal,
    adapter: Adapter,
    optional: boolean,
    errorOnBadPresenceTest: boolean
  ) {
    this.#id = id;
    this.#value = value;
    this.#celValue = celValue;
    this.#adapter = adapter;
    this.#optional = optional;
    this.#errorOnBadPresenceTest = errorOnBadPresenceTest;
  }

  value(): RefVal {
    return this.#celValue;
  }

  id(): bigint {
    return this.#id;
  }

  isOptional(): boolean {
    return this.#optional;
  }

  qualify(vars: Activation, obj: any): any | Error {
    const [val, _, err] = this._qualifyInternal(vars, obj, false, false);
    if (!isNil(err)) {
      return err;
    }
    return val;
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    return this._qualifyInternal(vars, obj, true, presenceOnly) as any;
  }

  private _qualifyInternal(
    vars: Activation,
    obj: any,
    presenceTest: boolean,
    presenceOnly: boolean
  ): [RefVal | null, boolean, Error | null] {
    const b = this.#value;
    switch (reflectNativeType(obj)) {
      case Map:
        if ((obj as Map<any, any>).has(b)) {
          return [(obj as Map<any, any>).get(b), true, null];
        }
        break;
      case RefValMap:
        if ((obj as RefValMap).contains(this.#celValue)) {
          return [(obj as RefValMap).get(this.#celValue), true, null];
        }
        break;
      case Object:
        if (String(b) in obj) {
          return [obj[String(b)], true, null];
        }
        break;
      default:
        return refQualify(
          this.#adapter,
          obj,
          this.#celValue,
          presenceTest,
          presenceOnly,
          this.#errorOnBadPresenceTest
        );
    }
    if (presenceTest) {
      return [null, false, null];
    }
    return [
      null,
      false,
      new ResolutionError(undefined, undefined, this.#celValue),
    ];
  }
}

/**
 * fieldQualifier indicates that the qualification is a well-defined field with
 * a known field type. When the field type is known this can be used to improve
 * the speed and efficiency of field resolution.
 */
class FieldQualifier implements ConstantQualifier {
  #id: bigint;
  #name: string;
  #fieldType: FieldType;
  #adapter: Adapter;
  #optional: boolean;

  constructor(
    id: bigint,
    name: string,
    fieldType: FieldType,
    adapter: Adapter,
    optional: boolean
  ) {
    this.#id = id;
    this.#name = name;
    this.#fieldType = fieldType;
    this.#adapter = adapter;
    this.#optional = optional;
  }

  value(): RefVal {
    throw new Error('Method not implemented.');
  }

  id(): bigint {
    return this.#id;
  }

  isOptional(): boolean {
    return this.#optional;
  }

  qualify(vars: Activation, obj: any): any | Error {
    if (isRefVal(obj)) {
      obj = obj.value();
    }
    const val = this.#fieldType.getFrom(obj);
    if (isErrorRefVal(val)) {
      return val.value();
    }
    return val;
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    if (isRefVal(obj)) {
      obj = obj.value();
    }
    if (!this.#fieldType.isSet(obj)) {
      return [null, false, null];
    }
    if (presenceOnly) {
      return [null, true, null];
    }
    const val = this.#fieldType.getFrom(obj);
    if (isErrorRefVal(val)) {
      return [null, false, val.value()];
    }
    if (val instanceof Error) {
      return [null, false, val];
    }
    return [val, true, null];
  }
}

/**
 * doubleQualifier qualifies a CEL object, map, or list using a double value.
 *
 * This qualifier is used for working with dynamic data like JSON or protobuf
 * Any where the value type may not be known ahead of time and may not conform
 * to the standard types supported as valid protobuf map key types.
 */
class DoubleQualifier implements ConstantQualifier {
  #id: bigint;
  #value: number;
  #celValue: RefVal;
  #adapter: Adapter;
  #optional: boolean;
  #errorOnBadPresenceTest: boolean;

  constructor(
    id: bigint,
    value: number,
    celValue: RefVal,
    adapter: Adapter,
    optional: boolean,
    errorOnBadPresenceTest: boolean
  ) {
    this.#id = id;
    this.#value = value;
    this.#celValue = celValue;
    this.#adapter = adapter;
    this.#optional = optional;
    this.#errorOnBadPresenceTest = errorOnBadPresenceTest;
  }

  value(): RefVal {
    return this.#celValue;
  }

  id(): bigint {
    return this.#id;
  }

  isOptional(): boolean {
    return this.#optional;
  }

  qualify(vars: Activation, obj: any): any | Error {
    const [val, _, err] = this._qualifyInternal(vars, obj, false, false);
    if (!isNil(err)) {
      return err;
    }
    return val;
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    return this._qualifyInternal(vars, obj, true, presenceOnly) as any;
  }

  private _qualifyInternal(
    vars: Activation,
    obj: any,
    presenceTest: boolean,
    presenceOnly: boolean
  ): [RefVal | null, boolean, Error | null] {
    return refQualify(
      this.#adapter,
      obj,
      this.#celValue,
      presenceTest,
      presenceOnly,
      this.#errorOnBadPresenceTest
    );
  }
}

/**
 * unknownQualifier is a simple qualifier which always returns a preconfigured
 * set of unknown values for any value subject to qualification. This is
 * consistent with CEL's unknown handling elsewhere.
 */
class UnknownQualifier implements ConstantQualifier {
  #id: bigint;
  #value: UnknownRefVal;

  constructor(id: bigint, value: UnknownRefVal) {
    this.#id = id;
    this.#value = value;
  }

  value(): RefVal {
    return this.#value;
  }

  id(): bigint {
    return this.#id;
  }

  isOptional(): boolean {
    return false;
  }

  qualify(vars: Activation, obj: any): any | Error {
    return this.#value;
  }

  qualifyIfPresent(
    vars: Activation,
    obj: any,
    presenceOnly: boolean
  ): [any | null, boolean, Error | null] {
    return [this.#value, true, null];
  }
}

function applyQualifiers(
  vars: Activation,
  obj: any,
  qualifiers: Qualifier[]
): [any | null, boolean, Error | null] {
  const isOpt = isOptionalRefVal(obj);
  if (isOpt) {
    if (!(obj as OptionalRefVal).hasValue()) {
      return [obj, false, null];
    }
    obj = (obj as OptionalRefVal).getValue().value();
  }

  for (const qual of qualifiers) {
    let qualObj: any;
    if (isOptionalRefVal(obj) || qual.isOptional()) {
      const [_qualObj, present, err] = qual.qualifyIfPresent(vars, obj, false);
      qualObj = _qualObj;

      if (!isNil(err)) {
        return [null, false, err];
      }
      if (!present) {
        // We return optional none here with a presence of 'false' he layers
        // above will attempt to call types.OptionalOf() on a present value if
        // any of the qualifiers is optional.
        return [OptionalNone, false, null];
      }
    } else {
      qualObj = qual.qualify(vars, obj);
      if (qualObj instanceof Error) {
        return [null, false, qualObj];
      }
    }
    obj = qualObj;
  }
  return [obj, isOpt, null];
}

/**
 * attrQualify performs a qualification using the result of an attribute
 * evaluation.
 */
function attrQualify(
  fac: AttributeFactory,
  vars: Activation,
  obj: any,
  qualAttr: Attribute
): any | Error {
  const val = qualAttr.resolve(vars);
  if (val instanceof Error) {
    return val;
  }
  const qual = fac.newQualifier(
    null,
    qualAttr.id(),
    val,
    qualAttr.isOptional()
  );
  if (qual instanceof Error) {
    return qual;
  }
  return qual.qualify(vars, obj);
}

/**
 * attrQualifyIfPresent conditionally performs the qualification of the result
 * of attribute is present on the target object.
 */
function attrQualifyIfPresent(
  fac: AttributeFactory,
  vars: Activation,
  obj: any,
  qualAttr: Attribute,
  presenceOnly: boolean
): [any | null, boolean, Error | null] {
  const val = qualAttr.resolve(vars);
  if (val instanceof Error) {
    return [null, false, val];
  }
  const qual = fac.newQualifier(
    null,
    qualAttr.id(),
    val,
    qualAttr.isOptional()
  );
  if (qual instanceof Error) {
    return [null, false, qual];
  }
  return qual.qualifyIfPresent(vars, obj, presenceOnly);
}

/**
 * refQualify attempts to convert the value to a CEL value and then uses
 * reflection methods to try and apply the qualifier with the option to
 * presence test field accesses before retrieving field values.
 */
function refQualify(
  adapter: Adapter,
  obj: any,
  idx: RefVal,
  presenceTest: boolean,
  presenceOnly: boolean,
  errorOnBadPresenceTest: boolean
): [RefVal | null, boolean, Error | null] {
  const celVal = adapter.nativeToValue(obj);
  if (isUnknownRefVal(celVal)) {
    return [celVal, true, null];
  }
  if (isErrorRefVal(celVal)) {
    return [null, false, celVal.value()];
  }
  if (isMapper(celVal)) {
    const val = celVal.find(idx);
    // If the index is of the wrong type for the map, then it is possible for
    // the Find call to produce an error.
    if (isErrorRefVal(val)) {
      return [null, false, val.value()];
    }
    if (!isNil(val)) {
      return [val, true, null];
    }
    if (presenceTest) {
      return [null, false, null];
    }
    return [null, false, new ResolutionError(undefined, undefined, idx)];
  }
  if (isLister(celVal)) {
    // If the index argument is not a valid numeric type, then it is possible
    // for the index operation to produce an error.
    const i = indexOrError(idx);
    if (isErrorRefVal(i)) {
      return [null, false, i.value()];
    }
    if (i.value() > 0 && i.value() < celVal.size().value()) {
      return [celVal.get(i), true, null];
    }
    if (presenceTest) {
      return [null, false, null];
    }
    return [null, false, new ResolutionError(undefined, idx, undefined)];
  }
  if (isIndexer(celVal)) {
    if (presenceTest && isFieldTester(celVal)) {
      const presence = celVal.isSet(idx);
      if (isErrorRefVal(presence)) {
        return [null, false, presence.value()];
      }
      // If not found or presence only test, then return.
      // Otherwise, if found, obtain the value later on.
      if (presence.value() === false || presenceOnly) {
        return [null, presence.value() === true, null];
      }
    }
    const val = celVal.get(idx);
    if (isErrorRefVal(val)) {
      return [null, false, val.value()];
    }
    return [val, true, null];
  }
  if (presenceTest && !errorOnBadPresenceTest) {
    return [null, false, null];
  }
  return [null, false, new ResolutionError(undefined, undefined, idx)];
}

/**
 * resolutionError is a custom error type which encodes the different error
 * states which may occur during attribute resolution.
 */
export class ResolutionError extends Error {
  constructor(
    public readonly missingAttribute?: string,
    public readonly missingIndex?: RefVal,
    public readonly missingKey?: RefVal
  ) {
    super(
      `resolution error: ${missingAttribute ?? ''} ${missingIndex ?? ''} ${
        missingKey ?? ''
      }`
    );
    this.name = 'ResolutionError';
  }
}
