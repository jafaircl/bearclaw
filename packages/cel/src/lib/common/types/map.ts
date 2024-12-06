/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HashMap } from '@bearclaw/collections';
import { isNil } from '@bearclaw/is';
import { create } from '@bufbuild/protobuf';
import { ValueSchema } from '@bufbuild/protobuf/wkt';
import { Adapter } from '../ref/provider';
import { RefType, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { DoubleRefVal } from './double';
import { ErrorRefVal, isErrorRefVal } from './error';
import { IntRefVal, isValidInt32 } from './int';
import { BaseIterator } from './iterator';
import { NativeType, reflectNativeType } from './native';
import { NullRefVal } from './null';
import { Foldable, Folder, isFoldable, Iterator } from './traits/iterator';
import { isMapper, Mapper, MutableMapper } from './traits/mapper';
import { DoubleType, IntType, MapType, TypeType, UintType } from './types';

// /**
//  * MapAccessor is a private interface for finding values within a map and
//  * iterating over the keys. This interface implements portions of the API
//  * surface area required by the traits.Mapper interface.
//  */
// interface MapAccessor extends Folder {
//   /**
//    * Find returns a value, if one exists, for the input key.
//    *
//    *  If the key is not found the function returns (nil, false).
//    */
//   find(value: RefVal): RefVal;

//   /**
//    * Iterator returns an Iterator over the map key set.
//    */
//   iterator(): Iterator;

//   /**
//    * Fold calls the FoldEntry method for each (key, value) pair in the map.
//    */
//   fold(f: Folder): void;
// }

/**
 * baseMap is a reflection based map implementation designed to handle a
 * variety of map-like types.
 *
 * Since CEL is side-effect free, the base map represents an immutable object.
 */
class BaseMap<K = any, V = any> implements Mapper, Foldable {
  /**
   * This is a HashMap from the collections library which hashes keys when
   * storing them in the map. This makes it possible to look up object keys
   * even when the object is not the same object as the one used to store the
   * value. As long as the object has the same hash, it will be found.
   *
   * For example, the following code will work with a HashMap but not with a
   * native Map:
   * ```ts
   * const map = new HashMap();
   * map.set(new IntRefVal(BigInt(1)), new DoubleRefVal(2));
   * map.get(new IntRefVal(BigInt(1))); // returns DoubleRefVal(2)
   * ```
   */
  protected _value = new HashMap<K, V>();

  constructor(public adapter: Adapter, value: Map<K, V>) {
    for (const [key, val] of value) {
      this._value.set(key, val);
    }
  }

  convertToNative(type: NativeType) {
    switch (type) {
      case Map:
        return new Map(this._nativeEntries());
      case Object:
        return this._nativeEntriesToObject();
      case ValueSchema:
        return create(ValueSchema, {
          kind: {
            case: 'structValue',
            value: this._nativeEntriesToObject(),
          },
        });
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  private _nativeEntries(): [K, V][] {
    const entries: any[] = [];
    for (const [key, value] of this._value) {
      let k = this.adapter.nativeToValue(key);
      k = k.convertToNative(reflectNativeType(k.value()));
      let v = this.adapter.nativeToValue(value);
      v = v.convertToNative(reflectNativeType(v.value()));
      entries.push([k, v]);
    }
    return entries;
  }

  private _nativeEntriesToObject(): Record<string | number | symbol, V> {
    const obj: Record<string | number | symbol, V> = {};
    for (const [key, value] of this._nativeEntries()) {
      obj[key as string | number | symbol] = value;
    }
    return obj;
  }

  convertToType(type: RefType): RefVal {
    switch (type) {
      case MapType:
        return this;
      case TypeType:
        return this.type();
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    if (!isMapper(other)) {
      return BoolRefVal.False;
    }
    if (this.size().value() !== other.size().value()) {
      return BoolRefVal.False;
    }
    const it = this.iterator();
    while (it.hasNext().value()) {
      const key = it.next();
      if (isNil(key)) {
        return new ErrorRefVal(`iterator error`);
      }
      const thisVal = this.find(key);
      if (isNil(thisVal)) {
        return BoolRefVal.False;
      }
      if (isErrorRefVal(thisVal)) {
        return thisVal;
      }
      const otherVal = other.find(key);
      if (isNil(otherVal)) {
        return BoolRefVal.False;
      }
      if (isErrorRefVal(otherVal)) {
        return otherVal;
      }
      if (isNil(otherVal)) {
        return BoolRefVal.False;
      }
      if (thisVal.equal(otherVal).value() === false) {
        return BoolRefVal.False;
      }
    }
    return BoolRefVal.True;
  }

  type(): RefType {
    return MapType;
  }

  value() {
    return this._value;
  }

  contains(value: RefVal): RefVal {
    const found = this.find(value);
    if (isErrorRefVal(found)) {
      return found;
    }
    return new BoolRefVal(!isNil(found));
  }

  get(index: RefVal): RefVal {
    const value = this.find(index);
    if (isNil(value)) {
      return new ErrorRefVal(`no such key: ${index.value()}`);
    }
    if (isErrorRefVal(value)) {
      return value;
    }
    return value;
  }

  size(): RefVal {
    return new IntRefVal(BigInt(this._value.size));
  }

  isZeroValue(): boolean {
    return this.size().value() === BigInt(0);
  }

  find(key: RefVal): RefVal | null {
    if (this._value.size === 0) {
      return null;
    }
    const keyVal = this.findInternal(key);
    if (!isNil(keyVal)) {
      return keyVal;
    }
    // If the key is not found, try to convert number types and see if it is
    // found
    switch (key.type()) {
      case DoubleType:
        if (!isValidInt32(key.value())) {
          return null;
        }
        const intKey = new IntRefVal(BigInt(key.value()));
        return this.findInternal(intKey);
      case IntType:
      case UintType:
        const doubleKey = new DoubleRefVal(Number(key.value()));
        return this.findInternal(doubleKey);
      default:
        return null;
    }
  }

  iterator(): Iterator {
    throw new Error('Method not implemented.');
  }

  fold(folder: Folder): void {
    for (const [key, value] of this._value) {
      if (!folder.foldEntry(key, value)) {
        return;
      }
    }
  }

  toString() {
    let str = '{';
    const it = this.iterator();
    let i = 0;
    while (it.hasNext().value()) {
      const key = it.next();
      if (isNil(key)) {
        break;
      }
      let value = this.find(key);
      if (isNil(value)) {
        value = new NullRefVal();
      }
      if (isErrorRefVal(value)) {
        return value;
      }
      str += `${key.toString()}: ${value.toString()}`;
      if (i < this._value.size - 1) {
        str += ', ';
      }
      i++;
    }
    return str + '}';
  }

  protected findInternal(key: RefVal): RefVal | null {
    const found = this._value.get(key as K);
    if (isNil(found)) {
      return null;
    }
    return this.adapter.nativeToValue(found);
  }
}

class MapIterator extends BaseIterator implements Iterator {
  private _keys: RefVal[];
  private _cursor = 0;

  constructor(public readonly adapter: Adapter, keys: RefVal[]) {
    super();
    this._keys = keys;
  }

  hasNext(): RefVal {
    return new BoolRefVal(this._cursor < this._keys.length);
  }

  next(): RefVal | null {
    if (this.hasNext().value()) {
      const index = this._cursor;
      this._cursor++;
      return this.adapter.nativeToValue(this._keys[index]);
    }
    return null;
  }
}

export class RefValMap<
  K extends RefVal = RefVal,
  V extends RefVal = RefVal
> extends BaseMap<K, V> {
  constructor(adapter: Adapter, value: Map<K, V>) {
    super(adapter, value);
  }

  override iterator(): Iterator {
    const keys = Array.from(this._value.keys());
    return new MapIterator(this.adapter, keys);
  }
}

export class MutableMap<K extends RefVal = RefVal, V extends RefVal = RefVal>
  extends BaseMap<K, V>
  implements MutableMapper
{
  insert(k: RefVal, v: RefVal): RefVal {
    const found = this.find(k);
    if (!isNil(found)) {
      if (isErrorRefVal(found)) {
        return found;
      }
      return new ErrorRefVal(`insert failed: key ${k.value()} already exists`);
    }
    this._value.set(k as K, v as V);
    return this;
  }

  toImmutableMap(): Mapper {
    return new RefValMap(this.adapter, new Map(this._value));
  }
}

export class DynamicMap<K = any, V = any> extends BaseMap<K, V> {
  constructor(adapter: Adapter, value: Map<K, V>) {
    super(adapter, value);
  }

  override iterator(): Iterator {
    const keys = [];
    for (const key of this._value.keys()) {
      keys.push(this.adapter.nativeToValue(key));
    }
    return new MapIterator(this.adapter, keys);
  }
}

class InteropFoldableMap<K = any, V = any> implements Mapper<K, V>, Foldable {
  constructor(private _mapper: Mapper<K, V>) {}

  find(key: K): V | null {
    return this._mapper.find(key);
  }

  convertToNative(type: NativeType) {
    return this._mapper.convertToNative(type);
  }

  convertToType(type: RefType): RefVal {
    return this._mapper.convertToType(type);
  }

  equal(other: RefVal): RefVal {
    return this._mapper.equal(other);
  }

  type(): RefType {
    return this._mapper.type();
  }

  value() {
    return this._mapper.value();
  }

  contains(value: RefVal): RefVal {
    return this._mapper.contains(value);
  }

  get(index: RefVal): RefVal {
    return this._mapper.get(index);
  }

  iterator(): Iterator {
    return this._mapper.iterator();
  }

  size(): RefVal {
    return this._mapper.size();
  }

  fold(f: Folder): void {
    const it = this.iterator();
    while (it.hasNext().value()) {
      const k = it.next();
      if (!f.foldEntry(k, this.get(k!))) {
        break;
      }
    }
  }
}

/**
 * ToFoldableMap will create a Foldable version of a map suitable for key-value
 * pair iteration.
 *
 * For values which are already Foldable, this call is a no-op. For all other
 * values, the fold is driven via the Iterator HasNext() and Next() calls as
 * well as the map's Get() method which means that the folding will function,
 * but take a performance hit.
 */
export function toFoldableMap<K = any, V = any>(
  mapper: Mapper<K, V>
): Foldable {
  if (isFoldable(mapper)) {
    return mapper;
  }
  return new InteropFoldableMap(mapper);
}
