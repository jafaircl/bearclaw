import {
  Type,
  TypeSchema,
  Type_ListTypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  Expr,
  ExprSchema,
  Expr_CreateListSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import {
  ListValueSchema,
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { MessageInitShape, create } from '@bufbuild/protobuf';

export function listType(value: MessageInitShape<typeof Type_ListTypeSchema>) {
  return create(TypeSchema, {
    typeKind: {
      case: 'listType',
      value,
    },
  });
}

export function isListType(val: Type): val is Type & {
  typeKind: {
    case: 'listType';
    value: MessageInitShape<typeof Type_ListTypeSchema>;
  };
} {
  return val.typeKind.case === 'listType';
}

export function unwrapListElemType(val: Type) {
  if (isListType(val)) {
    return val.typeKind.value.elemType;
  }
  return null;
}

export function listExpr(
  id: bigint,
  init: MessageInitShape<typeof Expr_CreateListSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'listExpr',
      value: init,
    },
  });
}

export function isListExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'listExpr';
    value: MessageInitShape<typeof Expr_CreateListSchema>;
  };
} {
  return val.exprKind.case === 'listExpr';
}

export function unwrapCreateList(val: Expr) {
  if (isListExpr(val)) {
    return val.exprKind.value;
  }
  return null;
}

export function listValue(value: MessageInitShape<typeof ListValueSchema>) {
  return create(ValueSchema, {
    kind: {
      case: 'listValue',
      value,
    },
  });
}

export function isListValue(val: Value): val is Value & {
  kind: { case: 'listValue'; value: MessageInitShape<typeof ListValueSchema> };
} {
  return val.kind.case === 'listValue';
}
