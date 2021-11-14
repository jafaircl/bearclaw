import stringify from 'fast-json-stable-stringify';
import MurmurHash from 'imurmurhash';
import { deepSortObject } from './deepSortObject';
import { HashFn, Primitive } from './types';
import { isArray, isPlainObject } from './validators';

export const defaultHash: HashFn = (value: unknown): Primitive => {
  if (isPlainObject(value) || isArray(value)) {
    deepSortObject(value);
  }
  const stringified = stringify(value);
  return MurmurHash(stringified).result();
};
