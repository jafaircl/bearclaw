import {
  Expr,
  Expr_IdentSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create, MessageInitShape } from '@bufbuild/protobuf';

export function identExpr(
  id: bigint,
  init: MessageInitShape<typeof Expr_IdentSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'identExpr',
      value: init,
    },
  });
}

export function isIdentExpr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'identExpr';
    value: MessageInitShape<typeof Expr_IdentSchema>;
  };
} {
  return expr.exprKind.case === 'identExpr';
}

export function unwrapIdentExpr(expr: Expr) {
  if (isIdentExpr(expr)) {
    return expr.exprKind.value;
  }
  return null;
}
