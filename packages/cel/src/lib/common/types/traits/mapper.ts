/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { RefVal, isRefVal } from './../../ref/reference';
import { Container, isContainer } from './container';
import { Indexer, isIndexer } from './indexer';
import { Iterable, isIterable } from './iterator';
import { Sizer, isSizer } from './sizer';

/**
 * Mapper interface which aggregates the traits of a maps.
 */
export interface Mapper<K = any, V = any>
  extends RefVal,
    Container,
    Indexer,
    Iterable,
    Sizer {
  /**
   * Find returns a value, if one exists, for the input key.
   *
   * If the key is not found the function returns (nil, false). If the input
   * key is not valid for the map, or is Err or Unknown the function returns
   * (Unknown|Err, false).
   */
  find(key: K): V | null;
}

export function isMapper(value: any): value is Mapper {
  return (
    value &&
    isFunction(value.find) &&
    isRefVal(value) &&
    isContainer(value) &&
    isIndexer(value) &&
    isIterable(value) &&
    isSizer(value)
  );
}

/**
 * MutableMapper interface which emits an immutable result after an
 * intermediate computation.
 *
 * Note, this interface is intended only to be used within Comprehensions where
 * the mutable value is not directly observable within the user-authored CEL
 * expression.
 */
export interface MutableMapper extends Mapper {
  /**
   * Insert a key, value pair into the map, returning the map if the insert is
   * successful and an error if key already exists in the mutable map.
   */
  insert(k: RefVal, v: RefVal): RefVal;

  /**
   * ToImmutableMap converts a mutable map into an immutable map.
   */
  toImmutableMap(): Mapper;
}

export function isMutableMapper(value: any): value is MutableMapper {
  return (
    value &&
    isFunction(value.insert) &&
    isFunction(value.toImmutableMap) &&
    isMapper(value)
  );
}
