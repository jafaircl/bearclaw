/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from '@bearclaw/is';
import { create } from '@bufbuild/protobuf';
import { ListValue, Value, ValueSchema } from '@bufbuild/protobuf/wkt';
import { Adapter } from '../ref/provider';
import { isRefVal, RefType, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { ErrorRefVal, isErrorRefVal } from './error';
import { IntRefVal } from './int';
import { BaseIterator } from './iterator';
import { NativeType, reflectNativeType } from './native';
import { Foldable, Folder, isFoldable, Iterator } from './traits/iterator';
import { isLister, Lister } from './traits/lister';
import { Zeroer } from './traits/zeroer';
import {
  DoubleType,
  ErrorType,
  IntType,
  ListType,
  TypeType,
  UintType,
} from './types';
import { isValidUint64 } from './uint';

/**
 * baseList points to a list containing elements of any type.
 *
 * The `value` is an array of native values, and refValue is its reflection
 * object.
 * The `Adapter` enables native type to CEL type conversions.
 */
class BaseList<T = any> implements Lister, Zeroer {
  protected _value: T[];

  constructor(public adapter: Adapter, _value: T[]) {
    this._value = _value;
  }

  convertToNative(type: NativeType) {
    switch (type) {
      case Array:
        return this._valuesToNativeValues();
      // TODO: AnySchema
      case ValueSchema:
        const values = this._valuesToProtoValueValues();
        if (isErrorRefVal(values)) {
          return values;
        }
        return create(ValueSchema, {
          kind: {
            case: 'listValue',
            value: { values },
          },
        });
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  private _valuesToNativeValues() {
    const values = [];
    for (let i = 0; i < this.size().value(); i++) {
      let value = this.get(new IntRefVal(BigInt(i))).value();
      if (isErrorRefVal(value)) {
        return value;
      }
      if (isRefVal(value)) {
        value = value.convertToNative(reflectNativeType(value.value()));
      }
      values.push(value);
    }
    return values;
  }

  private _valuesToProtoValueValues() {
    const nativeValues = this._valuesToNativeValues();
    if (isErrorRefVal(nativeValues)) {
      return nativeValues;
    }
    const values = [];
    for (const value of nativeValues) {
      switch (reflectNativeType(value)) {
        case Boolean:
          values.push(
            create(ValueSchema, { kind: { case: 'boolValue', value } })
          );
          break;
        case Number:
        case BigInt:
          values.push(
            create(ValueSchema, {
              kind: { case: 'numberValue', value: Number(value) },
            })
          );
          break;
        case String:
          values.push(
            create(ValueSchema, { kind: { case: 'stringValue', value } })
          );
          break;
        // TODO: list, null, struct
        default:
          return new ErrorRefVal(
            `unsupported type '${reflectNativeType(value)}' in list`
          );
      }
    }
    return values;
  }

  convertToType(type: RefType): RefVal {
    switch (type) {
      case ListType:
        return this;
      case TypeType:
        return ListType;
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    if (!isLister(other)) {
      return BoolRefVal.False;
    }
    if (this.size().value() !== other.size().value()) {
      return BoolRefVal.False;
    }
    for (let i = 0; i < this.size().value(); i++) {
      const thisElem = this.get(new IntRefVal(BigInt(i)));
      const otherElem = other.get(new IntRefVal(BigInt(i)));
      if (!thisElem.equal(otherElem).value()) {
        return BoolRefVal.False;
      }
    }
    return BoolRefVal.True;
  }

  type(): RefType {
    return ListType;
  }

  value() {
    return this._value;
  }

  isZeroValue(): boolean {
    return this.size().value() === BigInt(0);
  }

  add(other: RefVal): RefVal {
    if (!isLister(other)) {
      return ErrorRefVal.maybeNoSuchOverload(other);
    }
    if (this.size().value() === BigInt(0)) {
      return other;
    }
    if (other.size().value() === BigInt(0)) {
      return this;
    }
    return new ConcatList(this.adapter, this, other);
  }

  contains(elem: RefVal): RefVal {
    for (let i = 0; i < this.size().value(); i++) {
      const val = this.adapter.nativeToValue(
        this.get(new IntRefVal(BigInt(i)))
      );
      if (elem.equal(val).value()) {
        return BoolRefVal.True;
      }
    }
    return BoolRefVal.False;
  }

  iterator(): Iterator {
    return new ListIterator(this);
  }

  size(): RefVal {
    return new IntRefVal(BigInt(this._value.length));
  }

  get(index: RefVal): RefVal {
    const i = indexOrError(index);
    if (i.type() === ErrorType) {
      return i;
    }
    if (
      (i.value() as bigint) < 0 ||
      (i.value() as bigint) >= this.size().value()
    ) {
      return new ErrorRefVal(
        `index '${i.value()}' out of range in list size '${this.size().value()}'`
      );
    }
    return this.adapter.nativeToValue(
      this._value[Number((i as IntRefVal).value())]
    );
  }

  toString() {
    let str = '[';
    for (let i = 0; i < this.size().value(); i++) {
      if (i > 0) {
        str += ', ';
      }
      str += this.get(new IntRefVal(BigInt(i))).toString();
    }
    return str + ']';
  }
}

/**
 * mutableList aggregates values into its internal storage. For use with
 * internal CEL variables only.
 */
export class MutableList<T = any> extends BaseList<T> {
  constructor(adapter: Adapter, private mutableValues: T[]) {
    super(adapter, []);
  }

  /**
   * Add copies elements from the other list into the internal storage of the
   * mutable list. The ref.Val returned by Add is the receiver.
   */
  override add(other: RefVal) {
    switch (other.type()) {
      case ListType:
        const otherList = other as Lister;
        for (let i = 0; i < otherList.size().value(); i++) {
          const val = otherList.get(new IntRefVal(BigInt(i))).value();
          this.mutableValues.push(val);
          this._value.push(val);
        }
        return this;
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }
}

/**
 * NewDynamicList returns a traits.Lister with heterogenous elements.
 * value should be an array of "native" types, i.e. any type that
 * NativeToValue() can convert to a ref.Val.
 */
export class DynamicList<T = any> extends BaseList<T> {
  constructor(adapter: Adapter, value: T[]) {
    super(adapter, value);
  }
}

/**
 * NewStringList returns a traits.Lister containing only strings.
 */
export class StringList extends BaseList<string> {
  constructor(adapter: Adapter, value: string[]) {
    super(adapter, value);
  }
}

/**
 * NewRefValList returns a traits.Lister with ref.Val elements.
 *
 * This type specialization is used with list literals within CEL expressions.
 */
export class RefValList extends BaseList<RefVal> {
  constructor(adapter: Adapter, value: RefVal[]) {
    super(adapter, value);
  }
}

/**
 * NewProtoList returns a traits.Lister based on a pb.List instance.
 */
export class ProtoList extends BaseList<Value> {
  constructor(adapter: Adapter, value: ListValue) {
    super(adapter, value.values);
  }
}

/**
 * concatList combines two list implementations together into a view.
 * The `Adapter` enables native type to CEL type conversions.
 */
class ConcatList<T = any> extends BaseList<T> {
  constructor(
    public override adapter: Adapter,
    prevList: Lister,
    nextList: Lister
  ) {
    super(adapter, []);
    for (let i = 0; i < prevList.size().value(); i++) {
      this._value.push(prevList.get(new IntRefVal(BigInt(i))).value());
    }
    for (let i = 0; i < nextList.size().value(); i++) {
      this._value.push(nextList.get(new IntRefVal(BigInt(i))).value());
    }
  }
}

class ListIterator extends BaseIterator implements Iterator {
  private _cursor = 0;

  constructor(private listValue: Lister) {
    super();
  }

  hasNext(): RefVal {
    return new BoolRefVal(this._cursor < this.listValue.size().value());
  }

  next(): RefVal | null {
    if (this.hasNext().value()) {
      const index = this._cursor;
      this._cursor++;
      return this.listValue.get(new IntRefVal(BigInt(index)));
    }
    return null;
  }
}

/**
 * IndexOrError converts an input index value into either a lossless integer
 * index or an error.
 */
export function indexOrError(index: RefVal): IntRefVal | ErrorRefVal {
  let retval: IntRefVal | null = null;
  switch (index.type()) {
    case IntType:
    case UintType:
      retval = index as IntRefVal;
      break;
    case DoubleType:
      if (Math.round(index.value()) !== index.value()) {
        return new ErrorRefVal(
          `unsupported index value '${index.value()}' in list`
        );
      }
      retval = new IntRefVal(BigInt(index.value()));
      break;
    default:
      return new ErrorRefVal(
        `unsupported index type '${index.type().typeName()}' in list`
      );
  }
  if (isNil(retval)) {
    return new ErrorRefVal(
      `unsupported index type '${index.type().typeName()}' in list`
    );
  }
  if (!isValidUint64(retval.value())) {
    return new ErrorRefVal(
      `unsupported index value '${retval.value()}' in list`
    );
  }
  return retval;
}

class InteropFoldableList implements Lister, Foldable {
  constructor(private _lister: Lister) {}

  convertToNative(type: NativeType) {
    return this._lister.convertToNative(type);
  }
  convertToType(type: RefType): RefVal {
    return this._lister.convertToType(type);
  }
  equal(other: RefVal): RefVal {
    return this._lister.equal(other);
  }
  type(): RefType {
    return this._lister.type();
  }
  value() {
    return this._lister.value();
  }
  add(other: RefVal): RefVal {
    return this._lister.add(other);
  }
  contains(value: RefVal): RefVal {
    return this._lister.contains(value);
  }
  get(index: RefVal): RefVal {
    return this._lister.get(index);
  }
  iterator(): Iterator {
    return this._lister.iterator();
  }
  size(): RefVal {
    return this._lister.size();
  }
  fold(f: Folder): void {
    const sz = this.size();
    for (let i = 0; i < sz.value(); i++) {
      if (!f.foldEntry(i, this.get(new IntRefVal(BigInt(i))))) {
        break;
      }
    }
  }
}

/**
 * ToFoldableList will create a Foldable version of a list suitable for
 * key-value pair iteration.
 *
 * For values which are already Foldable, this call is a no-op. For all other
 * values, the fold is driven via the Size() and Get() calls which means that
 * the folding will function, but take a performance hit.
 */
export function toFoldableList(lister: Lister): Foldable {
  if (isFoldable(lister)) {
    return lister;
  }
  return new InteropFoldableList(lister);
}
