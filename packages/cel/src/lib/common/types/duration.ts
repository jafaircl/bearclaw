/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { clone, create } from '@bufbuild/protobuf';
import {
  AnySchema,
  Duration,
  DurationSchema,
  anyPack,
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
} from '../overloads';
import { RefType, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { ErrorRefVal } from './error';
import { IntRefVal, MAX_INT64, MIN_INT64 } from './int';
import { NativeType } from './native';
import { StringRefVal } from './string';
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
import { Zeroer } from './traits/zeroer';
import {
  DurationType,
  IntType,
  StringType,
  TimestampType,
  TypeType,
  UintType,
} from './types';
import { UintRefVal } from './uint';

export function duration(seconds?: bigint, nanos?: number): Duration {
  return create(DurationSchema, { seconds, nanos });
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
      console.error(e);
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
    switch (type) {
      case DurationType:
        return new DurationRefVal(this._value);
      case IntType:
        return new IntRefVal(durationToNanos(this._value));
      case StringType:
        return new StringRefVal(`${durationToSeconds(this._value)}s`);
      case TypeType:
        return DurationType;
      case UintType:
        return new UintRefVal(durationToNanos(this._value));
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    switch (other.type()) {
      case DurationType:
        return new BoolRefVal(
          this._value.seconds === other.value().seconds &&
            this._value.nanos === other.value().nanos
        );
      default:
        return BoolRefVal.False;
    }
  }

  type(): RefType {
    return DurationType;
  }

  value() {
    return this._value;
  }

  add(other: RefVal): RefVal {
    switch (other.type()) {
      case DurationType:
        const thisNanos = durationToNanos(this._value);
        const otherNanos = durationToNanos(other.value());
        if (
          (otherNanos > 0 && thisNanos > MAX_INT64 - BigInt(otherNanos)) ||
          (otherNanos < 0 && thisNanos < MIN_INT64 - BigInt(otherNanos))
        ) {
          return ErrorRefVal.errIntOverflow;
        }
        return new DurationRefVal(durationFromNanos(thisNanos + otherNanos));
      case TimestampType:
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
    switch (other.type()) {
      case DurationType:
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
    switch (subtrahend.type()) {
      case DurationType:
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

  toString() {
    return `${durationToSeconds(this._value)}s`;
  }
}
