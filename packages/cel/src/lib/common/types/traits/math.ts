/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { RefVal } from '../../ref/reference';
import { addBytesValue } from '../bytes';
import {
  addDoubleValue,
  divideDoubleValue,
  multiplyDoubleValue,
  subtractDoubleValue,
} from '../double';
import {
  addInt64Value,
  divideInt64Value,
  moduloInt64Value,
  multiplyInt64Value,
  subtractInt64Value,
} from '../int';
import { addStringValue } from '../string';
import {
  addUint64Value,
  divideUint64Value,
  moduloUint64Value,
  multiplyUint64Value,
  subtractUint64Value,
} from '../uint';

export function adder(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'bytesValue':
      return addBytesValue(value, other);
    case 'doubleValue':
      return addDoubleValue(value, other);
    case 'int64Value':
      return addInt64Value(value, other);
    case 'stringValue':
      return addStringValue(value, other);
    case 'uint64Value':
      return addUint64Value(value, other);
    default:
      return new Error('no such overload');
  }
}

export function divider(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'doubleValue':
      return divideDoubleValue(value, other);
    case 'int64Value':
      return divideInt64Value(value, other);
    case 'uint64Value':
      return divideUint64Value(value, other);
    default:
      return new Error('no such overload');
  }
}

export function modder(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'int64Value':
      return moduloInt64Value(value, other);
    case 'uint64Value':
      return moduloUint64Value(value, other);
    default:
      return new Error('no such overload');
  }
}

export function multiplier(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'doubleValue':
      return multiplyDoubleValue(value, other);
    case 'int64Value':
      return multiplyInt64Value(value, other);
    case 'uint64Value':
      return multiplyUint64Value(value, other);
    default:
      return new Error('no such overload');
  }
}

export function subtractor(value: Value, other: Value) {
  switch (value.kind.case) {
    case 'doubleValue':
      return subtractDoubleValue(value, other);
    case 'int64Value':
      return subtractInt64Value(value, other);
    case 'uint64Value':
      return subtractUint64Value(value, other);
    default:
      return new Error('no such overload');
  }
}

/**
 * Adder interface to support '+' operator overloads.
 */
export interface Adder {
  /**
   * Add returns a combination of the current value and other value.
   *
   * If the other value is an unsupported type, an error is returned.
   */
  add(other: RefVal): RefVal;
}

export function isAdder(value: any): value is Adder {
  return value && isFunction(value.add);
}

/**
 * Divider interface to support '/' operator overloads.
 */
export interface Divider {
  /**
   * Divide returns the result of dividing the current value by the input
   * denominator.
   *
   * A denominator value of zero results in an error.
   */
  divide(denominator: RefVal): RefVal;
}

export function isDivider(value: any): value is Divider {
  return value && isFunction(value.divide);
}

/**
 * Modder interface to support '%' operator overloads.
 */
export interface Modder {
  /**
   * Modulo returns the result of taking the modulus of the current value
   * by the denominator.
   *
   * A denominator value of zero results in an error.
   */
  modulo(denominator: RefVal): RefVal;
}

export function isModder(value: any): value is Modder {
  return value && isFunction(value.modulo);
}

/**
 * Multiplier interface to support '*' operator overloads.
 */
export interface Multiplier {
  /**
   * Multiply returns the result of multiplying the current and input value.
   */
  multiply(other: RefVal): RefVal;
}

export function isMultiplier(value: any): value is Multiplier {
  return value && isFunction(value.multiply);
}

/**
 * Negater interface to support unary '-' and '!' operator overloads.
 */
export interface Negater {
  /**
   * Negate returns the complement of the current value.
   */
  negate(): RefVal;
}

export function isNegater(value: any): value is Negater {
  return value && isFunction(value.negate);
}

/**
 * Subtractor interface to support binary '-' operator overloads.
 */
export interface Subtractor {
  /**
   * Subtract returns the result of subtracting the input from the current
   * value.
   */
  subtract(subtrahend: RefVal): RefVal;
}

export function isSubtractor(value: any): value is Subtractor {
  return value && isFunction(value.subtract);
}
