/**
 * SelectAndIdentCost is the cost of an operation that accesses an identifier
 * or performs a select.
 */
export const SelectAndIdentCost = 1;

/**
 * ConstCost is the cost of an operation that accesses a constant.
 */
export const ConstCost = 0;

/**
 * ListCreateBaseCost is the base cost of any operation that creates a new list.
 */
export const ListCreateBaseCost = 10;

/**
 * MapCreateBaseCost is the base cost of any operation that creates a new map.
 */
export const MapCreateBaseCost = 30;

/**
 * StructCreateBaseCost is the base cost of any operation that creates a new
 * struct.
 */
export const StructCreateBaseCost = 40;

/**
 * StringTraversalCostFactor is multiplied to a length of a string when
 * computing the cost of traversing the entire string once.
 */
export const StringTraversalCostFactor = 0.1;

/**
 * RegexStringLengthCostFactor is multiplied ot the length of a regex string
 * pattern when computing the cost of applying the regex to a string of unit
 * cost.
 */
export const RegexStringLengthCostFactor = 0.25;
