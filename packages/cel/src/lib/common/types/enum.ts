import {
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';

export function enumValue(type: string, value: number): Value {
  return create(ValueSchema, {
    kind: {
      case: 'enumValue',
      value: {
        type,
        value,
      },
    },
  });
}

export function isEnumValue(value: Value): value is Value & {
  kind: {
    case: 'enumValue';
    value: {
      type: string;
      value: number;
    };
  };
} {
  return value.kind.case === 'enumValue';
}

export function unwrapEnumValue(value: Value) {
  if (isEnumValue(value)) {
    return value.kind.value;
  }
  return null;
}
