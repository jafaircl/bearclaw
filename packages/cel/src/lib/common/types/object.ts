import {
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { MessageInitShape, create } from '@bufbuild/protobuf';
import { Any, AnySchema } from '@bufbuild/protobuf/wkt';

export function objectValue(init: MessageInitShape<typeof AnySchema>) {
  return create(ValueSchema, {
    kind: {
      case: 'objectValue',
      value: init,
    },
  });
}

export function isObjectValue(value: Value): value is Value & {
  kind: { case: 'objectValue'; value: Any };
} {
  return value.kind.case === 'objectValue';
}
