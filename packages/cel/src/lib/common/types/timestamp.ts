import {
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { MessageInitShape, create } from '@bufbuild/protobuf';
import {
  Any,
  Timestamp,
  TimestampSchema,
  anyPack,
  anyUnpack,
} from '@bufbuild/protobuf/wkt';
import { isObjectValue } from './object';
import { typeNameToUrl } from './utils';
import { WKT_REGISTRY } from './wkt';

// Number of seconds between `0001-01-01T00:00:00Z` and the Unix epoch.
export const MIN_UNIX_TIME = -62135596800;
export const MIN_UNIX_TIME_MS = MIN_UNIX_TIME * 1000;

// Number of seconds between `9999-12-31T23:59:59.999999999Z` and the Unix
// epoch.
export const MAX_UNIX_TIME = 253402300799;
export const MAX_UNIX_TIME_MS = MAX_UNIX_TIME * 1000;

export function isValidTimestamp(value: Timestamp) {
  return value.seconds >= MIN_UNIX_TIME && value.seconds <= MAX_UNIX_TIME;
}

export function timestampValue(init: MessageInitShape<typeof TimestampSchema>) {
  return create(ValueSchema, {
    kind: {
      case: 'objectValue',
      value: anyPack(TimestampSchema, create(TimestampSchema, init)),
    },
  });
}

export function isTimestampValue(value: Value): value is Value & {
  kind: { case: 'objectValue'; value: Any };
} {
  return (
    isObjectValue(value) &&
    value.kind.value.typeUrl === typeNameToUrl(TimestampSchema.typeName)
  );
}

export function unwrapTimestampValue(value: Value) {
  if (isTimestampValue(value)) {
    return anyUnpack(value.kind.value, WKT_REGISTRY) as Timestamp;
  }
  return null;
}
