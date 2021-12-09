import stringify from 'fast-json-stable-stringify';
import { HashFn } from './types';

/**
 *
 *
 * @param value the value to hash
 * @returns a hashed value
 */
export const defaultHash: HashFn = (value: unknown) => {
  const string = stringify(value);
  // Algorithim is the same as the Java implementation
  if (string.length === 0) {
    return string;
  }
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
};
