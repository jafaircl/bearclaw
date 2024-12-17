/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { RefVal } from '../../ref/reference';

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
