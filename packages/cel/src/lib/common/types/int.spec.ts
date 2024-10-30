import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import {
  AnySchema,
  Int32ValueSchema,
  Int64ValueSchema,
  anyPack,
  timestampFromMs,
} from '@bufbuild/protobuf/wkt';
import { boolValue } from './bool';
import { DOUBLE_TYPE, doubleValue } from './double';
import {
  INT64_TYPE,
  MAX_INT64,
  MIN_INT64,
  addInt64Value,
  compareInt64Value,
  convertInt64ValueToNative,
  convertInt64ValueToType,
  divideInt64Value,
  equalInt64Value,
  int64Constant,
  int64Expr,
  int64Value,
  isZeroInt64Value,
  moduloInt64Value,
  multiplyInt64Value,
  negateInt64Value,
  subtractInt64Value,
} from './int';
import { STRING_TYPE, stringValue } from './string';
import {
  MAX_UNIX_TIME_MS,
  MIN_UNIX_TIME_MS,
  timestampValue,
} from './timestamp';
import { TYPE_TYPE } from './type';
import { UINT64_TYPE, uint64Value } from './uint';
import { TIMESTAMP_TYPE } from './wkt';

describe('int', () => {
  it('int64Constant', () => {
    expect(int64Constant(BigInt(1))).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'int64Value',
          value: BigInt(1),
        },
      })
    );
  });

  it('int64Expr', () => {
    expect(int64Expr(BigInt(1), BigInt(1))).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'int64Value',
              value: BigInt(1),
            },
          }),
        },
      })
    );
  });

  it('int64Value', () => {
    expect(int64Value(BigInt(1))).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'int64Value',
          value: BigInt(1),
        },
      })
    );
  });

  // TODO: validations

  it('convertInt64ValueToNative - js BigInt', () => {
    expect(() => {
      convertInt64ValueToNative(stringValue('foo'), Number);
    }).toThrow();
    expect(convertInt64ValueToNative(int64Value(BigInt(42)), BigInt)).toEqual(
      BigInt(42)
    );
  });

  it('convertInt64ValueToNative - anyPack', () => {
    const value = int64Value(BigInt(-42));
    const packed = anyPack(
      Int64ValueSchema,
      create(Int64ValueSchema, { value: BigInt(-42) })
    );
    expect(convertInt64ValueToNative(value, AnySchema)).toEqual(packed);
  });

  it('convertInt64ValueToNative - int64 wrapper', () => {
    const value = int64Value(BigInt(30000000));
    expect(convertInt64ValueToNative(value, Int64ValueSchema)).toEqual(
      create(Int64ValueSchema, { value: BigInt(30000000) })
    );
    // Value errors
    expect(
      convertInt64ValueToNative(
        int64Value(MAX_INT64 + BigInt(1)),
        Int64ValueSchema
      )
    ).toEqual(new Error('integer overflow'));
    expect(
      convertInt64ValueToNative(
        int64Value(MIN_INT64 - BigInt(1)),
        Int64ValueSchema
      )
    ).toEqual(new Error('integer overflow'));
  });

  it('convertInt64ValueToNative - int32 wrapper', () => {
    const value = int64Value(BigInt(7976931348623157));
    expect(convertInt64ValueToNative(value, Int32ValueSchema)).toEqual(
      create(Int32ValueSchema, { value: 7976931348623157 })
    );
    // Value errors
    expect(
      convertInt64ValueToNative(
        int64Value(BigInt(Number.MAX_SAFE_INTEGER + 1)),
        Int32ValueSchema
      )
    ).toEqual(new Error('integer overflow'));
    expect(
      convertInt64ValueToNative(
        int64Value(BigInt(Number.MIN_SAFE_INTEGER - 1)),
        Int32ValueSchema
      )
    ).toEqual(new Error('integer overflow'));
  });

  it('convertInt64ValueToNative - invalid type', () => {
    const value = int64Value(BigInt(-314159));
    expect(convertInt64ValueToNative(value, Boolean)).toEqual(
      new Error(`type conversion error from 'int' to 'Boolean'`)
    );
  });

  it('convertInt64ValueToType', () => {
    expect(() => {
      convertInt64ValueToType(stringValue('foo'), TYPE_TYPE);
    }).toThrow();
    const tests = [
      {
        in: int64Value(BigInt(42)),
        type: TYPE_TYPE,
        out: INT64_TYPE,
      },
      {
        in: int64Value(BigInt(42)),
        type: INT64_TYPE,
        out: int64Value(BigInt(42)),
      },
      {
        in: int64Value(BigInt(42)),
        type: UINT64_TYPE,
        out: uint64Value(BigInt(42)),
      },
      {
        in: int64Value(BigInt(-42)),
        type: UINT64_TYPE,
        out: new Error('unsigned integer overflow'),
      },
      {
        in: int64Value(BigInt(42)),
        type: DOUBLE_TYPE,
        out: doubleValue(42),
      },
      {
        in: int64Value(BigInt(-42)),
        type: STRING_TYPE,
        out: stringValue('-42'),
      },
      {
        in: int64Value(BigInt(946684800)),
        type: TIMESTAMP_TYPE,
        out: timestampValue(timestampFromMs(946684800)),
      },
      {
        in: int64Value(BigInt(MAX_UNIX_TIME_MS + 1)),
        type: TIMESTAMP_TYPE,
        out: new Error('timestamp overflow'),
      },
      {
        in: int64Value(BigInt(MIN_UNIX_TIME_MS - 1)),
        type: TIMESTAMP_TYPE,
        out: new Error('timestamp overflow'),
      },
    ];
    for (const test of tests) {
      expect(convertInt64ValueToType(test.in, test.type)).toEqual(test.out);
    }
  });

  it('equalInt64Value', () => {
    expect(() => {
      equalInt64Value(stringValue('foo'), int64Value(BigInt(42)));
    }).toThrow();
    const tests = [
      {
        a: int64Value(BigInt(-10)),
        b: int64Value(BigInt(-10)),
        out: boolValue(true),
      },
      {
        a: int64Value(BigInt(10)),
        b: int64Value(BigInt(-10)),
        out: boolValue(false),
      },
      {
        a: int64Value(BigInt(10)),
        b: uint64Value(BigInt(10)),
        out: boolValue(true),
      },
      {
        a: int64Value(BigInt(9)),
        b: uint64Value(BigInt(10)),
        out: boolValue(false),
      },
      {
        a: int64Value(BigInt(10)),
        b: doubleValue(10),
        out: boolValue(true),
      },
      {
        a: int64Value(BigInt(10)),
        b: doubleValue(-10.5),
        out: boolValue(false),
      },
      {
        a: int64Value(BigInt(10)),
        b: doubleValue(NaN),
        out: boolValue(false),
      },
      {
        a: int64Value(BigInt(10)),
        b: stringValue('10'),
        out: boolValue(false),
      },
    ];
    for (const test of tests) {
      expect(equalInt64Value(test.a, test.b)).toEqual(test.out);
    }
  });

  it('isZeroInt64Value', () => {
    expect(isZeroInt64Value(int64Value(BigInt(0)))).toEqual(boolValue(true));
    expect(isZeroInt64Value(int64Value(BigInt(1)))).toEqual(boolValue(false));
  });

  it('addInt64Value', () => {
    expect(() => {
      addInt64Value(stringValue('foo'), int64Value(BigInt(42)));
    }).toThrow();
    expect(addInt64Value(int64Value(BigInt(1)), int64Value(BigInt(2)))).toEqual(
      int64Value(BigInt(3))
    );
    expect(addInt64Value(int64Value(BigInt(1)), stringValue('-4'))).toEqual(
      new Error('no such overload')
    );
    expect(addInt64Value(int64Value(MAX_INT64), int64Value(BigInt(1)))).toEqual(
      new Error('integer overflow')
    );
    expect(
      addInt64Value(int64Value(MIN_INT64), int64Value(BigInt(-1)))
    ).toEqual(new Error('integer overflow'));
    expect(
      addInt64Value(int64Value(MAX_INT64 - BigInt(1)), int64Value(BigInt(1)))
    ).toEqual(int64Value(MAX_INT64));
    expect(
      addInt64Value(int64Value(MIN_INT64 + BigInt(1)), int64Value(BigInt(-1)))
    ).toEqual(int64Value(MIN_INT64));
  });

  it('compareInt64Value', () => {
    expect(() => {
      compareInt64Value(stringValue('foo'), int64Value(BigInt(42)));
    }).toThrow();
    const tests = [
      {
        a: int64Value(BigInt(42)),
        b: int64Value(BigInt(42)),
        out: int64Value(BigInt(0)),
      },
      {
        a: int64Value(BigInt(42)),
        b: uint64Value(BigInt(42)),
        out: int64Value(BigInt(0)),
      },
      {
        a: int64Value(BigInt(42)),
        b: doubleValue(42),
        out: int64Value(BigInt(0)),
      },
      {
        a: int64Value(BigInt(-1300)),
        b: int64Value(BigInt(204)),
        out: int64Value(BigInt(-1)),
      },
      {
        a: int64Value(BigInt(204)),
        b: doubleValue(204.1),
        out: int64Value(BigInt(-1)),
      },
      {
        a: int64Value(BigInt(1300)),
        b: uint64Value(MAX_INT64 + BigInt(1)),
        out: int64Value(BigInt(-1)),
      },
      {
        a: int64Value(BigInt(204)),
        b: uint64Value(BigInt(205)),
        out: int64Value(BigInt(-1)),
      },
      {
        a: int64Value(BigInt(204)),
        b: doubleValue(Number(MAX_INT64) + 1025.0),
        out: int64Value(BigInt(-1)),
      },
      {
        a: int64Value(BigInt(204)),
        b: doubleValue(NaN),
        out: new Error('NaN values cannot be ordered'),
      },
      {
        a: int64Value(BigInt(204)),
        b: int64Value(BigInt(-1300)),
        out: int64Value(BigInt(1)),
      },
      {
        a: int64Value(BigInt(204)),
        b: uint64Value(BigInt(10)),
        out: int64Value(BigInt(1)),
      },
      {
        a: int64Value(BigInt(204)),
        b: doubleValue(203.9),
        out: int64Value(BigInt(1)),
      },
      {
        a: int64Value(BigInt(204)),
        b: doubleValue(Number(MIN_INT64) - 1025.0),
        out: int64Value(BigInt(1)),
      },
      {
        a: int64Value(BigInt(1)),
        b: stringValue('1'),
        out: new Error('no such overload'),
      },
    ];
    for (const test of tests) {
      expect(compareInt64Value(test.a, test.b)).toEqual(test.out);
    }
  });

  it('divideInt64Value', () => {
    expect(() => {
      divideInt64Value(stringValue('foo'), int64Value(BigInt(42)));
    }).toThrow();
    expect(
      divideInt64Value(int64Value(BigInt(3)), int64Value(BigInt(2)))
    ).toEqual(int64Value(BigInt(1)));
    expect(
      divideInt64Value(int64Value(BigInt(3)), int64Value(BigInt(0)))
    ).toEqual(new Error('divide by zero'));
    expect(
      divideInt64Value(int64Value(MIN_INT64), int64Value(BigInt(-1)))
    ).toEqual(new Error('integer overflow'));
  });

  it('moduloInt64Value', () => {
    expect(() => {
      moduloInt64Value(stringValue('foo'), int64Value(BigInt(42)));
    }).toThrow();
    expect(
      moduloInt64Value(int64Value(BigInt(21)), int64Value(BigInt(2)))
    ).toEqual(int64Value(BigInt(1)));
    expect(
      moduloInt64Value(int64Value(BigInt(21)), int64Value(BigInt(0)))
    ).toEqual(new Error('modulus by zero'));
    expect(
      moduloInt64Value(int64Value(MIN_INT64), int64Value(BigInt(-1)))
    ).toEqual(new Error('integer overflow'));
  });

  it('multiplyInt64Value', () => {
    expect(() => {
      multiplyInt64Value(stringValue('foo'), int64Value(BigInt(42)));
    }).toThrow();
    expect(
      multiplyInt64Value(int64Value(BigInt(2)), int64Value(BigInt(-2)))
    ).toEqual(int64Value(BigInt(-4)));
    expect(
      multiplyInt64Value(
        int64Value(MAX_INT64 / BigInt(2)),
        int64Value(BigInt(3))
      )
    ).toEqual(new Error('integer overflow'));
    expect(
      multiplyInt64Value(
        int64Value(MIN_INT64 / BigInt(2)),
        int64Value(BigInt(3))
      )
    ).toEqual(new Error('integer overflow'));
    expect(
      multiplyInt64Value(
        int64Value(MAX_INT64 / BigInt(2)),
        int64Value(BigInt(2))
      )
    ).toEqual(int64Value(MAX_INT64 - BigInt(1)));
    expect(
      multiplyInt64Value(
        int64Value(MIN_INT64 / BigInt(2)),
        int64Value(BigInt(2))
      )
    ).toEqual(int64Value(MIN_INT64));
    expect(
      multiplyInt64Value(
        int64Value(MAX_INT64 / BigInt(2)),
        int64Value(BigInt(-2))
      )
    ).toEqual(int64Value(MIN_INT64 + BigInt(2)));
    expect(
      multiplyInt64Value(
        int64Value((MIN_INT64 + BigInt(2)) / BigInt(2)),
        int64Value(BigInt(-2))
      )
    ).toEqual(int64Value(MAX_INT64 - BigInt(1)));
    expect(
      multiplyInt64Value(int64Value(MIN_INT64), int64Value(BigInt(-1)))
    ).toEqual(new Error('integer overflow'));
  });

  it('negateInt64Value', () => {
    expect(() => {
      negateInt64Value(stringValue('foo'));
    }).toThrow();
    expect(negateInt64Value(int64Value(BigInt(42)))).toEqual(
      int64Value(BigInt(-42))
    );
    expect(negateInt64Value(int64Value(MIN_INT64))).toEqual(
      new Error('integer overflow')
    );
    expect(negateInt64Value(int64Value(MAX_INT64))).toEqual(
      int64Value(MIN_INT64 + BigInt(1))
    );
  });

  it('subtractInt64Value', () => {
    expect(() => {
      subtractInt64Value(stringValue('foo'), int64Value(BigInt(42)));
    }).toThrow();
    expect(
      subtractInt64Value(int64Value(BigInt(4)), int64Value(BigInt(-3)))
    ).toEqual(int64Value(BigInt(7)));
    expect(
      subtractInt64Value(int64Value(MAX_INT64), int64Value(BigInt(-1)))
    ).toEqual(new Error('integer overflow'));
    expect(
      subtractInt64Value(int64Value(MIN_INT64), int64Value(BigInt(1)))
    ).toEqual(new Error('integer overflow'));
    expect(
      subtractInt64Value(
        int64Value(MAX_INT64 - BigInt(1)),
        int64Value(BigInt(-1))
      )
    ).toEqual(int64Value(MAX_INT64));
    expect(
      subtractInt64Value(
        int64Value(MIN_INT64 + BigInt(1)),
        int64Value(BigInt(1))
      )
    ).toEqual(int64Value(MIN_INT64));
  });
});
