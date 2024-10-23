import {
  Constant,
  ConstantSchema,
  Expr,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { MessageInitShape, create } from '@bufbuild/protobuf';

export function constExpr(
  id: bigint,
  init: MessageInitShape<typeof ConstantSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: create(ConstantSchema, init),
    },
  });
}

export function isConstExpr(
  expr: Expr
): expr is Expr & { exprKind: { case: 'constExpr'; value: Constant } } {
  return expr.exprKind.case === 'constExpr';
}

export function unwrapConstExpr(expr: Expr) {
  if (isConstExpr(expr)) {
    return expr.exprKind.value;
  }
  return null;
}
