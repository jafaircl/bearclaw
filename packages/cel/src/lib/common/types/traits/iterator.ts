/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { RefVal, isRefVal } from '../../ref/reference';

/**
 * Iterable aggregate types permit traversal over their elements.
 */
export interface Iterable {
  /**
   * Iterator returns a new iterator view of the struct.
   */
  iterator(): Iterator;
}

export function isIterable(value: any): value is Iterable {
  return value && isFunction(value.iterator);
}

/**
 * Iterator permits safe traversal over the contents of an aggregate type.
 */
export interface Iterator extends RefVal {
  /**
   * HasNext returns true if there are unvisited elements in the Iterator.
   */
  hasNext(): RefVal;

  /**
   * Next returns the next element.
   */
  next(): RefVal;
}

export function isIterator(value: any): value is Iterator {
  return (
    value &&
    isFunction(value.hasNext) &&
    isFunction(value.next) &&
    isRefVal(value)
  );
}

/**
 * Foldable aggregate types support iteration over (key, value) or (index,
 * value) pairs.
 */
export interface Foldable {
  /**
   * Fold invokes the Folder.FoldEntry for all entries in the type
   */
  fold(folder: Folder): void;
}

export function isFoldable(value: any): value is Foldable {
  return value && isFunction(value.fold);
}

/**
 * Folder performs a fold on a given entry and indicates whether to continue
 * folding.
 */
export interface Folder {
  /**
   * FoldEntry indicates the key, value pair associated with the entry. If the
   * output is true, continue folding. Otherwise, terminate the fold.
   */
  foldEntry(key: any, val: any): boolean;
}

export function isFolder(value: any): value is Folder {
  return value && isFunction(value.foldEntry);
}
