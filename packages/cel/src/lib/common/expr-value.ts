import {
  ErrorSet,
  ErrorSetSchema,
  ExprValue,
  ExprValueSchema,
  UnknownSet,
  UnknownSetSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb.js';
import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { MessageInitShape, create } from '@bufbuild/protobuf';

export function exprValueValue(value: Value) {
  return create(ExprValueSchema, {
    kind: {
      case: 'value',
      value,
    },
  });
}

export function isExprValueValue(
  exprValue: ExprValue
): exprValue is ExprValue & {
  kind: { case: 'value'; value: Value };
} {
  return exprValue.kind.case === 'value';
}

export function unwrapExprValueValue(exprValue: ExprValue) {
  if (isExprValueValue(exprValue)) {
    return exprValue.kind.value as Value;
  }
  return null;
}

export function exprValueError(value: MessageInitShape<typeof ErrorSetSchema>) {
  return create(ExprValueSchema, {
    kind: {
      case: 'error',
      value,
    },
  });
}

export function isExprValueError(
  exprValue: ExprValue
): exprValue is ExprValue & {
  kind: { case: 'error'; value: ErrorSet };
} {
  return exprValue.kind.case === 'error';
}

export function unwrapExprValueError(exprValue: ExprValue) {
  if (isExprValueError(exprValue)) {
    return exprValue.kind.value as ErrorSet;
  }
  return null;
}

export function exprValueUnknown(
  value: MessageInitShape<typeof UnknownSetSchema>
) {
  return create(ExprValueSchema, {
    kind: {
      case: 'unknown',
      value,
    },
  });
}

export function isExprValueUnknown(
  exprValue: ExprValue
): exprValue is ExprValue & {
  kind: { case: 'unknown'; value: UnknownSet };
} {
  return exprValue.kind.case === 'unknown';
}

export function unwrapExprValueUnknown(exprValue: ExprValue) {
  if (isExprValueUnknown(exprValue)) {
    return exprValue.kind.value as UnknownSet;
  }
  return null;
}
