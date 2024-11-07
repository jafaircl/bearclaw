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

export function timestampFromRfc3339nano(value: string) {
  const stReg =
    /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)?(:)?(\d\d)?([.,]\d+)?($|Z|([+-])(\d\d)(:)?(\d\d)?)/i;
  const nsReg = /(^[^.]*)(\.\d*)(Z.*$)/;
  if (!value || !stReg.test(value)) {
    return null;
  }
  const dt = new Date(
    value
      .replace(nsReg, '$1$3')
      .replace(/Z-/i, '-')
      .replace(/Z\+/i, '+')
      .replace(/Z/i, '+')
      .replace(/\+$/, 'Z')
  );
  const ns = value.replace(nsReg, '$2');
  return timestamp(BigInt(dt.getTime() / 1000), Number(ns) * 1e9);
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
        return new StringRefVal(this.toString());
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
