/* eslint-disable @typescript-eslint/no-unused-vars */
import { RefType, RefVal } from '../ref/reference';
import { ErrorRefVal } from './error';
import { NativeType } from './native';
import { newObjectType } from './types';

/**
 * IteratorType singleton.
 */
const IteratorType = newObjectType('iterator');

/**
 * baseIterator is the basis for list, map, and object iterators.
 *
 * An iterator in and of itself should not be a valid value for comparison, but
 * must implement the `ref.Val` methods in order to be well-supported within
 * instruction arguments processed by the interpreter.
 */
export class BaseIterator implements RefVal {
  convertToNative(type: NativeType) {
    return new ErrorRefVal(`type conversion on iterators not supported`);
  }

  convertToType(type: RefType): RefVal {
    return ErrorRefVal.errNoSuchOverload;
  }

  equal(other: RefVal): RefVal {
    return ErrorRefVal.errNoSuchOverload;
  }

  type(): RefType {
    return IteratorType;
  }

  value() {
    return null;
  }
}
