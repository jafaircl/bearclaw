import {
  Type,
  TypeSchema,
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
  Timestamp,
  TimestampSchema,
  anyPack,
  anyUnpack,
  timestampDate,
  timestampFromDate,
} from '@bufbuild/protobuf/wkt';
import { RefType, RefTypeEnum, RefVal } from './../ref/reference';
import { BoolRefVal } from './bool';
import { ErrorRefVal } from './error';
import { IntRefVal } from './int';
import { NativeType } from './native';
import { isObjectValue } from './object';
import { StringRefVal } from './string';
import { Comparer } from './traits/comparer';
import { Adder, Subtractor } from './traits/math';
import { Receiver } from './traits/receiver';
import { Trait } from './traits/trait';
import { Zeroer } from './traits/zeroer';
import { TypeRefVal } from './type';
import { typeNameToUrl } from './utils';
import { WKT_REGISTRY } from './wkt';

/**
 * The number of seconds between year 1 and year 1970. This is borrowed from
 * https://golang.org/src/time/time.go.
 */
export const UNIX_TO_INTERNAL =
  (1969 * 365 + 1969 / 4 - 1969 / 100 + 1969 / 400) * (60 * 60 * 24);

/**
 * Number of seconds between `0001-01-01T00:00:00Z` and the Unix epoch.
 */
export const MIN_UNIX_TIME = -62135596800;

/**
 * Number of seconds between `9999-12-31T23:59:59.999999999Z` and the Unix
 * epoch.
 */
export const MAX_UNIX_TIME = 253402300799;

export const TIMESTAMP_CEL_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'wellKnown',
    value: Type_WellKnownType.TIMESTAMP,
  },
});

export function timestamp(seconds?: bigint, nanos?: number) {
  return create(TimestampSchema, {
    seconds,
    nanos,
  });
}

export function isValidTimestamp(value: Timestamp) {
  return value.seconds >= MIN_UNIX_TIME && value.seconds <= MAX_UNIX_TIME;
}

export function timestampValue(ts: MessageInitShape<typeof TimestampSchema>) {
  return create(ValueSchema, {
    kind: {
      case: 'objectValue',
      value: anyPack(TimestampSchema, timestamp(ts.seconds, ts.nanos)),
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

export function timestampFromNanos(nanos: bigint) {
  return timestamp(nanos / BigInt(1e9), Number(nanos % BigInt(1e9)));
}

export function timestampToNanos(ts: Timestamp) {
  return ts.seconds * BigInt(1e9) + BigInt(ts.nanos);
}

/**
 * Parses a timestamp from a string. Will accept RFC3339 timestamps with or
 * without nanoseconds and with or without a timezone or ISO8601 timestamps
 * with or without a timezone.
 *
 * Example values:
 * - `1970-01-01T02:07:34.000000321Z`
 * - `1970-01-01T02:07:34.000000321+07:00`
 * - `2011-10-05T14:48:00.000Z`
 * - `2011-10-05T14:48:00.000-04:00`
 *
 * This function is based on the Go implementation of RFC3339 parsing:
 * @see https://cs.opensource.google/go/go/+/refs/tags/go1.23.3:src/time/format_rfc3339.go
 *
 * 1970-01-01T02:07:34.000000321Z
 */
export function timestampFromDateString(value: string) {
  /**
   * Parses a string as an unsigned integer between min and max.
   *
   * @param s the string to parse
   * @param min the minimum value
   * @param max the maximum value
   * @returns the parsed integer or the min value if the string is invalid
   */
  function parseUint(s: string, min: number, max: number) {
    const parsed = parseInt(s, 10);
    if (Number.isNaN(parsed) || parsed < min || parsed > max) {
      return min;
    }
    return parsed;
  }

  if (value.length < '2006-01-02T15:04:05'.length) {
    return null;
  }
  const year = parseUint(value.slice(0, 4), 0, 9999); // e.g., 2006
  const month = parseUint(value.slice(5, 7), 1, 12); // e.g., 01
  // TODO: handle months with fewer than 31 days
  const day = parseUint(value.slice(8, 10), 1, 31); // e.g., 02
  const hour = parseUint(value.slice(11, 13), 0, 23); // e.g., 15
  const min = parseUint(value.slice(14, 16), 0, 59); // e.g., 04
  const sec = parseUint(value.slice(17, 19), 0, 59); // e.g., 05

  value = value.slice(19);

  // Parse the fractional second.
  let nanos = 0;
  if (value.length > 1 && value[0] === '.') {
    value = value.slice(2);
    let i = 0;
    while (i < value.length && '0' <= value[i] && value[i] <= '9') {
      i++;
    }
    const frac = value.slice(0, i);
    nanos = parseInt(frac, 10);
    value = value.slice(i);
  }

  // Construct the date object
  const date = new Date(Date.UTC(year, month - 1, day, hour, min, sec));

  // Parse the timezone
  if (value.length !== 1 || value !== 'Z') {
    if (
      value.length !== '-07:00'.length ||
      (value[0] !== '+' && value[0] !== '-') ||
      value[3] !== ':'
    ) {
      return null;
    }
    const hr = parseUint(value.slice(1, 3), 0, 23); // e.g., 07
    const mm = parseUint(value.slice(4, 6), 0, 59); // e.g., 00
    let zoneOffset = hr * 60 + mm;
    if (value[0] === '-') {
      zoneOffset = -zoneOffset;
    }
    date.setMinutes(date.getMinutes() + zoneOffset);
  }
  const ts = timestampFromDate(date);
  return timestamp(ts.seconds, nanos);
}

/**
 * Converts a timestamp to a string. The string will be in RFC3339 format with
 * nanoseconds if the timestamp has nanoseconds. Otherwise, it will be in
 * ISO8061 format. The string will always be in UTC.
 *
 * @param ts the timestamp to convert
 * @returns the timestamp as a string
 */
export function timestampToDateString(ts: Timestamp) {
  const date = timestampDate(ts);
  if (ts.nanos === 0) {
    return date.toISOString();
  }
  const paddedNanos = ts.nanos.toString().padStart(9, '0');
  return date.toISOString().replace(/\.\d+Z$/, `.${paddedNanos}Z`);
}

export const TIMESTAMP_TRAITS = new Set<Trait>([
  Trait.ADDER_TYPE,
  Trait.COMPARER_TYPE,
  Trait.RECEIVER_TYPE,
  Trait.SUBTRACTOR_TYPE,
]);

export class TimestampRefType implements RefType {
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _traits = TIMESTAMP_TRAITS;

  celType(): Type {
    return TIMESTAMP_CEL_TYPE;
  }

  hasTrait(trait: Trait): boolean {
    return this._traits.has(trait);
  }

  typeName(): string {
    return RefTypeEnum.TIMESTAMP;
  }
}

export const TIMESTAMP_REF_TYPE = new TimestampRefType();

export class TimestampRefVal
  implements RefVal, Adder, Comparer, Receiver, Subtractor, Zeroer
{
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value: Timestamp;

  constructor(value: Timestamp) {
    this._value = value;
  }

  celValue(): Value {
    return timestampValue(this._value);
  }

  convertToNative(type: NativeType) {
    switch (type) {
      case Date:
        return timestampDate(this._value);
      case String:
        return timestampToDateString(this._value);
      case AnySchema:
        return anyPack(TimestampSchema, create(TimestampSchema, this._value));
      case TimestampSchema:
        return clone(TimestampSchema, this._value);
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    switch (type.typeName()) {
      case RefTypeEnum.INT:
        return new IntRefVal(this._value.seconds);
      case RefTypeEnum.STRING:
        return new StringRefVal(timestampToDateString(this._value));
      case RefTypeEnum.TIMESTAMP:
        return new TimestampRefVal(this._value);
      case RefTypeEnum.TYPE:
        return new TypeRefVal(TIMESTAMP_REF_TYPE);
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.TIMESTAMP:
        return new BoolRefVal(
          timestampToNanos(this._value) ===
            timestampToNanos((other as TimestampRefVal)._value)
        );
      default:
        return BoolRefVal.False;
    }
  }

  type(): RefType {
    return TIMESTAMP_REF_TYPE;
  }

  value() {
    return this._value;
  }

  add(other: RefVal): RefVal {
    throw new Error('Method not implemented.');
  }

  compare(other: RefVal): RefVal {
    throw new Error('Method not implemented.');
  }

  receive(fn: string, overload: string, args: RefVal[]): RefVal {
    throw new Error('Method not implemented.');
  }

  subtract(subtrahend: RefVal): RefVal {
    throw new Error('Method not implemented.');
  }

  isZeroValue(): boolean {
    throw new Error('Method not implemented.');
  }
}
