import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import { ValueSchema } from '@bufbuild/protobuf/wkt';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function unknownValue(value: any) {
  return create(ValueSchema, {
    kind: {
      case: undefined,
      value,
    },
  });
}

export function isUnknownValue(value: Value): value is Value & {
  kind: { case: undefined };
} {
  return value.kind.case === undefined;
}
