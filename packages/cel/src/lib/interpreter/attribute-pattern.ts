/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * qualifierValueEquator defines an interface for determining if an input
 * value, of valid map key type, is equal to the value held in the Qualifier.
 * This interface is used by the AttributeQualifierPattern to determine pattern
 * matches for non-wildcard qualifier patterns.
 *
 * Note: Attribute values are also Qualifier values; however, Attriutes are
 * resolved before qualification happens. This is an implementation detail, but
 * one relevant to why the Attribute types do not surface in the list of
 * implementations.
 *
 * See: partialAttributeFactory.matchesUnknownPatterns for more details on how
 * this interface is used.
 */
export interface QualifierValueEquator {
  /**
   * QualifierValueEquals returns true if the input value is equal to the value
   * held in the Qualifier.
   */
  qualifierValueEquals(value: any): boolean;
}
