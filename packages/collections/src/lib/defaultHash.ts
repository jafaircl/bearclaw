import { isDateObject, isMap, isSet } from '@bearclaw/is';
import stringify from 'fast-json-stable-stringify';
import { HashFn } from './types';

/**
 * If the value passed is an object, array, set or map, return a sorted
 * version of the value. Otherwise, return the value.
 *
 * @param value the object to sort
 * @returns a sorted version of the passed value
 */
function deepSortValue(value: unknown) {
  // If it's a function, return it's string representation
  if (typeof value === 'function') {
    return value.toString();
  }

  // If it's a primitive, return it
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  // If it's an array, sort it and return it
  if (Array.isArray(value)) {
    return value.sort().map(deepSortValue);
  }

  // If it's a set or map, sort its entries and return it
  if (isSet(value) || isMap(value)) {
    return Array.from(value).sort().map(deepSortValue);
  }

  // If it's a date, return its ISO string
  if (isDateObject(value)) {
    return value.toISOString();
  }

  // If it's an object, sort its keys and return it
  const sortedObject = {};
  const sortedKeys = Object.keys(value).sort();
  for (let i = 0; i < sortedKeys.length; i += 1) {
    const key = sortedKeys[i];
    sortedObject[key] = deepSortValue(value[key]);
  }

  return sortedObject;
}

/**
 * Hash a string using the djb2 algorithm.
 *
 * @param str the string to hash
 * @returns a hashed value
 */
function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * The default hashing function. This will simply sort then stringify the value.
 *
 * @param value the value to hash
 * @returns a hashed value
 */
export const defaultHash: HashFn = (value: unknown) => {
  const sortedValue = deepSortValue(value);
  const stringified = stringify(sortedValue);
  return hashCode(stringified);
};
