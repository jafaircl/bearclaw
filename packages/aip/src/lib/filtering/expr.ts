import {
  Expr,
  ExprSchema,
} from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import {
  FunctionAnd,
  FunctionDuration,
  FunctionEquals,
  FunctionFuzzyAnd,
  FunctionGreaterEquals,
  FunctionGreaterThan,
  FunctionHas,
  FunctionLessEquals,
  FunctionLessThan,
  FunctionNot,
  FunctionNotEquals,
  FunctionOr,
  FunctionTimestamp,
} from './functions';

export function not(arg: Expr) {
  return func(FunctionNot, arg);
}

export function member(operand: Expr, field: string) {
  return create(ExprSchema, {
    exprKind: {
      case: 'selectExpr',
      value: {
        operand,
        field,
      },
    },
  });
}

export function func(name: string, ...args: Expr[]) {
  return create(ExprSchema, {
    exprKind: {
      case: 'callExpr',
      value: {
        function: name,
        args,
      },
    },
  });
}

export function float(value: number) {
  return create(ExprSchema, {
    exprKind: {
      case: 'constExpr',
      value: {
        constantKind: {
          case: 'doubleValue',
          value,
        },
      },
    },
  });
}

export function duration(value: string) {
  return func(FunctionDuration, string(value));
}

export function timestamp(value: string) {
  return func(FunctionTimestamp, string(value));
}

export function int(value: bigint | number) {
  value = BigInt(value);
  return create(ExprSchema, {
    exprKind: {
      case: 'constExpr',
      value: {
        constantKind: {
          case: 'int64Value',
          value,
        },
      },
    },
  });
}

export function equals(lhs: Expr, rhs: Expr) {
  return func(FunctionEquals, lhs, rhs);
}

export function notEquals(lhs: Expr, rhs: Expr) {
  return func(FunctionNotEquals, lhs, rhs);
}

export function has(lhs: Expr, rhs: Expr) {
  return func(FunctionHas, lhs, rhs);
}

export function or(...args: Expr[]) {
  if (args.length <= 2) {
    return func(FunctionOr, ...args);
  }
  let result = func(FunctionOr, args[0], args[1]);
  for (let i = 2; i < args.length; i++) {
    result = func(FunctionOr, result, args[i]);
  }
  return result;
}

export function and(...args: Expr[]) {
  if (args.length <= 2) {
    return func(FunctionAnd, ...args);
  }
  let result = func(FunctionAnd, args[0], args[1]);
  for (let i = 2; i < args.length; i++) {
    result = func(FunctionAnd, result, args[i]);
  }
  return result;
}

export function lessThan(lhs: Expr, rhs: Expr) {
  return func(FunctionLessThan, lhs, rhs);
}

export function lessEquals(lhs: Expr, rhs: Expr) {
  return func(FunctionLessEquals, lhs, rhs);
}

export function greaterThan(lhs: Expr, rhs: Expr) {
  return func(FunctionGreaterThan, lhs, rhs);
}

export function greaterEquals(lhs: Expr, rhs: Expr) {
  return func(FunctionGreaterEquals, lhs, rhs);
}

export function text(name: string) {
  return create(ExprSchema, {
    exprKind: {
      case: 'identExpr',
      value: {
        name,
      },
    },
  });
}

export function string(value: string) {
  return create(ExprSchema, {
    exprKind: {
      case: 'constExpr',
      value: {
        constantKind: {
          case: 'stringValue',
          value,
        },
      },
    },
  });
}

export function expression(...sequences: Expr[]) {
  return and(...sequences);
}

export function sequence(...args: Expr[]) {
  if (args.length <= 2) {
    return func(FunctionFuzzyAnd, ...args);
  }
  let result = func(FunctionFuzzyAnd, args[0], args[1]);
  for (let i = 2; i < args.length; i++) {
    result = func(FunctionFuzzyAnd, result, args[i]);
  }
  return result;
}

export function factor(...terms: Expr[]) {
  return or(...terms);
}
