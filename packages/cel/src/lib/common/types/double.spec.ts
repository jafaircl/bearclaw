import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import {
  AnySchema,
  DoubleValueSchema,
  FloatValueSchema,
  anyPack,
} from '@bufbuild/protobuf/wkt';
import { BoolRefVal } from './bool';
import {
  DOUBLE_REF_TYPE,
  DoubleRefVal,
  doubleConstant,
  doubleExpr,
  doubleValue,
} from './double';
import { ErrorRefVal } from './error';
import { INT_REF_TYPE, IntRefVal } from './int';
import { STRING_REF_TYPE, StringRefVal } from './string';
import { TYPE_REF_TYPE, TypeRefVal } from './type';
import { UINT_REF_TYPE, UintRefVal } from './uint';

describe('double', () => {
  it('doubleConstant', () => {
    expect(doubleConstant(1.1)).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'doubleValue',
          value: 1.1,
        },
      })
    );
  });

  it('doubleExpr', () => {
    expect(doubleExpr(BigInt(1), 1.1)).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'doubleValue',
              value: 1.1,
            },
          }),
        },
      })
    );
  });

  it('doubleValue', () => {
    expect(doubleValue(1.1)).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'doubleValue',
          value: 1.1,
        },
      })
    );
  });

  // TODO: validations

  it('convertDoubleValueToNative - js Number', () => {
    const value = new DoubleRefVal(3.14);
    expect(value.convertToNative(Number)).toStrictEqual(3.14);
  });

  it('convertDoubleValueToNative - anyPack', () => {
    const value = new DoubleRefVal(-1.4);
    const packed = anyPack(
      DoubleValueSchema,
      create(DoubleValueSchema, { value: -1.4 })
    );
    expect(value.convertToNative(AnySchema)).toStrictEqual(packed);
  });

  it('convertDoubleValueToNative - double wrapper', () => {
    const value = new DoubleRefVal(30000000.1);
    expect(value.convertToNative(DoubleValueSchema)).toStrictEqual(
      create(DoubleValueSchema, { value: 30000000.1 })
    );
  });

  it('convertDoubleValueToNative - double wrapper', () => {
    const value = new DoubleRefVal(1.7976931348623157);
    expect(value.convertToNative(FloatValueSchema)).toStrictEqual(
      create(FloatValueSchema, { value: 1.7976931348623157 })
    );
  });

  it('convertDoubleValueToNative - invalid type', () => {
    const value = new DoubleRefVal(-3.14159);
    expect(value.convertToNative(Boolean)).toStrictEqual(
      ErrorRefVal.nativeTypeConversionError(value, Boolean)
    );
  });

  it('convertDoubleValueToType', () => {
    const value = new DoubleRefVal(1234.5);
    expect(value.convertToType(DOUBLE_REF_TYPE)).toStrictEqual(value);
    expect(value.convertToType(STRING_REF_TYPE)).toStrictEqual(
      new StringRefVal('1234.5')
    );
    expect(value.convertToType(TYPE_REF_TYPE)).toStrictEqual(
      new TypeRefVal(DOUBLE_REF_TYPE)
    );
    // Int64 errors
    expect(new DoubleRefVal(NaN).convertToType(INT_REF_TYPE)).toStrictEqual(
      ErrorRefVal.errIntOverflow
    );
    expect(
      new DoubleRefVal(Infinity).convertToType(INT_REF_TYPE)
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
    expect(
      new DoubleRefVal(-Infinity).convertToType(INT_REF_TYPE)
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
    expect(
      new DoubleRefVal(Number.MAX_VALUE).convertToType(INT_REF_TYPE)
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
    expect(
      new DoubleRefVal(-1 * Number.MAX_VALUE).convertToType(INT_REF_TYPE)
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
    // Uint64 errors
    expect(new DoubleRefVal(NaN).convertToType(UINT_REF_TYPE)).toStrictEqual(
      ErrorRefVal.errUintOverflow
    );
    expect(
      new DoubleRefVal(Infinity).convertToType(UINT_REF_TYPE)
    ).toStrictEqual(ErrorRefVal.errUintOverflow);
    expect(new DoubleRefVal(-1).convertToType(UINT_REF_TYPE)).toStrictEqual(
      ErrorRefVal.errUintOverflow
    );
    expect(
      new DoubleRefVal(Number.MAX_VALUE).convertToType(UINT_REF_TYPE)
    ).toStrictEqual(ErrorRefVal.errUintOverflow);
  });

  it('equalDoubleValue', () => {
    const testCases = [
      {
        a: new DoubleRefVal(-10),
        b: new DoubleRefVal(-10),
        out: new BoolRefVal(true),
      },
      {
        a: new DoubleRefVal(-10),
        b: new DoubleRefVal(10),
        out: new BoolRefVal(false),
      },
      {
        a: new DoubleRefVal(10),
        b: new UintRefVal(BigInt(10)),
        out: new BoolRefVal(true),
      },
      {
        a: new DoubleRefVal(9),
        b: new UintRefVal(BigInt(10)),
        out: new BoolRefVal(false),
      },
      {
        a: new DoubleRefVal(10),
        b: new IntRefVal(BigInt(10)),
        out: new BoolRefVal(true),
      },
      {
        a: new DoubleRefVal(10),
        b: new IntRefVal(BigInt(-15)),
        out: new BoolRefVal(false),
      },
      {
        a: new DoubleRefVal(NaN),
        b: new IntRefVal(BigInt(10)),
        out: new BoolRefVal(false),
      },
      {
        a: new DoubleRefVal(10),
        b: new DoubleRefVal(NaN),
        out: new BoolRefVal(false),
      },
    ];
    for (const testCase of testCases) {
      expect(testCase.a.equal(testCase.b)).toStrictEqual(testCase.out);
    }
  });

  it('isZeroDoubleValue', () => {
    expect(new DoubleRefVal(0).isZeroValue()).toEqual(true);
    expect(new DoubleRefVal(1).isZeroValue()).toEqual(false);
  });

  it('addDoubleValue', () => {
    expect(new DoubleRefVal(1).add(new DoubleRefVal(2))).toStrictEqual(
      new DoubleRefVal(3)
    );
    expect(new DoubleRefVal(1).add(new UintRefVal(BigInt(2)))).toStrictEqual(
      new DoubleRefVal(3)
    );
    expect(new DoubleRefVal(1).add(new IntRefVal(BigInt(2)))).toStrictEqual(
      new DoubleRefVal(3)
    );
    expect(new DoubleRefVal(1).add(new StringRefVal('2'))).toStrictEqual(
      ErrorRefVal.errNoSuchOverload
    );
  });

  it('compareDoubleValue', () => {
    const testCases = [
      {
        a: new DoubleRefVal(42),
        b: new DoubleRefVal(42),
        out: new IntRefVal(BigInt(0)),
      },
      {
        a: new DoubleRefVal(42),
        b: new UintRefVal(BigInt(42)),
        out: new IntRefVal(BigInt(0)),
      },
      {
        a: new DoubleRefVal(42),
        b: new IntRefVal(BigInt(42)),
        out: new IntRefVal(BigInt(0)),
      },
      {
        a: new DoubleRefVal(-1300),
        b: new DoubleRefVal(204),
        out: new IntRefVal(BigInt(-1)),
      },
      {
        a: new DoubleRefVal(-1300),
        b: new UintRefVal(BigInt(204)),
        out: new IntRefVal(BigInt(-1)),
      },
      {
        a: new DoubleRefVal(203.9),
        b: new IntRefVal(BigInt(204)),
        out: new IntRefVal(BigInt(-1)),
      },
      {
        a: new DoubleRefVal(1300),
        b: new UintRefVal(BigInt(Number.MAX_SAFE_INTEGER + 1)),
        out: new IntRefVal(BigInt(-1)),
      },
      {
        a: new DoubleRefVal(204),
        b: new UintRefVal(BigInt(205)),
        out: new IntRefVal(BigInt(-1)),
      },
      {
        a: new DoubleRefVal(204),
        b: new DoubleRefVal(Number.MAX_SAFE_INTEGER + 1025),
        out: new IntRefVal(BigInt(-1)),
      },
      {
        a: new DoubleRefVal(204),
        b: new DoubleRefVal(NaN),
        out: new ErrorRefVal('NaN values cannot be ordered'),
      },
      {
        a: new DoubleRefVal(NaN),
        b: new DoubleRefVal(204),
        out: new ErrorRefVal('NaN values cannot be ordered'),
      },
      {
        a: new DoubleRefVal(204),
        b: new DoubleRefVal(-1300),
        out: new IntRefVal(BigInt(1)),
      },
      {
        a: new DoubleRefVal(204),
        b: new UintRefVal(BigInt(10)),
        out: new IntRefVal(BigInt(1)),
      },
      {
        a: new DoubleRefVal(204.1),
        b: new IntRefVal(BigInt(204)),
        out: new IntRefVal(BigInt(1)),
      },
      {
        a: new DoubleRefVal(1),
        b: new StringRefVal('1'),
        out: ErrorRefVal.errNoSuchOverload,
      },
    ];
    for (const testCase of testCases) {
      expect(testCase.a.compare(testCase.b)).toStrictEqual(testCase.out);
    }
  });

  it('divideDoubleValue', () => {
    expect(new DoubleRefVal(1).divide(new DoubleRefVal(2))).toStrictEqual(
      new DoubleRefVal(0.5)
    );
    expect(new DoubleRefVal(1).divide(new UintRefVal(BigInt(2)))).toStrictEqual(
      new DoubleRefVal(0.5)
    );
    expect(new DoubleRefVal(1).divide(new IntRefVal(BigInt(2)))).toStrictEqual(
      new DoubleRefVal(0.5)
    );
    expect(new DoubleRefVal(1).divide(new StringRefVal('2'))).toStrictEqual(
      ErrorRefVal.errNoSuchOverload
    );
    expect(new DoubleRefVal(1).divide(new DoubleRefVal(0))).toStrictEqual(
      new DoubleRefVal(Infinity)
    );
  });

  it('multiplyDoubleValue', () => {
    expect(new DoubleRefVal(2).multiply(new DoubleRefVal(21))).toStrictEqual(
      new DoubleRefVal(42)
    );
    expect(
      new DoubleRefVal(2).multiply(new UintRefVal(BigInt(21)))
    ).toStrictEqual(new DoubleRefVal(42));
    expect(
      new DoubleRefVal(2).multiply(new IntRefVal(BigInt(21)))
    ).toStrictEqual(new DoubleRefVal(42));
    expect(new DoubleRefVal(2).multiply(new StringRefVal('21'))).toStrictEqual(
      ErrorRefVal.errNoSuchOverload
    );
  });
});
