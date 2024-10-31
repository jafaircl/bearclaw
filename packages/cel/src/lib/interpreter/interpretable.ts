import { ExprValue } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb.js';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { Activation } from './activation';

export interface Interpretable {
  // ID value corresponding to the expression node.
  id: bigint;

  // Eval an Activation to produce an output.
  eval: (ctx: Activation) => ExprValue;
}

// InterpretableConst interface for tracking whether the Interpretable is a
// constant value.
export interface InterpretableConst extends Interpretable {
  // Value returns the constant value of the instruction.
  value: Value;
}
