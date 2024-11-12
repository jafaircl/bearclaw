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
import { AnySchema, BoolValueSchema, anyPack } from '@bufbuild/protobuf/wkt';
import { formatCELType } from '../format';
import { RefType, RefTypeEnum, RefVal } from '../ref/reference';
import { isConstExpr } from './constant';
import { ErrorRefVal } from './error';
import { IntRefVal, int64Value } from './int';
import { NativeType } from './native';
import { primitiveType } from './primitive';
import { StringRefVal, stringValue } from './string';
import { Comparer } from './traits/comparer';
import { Negater } from './traits/math';
import { Trait } from './traits/trait';
import { Zeroer } from './traits/zeroer';
import { TypeValue } from './type';

export const BOOL_CEL_TYPE = primitiveType(Type_PrimitiveType.BOOL);

export function isBoolType(type: Type) {
  return (
    type.typeKind.case === 'primitive' &&
    type.typeKind.value === Type_PrimitiveType.BOOL
  );
}

export function boolConstant(value: boolean) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'boolValue',
      value,
    },
  });
}

export function isBoolConstant(constant: Constant): constant is Constant & {
  constantKind: { case: 'boolValue'; value: boolean };
} {
  return constant.constantKind.case === 'boolValue';
}

export function boolExpr(id: bigint, value: boolean) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: boolConstant(value),
    },
  });
}

export function isBoolExpr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'constExpr';
    value: Constant & { constantKind: { case: 'boolValue'; value: boolean } };
  };
} {
  return isConstExpr(expr) && isBoolConstant(expr.exprKind.value);
}

export function boolValue(value: boolean) {
  return create(ValueSchema, {
    kind: {
      case: 'boolValue',
      value,
    },
  });
}

export function isBoolValue(value: Value): value is Value & {
  kind: { case: 'boolValue'; value: boolean };
} {
  return value.kind.case === 'boolValue';
}

export function convertBoolValueToNative(value: Value, type: NativeType) {
  if (!isBoolValue(value)) {
    // This should never happen
    throw new Error('value is not a bool');
  }
  switch (type) {
    case Boolean:
      return value.kind.value;
    case AnySchema:
      return anyPack(
        BoolValueSchema,
        create(BoolValueSchema, { value: value.kind.value })
      );
    case BoolValueSchema:
      return create(BoolValueSchema, { value: value.kind.value });
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(BOOL_CEL_TYPE)}' to '${
      type.name
    }'`
  );
}

export function convertBoolValueToType(value: Value, type: Type) {
  if (!isBoolValue(value)) {
    // This should never happen
    throw new Error('value is not a bool');
  }
  switch (type.typeKind.case) {
    case 'primitive':
      switch (type.typeKind.value) {
        case Type_PrimitiveType.BOOL:
          return boolValue(value.kind.value);
        case Type_PrimitiveType.STRING:
          return stringValue(value.kind.value ? 'true' : 'false');
        default:
          break;
      }
      break;
    case 'type':
      return BOOL_CEL_TYPE;
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(
      BOOL_CEL_TYPE
    )}' to '${formatCELType(type)}'`
  );
}

export function equalBoolValue(value: Value, other: Value) {
  if (!isBoolValue(value)) {
    // This should never happen
    throw new Error('value is not a bool');
  }
  if (!isBoolValue(other)) {
    return boolValue(false);
  }
  return boolValue(value.kind.value === other.kind.value);
}

export function isZeroBoolValue(value: Value) {
  if (!isBoolValue(value)) {
    // This should never happen
    throw new Error('value is not a bool');
  }
  return equalBoolValue(value, boolValue(false));
}

export const BOOL_TRAITS = new Set([Trait.COMPARER_TYPE, Trait.NEGATER_TYPE]);

export function compareBoolValue(value: Value, other: Value) {
  if (!isBoolValue(value)) {
    // This should never happen
    throw new Error('value is not a bool');
  }
  if (!isBoolValue(other)) {
    return new Error('no such overload');
  }
  if (value.kind.value === other.kind.value) {
    return int64Value(BigInt(0));
  }
  if (!value.kind.value && other.kind.value) {
    return int64Value(BigInt(-1));
  }
  return int64Value(BigInt(1));
}

export function negateBoolValue(value: Value) {
  if (!isBoolValue(value)) {
    // This should never happen
    throw new Error('value is not a bool');
  }
  return boolValue(!value.kind.value);
}

export const BOOL_REF_TYPE = new TypeValue(RefTypeEnum.BOOL, BOOL_TRAITS);

export class BoolRefVal implements RefVal, Comparer, Zeroer, Negater {
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value: boolean;

  constructor(value: boolean) {
    this._value = value;
  }

  static True = new BoolRefVal(true);
  static False = new BoolRefVal(false);

  celValue(): Value {
    return boolValue(this._value);
  }

  convertToNative(type: NativeType) {
    switch (type) {
      case Boolean:
        return this._value;
      case AnySchema:
        return anyPack(
          BoolValueSchema,
          create(BoolValueSchema, { value: this._value })
        );
      case BoolValueSchema:
        return create(BoolValueSchema, { value: this._value });
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    switch (type.typeName()) {
      case RefTypeEnum.BOOL:
        return new BoolRefVal(this._value);
      case RefTypeEnum.STRING:
        return new StringRefVal(this._value ? 'true' : 'false');
      case RefTypeEnum.TYPE:
        return BOOL_REF_TYPE;
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.BOOL:
        return new BoolRefVal(this._value === other.value());
      default:
        return BoolRefVal.False;
    }
  }

  type(): RefType {
    return BOOL_REF_TYPE;
  }

  value(): boolean {
    return this._value;
  }

  compare(other: RefVal) {
    switch (other.type().typeName()) {
      case RefTypeEnum.BOOL:
        if (other.value() === this.value()) {
          return IntRefVal.IntZero;
        }
        if (!this.value() && other.value()) {
          return IntRefVal.IntNegOne;
        }
        return IntRefVal.IntOne;
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  isZeroValue(): boolean {
    return this._value === false;
  }

  negate(): RefVal {
    return new BoolRefVal(!this._value);
  }
}
