import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import {
  AnySchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
  anyPack,
} from '@bufbuild/protobuf/wkt';
import { boolValue } from './bool';
import { DOUBLE_TYPE, doubleValue } from './double';
import { INT64_TYPE, MAX_INT64, int64Value } from './int';
import { STRING_TYPE, stringValue } from './string';
import { TYPE_TYPE } from './type';
import {
  UINT64_TYPE,
  addUint64Value,
  compareUint64Value,
  convertUint64ValueToNative,
  convertUint64ValueToType,
  divideUint64Value,
  equalUint64Value,
  isZeroUint64Value,
  moduloUint64Value,
  multiplyUint64Value,
  subtractUint64Value,
  uint64Constant,
  uint64Expr,
  uint64Value,
} from './uint';

describe('uint', () => {
  it('uint64Constant', () => {
    expect(uint64Constant(BigInt(1))).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'uint64Value',
          value: BigInt(1),
        },
      })
    );
  });

  it('uint64Expr', () => {
    expect(uint64Expr(BigInt(1), BigInt(1))).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'uint64Value',
              value: BigInt(1),
            },
          }),
        },
      })
    );
  });

  it('uint64Value', () => {
    expect(uint64Value(BigInt(1))).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'uint64Value',
          value: BigInt(1),
        },
      })
    );
  });

  // TODO; validations

  it('convertUint64ValueToNative', () => {
    expect(() => {
      convertUint64ValueToNative(stringValue('abc'), Number);
    }).toThrow();
    const tests = [
      {
        input: uint64Value(BigInt(1)),
        type: BigInt,
        output: BigInt(1),
      },
      {
        input: uint64Value(BigInt(2)),
        type: Number,
        output: 2,
      },
      {
        input: uint64Value(BigInt(42)),
        type: AnySchema,
        output: anyPack(
          UInt64ValueSchema,
          create(UInt64ValueSchema, { value: BigInt(42) })
        ),
      },
      {
        input: uint64Value(BigInt(1234)),
        type: UInt32ValueSchema,
        output: create(UInt32ValueSchema, { value: 1234 }),
      },
      {
        input: uint64Value(BigInt(5678)),
        type: UInt64ValueSchema,
        output: create(UInt64ValueSchema, { value: BigInt(5678) }),
      },
      {
        input: uint64Value(BigInt(5678)),
        type: String,
        output: new Error(`type conversion error from 'uint' to 'String'`),
      },
    ];
    for (const test of tests) {
      expect(convertUint64ValueToNative(test.input, test.type)).toEqual(
        test.output
      );
    }
  });

  it('convertUint64ValueToType', () => {
    expect(() => {
      convertUint64ValueToType(stringValue('abc'), UINT64_TYPE);
    }).toThrow();

    const tests = [
      {
        in: uint64Value(BigInt(42)),
        type: TYPE_TYPE,
        out: UINT64_TYPE,
      },
      {
        in: uint64Value(BigInt(46)),
        type: UINT64_TYPE,
        out: uint64Value(BigInt(46)),
      },
      {
        in: uint64Value(BigInt(312)),
        type: INT64_TYPE,
        out: int64Value(BigInt(312)),
      },
      {
        in: uint64Value(BigInt(894)),
        type: DOUBLE_TYPE,
        out: doubleValue(894),
      },
      {
        in: uint64Value(BigInt(5848)),
        type: STRING_TYPE,
        out: stringValue('5848'),
      },
      {
        in: uint64Value(MAX_INT64 + BigInt(1)),
        type: INT64_TYPE,
        out: new Error('integer overflow'),
      },
      {
        in: uint64Value(MAX_INT64 + BigInt(1)),
        type: UINT64_TYPE,
        out: new Error('unsigned integer overflow'),
      },
    ];
    for (const test of tests) {
      expect(convertUint64ValueToType(test.in, test.type)).toEqual(test.out);
    }
  });

  it('equalUint64Value', () => {
    expect(() => {
      equalUint64Value(stringValue('abc'), uint64Value(BigInt(1)));
    }).toThrow();
    const tests = [
      {
        a: uint64Value(BigInt(10)),
        b: uint64Value(BigInt(10)),
        out: boolValue(true),
      },
      {
        a: uint64Value(BigInt(10)),
        b: int64Value(BigInt(-10)),
        out: boolValue(false),
      },
      {
        a: uint64Value(BigInt(10)),
        b: int64Value(BigInt(10)),
        out: boolValue(true),
      },
      {
        a: uint64Value(BigInt(9)),
        b: int64Value(BigInt(10)),
        out: boolValue(false),
      },
      {
        a: uint64Value(BigInt(10)),
        b: doubleValue(10),
        out: boolValue(true),
      },
      {
        a: uint64Value(BigInt(10)),
        b: doubleValue(-10.5),
        out: boolValue(false),
      },
      {
        a: uint64Value(BigInt(10)),
        b: doubleValue(NaN),
        out: boolValue(false),
      },
    ];
    for (const test of tests) {
      expect(equalUint64Value(test.a, test.b)).toEqual(test.out);
    }
  });

  it('isZeroUint64Value', () => {
    expect(() => {
      isZeroUint64Value(stringValue('abc'));
    }).toThrow();
    expect(isZeroUint64Value(uint64Value(BigInt(0)))).toEqual(boolValue(true));
    expect(isZeroUint64Value(uint64Value(BigInt(1)))).toEqual(boolValue(false));
  });

  it('addUint64Value', () => {
    expect(() => {
      addUint64Value(stringValue('abc'), uint64Value(BigInt(1)));
    }).toThrow();
    expect(
      addUint64Value(uint64Value(BigInt(1)), uint64Value(BigInt(2)))
    ).toEqual(uint64Value(BigInt(3)));
    expect(addUint64Value(uint64Value(BigInt(1)), stringValue('2'))).toEqual(
      new Error('no such overload')
    );
    expect(
      addUint64Value(uint64Value(MAX_INT64), uint64Value(BigInt(1)))
    ).toEqual(new Error('unsigned integer overflow'));
    expect(
      addUint64Value(uint64Value(BigInt(1)), int64Value(BigInt(-1000)))
    ).toEqual(new Error('unsigned integer overflow'));
    expect(
      addUint64Value(uint64Value(MAX_INT64 - BigInt(1)), uint64Value(BigInt(1)))
    ).toEqual(uint64Value(MAX_INT64));
  });

  it('compareUint64Value', () => {
    expect(() => {
      compareUint64Value(stringValue('abc'), uint64Value(BigInt(1)));
    }).toThrow();
    const tests = [
      {
        a: uint64Value(BigInt(42)),
        b: uint64Value(BigInt(42)),
        out: int64Value(BigInt(0)),
      },
      {
        a: uint64Value(BigInt(42)),
        b: int64Value(BigInt(42)),
        out: int64Value(BigInt(0)),
      },
      {
        a: uint64Value(BigInt(42)),
        b: doubleValue(42),
        out: int64Value(BigInt(0)),
      },
      {
        a: uint64Value(BigInt(13)),
        b: int64Value(BigInt(204)),
        out: int64Value(BigInt(-1)),
      },
      {
        a: uint64Value(BigInt(13)),
        b: uint64Value(BigInt(204)),
        out: int64Value(BigInt(-1)),
      },
      {
        a: uint64Value(BigInt(204)),
        b: doubleValue(204.1),
        out: int64Value(BigInt(-1)),
      },
      {
        a: uint64Value(BigInt(204)),
        b: int64Value(BigInt(205)),
        out: int64Value(BigInt(-1)),
      },
      {
        a: uint64Value(BigInt(204)),
        b: doubleValue(Number(MAX_INT64) + 2049.0),
        out: int64Value(BigInt(-1)),
      },
      {
        a: uint64Value(BigInt(204)),
        b: doubleValue(NaN),
        out: new Error('NaN values cannot be ordered'),
      },
      {
        a: uint64Value(BigInt(1300)),
        b: int64Value(BigInt(-1)),
        out: int64Value(BigInt(1)),
      },
      {
        a: uint64Value(BigInt(204)),
        b: uint64Value(BigInt(13)),
        out: int64Value(BigInt(1)),
      },
      {
        a: uint64Value(BigInt(204)),
        b: doubleValue(203.9),
        out: int64Value(BigInt(1)),
      },
      {
        a: uint64Value(BigInt(204)),
        b: doubleValue(-1.0),
        out: int64Value(BigInt(1)),
      },
      {
        a: uint64Value(BigInt(12)),
        b: stringValue('1'),
        out: new Error('no such overload'),
      },
    ];
    for (const test of tests) {
      expect(compareUint64Value(test.a, test.b)).toEqual(test.out);
    }
  });

  it('divideUint64Value', () => {
    expect(() => {
      divideUint64Value(stringValue('abc'), uint64Value(BigInt(1)));
    }).toThrow();
    expect(
      divideUint64Value(uint64Value(BigInt(3)), uint64Value(BigInt(2)))
    ).toEqual(uint64Value(BigInt(1)));
    expect(divideUint64Value(uint64Value(BigInt(3)), stringValue('2'))).toEqual(
      new Error('no such overload')
    );
    expect(
      divideUint64Value(uint64Value(BigInt(3)), uint64Value(BigInt(0)))
    ).toEqual(new Error('divide by zero'));
  });

  it('moduloUint64Value', () => {
    expect(() => {
      moduloUint64Value(stringValue('abc'), uint64Value(BigInt(1)));
    }).toThrow();
    expect(
      moduloUint64Value(uint64Value(BigInt(21)), uint64Value(BigInt(2)))
    ).toEqual(uint64Value(BigInt(1)));
    expect(moduloUint64Value(uint64Value(BigInt(3)), stringValue('2'))).toEqual(
      new Error('no such overload')
    );
    expect(
      moduloUint64Value(uint64Value(BigInt(3)), uint64Value(BigInt(0)))
    ).toEqual(new Error('modulus by zero'));
  });

  it('multiplyUint64Value', () => {
    expect(() => {
      multiplyUint64Value(stringValue('abc'), uint64Value(BigInt(1)));
    }).toThrow();
    expect(
      multiplyUint64Value(uint64Value(BigInt(3)), uint64Value(BigInt(2)))
    ).toEqual(uint64Value(BigInt(6)));
    expect(
      multiplyUint64Value(uint64Value(BigInt(3)), stringValue('2'))
    ).toEqual(new Error('no such overload'));
    expect(
      multiplyUint64Value(uint64Value(BigInt(3)), uint64Value(BigInt(0)))
    ).toEqual(uint64Value(BigInt(0)));
    expect(
      multiplyUint64Value(uint64Value(MAX_INT64), uint64Value(BigInt(2)))
    ).toEqual(new Error('unsigned integer overflow'));
    expect(
      multiplyUint64Value(uint64Value(BigInt(42)), int64Value(BigInt(-1)))
    ).toEqual(new Error('unsigned integer overflow'));
  });

  it('subtractUint64Value', () => {
    expect(() => {
      subtractUint64Value(stringValue('abc'), uint64Value(BigInt(1)));
    }).toThrow();
    expect(
      subtractUint64Value(uint64Value(BigInt(3)), uint64Value(BigInt(2)))
    ).toEqual(uint64Value(BigInt(1)));
    expect(
      subtractUint64Value(uint64Value(BigInt(3)), stringValue('2'))
    ).toEqual(new Error('no such overload'));
    expect(
      subtractUint64Value(uint64Value(BigInt(3)), uint64Value(BigInt(4)))
    ).toEqual(new Error('unsigned integer overflow'));
    expect(
      subtractUint64Value(uint64Value(MAX_INT64), int64Value(BigInt(-1)))
    ).toEqual(new Error('unsigned integer overflow'));
  });
});
