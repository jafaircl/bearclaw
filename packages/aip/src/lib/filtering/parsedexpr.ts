import { Expr } from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/syntax_pb.js';
import { expression, float, func, int, member, or, string, text } from './expr';
import { FunctionFuzzyAnd } from './functions';

export function parsedFloat(id: bigint, value: number) {
  const result = float(value);
  result.id = id;
  return result;
}

export function parsedInt(id: bigint, value: bigint) {
  const result = int(value);
  result.id = id;
  return result;
}

export function parsedText(id: bigint, s: string) {
  const result = text(s);
  result.id = id;
  return result;
}

export function parsedString(id: bigint, s: string) {
  const result = string(s);
  result.id = id;
  return result;
}

export function parsedExpression(id: bigint, ...sequences: Expr[]) {
  const result = expression(...sequences);
  result.id = id;
  return result;
}

export function parsedSequence(id: bigint, factor1: Expr, factor2: Expr) {
  return parsedFunction(id, FunctionFuzzyAnd, factor1, factor2);
}

export function parsedFactor(id: bigint, term1: Expr, term2: Expr) {
  const result = or(term1, term2);
  result.id = id;
  return result;
}

export function parsedMember(id: bigint, operand: Expr, field: string) {
  const result = member(operand, field);
  result.id = id;
  return result;
}

export function parsedFunction(id: bigint, name: string, ...args: Expr[]) {
  const result = func(name, ...args);
  result.id = id;
  return result;
}
