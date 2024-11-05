import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { Trait } from '../common/types/traits/trait';

/**
 * A function that takes a single value and produces an output.
 */
export type UnaryOp = (value: Value) => Value;

/**
 * A function that takes two values and produces an output.
 */
export type BinaryOp = (left: Value, right: Value) => Value;

/**
 * A function which accepts zero or more arguments and produces a value or
 * error as a result
 */
export type FunctionOp = (...values: Value[]) => Value;

/**
 * Defines a named overload of a function, indicating an operand trait
 * which must be present on the first argument to the overload as well as one
 * of either a unary, binary, or function implementation.
 *
 * The majority of  operators within the expression language are unary or binary
 * and the specializations simplify the call contract for implementers of
 * types with operator overloads. Any added complexity is assumed to be handled
 * by the generic FunctionOp.
 */
export interface Overload {
  /**
   * Operator name as written in an expression
   */
  operator: string;

  /**
   * Operand trait used to dispatch the call. The zero-value indicates a
   * global function overload or that one of the Unary / Binary / Function
   * definitions should be used to execute the call.
   */
  operandTrait: Trait;

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
  nonStrict: boolean;
}
