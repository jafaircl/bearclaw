import {
  Expr,
  Expr_SelectSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { create, MessageInitShape } from '@bufbuild/protobuf';

export function selectExpr(
  id: bigint,
  init: MessageInitShape<typeof Expr_SelectSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'selectExpr',
      value: init,
    },
  });
}

export function isSelectExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'selectExpr';
    value: MessageInitShape<typeof Expr_SelectSchema>;
  };
} {
  return val.exprKind.case === 'selectExpr';
}

export function unwrapSelectExpr(val: Expr) {
  if (isSelectExpr(val)) {
    return val.exprKind.value;
  }
  return null;
}
