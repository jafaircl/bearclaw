import { isBigInt, isNil, isNumber } from '@bearclaw/is';
import { RefType, RefVal } from '../ref/reference';
import { NativeType, reflectNativeType } from './native';
import { UnknownType } from './types';

type AttributeQualifier = string | number | bigint | boolean;

/**
 * AttributeTrail specifies a variable with an optional qualifier path. An
 * attribute value is expected to correspond to an AbsoluteAttribute, meaning a
 * field selection which starts with a top-level variable.
 *
 * The qualifer path elements adhere to the AttributeQualifier type constraint.
 */
export class AttributeTrail {
  private readonly _variable: string;
  private readonly _qualifierPath: AttributeQualifier[];

  constructor(variable: string, qualifierPath: AttributeQualifier[] = []) {
    this._variable = variable;
    this._qualifierPath = qualifierPath;
  }

  variable() {
    return this._variable;
  }

  qualifierPath() {
    return this._qualifierPath;
  }

  /**
   * Equal returns whether two attribute values have the same variable name and
   * qualifier paths.
   */
  equal(other: AttributeTrail) {
    if (
      this.variable() !== other.variable() ||
      this.qualifierPath().length !== other.qualifierPath().length
    ) {
      return false;
    }
    for (let i = 0; i < this.qualifierPath().length; i++) {
      if (!qualifiersEqual(this.qualifierPath()[i], other.qualifierPath()[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * String returns the string representation of the Attribute.
   */
  toString() {
    let result = this.variable();
    if (result === '') {
      return '<unspecified>';
    }
    for (const qualifier of this.qualifierPath()) {
      const qualifierType = reflectNativeType(qualifier);
      switch (qualifierType) {
        case Boolean:
        case BigInt:
        case Number:
          result += `[${qualifier}]`;
          break;
        case String:
          if (isIdentifierCharater(qualifier as string)) {
            result += `.${qualifier}`;
          } else {
            result += `["${qualifier}"]`;
          }
          break;
        default:
          throw new Error(`unsupported qualifier type: ${qualifierType}`);
      }
    }
    return result;
  }
}

export function isIdentifierCharater(str: string) {
  for (const c of str) {
    if (!isIdentifierCharaterRune(c)) {
      return false;
    }
  }
  return true;
}

function isIdentifierCharaterRune(rune: string) {
  return rune.length === 1 && /[a-zA-Z0-9_]/.test(rune);
}

export const unspecifiedAttribute = new AttributeTrail('');

/**
 * QualifyAttribute qualifies an attribute using a valid AttributeQualifier
 * type.
 */
export function qualifyAttribute(
  attr: AttributeTrail,
  qualifier: AttributeQualifier
) {
  attr.qualifierPath().push(qualifier);
  return attr;
}

function qualifiersEqual(a: AttributeQualifier, b: AttributeQualifier) {
  if (a === b) {
    return true;
  }
  if (isBigInt(a) || isBigInt(b)) {
    if (!isBigInt(b) && !isNumber(b)) {
      return false;
    }
    try {
      return Number(a) === Number(b);
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Unknown type implementation which collects expression ids which caused the
 * current value to become unknown.
 */
export class UnknownRefVal implements RefVal {
  private readonly _attributeTrails: Map<bigint, AttributeTrail[]>;

  constructor(id: bigint, attributeTrail?: AttributeTrail) {
    if (isNil(attributeTrail)) {
      attributeTrail = unspecifiedAttribute;
    }
    this._attributeTrails = new Map([[id, [attributeTrail]]]);
  }

  /**
   * IDs returns the set of unknown expression ids contained by this value.
   *
   * Numeric identifiers are guaranteed to be in sorted order.
   */
  ids() {
    return [...this._attributeTrails.keys()];
  }

  /**
   * AttributeTrails returns the attribute trails which caused the current value
   * to become unknown.
   */
  attributeTrails() {
    return [...this._attributeTrails.entries()];
  }

  /**
   * GetAttributeTrails returns the attribute trails, if present, missing for a
   * given expression id.
   */
  getAttributeTrails(id: bigint) {
    return this._attributeTrails.get(id);
  }

  /**
   * SetAttributeTrails sets the attribute trails for a given expression id.
   */
  setAttributeTrails(id: bigint, trails: AttributeTrail[]) {
    this._attributeTrails.set(id, trails);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  convertToNative(typeDesc: NativeType) {
    return this.value();
  }

  /**
   * ConvertToType is an identity function since unknown values cannot be
   * modified.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  convertToType(typeValue: RefType): RefVal {
    return this;
  }

  /**
   * Equal is an identity function since unknown values cannot be modified.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  equal(other: RefVal): RefVal {
    return this;
  }

  type(): RefType {
    return UnknownType;
  }

  value() {
    return this;
  }

  /**
   * Contains returns true if the input unknown is a subset of the current
   * unknown.
   */
  contains(other: UnknownRefVal): boolean {
    for (const [id, otherTrails] of other.attributeTrails()) {
      const trails = this._attributeTrails.get(id);
      if (!trails || otherTrails.length !== trails.length) {
        return false;
      }
      for (const ot of otherTrails) {
        let found = false;
        for (const t of trails) {
          if (t.equal(ot)) {
            found = true;
            break;
          }
        }
        if (!found) {
          return false;
        }
      }
    }
    return true;
  }

  toString() {
    const parts = [];
    for (const [id, attrs] of this.attributeTrails()) {
      if (attrs.length === 1) {
        parts.push(`${attrs[0].toString()} (${id})`);
        continue;
      } else {
        parts.push(`[${attrs.map((a) => a.toString()).join(' ')}] (${id})`);
      }
    }
    return parts.join(', ');
  }
}

/**
 * IsUnknown returns whether the element ref.Val is in instance of
 * *types.Unknown
 */
export function isUnknownRefVal(val: RefVal): val is UnknownRefVal {
  return val.type() === UnknownType;
}

/**
 * MaybeMergeUnknowns determines whether an input value and another, possibly
 * nil, unknown will produce an unknown result.
 *
 * If the input `val` is another Unknown, then the result will be the merge of
 * the `val` and the input `unk`. If the `val` is not unknown, then the result
 * will depend on whether the input `unk` is nil.
 *
 * If both values are non-nil and unknown, then the return value will be a
 * merge of both unknowns.
 */
export function maybeMergeUnknowns(val: RefVal, unk: UnknownRefVal): RefVal {
  if (!isUnknownRefVal(val)) {
    return unk;
  }
  return mergeUnknowns(val, unk);
}

/**
 * MergeUnknowns combines two unknown values into a new unknown value.
 */
export function mergeUnknowns(
  unk1: UnknownRefVal,
  unk2: UnknownRefVal
): UnknownRefVal {
  if (isNil(unk1)) {
    return unk2;
  }
  if (isNil(unk2)) {
    return unk1;
  }
  let out: UnknownRefVal | null = null;
  for (const [id, ats] of unk1.attributeTrails()) {
    if (isNil(out)) {
      out = new UnknownRefVal(id, ...ats);
      continue;
    }
    out.setAttributeTrails(id, ats);
  }
  if (isNil(out)) {
    throw new Error('failed to merge unknowns');
  }
  for (const [id, ats] of unk2.attributeTrails()) {
    const existing = out.getAttributeTrails(id);
    if (isNil(existing)) {
      out.setAttributeTrails(id, ats);
      continue;
    }
    for (const at of ats) {
      let found = false;
      for (const et of existing) {
        if (at.equal(et)) {
          found = true;
          break;
        }
      }
      if (!found) {
        out.setAttributeTrails(id, [...existing, at]);
      }
    }
  }
  return out;
}
