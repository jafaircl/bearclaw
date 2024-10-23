import {
  Expr,
  Expr_CallSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create, MessageInitShape } from '@bufbuild/protobuf';

export function callExpr(
  id: bigint,
  init: MessageInitShape<typeof Expr_CallSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'callExpr',
      value: init,
    },
  });
}

export function isCallExpr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'callExpr';
    value: MessageInitShape<typeof Expr_CallSchema>;
  };
} {
  return expr.exprKind.case === 'callExpr';
}

export function unwrapCallExpr(expr: Expr) {
  if (isCallExpr(expr)) {
    return expr.exprKind.value;
  }
  return null;
}
