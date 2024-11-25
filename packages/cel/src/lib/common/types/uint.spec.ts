import { create } from '@bufbuild/protobuf';
import {
  AnySchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
  anyPack,
} from '@bufbuild/protobuf/wkt';
import { BoolRefVal } from './bool';
import { DoubleRefVal } from './double';
import { ErrorRefVal } from './error';
import { IntRefVal, MAX_INT64 } from './int';
import { StringRefVal } from './string';
import { DoubleType, IntType, StringType, TypeType, UintType } from './types';
import { MAX_UINT64, UintRefVal } from './uint';

describe('uint', () => {
  it('convertUint64ValueToNative', () => {
    const tests = [
      {
        input: new UintRefVal(BigInt(1)),
        type: BigInt,
        output: BigInt(1),
      },
      {
        input: new UintRefVal(BigInt(2)),
        type: Number,
        output: 2,
      },
      {
        input: new UintRefVal(BigInt(42)),
        type: AnySchema,
        output: anyPack(
          UInt64ValueSchema,
          create(UInt64ValueSchema, { value: BigInt(42) })
        ),
      },
      {
        input: new UintRefVal(BigInt(1234)),
        type: UInt32ValueSchema,
        output: create(UInt32ValueSchema, { value: 1234 }),
      },
      {
        input: new UintRefVal(BigInt(5678)),
        type: UInt64ValueSchema,
        output: create(UInt64ValueSchema, { value: BigInt(5678) }),
      },
      {
        input: new UintRefVal(BigInt(5678)),
        type: String,
        output: ErrorRefVal.nativeTypeConversionError(
          new UintRefVal(BigInt(0)),
          String
        ),
      },
    ];
    for (const test of tests) {
      expect(test.input.convertToNative(test.type)).toStrictEqual(test.output);
    }
  });

  it('convertUint64ValueToType', () => {
    const tests = [
      {
        in: new UintRefVal(BigInt(42)),
        type: TypeType,
        out: UintType,
      },
      {
        in: new UintRefVal(BigInt(46)),
        type: UintType,
        out: new UintRefVal(BigInt(46)),
      },
      {
        in: new UintRefVal(BigInt(312)),
        type: IntType,
        out: new IntRefVal(BigInt(312)),
      },
      {
        in: new UintRefVal(BigInt(894)),
        type: DoubleType,
        out: new DoubleRefVal(894),
      },
      {
        in: new UintRefVal(BigInt(5848)),
        type: StringType,
        out: new StringRefVal('5848'),
      },
      {
        in: new UintRefVal(MAX_UINT64 + BigInt(1)),
        type: IntType,
        out: ErrorRefVal.errIntOverflow,
      },
      {
        in: new UintRefVal(MAX_UINT64 + BigInt(1)),
        type: UintType,
        out: ErrorRefVal.errUintOverflow,
      },
    ];
    for (const test of tests) {
      expect(test.in.convertToType(test.type)).toStrictEqual(test.out);
    }
  });

  it('equalUint64Value', () => {
    const tests = [
      {
        a: new UintRefVal(BigInt(10)),
        b: new UintRefVal(BigInt(10)),
        out: new BoolRefVal(true),
      },
      {
        a: new UintRefVal(BigInt(10)),
        b: new IntRefVal(BigInt(-10)),
        out: new BoolRefVal(false),
      },
      {
        a: new UintRefVal(BigInt(10)),
        b: new IntRefVal(BigInt(10)),
        out: new BoolRefVal(true),
      },
      {
        a: new UintRefVal(BigInt(9)),
        b: new IntRefVal(BigInt(10)),
        out: new BoolRefVal(false),
      },
      {
        a: new UintRefVal(BigInt(10)),
        b: new DoubleRefVal(10),
        out: new BoolRefVal(true),
      },
      {
        a: new UintRefVal(BigInt(10)),
        b: new DoubleRefVal(-10.5),
        out: new BoolRefVal(false),
      },
      {
        a: new UintRefVal(BigInt(10)),
        b: new DoubleRefVal(NaN),
        out: new BoolRefVal(false),
      },
    ];
    for (const test of tests) {
      expect(test.a.equal(test.b)).toStrictEqual(test.out);
    }
  });

  it('isZeroUint64Value', () => {
    expect(new UintRefVal(BigInt(0)).isZeroValue()).toEqual(true);
    expect(new UintRefVal(BigInt(1)).isZeroValue()).toEqual(false);
  });

  it('addUint64Value', () => {
    expect(
      new UintRefVal(BigInt(1)).add(new UintRefVal(BigInt(2)))
    ).toStrictEqual(new UintRefVal(BigInt(3)));
    expect(new UintRefVal(BigInt(1)).add(new StringRefVal('2'))).toStrictEqual(
      ErrorRefVal.errNoSuchOverload
    );
    expect(
      new UintRefVal(BigInt(1)).add(new UintRefVal(MAX_INT64))
    ).toStrictEqual(ErrorRefVal.errUintOverflow);
    expect(
      new UintRefVal(BigInt(1)).add(new IntRefVal(BigInt(-1000)))
    ).toStrictEqual(ErrorRefVal.errUintOverflow);
    expect(
      new UintRefVal(MAX_INT64 - BigInt(1)).add(new UintRefVal(BigInt(1)))
    ).toStrictEqual(new UintRefVal(MAX_INT64));
  });

  it('compareUint64Value', () => {
    const tests = [
      {
        a: new UintRefVal(BigInt(42)),
        b: new UintRefVal(BigInt(42)),
        out: new IntRefVal(BigInt(0)),
      },
      {
        a: new UintRefVal(BigInt(42)),
        b: new IntRefVal(BigInt(42)),
        out: new IntRefVal(BigInt(0)),
      },
      {
        a: new UintRefVal(BigInt(42)),
        b: new DoubleRefVal(42),
        out: new IntRefVal(BigInt(0)),
      },
      {
        a: new UintRefVal(BigInt(13)),
        b: new IntRefVal(BigInt(204)),
        out: new IntRefVal(BigInt(-1)),
      },
      {
        a: new UintRefVal(BigInt(13)),
        b: new UintRefVal(BigInt(204)),
        out: new IntRefVal(BigInt(-1)),
      },
      {
        a: new UintRefVal(BigInt(204)),
        b: new DoubleRefVal(204.1),
        out: new IntRefVal(BigInt(-1)),
      },
      {
        a: new UintRefVal(BigInt(204)),
        b: new IntRefVal(BigInt(205)),
        out: new IntRefVal(BigInt(-1)),
      },
      {
        a: new UintRefVal(BigInt(204)),
        b: new DoubleRefVal(Number(MAX_INT64) + 2049.0),
        out: new IntRefVal(BigInt(-1)),
      },
      {
        a: new UintRefVal(BigInt(204)),
        b: new DoubleRefVal(NaN),
        out: new ErrorRefVal('NaN values cannot be ordered'),
      },
      {
        a: new UintRefVal(BigInt(1300)),
        b: new IntRefVal(BigInt(-1)),
        out: new IntRefVal(BigInt(1)),
      },
      {
        a: new UintRefVal(BigInt(204)),
        b: new UintRefVal(BigInt(13)),
        out: new IntRefVal(BigInt(1)),
      },
      {
        a: new UintRefVal(BigInt(204)),
        b: new DoubleRefVal(203.9),
        out: new IntRefVal(BigInt(1)),
      },
      {
        a: new UintRefVal(BigInt(204)),
        b: new DoubleRefVal(-1.0),
        out: new IntRefVal(BigInt(1)),
      },
      {
        a: new UintRefVal(BigInt(12)),
        b: new StringRefVal('1'),
        out: ErrorRefVal.errNoSuchOverload,
      },
    ];
    for (const test of tests) {
      expect(test.a.compare(test.b)).toStrictEqual(test.out);
    }
  });

  it('divideUint64Value', () => {
    expect(
      new UintRefVal(BigInt(3)).divide(new UintRefVal(BigInt(2)))
    ).toStrictEqual(new UintRefVal(BigInt(1)));
    expect(
      new UintRefVal(BigInt(3)).divide(new StringRefVal('2'))
    ).toStrictEqual(ErrorRefVal.errNoSuchOverload);
    expect(
      new UintRefVal(BigInt(3)).divide(new UintRefVal(BigInt(0)))
    ).toStrictEqual(ErrorRefVal.errDivideByZero);
  });

  it('moduloUint64Value', () => {
    expect(
      new UintRefVal(BigInt(21)).modulo(new UintRefVal(BigInt(2)))
    ).toStrictEqual(new UintRefVal(BigInt(1)));
    expect(
      new UintRefVal(BigInt(3)).modulo(new StringRefVal('2'))
    ).toStrictEqual(ErrorRefVal.errNoSuchOverload);
    expect(
      new UintRefVal(BigInt(3)).modulo(new UintRefVal(BigInt(0)))
    ).toStrictEqual(ErrorRefVal.errModulusByZero);
  });

  it('multiplyUint64Value', () => {
    expect(
      new UintRefVal(BigInt(3)).multiply(new UintRefVal(BigInt(2)))
    ).toStrictEqual(new UintRefVal(BigInt(6)));
    expect(
      new UintRefVal(BigInt(3)).multiply(new StringRefVal('2'))
    ).toStrictEqual(ErrorRefVal.errNoSuchOverload);
    expect(
      new UintRefVal(BigInt(3)).multiply(new UintRefVal(BigInt(0)))
    ).toStrictEqual(new UintRefVal(BigInt(0)));
    expect(
      new UintRefVal(MAX_INT64).multiply(new UintRefVal(BigInt(2)))
    ).toStrictEqual(ErrorRefVal.errUintOverflow);
    expect(
      new UintRefVal(BigInt(42)).multiply(new IntRefVal(BigInt(-1)))
    ).toStrictEqual(ErrorRefVal.errUintOverflow);
  });

  it('subtractUint64Value', () => {
    expect(
      new UintRefVal(BigInt(3)).subtract(new UintRefVal(BigInt(2)))
    ).toStrictEqual(new UintRefVal(BigInt(1)));
    expect(
      new UintRefVal(BigInt(3)).subtract(new StringRefVal('2'))
    ).toStrictEqual(ErrorRefVal.errNoSuchOverload);
    expect(
      new UintRefVal(BigInt(3)).subtract(new UintRefVal(BigInt(4)))
    ).toStrictEqual(ErrorRefVal.errUintOverflow);
    expect(
      new UintRefVal(MAX_INT64).subtract(new IntRefVal(BigInt(-1)))
    ).toStrictEqual(ErrorRefVal.errUintOverflow);
  });
});
