/* eslint-disable no-case-declarations */
import {
  Type,
  Type_PrimitiveType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  Constant,
  ConstantSchema,
  Expr,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import {
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import {
  AnySchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
  anyPack,
} from '@bufbuild/protobuf/wkt';
import { formatCELType } from '../format';
import { RefType, RefTypeEnum, RefVal } from './../ref/reference';
import { BoolRefVal, boolValue } from './bool';
import { compareNumberRefVals, compareNumberValues } from './compare';
import { isConstExpr } from './constant';
import { DoubleRefVal, doubleValue, isDoubleValue } from './double';
import { ErrorRefVal } from './error';
import { IntRefVal, MAX_INT64, int64Value } from './int';
import { NativeType } from './native';
import { isNumberValue } from './number';
import { primitiveType } from './primitive';
import { StringRefVal, stringValue } from './string';
import { Comparer } from './traits/comparer';
import { Adder, Divider, Modder, Multiplier, Subtractor } from './traits/math';
import { Trait } from './traits/trait';
import { Zeroer } from './traits/zeroer';
import { TypeValue } from './type';

export const UINT_CEL_TYPE = primitiveType(Type_PrimitiveType.UINT64);

export function isUint64Type(type: Type): type is Type & {
  typeKind: { case: 'primitive'; value: Type_PrimitiveType };
} {
  return (
    type.typeKind.case === 'primitive' &&
    type.typeKind.value === Type_PrimitiveType.UINT64
  );
}

export function unwrapUnit64Type(type: Type) {
  if (isUint64Type(type)) {
    return type.typeKind.value;
  }
  return null;
}

export function uint64Constant(value: bigint) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'uint64Value',
      value,
    },
  });
}

export function isUint64Constant(constant: Constant): constant is Constant & {
  constantKind: { case: 'uint64Value'; value: bigint };
} {
  return constant.constantKind.case === 'uint64Value';
}

export function uint64Expr(id: bigint, value: bigint) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: uint64Constant(value),
    },
  });
}

export function isUint64Expr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'constExpr';
    value: Constant & { constantKind: { case: 'uint64Value'; value: bigint } };
  };
} {
  return isConstExpr(expr) && isUint64Constant(expr.exprKind.value);
}

export function uint64Value(value: bigint) {
  return create(ValueSchema, {
    kind: {
      case: 'uint64Value',
      value,
    },
  });
}

export function isUint64Value(value: Value): value is Value & {
  kind: { case: 'uint64Value'; value: bigint };
} {
  return value.kind.case === 'uint64Value';
}

export function isValidUint32(value: number) {
  return (
    !Number.isNaN(value) &&
    value >= 0 &&
    value <= Number.MAX_SAFE_INTEGER &&
    value <= Infinity
  );
}

export function isValidUint64(value: bigint) {
  return (
    !Number.isNaN(value) &&
    value >= BigInt(0) &&
    value <= MAX_INT64 &&
    value <= Infinity
  );
}

export function convertUint64ValueToNative(value: Value, type: NativeType) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  switch (type) {
    case BigInt:
      return value.kind.value;
    case Number:
      return Number(value.kind.value);
    case AnySchema:
      return anyPack(
        UInt64ValueSchema,
        create(UInt64ValueSchema, { value: value.kind.value })
      );
    case UInt32ValueSchema:
      if (!isValidUint32(Number(value.kind.value))) {
        return new Error('unsigned integer overflow');
      }
      return create(UInt32ValueSchema, { value: Number(value.kind.value) });
    case UInt64ValueSchema:
      if (!isValidUint64(value.kind.value)) {
        return new Error('unsigned integer overflow');
      }
      return create(UInt64ValueSchema, { value: value.kind.value });
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(UINT_CEL_TYPE)}' to '${
      type.name
    }'`
  );
}

export function convertUint64ValueToType(value: Value, type: Type) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  switch (type.typeKind.case) {
    case 'primitive':
      switch (type.typeKind.value) {
        case Type_PrimitiveType.INT64:
          if (
            Number.isNaN(value.kind.value) ||
            !isValidUint64(value.kind.value)
          ) {
            return new Error('integer overflow');
          }
          return int64Value(value.kind.value);
        case Type_PrimitiveType.UINT64:
          if (
            Number.isNaN(value.kind.value) ||
            !isValidUint64(value.kind.value)
          ) {
            return new Error('unsigned integer overflow');
          }
          return uint64Value(value.kind.value);
        case Type_PrimitiveType.DOUBLE:
          return doubleValue(Number(value.kind.value));
        case Type_PrimitiveType.STRING:
          return stringValue(value.kind.value.toString());
        default:
          break;
      }
      break;
    case 'type':
      return UINT_CEL_TYPE;
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(
      UINT_CEL_TYPE
    )}' to '${formatCELType(type)}'`
  );
}

export function equalUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return boolValue(false);
  }
  if (
    Number.isNaN(Number(value.kind.value)) ||
    Number.isNaN(Number(other.kind.value))
  ) {
    return boolValue(false);
  }
  const compared = compareNumberValues(value, other);
  if (compared instanceof Error) {
    return boolValue(false);
  }
  return boolValue(compared.kind.value === BigInt(0));
}

export function isZeroUint64Value(value: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  return boolValue(value.kind.value === BigInt(0));
}

export const UINT64_TRAITS = new Set([
  Trait.ADDER_TYPE,
  Trait.COMPARER_TYPE,
  Trait.DIVIDER_TYPE,
  Trait.MODDER_TYPE,
  Trait.MULTIPLIER_TYPE,
  Trait.SUBTRACTOR_TYPE,
]);

export function addUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (
    (other.kind.value > 0 &&
      value.kind.value > MAX_INT64 - BigInt(other.kind.value)) ||
    (other.kind.value < 0 &&
      value.kind.value < Math.abs(Number(other.kind.value)))
  ) {
    return new Error('unsigned integer overflow');
  }
  return uint64Value(value.kind.value + BigInt(other.kind.value));
}

export function compareUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (
    Number.isNaN(Number(value.kind.value)) ||
    Number.isNaN(Number(other.kind.value))
  ) {
    return new Error('NaN values cannot be ordered');
  }
  if (isDoubleValue(other) && value.kind.value < Number.MIN_SAFE_INTEGER) {
    return uint64Value(BigInt(-1));
  }
  if (isDoubleValue(other) && value.kind.value > Number.MAX_SAFE_INTEGER) {
    return uint64Value(BigInt(1));
  }
  return compareNumberValues(value, other);
}

export function divideUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (Number(other.kind.value) === 0) {
    return new Error('divide by zero');
  }
  return uint64Value(value.kind.value / BigInt(other.kind.value));
}

export function moduloUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (Number(other.kind.value) === 0) {
    return new Error('modulus by zero');
  }
  return uint64Value(value.kind.value % BigInt(other.kind.value));
}

export function multiplyUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  const x = value.kind.value;
  const y = BigInt(other.kind.value);
  // Detecting multiplication overflow is more complicated than the others. The
  // first two detect attempting to negate MinUint64, which would result in
  // MaxUint64+1. The other four detect normal overflow conditions.
  if (y !== BigInt(0) && x > MAX_INT64 / y) {
    return new Error('unsigned integer overflow');
  }
  return uint64Value(value.kind.value * BigInt(other.kind.value));
}

export function subtractUint64Value(value: Value, other: Value) {
  if (!isUint64Value(value)) {
    throw new Error('int64 value is not a int64');
  }
  if (!isNumberValue(other)) {
    return new Error('no such overload');
  }
  if (other.kind.value > value.kind.value) {
    return new Error('unsigned integer overflow');
  }
  const result = value.kind.value - BigInt(other.kind.value);
  if (result < BigInt(0) || result > MAX_INT64) {
    return new Error('unsigned integer overflow');
  }
  return uint64Value(result);
}

export const UINT_REF_TYPE = new TypeValue(RefTypeEnum.UINT, UINT64_TRAITS);

export class UintRefVal
  implements
    RefVal,
    Adder,
    Comparer,
    Divider,
    Modder,
    Multiplier,
    Subtractor,
    Zeroer
{
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value: bigint;

  constructor(value: bigint) {
    this._value = value;
  }

  celValue(): Value {
    return uint64Value(this._value);
  }

  convertToNative(type: NativeType) {
    switch (type) {
      case BigInt:
        return this._value;
      case Number:
        return Number(this._value);
      case AnySchema:
        return anyPack(
          UInt64ValueSchema,
          create(UInt64ValueSchema, { value: this._value })
        );
      case UInt32ValueSchema:
        if (!isValidUint32(Number(this._value))) {
          return ErrorRefVal.errUintOverflow;
        }
        return create(UInt32ValueSchema, { value: Number(this._value) });
      case UInt64ValueSchema:
        if (!isValidUint64(this._value)) {
          return ErrorRefVal.errUintOverflow;
        }
        return create(UInt64ValueSchema, { value: this._value });
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    switch (type.typeName()) {
      case RefTypeEnum.DOUBLE:
        return new DoubleRefVal(Number(this._value));
      case RefTypeEnum.INT:
        if (Number.isNaN(this._value) || !isValidUint64(this._value)) {
          return ErrorRefVal.errIntOverflow;
        }
        return new IntRefVal(this._value);
      case RefTypeEnum.STRING:
        return new StringRefVal(this._value.toString());
      case RefTypeEnum.TYPE:
        return UINT_REF_TYPE;
      case RefTypeEnum.UINT:
        if (Number.isNaN(this._value) || !isValidUint64(this._value)) {
          return ErrorRefVal.errUintOverflow;
        }
        return new UintRefVal(this._value);
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    if (Number.isNaN(this._value) || Number.isNaN(other.value())) {
      return BoolRefVal.False;
    }
    switch (other.type().typeName()) {
      case RefTypeEnum.DOUBLE:
      case RefTypeEnum.INT:
      case RefTypeEnum.UINT:
        const compared = compareNumberRefVals(this, other);
        if (compared.type().typeName() === RefTypeEnum.ERR) {
          return compared;
        }
        return new BoolRefVal(compared.value() === BigInt(0));
      default:
        return BoolRefVal.False;
    }
  }

  type(): RefType {
    return UINT_REF_TYPE;
  }

  value() {
    return this._value;
  }

  add(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.DOUBLE:
      case RefTypeEnum.INT:
      case RefTypeEnum.UINT:
        if (
          (other.value() > 0 &&
            this._value > MAX_INT64 - BigInt(other.value())) ||
          (other.value() < 0 && this._value < Math.abs(Number(other.value())))
        ) {
          return ErrorRefVal.errUintOverflow;
        }
        return new UintRefVal(this._value + BigInt(other.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  compare(other: RefVal): RefVal {
    if (
      Number.isNaN(Number(this._value)) ||
      Number.isNaN(Number(other.value()))
    ) {
      return new ErrorRefVal('NaN values cannot be ordered');
    }
    switch (other.type().typeName()) {
      case RefTypeEnum.DOUBLE:
        if (this._value < Number.MIN_SAFE_INTEGER) {
          return IntRefVal.IntNegOne;
        }
        if (this._value > Number.MAX_SAFE_INTEGER) {
          return IntRefVal.IntOne;
        }
        return compareNumberRefVals(this, other);
      case RefTypeEnum.INT:
      case RefTypeEnum.UINT:
        return compareNumberRefVals(this, other);
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  divide(denominator: RefVal): RefVal {
    switch (denominator.type().typeName()) {
      case RefTypeEnum.DOUBLE:
      case RefTypeEnum.INT:
      case RefTypeEnum.UINT:
        if (Number(denominator.value()) === 0) {
          return ErrorRefVal.errDivideByZero;
        }
        return new UintRefVal(this._value / BigInt(denominator.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(denominator);
    }
  }

  modulo(denominator: RefVal): RefVal {
    switch (denominator.type().typeName()) {
      case RefTypeEnum.DOUBLE:
      case RefTypeEnum.INT:
      case RefTypeEnum.UINT:
        if (Number(denominator.value()) === 0) {
          return ErrorRefVal.errModulusByZero;
        }
        return new UintRefVal(this._value % BigInt(denominator.value()));
      default:
        return ErrorRefVal.maybeNoSuchOverload(denominator);
    }
  }

  multiply(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.DOUBLE:
      case RefTypeEnum.INT:
      case RefTypeEnum.UINT:
        const x = this._value;
        const y = BigInt(other.value());
        // Detecting multiplication overflow is more complicated than the
        // others. The first two detect attempting to negate MinUint64, which
        // would result in MaxUint64+1. The other four detect normal overflow
        // conditions.
        if (y !== BigInt(0) && x > MAX_INT64 / y) {
          return ErrorRefVal.errUintOverflow;
        }
        return new UintRefVal(x * y);
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  subtract(subtrahend: RefVal): RefVal {
    switch (subtrahend.type().typeName()) {
      case RefTypeEnum.DOUBLE:
      case RefTypeEnum.INT:
      case RefTypeEnum.UINT:
        if (subtrahend.value() > this._value) {
          return ErrorRefVal.errUintOverflow;
        }
        const result = this._value - BigInt(subtrahend.value());
        if (result < BigInt(0) || result > MAX_INT64) {
          return ErrorRefVal.errUintOverflow;
        }
        return new UintRefVal(result);
      default:
        return ErrorRefVal.maybeNoSuchOverload(subtrahend);
    }
  }

  isZeroValue(): boolean {
    return this._value === BigInt(0);
  }
}
