import {
  Type,
  TypeSchema,
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
import { NullValue, NullValueSchema } from '@bufbuild/protobuf/wkt';
import { RefType, RefTypeEnum, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { isConstExpr } from './constant';
import { ErrorRefVal } from './error';
import { NativeType } from './native';
import { StringRefVal } from './string';
import { Zeroer } from './traits/zeroer';
import { TypeValue } from './type';

export const NULL_CEL_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'null',
    value: NullValue.NULL_VALUE,
  },
});

export function isNullType(type: Type): type is Type & {
  typeKind: { case: 'null'; value: NullValue };
} {
  return type.typeKind.case === 'null';
}

export function unwrapNullType(type: Type) {
  if (isNullType(type)) {
    return type.typeKind.value;
  }
  return null;
}

export const NULL_CONSTANT = create(ConstantSchema, {
  constantKind: {
    case: 'nullValue',
    value: NullValue.NULL_VALUE,
  },
});

export function isNullConstant(constant: Constant): constant is Constant & {
  constantKind: { case: 'nullValue'; value: NullValue.NULL_VALUE };
} {
  return constant.constantKind.case === 'nullValue';
}

export function nullExpr(id: bigint) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: NULL_CONSTANT,
    },
  });
}

export function isNullExpr(expr: Expr): expr is Expr & {
  exprKind: {
    case: 'constExpr';
    value: Constant & {
      constantKind: { case: 'nullValue'; value: NullValue.NULL_VALUE };
    };
  };
} {
  return isConstExpr(expr) && isNullConstant(expr.exprKind.value);
}

export const NULL_VALUE = create(ValueSchema, {
  kind: {
    case: 'nullValue',
    value: NullValue.NULL_VALUE,
  },
});

export function isNullValue(value: Value): value is Value & {
  kind: { case: 'nullValue'; value: NullValue.NULL_VALUE };
} {
  return value.kind.case === 'nullValue';
}

export const NULL_REF_TYPE = new TypeValue(RefTypeEnum.NULL);

export class NullRefVal implements RefVal, Zeroer {
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value = null;

  celValue(): Value {
    return NULL_VALUE;
  }

  convertToNative(type: NativeType) {
    switch (type) {
      case Object:
        return null;
      // TODO: should we do this?
      case BigInt:
        return BigInt(0);
      // TODO: since NullValueSchema isn't the same as other DescMessage types, we need to figure out how to handle this
      // case AnySchema:
      //   return anyPack(NullValueSchema as unknown as DescMessage, NULL_VALUE);
      case NullValueSchema:
        return NULL_VALUE;
      // TODO: cel-go translates to wrapper types. But, there is no way to set a value on a protobuf-es wrapper type to null
      default:
        return ErrorRefVal.nativeTypeConversionError(this, type);
    }
  }

  convertToType(type: RefType): RefVal {
    switch (type.typeName()) {
      case RefTypeEnum.STRING:
        return new StringRefVal('null');
      case RefTypeEnum.NULL:
        return new NullRefVal();
      case RefTypeEnum.TYPE:
        return NULL_REF_TYPE;
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  equal(other: RefVal): RefVal {
    return new BoolRefVal(other.type().typeName() === this.type().typeName());
  }

  type(): RefType {
    return NULL_REF_TYPE;
  }

  value() {
    return this._value;
  }

  isZeroValue(): boolean {
    return true;
  }
}
