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
import { AnySchema, BytesValueSchema, anyPack } from '@bufbuild/protobuf/wkt';
import { dequal } from 'dequal';
import { formatCELType } from '../format';
import { RefType, RefTypeEnum, RefVal } from '../ref/reference';
import { BoolRefVal, boolValue } from './bool';
import { isConstExpr } from './constant';
import { ErrorRefVal } from './error';
import { IntRefVal, int64Value } from './int';
import { NativeType } from './native';
import { primitiveType } from './primitive';
import { StringRefVal, stringValue } from './string';
import { Comparer } from './traits/comparer';
import { Adder } from './traits/math';
import { Sizer } from './traits/sizer';
import { Trait } from './traits/trait';
import { Zeroer } from './traits/zeroer';
import { TypeRefVal } from './type';

export const BYTES_CEL_TYPE = primitiveType(Type_PrimitiveType.BYTES);

export function isBytesType(val: Type) {
  return (
    val.typeKind.case === 'primitive' &&
    val.typeKind.value === Type_PrimitiveType.BYTES
  );
}

export function bytesConstant(value: Uint8Array) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'bytesValue',
      value,
    },
  });
}

export function isBytesConstant(constant: Constant): constant is Constant & {
  constantKind: { case: 'bytesValue'; value: Uint8Array };
} {
  return constant.constantKind.case === 'bytesValue';
}

export function bytesExpr(id: bigint, value: Uint8Array) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: bytesConstant(value),
    },
  });
}

export function isBytesExpr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'constExpr';
    value: Constant & {
      constantKind: { case: 'bytesValue'; value: Uint8Array };
    };
  };
} {
  return isConstExpr(expr) && isBytesConstant(expr.exprKind.value);
}

export function bytesValue(value: Uint8Array) {
  return create(ValueSchema, {
    kind: {
      case: 'bytesValue',
      value,
    },
  });
}

export function isBytesValue(value: Value): value is Value & {
  kind: { case: 'bytesValue'; value: Uint8Array };
} {
  return value.kind.case === 'bytesValue';
}

export function convertBytesValueToNative(value: Value, type: NativeType) {
  if (!isBytesValue(value)) {
    throw new Error('bytes value is not a bytes');
  }
  switch (type) {
    case Uint8Array:
      return value.kind.value;
    case AnySchema:
      return anyPack(
        BytesValueSchema,
        create(BytesValueSchema, { value: value.kind.value })
      );
    case BytesValueSchema:
      return create(BytesValueSchema, { value: value.kind.value });
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(BYTES_CEL_TYPE)}' to '${
      type.name
    }'`
  );
}

export function convertBytesValueToType(value: Value, type: Type) {
  if (!isBytesValue(value)) {
    throw new Error('bytes value is not a bytes');
  }
  switch (type.typeKind.case) {
    case 'primitive':
      switch (type.typeKind.value) {
        case Type_PrimitiveType.BYTES:
          return bytesValue(value.kind.value);
        case Type_PrimitiveType.STRING:
          return stringValue(new TextDecoder().decode(value.kind.value));
        default:
          break;
      }
      break;
    case 'type':
      return BYTES_CEL_TYPE;
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(
      BYTES_CEL_TYPE
    )}' to '${formatCELType(type)}'`
  );
}

export function equalBytesValue(value: Value, other: Value) {
  if (!isBytesValue(value)) {
    throw new Error('bytes value is not a bytes');
  }
  if (!isBytesValue(other)) {
    return boolValue(false);
  }
  return boolValue(dequal(value.kind.value, other.kind.value));
}

export function isZeroBytesValue(value: Value) {
  if (!isBytesValue(value)) {
    throw new Error('bytes value is not a bytes');
  }
  return boolValue(value.kind.value.length === 0);
}

export const BYTES_TRAITS = new Set<Trait>([
  Trait.ADDER_TYPE,
  Trait.COMPARER_TYPE,
  Trait.SIZER_TYPE,
]);

export function addBytesValue(value: Value, other: Value) {
  if (!isBytesValue(value)) {
    throw new Error('bytes value is not a bytes');
  }
  if (!isBytesValue(other)) {
    return new Error('no such overload');
  }
  return bytesValue(new Uint8Array([...value.kind.value, ...other.kind.value]));
}

export function compareBytesValue(value: Value, other: Value) {
  if (!isBytesValue(value)) {
    throw new Error('bytes value is not a bytes');
  }
  if (!isBytesValue(other)) {
    return new Error('no such overload');
  }
  if (value.kind.value.length < other.kind.value.length) {
    return int64Value(BigInt(-1));
  }
  if (value.kind.value.length > other.kind.value.length) {
    return int64Value(BigInt(1));
  }
  for (let i = 0; i < value.kind.value.length; i++) {
    const v = value.kind.value[i];
    const o = other.kind.value[i];
    if (v < o) {
      return int64Value(BigInt(-1));
    }
    if (v > o) {
      return int64Value(BigInt(1));
    }
  }
  return int64Value(BigInt(0));
}

export function sizeBytesValue(value: Value) {
  if (!isBytesValue(value)) {
    throw new Error('bytes value is not a bytes');
  }
  return int64Value(BigInt(value.kind.value.length));
}

export class BytesRefType implements RefType {
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  readonly _traits = BYTES_TRAITS;

  celType(): Type {
    return BYTES_CEL_TYPE;
  }

  hasTrait(trait: Trait): boolean {
    return this._traits.has(trait);
  }

  typeName(): string {
    return RefTypeEnum.BYTES;
  }
}

export const BYTES_REF_TYPE = new BytesRefType();

export class BytesRefVal implements RefVal, Adder, Comparer, Sizer, Zeroer {
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value: Uint8Array;

  constructor(value: Uint8Array) {
    this._value = value;
  }

  celValue(): Value {
    return bytesValue(this._value);
  }

  convertToNative(type: NativeType) {
    switch (type) {
      case Uint8Array:
        return this._value;
      case AnySchema:
        return anyPack(
          BytesValueSchema,
          create(BytesValueSchema, { value: this._value })
        );
      case BytesValueSchema:
        return create(BytesValueSchema, { value: this._value });
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    switch (type.typeName()) {
      case RefTypeEnum.BYTES:
        return new BytesRefVal(this._value);
      case RefTypeEnum.STRING:
        return new StringRefVal(new TextDecoder().decode(this._value));
      case RefTypeEnum.TYPE:
        return new TypeRefVal(BYTES_REF_TYPE);
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.BYTES:
        return new BoolRefVal(dequal(this._value, other.value()));
      default:
        return BoolRefVal.False;
    }
  }

  type(): RefType {
    return BYTES_REF_TYPE;
  }

  value() {
    return this._value;
  }

  add(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.BYTES:
        return new BytesRefVal(
          new Uint8Array([...this._value, ...(other.value() as Uint8Array)])
        );
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  compare(other: RefVal): RefVal {
    switch (other.type().typeName()) {
      case RefTypeEnum.BYTES:
        if (this._value.length < other.value().length) {
          return IntRefVal.IntNegOne;
        }
        if (this._value.length > other.value().length) {
          return IntRefVal.IntOne;
        }
        for (let i = 0; i < this._value.length; i++) {
          const v = this._value[i];
          const o = other.value()[i];
          if (v < o) {
            return IntRefVal.IntNegOne;
          }
          if (v > o) {
            return IntRefVal.IntOne;
          }
        }
        return IntRefVal.IntZero;
      default:
        return ErrorRefVal.maybeNoSuchOverload(other);
    }
  }

  size(): RefVal {
    return new IntRefVal(BigInt(this._value.length));
  }

  isZeroValue(): boolean {
    return this._value.length === 0;
  }
}
