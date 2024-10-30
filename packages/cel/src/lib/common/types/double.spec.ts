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
import { boolValue } from './bool';
import {
  DOUBLE_TYPE,
  addDoubleValue,
  compareDoubleValue,
  convertDoubleValueToNative,
  convertDoubleValueToType,
  divideDoubleValue,
  doubleConstant,
  doubleExpr,
  doubleValue,
  equalDoubleValue,
  isZeroDoubleValue,
  multiplyDoubleValue,
} from './double';
import { INT64_TYPE, int64Value } from './int';
import { STRING_TYPE, stringValue } from './string';
import { TYPE_TYPE } from './type';
import { UINT64_TYPE, uint64Value } from './uint';

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
    expect(() => {
      convertDoubleValueToNative(stringValue('foo'), Number);
    }).toThrow();
    expect(convertDoubleValueToNative(doubleValue(3.14), Number)).toEqual(3.14);
  });

  it('convertDoubleValueToNative - anyPack', () => {
    const value = doubleValue(-1.4);
    const packed = anyPack(
      DoubleValueSchema,
      create(DoubleValueSchema, { value: -1.4 })
    );
    expect(convertDoubleValueToNative(value, AnySchema)).toEqual(packed);
  });

  it('convertDoubleValueToNative - double wrapper', () => {
    const value = doubleValue(30000000.1);
    expect(convertDoubleValueToNative(value, DoubleValueSchema)).toEqual(
      create(DoubleValueSchema, { value: 30000000.1 })
    );
  });

  it('convertDoubleValueToNative - double wrapper', () => {
    const value = doubleValue(1.7976931348623157);
    expect(convertDoubleValueToNative(value, FloatValueSchema)).toEqual(
      create(FloatValueSchema, { value: 1.7976931348623157 })
    );
  });

  it('convertDoubleValueToNative - invalid type', () => {
    const value = doubleValue(-3.14159);
    expect(convertDoubleValueToNative(value, Boolean)).toEqual(
      new Error(`type conversion error from 'double' to 'Boolean'`)
    );
  });

  it('convertDoubleValueToType', () => {
    expect(() => {
      convertDoubleValueToType(stringValue('true'), DOUBLE_TYPE);
    }).toThrow();
    const value = doubleValue(1234.5);
    expect(convertDoubleValueToType(value, DOUBLE_TYPE)).toEqual(value);
    expect(convertDoubleValueToType(value, STRING_TYPE)).toEqual(
      stringValue('1234.5')
    );
    expect(convertDoubleValueToType(value, TYPE_TYPE)).toEqual(DOUBLE_TYPE);
    // Int64 errors
    expect(convertDoubleValueToType(doubleValue(NaN), INT64_TYPE)).toEqual(
      new Error('integer overflow')
    );
    expect(convertDoubleValueToType(doubleValue(Infinity), INT64_TYPE)).toEqual(
      new Error('integer overflow')
    );
    expect(
      convertDoubleValueToType(doubleValue(-Infinity), INT64_TYPE)
    ).toEqual(new Error('integer overflow'));
    expect(
      convertDoubleValueToType(doubleValue(Number.MAX_VALUE), INT64_TYPE)
    ).toEqual(new Error('integer overflow'));
    expect(
      convertDoubleValueToType(doubleValue(-1 * Number.MAX_VALUE), INT64_TYPE)
    ).toEqual(new Error('integer overflow'));
    // Uint64 errors
    expect(convertDoubleValueToType(doubleValue(NaN), UINT64_TYPE)).toEqual(
      new Error('unsigned integer overflow')
    );
    expect(
      convertDoubleValueToType(doubleValue(Infinity), UINT64_TYPE)
    ).toEqual(new Error('unsigned integer overflow'));
    expect(convertDoubleValueToType(doubleValue(-1), UINT64_TYPE)).toEqual(
      new Error('unsigned integer overflow')
    );
    expect(
      convertDoubleValueToType(doubleValue(Number.MAX_VALUE), UINT64_TYPE)
    ).toEqual(new Error('unsigned integer overflow'));
  });

  it('equalDoubleValue', () => {
    expect(() => {
      equalDoubleValue(stringValue('foo'), doubleValue(1));
    }).toThrow();
    const testCases = [
      {
        a: doubleValue(-10),
        b: doubleValue(-10),
        out: boolValue(true),
      },
      {
        a: doubleValue(-10),
        b: doubleValue(10),
        out: boolValue(false),
      },
      {
        a: doubleValue(10),
        b: uint64Value(BigInt(10)),
        out: boolValue(true),
      },
      {
        a: doubleValue(9),
        b: uint64Value(BigInt(10)),
        out: boolValue(false),
      },
      {
        a: doubleValue(10),
        b: int64Value(BigInt(10)),
        out: boolValue(true),
      },
      {
        a: doubleValue(10),
        b: int64Value(BigInt(-15)),
        out: boolValue(false),
      },
      {
        a: doubleValue(NaN),
        b: int64Value(BigInt(10)),
        out: boolValue(false),
      },
      {
        a: doubleValue(10),
        b: doubleValue(NaN),
        out: boolValue(false),
      },
    ];
    for (const testCase of testCases) {
      expect(equalDoubleValue(testCase.a, testCase.b)).toEqual(testCase.out);
    }
  });

  it('isZeroDoubleValue', () => {
    expect(() => {
      isZeroDoubleValue(stringValue('foo'));
    }).toThrow();
    expect(isZeroDoubleValue(doubleValue(0))).toEqual(boolValue(true));
    expect(isZeroDoubleValue(doubleValue(1))).toEqual(boolValue(false));
  });

  it('addDoubleValue', () => {
    expect(() => {
      addDoubleValue(stringValue('foo'), doubleValue(1));
    }).toThrow();
    expect(addDoubleValue(doubleValue(1), doubleValue(2))).toEqual(
      doubleValue(3)
    );
    expect(addDoubleValue(doubleValue(1), uint64Value(BigInt(2)))).toEqual(
      doubleValue(3)
    );
    expect(addDoubleValue(doubleValue(1), int64Value(BigInt(2)))).toEqual(
      doubleValue(3)
    );
    expect(addDoubleValue(doubleValue(1), stringValue('2'))).toEqual(
      new Error('no such overload')
    );
  });

  it('compareDoubleValue', () => {
    expect(() => {
      compareDoubleValue(stringValue('foo'), doubleValue(1));
    }).toThrow();
    const testCases = [
      {
        a: doubleValue(42),
        b: doubleValue(42),
        out: int64Value(BigInt(0)),
      },
      {
        a: doubleValue(42),
        b: uint64Value(BigInt(42)),
        out: int64Value(BigInt(0)),
      },
      {
        a: doubleValue(42),
        b: int64Value(BigInt(42)),
        out: int64Value(BigInt(0)),
      },
      {
        a: doubleValue(-1300),
        b: doubleValue(204),
        out: int64Value(BigInt(-1)),
      },
      {
        a: doubleValue(-1300),
        b: uint64Value(BigInt(204)),
        out: int64Value(BigInt(-1)),
      },
      {
        a: doubleValue(203.9),
        b: int64Value(BigInt(204)),
        out: int64Value(BigInt(-1)),
      },
      {
        a: doubleValue(1300),
        b: uint64Value(BigInt(Number.MAX_SAFE_INTEGER + 1)),
        out: int64Value(BigInt(-1)),
      },
      {
        a: doubleValue(204),
        b: uint64Value(BigInt(205)),
        out: int64Value(BigInt(-1)),
      },
      {
        a: doubleValue(204),
        b: doubleValue(Number.MAX_SAFE_INTEGER + 1025),
        out: int64Value(BigInt(-1)),
      },
      {
        a: doubleValue(204),
        b: doubleValue(NaN),
        out: new Error('NaN values cannot be ordered'),
      },
      {
        a: doubleValue(NaN),
        b: doubleValue(204),
        out: new Error('NaN values cannot be ordered'),
      },
      {
        a: doubleValue(204),
        b: doubleValue(-1300),
        out: int64Value(BigInt(1)),
      },
      {
        a: doubleValue(204),
        b: uint64Value(BigInt(10)),
        out: int64Value(BigInt(1)),
      },
      {
        a: doubleValue(204.1),
        b: int64Value(BigInt(204)),
        out: int64Value(BigInt(1)),
      },
      {
        a: doubleValue(1),
        b: stringValue('1'),
        out: new Error('no such overload'),
      },
    ];
    for (const testCase of testCases) {
      expect(compareDoubleValue(testCase.a, testCase.b)).toEqual(testCase.out);
    }
  });

  it('divideDoubleValue', () => {
    expect(() => {
      divideDoubleValue(stringValue('foo'), doubleValue(1));
    }).toThrow();
    expect(divideDoubleValue(doubleValue(1), doubleValue(2))).toEqual(
      doubleValue(0.5)
    );
    expect(divideDoubleValue(doubleValue(1), uint64Value(BigInt(2)))).toEqual(
      doubleValue(0.5)
    );
    expect(divideDoubleValue(doubleValue(1), int64Value(BigInt(2)))).toEqual(
      doubleValue(0.5)
    );
    expect(divideDoubleValue(doubleValue(1), stringValue('2'))).toEqual(
      new Error('no such overload')
    );
    expect(divideDoubleValue(doubleValue(1), doubleValue(0))).toEqual(
      doubleValue(Infinity)
    );
  });

  it('multiplyDoubleValue', () => {
    expect(() => {
      multiplyDoubleValue(stringValue('foo'), doubleValue(1));
    }).toThrow();
    expect(multiplyDoubleValue(doubleValue(2), doubleValue(21))).toEqual(
      doubleValue(42)
    );
    expect(
      multiplyDoubleValue(doubleValue(2), uint64Value(BigInt(21)))
    ).toEqual(doubleValue(42));
    expect(multiplyDoubleValue(doubleValue(2), int64Value(BigInt(21)))).toEqual(
      doubleValue(42)
    );
    expect(multiplyDoubleValue(doubleValue(2), stringValue('21'))).toEqual(
      new Error('no such overload')
    );
  });
});
