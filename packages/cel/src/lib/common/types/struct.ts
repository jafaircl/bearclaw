import {
  Expr,
  Expr_CreateStruct_Entry,
  Expr_CreateStruct_EntrySchema,
  Expr_CreateStructSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create, MessageInitShape } from '@bufbuild/protobuf';

export function structExpr(
  id: bigint,
  init: MessageInitShape<typeof Expr_CreateStructSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'structExpr',
      value: init,
    },
  });
}

export function isStructExpr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'structExpr';
    value: MessageInitShape<typeof Expr_CreateStructSchema>;
  };
} {
  return expr.exprKind.case === 'structExpr';
}

export function unwrapStructExpr(expr: Expr) {
  if (isStructExpr(expr)) {
    return expr.exprKind.value;
  }
  return null;
}

export function structEntry(
  init: MessageInitShape<typeof Expr_CreateStruct_EntrySchema>
) {
  return create(Expr_CreateStruct_EntrySchema, init);
}

export function structFieldEntry(
  id: bigint,
  key: string,
  value: Expr,
  optionalEntry?: boolean
) {
  return structEntry({
    id,
    keyKind: {
      case: 'fieldKey',
      value: key,
    },
    value,
    optionalEntry: optionalEntry ?? false,
  });
}

export function isStructFieldEntry(
  entry: Expr_CreateStruct_Entry
): entry is Expr_CreateStruct_Entry & {
  keyKind: {
    case: 'fieldKey';
    value: string;
  };
} {
  return entry.keyKind.case === 'fieldKey';
}

export function structMapEntry(
  id: bigint,
  key: Expr,
  value: Expr,
  optionalEntry?: boolean
) {
  return structEntry({
    id,
    keyKind: {
      case: 'mapKey',
      value: key,
    },
    value,
    optionalEntry: optionalEntry ?? false,
  });
}

export function isStructMapEntry(
  entry: Expr_CreateStruct_Entry
): entry is Expr_CreateStruct_Entry & {
  keyKind: {
    case: 'mapKey';
    value: Expr;
  };
} {
  return entry.keyKind.case === 'mapKey';
}

export function isMessageStructExpr(expr: Expr) {
  if (!isStructExpr(expr)) {
    return false;
  }
  return expr.exprKind.value.entries.every(isStructFieldEntry);
}

export function isMapStructExpr(expr: Expr) {
  if (!isStructExpr(expr)) {
    return false;
  }
  return expr.exprKind.value.entries.every(isStructMapEntry);
}
