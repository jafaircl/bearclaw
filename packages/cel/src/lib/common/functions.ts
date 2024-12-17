import { isNil } from '@bearclaw/is';
import { Trait } from '../common/types/traits/trait';
import { RefVal } from './ref/reference';

/**
 * A function that takes a single value and produces an output.
 */
export type UnaryOp = (value: RefVal) => RefVal;

/**
 * A function that takes two values and produces an output.
 */
export type BinaryOp = (left: RefVal, right: RefVal) => RefVal;

/**
 * A function which accepts zero or more arguments and produces a value or
 * error as a result
 */
export type FunctionOp = (...values: RefVal[]) => RefVal;

interface OverloadInput {
  /**
   * Operator name as written in an expression or defined in overloads.ts
   */
  operator: string;

  /**
   * Operand trait used to dispatch the call. The zero-value indicates a
   * global function overload or that one of the Unary / Binary / Function
   * definitions should be used to execute the call.
   */
  operandTraits?: Trait[];

  /**
   * Unary defines the overload with a UnaryOp implementation. May be nil.
   */
  unary?: UnaryOp;

  /**
   * Binary defines the overload with a BinaryOp implementation. May be nil.
   */
  binary?: BinaryOp;

  /**
   * Function defines the overload with a FunctionOp implementation. May be nil.
   */
  function?: FunctionOp;

  /**
   * NonStrict specifies whether the Overload will tolerate arguments that are
   * types.Err or types.Unknown.
   */
  nonStrict?: boolean;
}

/**
 * Overload defines a named overload of a function, indicating an operand trait
 * which must be present on the first argument to the overload as well as one
 * of either a unary, binary, or function implementation.
 *
 * The majority of  operators within the expression language are unary or
 * binary and the specializations simplify the call contract for implementers
 * of types with operator overloads. Any added complexity is assumed to be
 * handled by the generic FunctionOp.
 */
export class Overload {
  /**
   * Operator name as written in an expression or defined in overloads.ts
   */
  operator: string;

  /**
   * Operand traits used to dispatch the call. The zero-value indicates a
   * global function overload or that one of the Unary / Binary / Function
   * definitions should be used to execute the call.
   */
  operandTraits: Trait[];

  /**
   * Unary defines the overload with a UnaryOp implementation. May be nil.
   */
  unary?: UnaryOp;

  /**
   * Binary defines the overload with a BinaryOp implementation. May be nil.
   */
  binary?: BinaryOp;

  /**
   * Function defines the overload with a FunctionOp implementation. May be nil.
   */
  function?: FunctionOp;

  /**
   * NonStrict specifies whether the Overload will tolerate arguments that are
   * types.Err or types.Unknown.
   */
  nonStrict?: boolean;

  constructor(input: OverloadInput) {
    this.operator = input.operator;
    this.operandTraits = input.operandTraits ?? [];
    this.unary = input.unary;
    this.binary = input.binary;
    this.function = input.function;
    this.nonStrict = isNil(input.nonStrict) ? false : input.nonStrict;
  }
}
