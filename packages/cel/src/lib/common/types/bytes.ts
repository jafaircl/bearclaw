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
import { boolValue } from './bool';
import { isConstExpr } from './constant';
import { int64Value } from './int';
import { NativeType } from './native';
import { primitiveType } from './primitive';
import { stringValue } from './string';
import { Trait } from './traits/trait';

export const BYTES_TYPE = primitiveType(Type_PrimitiveType.BYTES);

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
    `type conversion error from '${formatCELType(BYTES_TYPE)}' to '${
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
      return BYTES_TYPE;
    default:
      break;
  }
  return new Error(
    `type conversion error from '${formatCELType(
      BYTES_TYPE
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
