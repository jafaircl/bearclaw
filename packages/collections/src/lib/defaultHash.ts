import stringify from 'safe-stable-stringify';
import { HashFn } from './types';

/**
 * The default hashing function. This will stringify the value then use the
 * same hashing algorithm as Java's HashMap.
 *
 * @param value the value to hash
 * @returns a hashed value
 */
export const defaultHash: HashFn = (value: unknown) => {
  const string = stringify(value);
  // Algorithim is the same as the Java implementation
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    const char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
};
