/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { RefVal, isRefVal } from '../../ref/reference';
import { Container, isContainer } from './container';
import { Indexer, isIndexer } from './indexer';
import { Iterable, isIterable } from './iterator';
import { Adder, isAdder } from './math';
import { Sizer, isSizer } from './sizer';

/**
 * Lister interface which aggregates the traits of a list.
 */
export interface Lister
  extends RefVal,
    Adder,
    Container,
    Indexer,
    Iterable,
    Sizer {}

export function isLister(value: any): value is Lister {
  return (
    value &&
    isRefVal(value) &&
    isAdder(value) &&
    isSizer(value) &&
    isContainer(value) &&
    isIndexer(value) &&
    isIterable(value)
  );
}

/**
 * MutableLister interface which emits an immutable result after an
 * intermediate computation.
 *
 * Note, this interface is intended only to be used within Comprehensions where
 * the mutable value is not directly observable within the user-authored CEL
 * expression.
 */
export interface MutableLister extends Lister {
  toImmutableList(): Lister;
}

export function isMutableLister(value: any): value is MutableLister {
  return value && isFunction(value.toImmutableList) && isLister(value);
}
