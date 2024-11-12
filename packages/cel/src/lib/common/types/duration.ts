/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Type,
  TypeSchema,
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
import {
  toSeconds as iso8601durationToSeconds,
  parse as parseIso8601Duration,
} from 'iso8601-duration';
import {
  TIME_GET_HOURS_OVERLOAD,
  TIME_GET_MILLISECONDS_OVERLOAD,
  TIME_GET_MINUTES_OVERLOAD,
  TIME_GET_SECONDS_OVERLOAD,
} from '../../overloads';
import { formatCELType } from '../format';
import { RefType, RefTypeEnum, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { ErrorRefVal } from './error';
import { IntRefVal, MAX_INT64, MIN_INT64, int64Value } from './int';
import { NativeType } from './native';
import { isObjectValue } from './object';
import { StringRefVal, stringValue } from './string';
import {
  MAX_UNIX_TIME,
  MIN_UNIX_TIME,
  TimestampRefVal,
  timestampFromNanos,
  timestampToNanos,
} from './timestamp';
import { Comparer } from './traits/comparer';
import { Adder, Negater, Subtractor } from './traits/math';
import { Receiver } from './traits/receiver';
import { Trait } from './traits/trait';
import { Zeroer } from './traits/zeroer';
import { TypeValue } from './type';
import { UintRefVal } from './uint';
import { typeNameToUrl } from './utils';
import { DURATION_WKT_CEL_TYPE, WKT_REGISTRY } from './wkt';

export const DURATION_CEL_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'wellKnown',
    value: Type_WellKnownType.DURATION,
  },
});

export function duration(seconds?: bigint, nanos?: number) {
  return create(DurationSchema, { seconds, nanos });
}

export function durationValue(init: MessageInitShape<typeof DurationSchema>) {
  return create(ValueSchema, {
    kind: {
      case: 'objectValue',
      value: anyPack(DurationSchema, duration(init.seconds, init.nanos)),
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
    `type conversion error from '${formatCELType(DURATION_WKT_CEL_TYPE)}' to '${
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
      return DURATION_WKT_CEL_TYPE;
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(
      DURATION_WKT_CEL_TYPE
    )}' to '${formatCELType(type)}'`
  );
}

export function parseISO8061DurationString(text: string) {
  try {
    const duration = parseIso8601Duration(`P${text.toUpperCase()}`);
    const seconds = iso8601durationToSeconds(duration);
    return durationFromSeconds(seconds);
  } catch {
    try {
      const duration = parseIso8601Duration(`PT${text.toUpperCase()}`);
      const seconds = iso8601durationToSeconds(duration);
      return durationFromSeconds(seconds);
    } catch (e) {
      console.log(e);
      return new Error(`cannot parse duration: ${text}`);
    }
  }
}

export function durationFromNanos(nanos: bigint) {
  return duration(nanos / BigInt(1e9), Number(nanos % BigInt(1e9)));
}

export function durationFromSeconds(seconds: number) {
  return duration(BigInt(Math.trunc(seconds)), Math.trunc((seconds % 1) * 1e9));
}

export function durationToNanos(duration: Duration) {
  return duration.seconds * BigInt(1e9) + BigInt(duration.nanos);
}

export function durationToSeconds(duration: Duration) {
  return Number(duration.seconds) + duration.nanos * 1e-9;
}

export const DURATION_TRAITS = new Set([
  Trait.ADDER_TYPE,
  Trait.COMPARER_TYPE,
  Trait.NEGATER_TYPE,
  Trait.RECEIVER_TYPE,
  Trait.SUBTRACTOR_TYPE,
]);

export const DURATION_REF_TYPE = new TypeValue(
  RefTypeEnum.DURATION,
  DURATION_TRAITS
);

export class DurationRefVal
  implements RefVal, Adder, Comparer, Negater, Receiver, Subtractor, Zeroer
{
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value: Duration;

  constructor(value: Duration) {
    this._value = value;
  }

  static durationGetHours(duration: Duration) {
    const nanos = durationToNanos(duration);
    return new IntRefVal(nanos / BigInt(1e9 * 60 * 60));
  }

  static durationGetMinutes(duration: Duration) {
    const nanos = durationToNanos(duration);
    return new IntRefVal(nanos / BigInt(1e9 * 60));
  }

  static durationGetSeconds(duration: Duration) {
    const nanos = durationToNanos(duration);
    return new IntRefVal(nanos / BigInt(1e9));
  }

  static durationGetMilliseconds(duration: Duration) {
    const nanos = durationToNanos(duration);
    return new IntRefVal(nanos / BigInt(1e6));
  }

  static Overloads = new Map([
    [TIME_GET_HOURS_OVERLOAD, DurationRefVal.durationGetHours],
    [TIME_GET_MINUTES_OVERLOAD, DurationRefVal.durationGetMinutes],
    [TIME_GET_SECONDS_OVERLOAD, DurationRefVal.durationGetSeconds],
    [TIME_GET_MILLISECONDS_OVERLOAD, DurationRefVal.durationGetMilliseconds],
  ]);

  celValue(): Value {
    return durationValue(this._value);
  }

  convertToNative(type: NativeType) {
    switch (type) {
      case BigInt:
        return durationToNanos(this._value);
      case String:
        return `${durationToSeconds(this._value)}s`;
      case AnySchema:
        return anyPack(DurationSchema, this._value);
      case DurationSchema:
        return clone(DurationSchema, this._value);
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    switch (type.typeName()) {
      case RefTypeEnum.DURATION:
        return new DurationRefVal(this._value);
      case RefTypeEnum.INT:
        return new IntRefVal(durationToNanos(this._value));
      case RefTypeEnum.STRING:
        return new StringRefVal(`${durationToSeconds(this._value)}s`);
      case RefTypeEnum.TYPE:
        return DURATION_REF_TYPE;
      case RefTypeEnum.UINT:
        return new UintRefVal(durationToNanos(this._value));
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.DURATION:
        return new BoolRefVal(
          this._value.seconds === other.value().seconds &&
            this._value.nanos === other.value().nanos
        );
      default:
        return BoolRefVal.False;
    }
  }

  type(): RefType {
    return DURATION_REF_TYPE;
  }

  value() {
    return this._value;
  }

  add(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.DURATION:
        const thisNanos = durationToNanos(this._value);
        const otherNanos = durationToNanos(other.value());
        if (
          (otherNanos > 0 && thisNanos > MAX_INT64 - BigInt(otherNanos)) ||
          (otherNanos < 0 && thisNanos < MIN_INT64 - BigInt(otherNanos))
        ) {
          return ErrorRefVal.errIntOverflow;
        }
        return new DurationRefVal(durationFromNanos(thisNanos + otherNanos));
      case RefTypeEnum.TIMESTAMP:
        const durationNanos = durationToNanos(this._value);
        const tsNanos = timestampToNanos(other.value());
        if (
          (durationNanos > 0 &&
            tsNanos > MAX_INT64 * BigInt(1e9) - durationNanos) ||
          (durationNanos < 0 &&
            tsNanos < MIN_INT64 * BigInt(1e9) - durationNanos)
        ) {
          return ErrorRefVal.errIntOverflow;
        }
        const ts = timestampFromNanos(tsNanos + durationNanos);
        if (ts.seconds < MIN_UNIX_TIME || ts.seconds > MAX_UNIX_TIME) {
          return ErrorRefVal.errTimestampOverflow;
        }
        return new TimestampRefVal(ts);
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  compare(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.DURATION:
        const d1 = durationToNanos(this._value);
        const d2 = durationToNanos(other.value());
        if (d1 < d2) {
          return IntRefVal.IntNegOne;
        }
        if (d1 > d2) {
          return IntRefVal.IntOne;
        }
        return IntRefVal.IntZero;
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  negate(): RefVal {
    const nanos = durationToNanos(this._value);
    if (nanos === MIN_INT64) {
      return ErrorRefVal.errIntOverflow;
    }
    return new DurationRefVal(durationFromNanos(-nanos));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  receive(fn: string, overload: string, args: RefVal[]): RefVal {
    const f = DurationRefVal.Overloads.get(fn);
    if (f) {
      return f(this._value);
    }
    return ErrorRefVal.errNoSuchOverload;
  }

  subtract(subtrahend: RefVal): RefVal {
    switch (subtrahend.type().typeName()) {
      case RefTypeEnum.DURATION:
        const thisNanos = durationToNanos(this._value);
        const otherNanos = durationToNanos(subtrahend.value());
        if (
          (otherNanos < 0 && thisNanos > MAX_INT64 + BigInt(otherNanos)) ||
          (otherNanos > 0 && thisNanos < MIN_INT64 + BigInt(otherNanos))
        ) {
          return ErrorRefVal.errIntOverflow;
        }
        return new DurationRefVal(
          duration(
            this._value.seconds - subtrahend.value().seconds,
            this._value.nanos - subtrahend.value().nanos
          )
        );
      default:
        return ErrorRefVal.maybeNoSuchOverload(subtrahend);
    }
  }

  isZeroValue(): boolean {
    return durationToNanos(this._value) === BigInt(0);
  }
}
