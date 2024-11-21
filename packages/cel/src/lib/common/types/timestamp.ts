/* eslint-disable no-case-declarations */
import { isNil } from '@bearclaw/is';
import { clone, create } from '@bufbuild/protobuf';
import {
  AnySchema,
  Timestamp,
  TimestampSchema,
  anyPack,
  timestampDate,
  timestampFromDate,
  timestampNow,
} from '@bufbuild/protobuf/wkt';
import {
  TIME_GET_DATE_OVERLOAD,
  TIME_GET_DAY_OF_MONTH_OVERLOAD,
  TIME_GET_DAY_OF_WEEK_OVERLOAD,
  TIME_GET_DAY_OF_YEAR_OVERLOAD,
  TIME_GET_FULL_YEAR_OVERLOAD,
  TIME_GET_HOURS_OVERLOAD,
  TIME_GET_MILLISECONDS_OVERLOAD,
  TIME_GET_MINUTES_OVERLOAD,
  TIME_GET_MONTH_OVERLOAD,
  TIME_GET_SECONDS_OVERLOAD,
} from '../overloads';
import { RefType, RefVal } from './../ref/reference';
import { BoolRefVal } from './bool';
import { DurationRefVal, durationFromNanos, durationToNanos } from './duration';
import { ErrorRefVal } from './error';
import { IntRefVal, MAX_INT64, MIN_INT64 } from './int';
import { NativeType } from './native';
import { StringRefVal } from './string';
import { timeZoneOffsetMap } from './timezones';
import { Comparer } from './traits/comparer';
import { Adder, Subtractor } from './traits/math';
import { Receiver } from './traits/receiver';
import { Zeroer } from './traits/zeroer';
import {
  DurationType,
  IntType,
  StringType,
  TimestampType,
  TypeType,
} from './types';

/**
 * The number of seconds between year 1 and year 1970. This is borrowed from
 * https://golang.org/src/time/time.go.
 */
export const UNIX_TO_INTERNAL = BigInt(
  (1969 * 365 + 1969 / 4 - 1969 / 100 + 1969 / 400) * (60 * 60 * 24)
);

/**
 * Number of seconds between `0001-01-01T00:00:00Z` and the Unix epoch.
 */
export const MIN_UNIX_TIME = BigInt(-62135596800);

/**
 * Number of seconds between `9999-12-31T23:59:59.999999999Z` and the Unix
 * epoch.
 */
export const MAX_UNIX_TIME = BigInt(253402300799);

export function timestamp(seconds?: bigint, nanos?: number) {
  if (isNil(seconds) && isNil(nanos)) {
    return timestampNow();
  }
  return create(TimestampSchema, {
    seconds,
    nanos,
  });
}

export function isValidTimestamp(value: Timestamp) {
  return value.seconds >= MIN_UNIX_TIME && value.seconds <= MAX_UNIX_TIME;
}

export function timestampFromNanos(nanos: bigint) {
  return timestamp(nanos / BigInt(1e9), Number(nanos % BigInt(1e9)));
}

export function timestampFromSeconds(seconds: number) {
  return timestamp(
    BigInt(Math.trunc(seconds)),
    Math.trunc((seconds % 1) * 1e9)
  );
}

export function timestampToNanos(ts: Timestamp) {
  return ts.seconds * BigInt(1e9) + BigInt(ts.nanos);
}

export function timestampToSeconds(ts: Timestamp) {
  return Number(ts.seconds) + ts.nanos * 1e-9;
}

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

  static getFullYear(ts: Timestamp) {
    const date = timestampDate(ts);
    return new IntRefVal(BigInt(date.getUTCFullYear()));
  }

  static getMonth(ts: Timestamp) {
    const date = timestampDate(ts);
    return new IntRefVal(BigInt(date.getUTCMonth()));
  }

  static getDayOfYear(ts: Timestamp) {
    const date = timestampDate(ts);
    const start = new Date(date.getUTCFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return new IntRefVal(BigInt(Math.floor(diff / (1000 * 60 * 60 * 24))));
  }

  static getDayOfMonthOneBased(ts: Timestamp) {
    const date = timestampDate(ts);
    return new IntRefVal(BigInt(date.getUTCDate()));
  }

  static getDayOfMonthZeroBased(ts: Timestamp) {
    const date = timestampDate(ts);
    return new IntRefVal(BigInt(date.getUTCDate() - 1));
  }

  static getDayOfWeek(ts: Timestamp) {
    const date = timestampDate(ts);
    return new IntRefVal(BigInt(date.getUTCDay()));
  }

  static getHours(ts: Timestamp) {
    const date = timestampDate(ts);
    return new IntRefVal(BigInt(date.getUTCHours()));
  }

  static getMinutes(ts: Timestamp) {
    const date = timestampDate(ts);
    return new IntRefVal(BigInt(date.getUTCMinutes()));
  }

  static getSeconds(ts: Timestamp) {
    const date = timestampDate(ts);
    return new IntRefVal(BigInt(date.getUTCSeconds()));
  }

  static getMilliseconds(ts: Timestamp) {
    const date = timestampDate(ts);
    return new IntRefVal(BigInt(date.getUTCMilliseconds()));
  }

  static timeZone(
    tz: RefVal,
    visitor: (ts: Timestamp) => RefVal
  ): (ts: Timestamp) => RefVal {
    return (ts: Timestamp) => {
      switch (tz.type()) {
        case StringType:
          const date = timestampDate(ts);
          const tzStr = (tz as StringRefVal).value();
          // Handle cases where the timezone is an IANA timezone such as
          // "America/New_York".
          if (tzStr.indexOf('/') !== -1) {
            const offset = timeZoneOffsetMap.get(tzStr);
            if (isNil(offset)) {
              return new ErrorRefVal('invalid timezone');
            }
            date.setUTCMinutes(date.getUTCMinutes() + offset);
            return visitor(timestampFromDate(date));
          }
          // Otherwise, the timezone is an offset in in the format:
          // ^(+|-)(0[0-9]|1[0-4]):[0-5][0-9]$ such as "-07:00".
          const sign = tzStr[0] === '-' ? -1 : 1;
          const hr = parseUint(tzStr.slice(1, 3), 0, 23); // e.g., 07
          const mm = parseUint(tzStr.slice(4, 6), 0, 59); // e.g., 00
          const offset = sign * (hr * 60 + mm);
          date.setUTCMinutes(date.getUTCMinutes() + offset);
          return visitor(timestampFromDate(date));
        default:
          return ErrorRefVal.maybeNoSuchOverload(tz);
      }
    };
  }

  static ZeroArgOverloads = new Map([
    [TIME_GET_FULL_YEAR_OVERLOAD, TimestampRefVal.getFullYear],
    [TIME_GET_MONTH_OVERLOAD, TimestampRefVal.getMonth],
    [TIME_GET_DAY_OF_YEAR_OVERLOAD, TimestampRefVal.getDayOfYear],
    [TIME_GET_DATE_OVERLOAD, TimestampRefVal.getDayOfMonthOneBased],
    [TIME_GET_DAY_OF_MONTH_OVERLOAD, TimestampRefVal.getDayOfMonthZeroBased],
    [TIME_GET_DAY_OF_WEEK_OVERLOAD, TimestampRefVal.getDayOfWeek],
    [TIME_GET_HOURS_OVERLOAD, TimestampRefVal.getHours],
    [TIME_GET_MINUTES_OVERLOAD, TimestampRefVal.getMinutes],
    [TIME_GET_SECONDS_OVERLOAD, TimestampRefVal.getSeconds],
    [TIME_GET_MILLISECONDS_OVERLOAD, TimestampRefVal.getMilliseconds],
  ]);

  static OneArgOverloads = new Map([
    [
      TIME_GET_FULL_YEAR_OVERLOAD,
      (ts: Timestamp, tz: RefVal) => {
        return TimestampRefVal.timeZone(tz, TimestampRefVal.getFullYear)(ts);
      },
    ],
    [
      TIME_GET_MONTH_OVERLOAD,
      (ts: Timestamp, tz: RefVal) => {
        return TimestampRefVal.timeZone(tz, TimestampRefVal.getMonth)(ts);
      },
    ],
    [
      TIME_GET_DAY_OF_YEAR_OVERLOAD,
      (ts: Timestamp, tz: RefVal) => {
        return TimestampRefVal.timeZone(tz, TimestampRefVal.getDayOfYear)(ts);
      },
    ],
    [
      TIME_GET_DATE_OVERLOAD,
      (ts: Timestamp, tz: RefVal) => {
        return TimestampRefVal.timeZone(
          tz,
          TimestampRefVal.getDayOfMonthOneBased
        )(ts);
      },
    ],
    [
      TIME_GET_DAY_OF_MONTH_OVERLOAD,
      (ts: Timestamp, tz: RefVal) => {
        return TimestampRefVal.timeZone(
          tz,
          TimestampRefVal.getDayOfMonthZeroBased
        )(ts);
      },
    ],
    [
      TIME_GET_DAY_OF_WEEK_OVERLOAD,
      (ts: Timestamp, tz: RefVal) => {
        return TimestampRefVal.timeZone(tz, TimestampRefVal.getDayOfWeek)(ts);
      },
    ],
    [
      TIME_GET_HOURS_OVERLOAD,
      (ts: Timestamp, tz: RefVal) => {
        return TimestampRefVal.timeZone(tz, TimestampRefVal.getHours)(ts);
      },
    ],
    [
      TIME_GET_MINUTES_OVERLOAD,
      (ts: Timestamp, tz: RefVal) => {
        return TimestampRefVal.timeZone(tz, TimestampRefVal.getMinutes)(ts);
      },
    ],
    [
      TIME_GET_SECONDS_OVERLOAD,
      (ts: Timestamp, tz: RefVal) => {
        return TimestampRefVal.timeZone(tz, TimestampRefVal.getSeconds)(ts);
      },
    ],
    [
      TIME_GET_MILLISECONDS_OVERLOAD,
      (ts: Timestamp, tz: RefVal) => {
        return TimestampRefVal.timeZone(
          tz,
          TimestampRefVal.getMilliseconds
        )(ts);
      },
    ],
  ]);

  convertToNative(type: NativeType) {
    switch (type) {
      // TODO: should we do bigints and numbers? The go and projectnessie java implementations do not but you can use convertToType to get an IntRefVal.
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
    switch (type) {
      case IntType:
        return new IntRefVal(this._value.seconds);
      case StringType:
        return new StringRefVal(timestampToDateString(this._value));
      case TimestampType:
        return new TimestampRefVal(this._value);
      case TypeType:
        return TimestampType;
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    switch (other.type()) {
      case TimestampType:
        return new BoolRefVal(
          timestampToNanos(this._value) ===
            timestampToNanos((other as TimestampRefVal)._value)
        );
      default:
        return BoolRefVal.False;
    }
  }

  type(): RefType {
    return TimestampType;
  }

  value() {
    return this._value;
  }

  add(other: RefVal): RefVal {
    switch (other.type()) {
      case DurationType:
        return (other as DurationRefVal).add(this);
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  compare(other: RefVal): RefVal {
    switch (other.type()) {
      case TimestampType:
        const ts1 = timestampToNanos(this._value);
        const ts2 = timestampToNanos((other as TimestampRefVal).value());
        if (ts1 < ts2) {
          return IntRefVal.IntNegOne;
        }
        if (ts1 > ts2) {
          return IntRefVal.IntOne;
        }
        return IntRefVal.IntZero;
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  receive(fn: string, overload: string, args: RefVal[]): RefVal {
    switch (args.length) {
      case 0:
        const zeroArgFn = TimestampRefVal.ZeroArgOverloads.get(fn);
        if (zeroArgFn) {
          return zeroArgFn(this._value);
        }
        break;
      case 1:
        const oneArgFn = TimestampRefVal.OneArgOverloads.get(fn);
        if (oneArgFn) {
          return oneArgFn(this._value, args[0]);
        }
        break;
      default:
        break;
    }
    return ErrorRefVal.maybeNoSuchOverload(this);
  }

  subtract(subtrahend: RefVal): RefVal {
    switch (subtrahend.type()) {
      case DurationType:
        const durationNanos = durationToNanos(subtrahend.value());
        const tsNanos = timestampToNanos(this._value);
        if (
          (durationNanos < 0 &&
            tsNanos > MAX_INT64 * BigInt(1e9) + durationNanos) ||
          (durationNanos > 0 &&
            tsNanos < MIN_INT64 * BigInt(1e9) + durationNanos)
        ) {
          return ErrorRefVal.errIntOverflow;
        }
        const ts = timestampFromNanos(tsNanos - durationNanos);
        if (ts.seconds < MIN_UNIX_TIME || ts.seconds > MAX_UNIX_TIME) {
          return ErrorRefVal.errTimestampOverflow;
        }
        return new TimestampRefVal(ts);
      case TimestampType:
        const otherNanos = timestampToNanos(
          (subtrahend as TimestampRefVal).value()
        );
        const thisNanos = timestampToNanos(this._value);
        if (
          (thisNanos < 0 && otherNanos > MAX_INT64 + thisNanos) ||
          (thisNanos > 0 && otherNanos < MIN_INT64 + thisNanos)
        ) {
          return ErrorRefVal.errIntOverflow;
        }
        return new DurationRefVal(durationFromNanos(thisNanos - otherNanos));
      default:
        return ErrorRefVal.maybeNoSuchOverload(subtrahend);
    }
  }

  isZeroValue(): boolean {
    return timestampToNanos(this._value) === BigInt(0);
  }
}
