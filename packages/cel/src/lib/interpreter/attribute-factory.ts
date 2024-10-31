/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isNil } from '@bearclaw/is';
import { Type } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { ExprValue } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb.js';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { CELContainer } from '../cel';
import {
  isExprValueError,
  isExprValueUnknown,
  isExprValueValue,
} from '../common/expr-value';
import { TypeAdapter } from '../common/ref/adapter';
import { TypeProvider } from '../common/ref/provider';
import { isBoolValue } from '../common/types/bool';
import { isStringValue } from '../common/types/string';
import { Activation } from './activation';
import { QualifierValueEquator } from './attribute-pattern';
import { Cost, Coster } from './coster';
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
   * Parse-only expressions may have more than one possible absolute identifier
   * when the expression is created within a container, e.g. package or
   * namespace.
   *
   * When there is more than one name supplied to the AbsoluteAttribute call,
   * the names must be in CEL's namespace resolution order. The name arguments
   * provided here are returned in the same order as they were provided by the
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
  newQualifier(objType: Type | null, qualID: bigint, val: any): Qualifier;
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
   * Qualify performs a qualification, e.g. field selection, on the input
   * object and returns the value or error that results.
   */
  qualify(vars: Activation, obj: any): ExprValue;
}

/**
 * ConstantQualifier interface embeds the Qualifier interface and provides an
 * option to inspect the qualifier's constant value.
 *
 * Non-constant qualifiers are of Attribute type.
 */
export interface ConstantQualifier extends Qualifier {
  value(): Value;
}

export interface ConstantQualifierEquator
  extends QualifierValueEquator,
    ConstantQualifier {}

/**
 * Attribute values are a variable or value with an optional set of qualifiers,
 * such as field, key, or index accesses.
 */
interface Attribute extends Qualifier {
  /**
   * AddQualifier adds a qualifier on the Attribute or error if the
   * qualification is not a valid qualifier type.
   */
  addQualifier(q: Qualifier): Attribute;

  /**
   * Resolve returns the value of the Attribute given the current Activation.
   */
  resolve(a: Activation): ExprValue;
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
   * Qualifiers returns the list of qualifiers associated with the Attribute.s */
  qualifiers(): Qualifier[];

  /**
   * TryResolve attempts to return the value of the attribute given the current
   * Activation. If an error is encountered during attribute resolution, it
   * will be returned immediately. If the attribute cannot be resolved within
   * the Activation, the result must be: `nil`, `false`, `nil`.
   */
  tryResolve(a: Activation): ExprValue | null;
}

export class AttrFactory implements AttributeFactory {
  readonly #container: CELContainer;
  readonly #adapter: TypeAdapter;
  readonly #provider: TypeProvider;

  constructor(
    container: CELContainer,
    adapter: TypeAdapter,
    provider: TypeProvider
  ) {
    this.#container = container;
    this.#adapter = adapter;
    this.#provider = provider;
  }

  absoluteAttribute(id: bigint, ...names: string[]): NamespacedAttribute {
    return new AbsoluteAttribute(
      id,
      names,
      [],
      this.#adapter,
      this.#provider,
      this
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
    const attrs = [
      this.absoluteAttribute(
        id,
        ...this.#container.resolveCandidateNames(name)
      ),
    ];
    return new MaybeAttribute(id, attrs, this.#adapter, this.#provider, this);
  }

  relativeAttribute(id: bigint, operand: Interpretable): Attribute {
    return new RelativeAttribute(id, operand, [], this.#adapter, this);
  }

  newQualifier(objType: Type, qualID: bigint, val: any): Qualifier {
    throw new Error('Method not implemented.');
  }
}

export class AbsoluteAttribute
  implements Qualifier, NamespacedAttribute, Coster
{
  readonly #id: bigint;
  /**
   * namespaceNames represent the names the variable could have based on
   * declared container (package) of the expression.
   */
  readonly #namespacedNames: string[];
  readonly #qualifiers: Qualifier[];
  readonly #adapter: TypeAdapter;
  readonly #provider: TypeProvider;
  readonly #fac: AttributeFactory;

  constructor(
    id: bigint,
    namespacedNames: string[],
    qualifiers: Qualifier[],
    adapter: TypeAdapter,
    provider: TypeProvider,
    fac: AttributeFactory
  ) {
    this.#id = id;
    this.#namespacedNames = namespacedNames;
    this.#qualifiers = qualifiers;
    this.#adapter = adapter;
    this.#provider = provider;
    this.#fac = fac;
  }

  id(): bigint {
    return this.#id;
  }

  /**
   * Cost implements the Coster interface method.
   */
  cost(): Cost {
    let min = 0;
    let max = 0;
    for (const qualifier of this.#qualifiers) {
      const qc = Cost.estimateCost(qualifier);
      min += qc.min;
      max += qc.max;
    }
    min++; // For object retrieval.
    max++;
    return new Cost(min, max);
  }

  qualifiers(): Qualifier[] {
    return this.#qualifiers;
  }

  addQualifier(q: Qualifier): Attribute {
    this.#qualifiers.push(q);
    return this;
  }

  candidateVariableNames(): string[] {
    return this.#namespacedNames;
  }

  qualify(vars: Activation, obj: any): any {
    const val = this.resolve(vars);
    if (isExprValueUnknown(val)) {
      return val;
    }
    const qual = this.#fac.newQualifier(null, this.#id, val);
    return qual.qualify(vars, obj);
  }

  resolve<T = any>(vars: Activation): T {
    return this.tryResolve(vars);
  }

  tryResolve<T = any>(vars: Activation): T {
    for (const nm of this.#namespacedNames) {
      // If the variable is found, process it. Otherwise, wait until the checks\
      // to determine whether the type is unknown before returning.
      const obj = vars.resolveName(nm);
      if (obj?.present) {
        let op = obj.value;
        for (const qual of this.#qualifiers) {
          const op2 = qual.qualify(vars, op);
          if (op2 instanceof Error) {
            return op2 as T;
          }
          if (op2 == null) {
            break;
          }
          op = op2;
        }
        return op as T;
      }
      // Attempt to resolve the qualified type name if the name is not a
      // variable identifier.
      const typ = this.#provider.findIdent(nm);
      if (!isNil(typ)) {
        if (this.#qualifiers.length === 0) {
          return typ as T;
        }
        throw noSuchAttributeException(this.toString());
      }
    }
    throw noSuchAttributeException(this.toString());
  }

  /**
   * String implements the Stringer interface method.
   */
  toString() {
    return 'id: ' + this.#id + ', names: ' + this.#namespacedNames.join(', ');
  }
}

export class ConditionalAttribute implements Qualifier, Attribute, Coster {
  readonly #id: bigint;
  readonly #expr: Interpretable;
  readonly #truthy: Attribute;
  readonly #falsy: Attribute;
  readonly #adapter: TypeAdapter;
  readonly #fac: AttributeFactory;

  constructor(
    id: bigint,
    expr: Interpretable,
    truthy: Attribute,
    falsy: Attribute,
    adapter: TypeAdapter,
    fac: AttributeFactory
  ) {
    this.#id = id;
    this.#expr = expr;
    this.#truthy = truthy;
    this.#falsy = falsy;
    this.#adapter = adapter;
    this.#fac = fac;
  }

  id(): bigint {
    return this.#id;
  }

  /**
   * Cost provides the heuristic cost of a ternary operation `expr ? t : f`.
   * The cost is computed as `cost(expr)` plus the min/max costs of evaluating
   * either `t` or `f`.
   */
  cost(): Cost {
    const t = Cost.estimateCost(this.#truthy);
    const f = Cost.estimateCost(this.#falsy);
    const e = Cost.estimateCost(this.#expr);
    return new Cost(
      e.min + Math.min(t.min, f.min),
      e.max + Math.max(t.max, f.max)
    );
  }

  /**
   * AddQualifier appends the same qualifier to both sides of the conditional,
   * in effect managing the qualification of alternate attributes.
   */
  addQualifier(q: Qualifier): Attribute {
    this.#truthy.addQualifier(q);
    this.#falsy.addQualifier(q);
    return this;
  }

  qualify(vars: Activation, obj: any) {
    const val = this.resolve(vars);
    if (isExprValueUnknown(val)) {
      return val;
    }
    const qual = this.#fac.newQualifier(null, this.#id, val);
    return qual.qualify(vars, obj);
  }

  resolve(vars: Activation) {
    const val = this.#expr.eval(vars);
    if (isExprValueError(val)) {
      throw new Error(
        `messsage: ${val.kind.value.errors.map((e) => e.message).join(', ')}`
      );
    }
    if (isExprValueValue(val)) {
      const v = val.kind.value;
      if (!isBoolValue(v)) {
        // This should never happen
        throw new Error('conditional expression must be a boolean');
      }
      if (v.kind.value) {
        return this.#truthy.resolve(vars);
      }
      return this.#falsy.resolve(vars);
    }
    if (isExprValueUnknown(val)) {
      return val;
    }
    return val;
  }

  toString() {
    return `id: ${
      this.#id
    }, truthy attribute: ${this.#truthy.id()}, falsy attribute: ${this.#falsy.id()}`;
  }
}

export class MaybeAttribute implements Coster, Attribute, Qualifier {
  readonly #id: bigint;
  readonly #attrs: NamespacedAttribute[];
  readonly #adapter: TypeAdapter;
  readonly #provider: TypeProvider;
  readonly #fac: AttributeFactory;

  constructor(
    id: bigint,
    attrs: NamespacedAttribute[],
    adapter: TypeAdapter,
    provider: TypeProvider,
    fac: AttributeFactory
  ) {
    this.#id = id;
    this.#attrs = attrs;
    this.#adapter = adapter;
    this.#provider = provider;
    this.#fac = fac;
  }

  id(): bigint {
    return this.#id;
  }

  /**
   * Cost implements the Coster interface method. The min cost is computed as
   * the minimal cost among all the possible attributes, the max cost ditto.
   */
  cost(): Cost {
    let min = Number.MAX_VALUE;
    let max = 0;
    for (const attr of this.#attrs) {
      const ac = Cost.estimateCost(attr);
      min = Math.min(min, ac.min);
      max = Math.max(max, ac.max);
    }
    return new Cost(min, max);
  }

  /**
   * AddQualifier adds a qualifier to each possible attribute variant, and also
   * creates a new namespaced variable from the qualified value.
   *
   * The algorithm for building the maybe attribute is as follows:
   *
   * - Create a maybe attribute from a simple identifier when it occurs in a
   * parsed-only expression `mb = MaybeAttribute(id, "a")`
   * - Initializing the maybe attribute creates an absolute attribute
   * internally which includes the possible namespaced names of the attribute.
   * In this example, let's assume we are in namespace 'ns', then the maybe is
   * either one of the following variable names:
   *    - possible variables names -- ns.a, a
   *    - Adding a qualifier to the maybe means that the variable name could be
   *    a longer qualified name, or a field selection on one of the possible
   *    variable names produced earlier:
   *       `mb.AddQualifier("b")`
   *        - possible variables names -- ns.a.b, a.b<br>
   *        - possible field selection -- ns.a['b'], a['b']
   *
   * If none of the attributes within the maybe resolves a value, the result is
   * an error.
   */
  addQualifier(qual: Qualifier): Attribute {
    let str = '';
    let isStr = false;
    if (isFunction((qual as ConstantQualifier).value)) {
      const cq = qual as ConstantQualifier;
      const cqv = cq.value();
      if (isStringValue(cqv)) {
        str = cqv.kind.value;
        isStr = true;
      }
    }
    const augmentedNames: string[] = [];
    // First add the qualifier to all existing attributes in the oneof.
    for (const attr of this.#attrs) {
      if (isStr && attr.qualifiers().length === 0) {
        const candidateVars = attr.candidateVariableNames();
        for (let i = 0; i < candidateVars.length; i++) {
          const name = candidateVars[i];
          augmentedNames[i] = `${name}.${str}`;
        }
      }
      attr.addQualifier(qual);
    }
    // Next, ensure the most specific variable / type reference is searched
    // first.
    if (this.#attrs.length === 0) {
      this.#attrs.push(
        this.#fac.absoluteAttribute(this.#id, ...augmentedNames)
      );
    } else {
      this.#attrs.unshift(
        this.#fac.absoluteAttribute(this.#id, ...augmentedNames)
      );
    }
    return this;
  }

  qualify(vars: Activation, obj: any) {
    const val = this.resolve(vars);
    if (isExprValueUnknown(val)) {
      return val;
    }
    const qual = this.#fac.newQualifier(null, this.#id, val);
    return qual.qualify(vars, obj);
  }

  resolve(vars: Activation) {
    for (const attr of this.#attrs) {
      try {
        const val = attr.tryResolve(vars);
        if (!isNil(val)) {
          return val;
        }
      } catch {
        // Do nothing
      }
    }
    throw noSuchAttributeException(this.toString());
  }

  toString() {
    return `id: ${this.#id}, attributes: ${this.#attrs.join(', ')}`;
  }
}

export class RelativeAttribute implements Coster, Qualifier, Attribute {
  readonly #id: bigint;
  readonly #operand: Interpretable;
  readonly #qualifiers: Qualifier[];
  readonly #adapter: TypeAdapter;
  readonly #fac: AttributeFactory;

  constructor(
    id: bigint,
    operand: Interpretable,
    qualifiers: Qualifier[],
    adapter: TypeAdapter,
    fac: AttributeFactory
  ) {
    this.#id = id;
    this.#operand = operand;
    this.#qualifiers = qualifiers;
    this.#adapter = adapter;
    this.#fac = fac;
  }

  id(): bigint {
    return this.#id;
  }

  cost() {
    const c = Cost.estimateCost(this.#operand);
    let min = c.min;
    let max = c.max;
    for (const qual of this.#qualifiers) {
      const q = Cost.estimateCost(qual);
      min += q.min;
      max += q.max;
    }
    return new Cost(min, max);
  }

  addQualifier(q: Qualifier): Attribute {
    this.#qualifiers.push(q);
    return this;
  }

  qualify(vars: Activation, obj: any): ExprValue {
    const val = this.resolve(vars);
    if (isExprValueUnknown(val)) {
      return val;
    }
    const qual = this.#fac.newQualifier(null, this.#id, val);
    return qual.qualify(vars, obj);
  }

  resolve(vars: Activation): ExprValue {
    // First, evaluate the operand.
    const v = this.#operand.eval(vars);
    if (isExprValueError(v)) {
      throw new Error(
        `message: ${v.kind.value.errors.map((e) => e.message).join(', ')}`
      );
    }
    if (isExprValueUnknown(v)) {
      return v;
    }
    // Next, qualify it. Qualification handles unkonwns as well, so there's no
    // need to recheck.
    let obj = v;
    for (const qual of this.#qualifiers) {
      if (isNil(obj)) {
        throw noSuchAttributeException(this.toString());
      }
      obj = qual.qualify(vars, obj);
      if (isExprValueError(obj)) {
        return obj;
      }
    }
    if (isNil(obj)) {
      throw noSuchAttributeException(this.toString());
    }
    return obj;
  }

  toString() {
    return `id: ${this.id()}, operand: ${this.#operand.id}`;
  }
}

function noSuchAttributeException(context: string) {
  return new Error(`undeclared reference to '${context}' (in container '')`);
}
