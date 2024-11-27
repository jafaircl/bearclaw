/* eslint-disable @typescript-eslint/no-explicit-any */

import { isFunction, isNil } from '@bearclaw/is';
import { RefVal } from '../common/ref/reference';
import { defaultTypeAdapter } from '../common/types/provider';
import { Qualifier } from './attributes';

/**
 * AttributePattern represents a top-level variable with an optional set of
 * qualifier patterns.
 *
 * When using a CEL expression within a container, e.g. a package or namespace,
 * the variable name in the pattern must match the qualified name produced
 * during the variable namespace resolution. For example, if variable `c`
 * appears in an expression whose container is `a.b`, the variable  name
 * supplied to the pattern must be `a.b.c`
 *
 * The qualifier patterns for attribute matching must be one of the following:
 *
 *   - valid map key type: string, int, uint, bool
 *   - wildcard (*)
 *
 * Examples:
 *
 *  1. ns.myvar["complex-value"]
 *  2. ns.myvar["complex-value"][0]
 *  3. ns.myvar["complex-value"].*.name
 *
 * The first example is simple: match an attribute where the variable is
 * 'ns.myvar' with a field access on 'complex-value'. The second example
 * expands the match to indicate that only a specific index `0` should match.
 * And lastly, the third example matches any indexed access that later selects
 * the 'name' field.
 */
export class AttributePattern {
  #variable: string;
  #qualifierPatterns: AttributeQualifierPattern[] = [];

  constructor(variable: string) {
    this.#variable = variable;
  }

  /**
   * QualString adds a string qualifier pattern to the AttributePattern. The
   * string may be a valid identifier, or string map key including empty string.
   */
  qualString(pattern: string): AttributePattern {
    this.#qualifierPatterns.push(
      new AttributeQualifierPattern(undefined, pattern)
    );
    return this;
  }

  /**
   * QualInt adds an int qualifier pattern to the AttributePattern. The index
   * may be either a map or list index.
   */
  qualInt(pattern: bigint): AttributePattern {
    this.#qualifierPatterns.push(
      new AttributeQualifierPattern(undefined, pattern)
    );
    return this;
  }

  /**
   * QualUint adds an uint qualifier pattern for a map index operation to the
   * AttributePattern.
   */
  qualUint(pattern: bigint): AttributePattern {
    this.#qualifierPatterns.push(
      new AttributeQualifierPattern(undefined, pattern)
    );
    return this;
  }

  /**
   * QualBool adds a bool qualifier pattern for a map index operation to the
   * AttributePattern.
   */
  qualBool(pattern: boolean): AttributePattern {
    this.#qualifierPatterns.push(
      new AttributeQualifierPattern(undefined, pattern)
    );
    return this;
  }

  /**
   * Wildcard adds a special sentinel qualifier pattern that will match any
   * single qualifier.
   */
  wildcard(): AttributePattern {
    this.#qualifierPatterns.push(new AttributeQualifierPattern(true));
    return this;
  }

  /**
   * VariableMatches returns true if the fully qualified variable matches the
   * AttributePattern fully qualified variable name.
   */
  variableMatches(variable: string): boolean {
    return this.#variable === variable;
  }

  /**
   * QualifierPatterns returns the set of AttributeQualifierPattern values on
   * the AttributePattern.
   */
  qualifierPatterns(): AttributeQualifierPattern[] {
    return this.#qualifierPatterns;
  }
}

/**
 * AttributeQualifierPattern holds a wildcard or valued qualifier pattern.
 */
export class AttributeQualifierPattern {
  #wildcard: boolean | null;
  #value: any | null;

  constructor(wildcard?: boolean, value?: any) {
    if (isNil(wildcard) && isNil(value)) {
      throw new Error('wildcard or value must be non-nil');
    }
    this.#wildcard = wildcard ?? null;
    this.#value = value ?? null;
  }

  /**
   * Matches returns true if the qualifier pattern is a wildcard, or the
   * Qualifier implements the qualifierValueEquator interface and its
   * IsValueEqualTo returns true for the qualifier pattern.
   */
  matches(q: Qualifier): boolean {
    if (this.#wildcard === true) {
      return true;
    }
    return isQualifierValueEquator(q) && q.qualifierValueEquals(this.#value);
  }
}

/**
 * qualifierValueEquator defines an interface for determining if an input value, of valid map key type, is equal to the value held in the Qualifier. This interface is used by the AttributeQualifierPattern to determine pattern matches for non-wildcard qualifier patterns.
 *
 * Note: Attribute values are also Qualifier values; however, Attributes are resolved before qualification happens. This is an implementation detail, but one relevant to why the Attribute types do not surface in the list of implementations.
 *
 * See: partialAttributeFactory.matchesUnknownPatterns for more details on how this interface is used.
 */
export interface QualifierValueEquator {
  /**
   * QualifierValueEquals returns true if the input value is equal to the value
   * held in the Qualifier.
   */
  qualifierValueEquals(value: any): boolean;
}

export function isQualifierValueEquator(
  val: any
): val is QualifierValueEquator {
  return val && isFunction(val.qualifierValueEquals);
}

/**
 * numericValueEquals uses CEL equality to determine whether two number values
 * are equal
 */
export function numericValueEquals(value: any, celValue: RefVal): boolean {
  const val = defaultTypeAdapter.nativeToValue(value);
  return celValue.equal(val).value() === true;
}
