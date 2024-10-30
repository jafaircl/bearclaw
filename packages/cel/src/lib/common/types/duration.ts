/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Type,
  Type_PrimitiveType,
  Type_WellKnownType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { MessageInitShape, clone, create } from '@bufbuild/protobuf';
import {
  Any,
  AnySchema,
  Duration,
  DurationSchema,
  anyPack,
  anyUnpack,
} from '@bufbuild/protobuf/wkt';
import { formatCELType } from '../format';
import { int64Value } from './int';
import { NativeType } from './native';
import { isObjectValue } from './object';
import { stringValue } from './string';
import { typeNameToUrl } from './utils';
import { DURATION_TYPE, WKT_REGISTRY } from './wkt';

export function durationValue(init: MessageInitShape<typeof DurationSchema>) {
  return create(ValueSchema, {
    kind: {
      case: 'objectValue',
      value: anyPack(DurationSchema, create(DurationSchema, init)),
    },
  });
}

export function isDurationValue(value: Value): value is Value & {
  kind: { case: 'objectValue'; value: Any };
} {
  return (
    isObjectValue(value) &&
    value.kind.value.typeUrl === typeNameToUrl(DurationSchema.typeName)
  );
}

export function unwrapDurationValue(value: Value) {
  if (isDurationValue(value)) {
    return anyUnpack(value.kind.value, WKT_REGISTRY) as Duration;
  }
  return null;
}

export function convertDurationValueToNative(value: Value, type: NativeType) {
  if (!isDurationValue(value)) {
    throw new Error('duration value is not a duration');
  }
  const duration = unwrapDurationValue(value)!;
  switch (type) {
    case AnySchema:
      return anyPack(DurationSchema, duration);
    case DurationSchema:
      return clone(DurationSchema, duration);
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(DURATION_TYPE)}' to '${
      type.name
    }'`
  );
}

export function convertDurationValueToType(value: Value, type: Type) {
  if (!isDurationValue(value)) {
    throw new Error('duration value is not a duration');
  }
  const duration = unwrapDurationValue(value)!;
  switch (type.typeKind.case) {
    case 'primitive':
      switch (type.typeKind.value) {
        case Type_PrimitiveType.STRING:
          return stringValue(
            `${Number(duration.seconds) + duration.nanos * 1e-9}s`
          );
        case Type_PrimitiveType.INT64:
          return int64Value(
            duration.seconds * BigInt(1e9) + BigInt(duration.nanos)
          );
        default:
          break;
      }
      break;
    case 'wellKnown':
      switch (type.typeKind.value) {
        case Type_WellKnownType.DURATION:
          return durationValue(clone(DurationSchema, duration));
        default:
          break;
      }
      break;
    case 'type':
      return DURATION_TYPE;
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(
      DURATION_TYPE
    )}' to '${formatCELType(type)}'`
  );
}
