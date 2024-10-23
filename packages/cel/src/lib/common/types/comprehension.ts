import {
  Expr,
  Expr_ComprehensionSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create, MessageInitShape } from '@bufbuild/protobuf';

export function comprehensionExpr(
  id: bigint,
  init: MessageInitShape<typeof Expr_ComprehensionSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'comprehensionExpr',
      value: init,
    },
  });
}

export function isComprehensionExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'comprehensionExpr';
    value: MessageInitShape<typeof Expr_ComprehensionSchema>;
  };
} {
  return val.exprKind.case === 'comprehensionExpr';
}

export function unwrapComprehensionExpr(val: Expr) {
  if (isComprehensionExpr(val)) {
    return val.exprKind.value;
  }
  return null;
}
