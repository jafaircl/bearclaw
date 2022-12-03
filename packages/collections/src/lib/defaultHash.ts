import stringify from 'fast-json-stable-stringify';
import { HashFn } from './types';

/**
 * If the value passed is an object or contains objects, sort the object(s) and
 * return the result. Otherwise, return the value as-is.
 *
 * @param value the object to sort
 * @returns a sorted version of the passed value
 */
function deepSortValue(value: unknown) {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(deepSortValue);
  }

  const sortedObject = {};
  const sortedKeys = Object.keys(value).sort();
  for (let i = 0; i < sortedKeys.length; i += 1) {
    const key = sortedKeys[i];
    sortedObject[key] = deepSortValue(value[key]);
  }

  return sortedObject;
}

/**
 * The default hashing function. This will simply sort then stringify the value.
 *
 * @param value the value to hash
 * @returns a hashed value
 */
export const defaultHash: HashFn = (value: unknown) => {
  const sortedValue = deepSortValue(value);
  return stringify(sortedValue);
};
