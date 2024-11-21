import { create } from '@bufbuild/protobuf';
import {
  AnySchema,
  StringValueSchema,
  anyPack,
  timestampFromDate,
} from '@bufbuild/protobuf/wkt';
import { CONTAINS_OVERLOAD } from '../overloads';
import { BoolRefVal } from './bool';
import { BytesRefVal } from './bytes';
import { DoubleRefVal } from './double';
import { DurationRefVal, duration } from './duration';
import { ErrorRefVal } from './error';
import { IntRefVal } from './int';
import { StringRefVal } from './string';
import { TimestampRefVal } from './timestamp';
import {
  BoolType,
  BytesType,
  DoubleType,
  DurationType,
  IntType,
  StringType,
  TimestampType,
  TypeType,
  UintType,
} from './types';
import { UintRefVal } from './uint';

describe('string', () => {
  it('convertStringValueToNative ', () => {
    expect(new StringRefVal('hello').convertToNative(String)).toStrictEqual(
      'hello'
    );
    expect(new StringRefVal('hello').convertToNative(Uint8Array)).toStrictEqual(
      new TextEncoder().encode('hello')
    );
    expect(
      new StringRefVal('hey buddy').convertToNative(AnySchema)
    ).toStrictEqual(
      anyPack(
        StringValueSchema,
        create(StringValueSchema, { value: 'hey buddy' })
      )
    );
    expect(
      new StringRefVal('hey buddy').convertToNative(StringValueSchema)
    ).toStrictEqual(create(StringValueSchema, { value: 'hey buddy' }));
    const val = new StringRefVal('hey buddy');
    expect(val.convertToNative(Number)).toStrictEqual(
      ErrorRefVal.nativeTypeConversionError(val, Number)
    );
  });

  it('convertStringValueToType', () => {
    const tests = [
      {
        value: new StringRefVal('hello'),
        type: TypeType,
        expected: StringType,
      },
      {
        value: new StringRefVal('hello'),
        type: StringType,
        expected: new StringRefVal('hello'),
      },
      {
        value: new StringRefVal('-1'),
        type: IntType,
        expected: new IntRefVal(BigInt(-1)),
      },
      {
        value: new StringRefVal('3.14'),
        type: DoubleType,
        expected: new DoubleRefVal(3.14),
      },
      {
        value: new StringRefVal('42'),
        type: UintType,
        expected: new UintRefVal(BigInt(42)),
      },
      {
        value: new StringRefVal('true'),
        type: BoolType,
        expected: new BoolRefVal(true),
      },
      {
        value: new StringRefVal('false'),
        type: BoolType,
        expected: new BoolRefVal(false),
      },
      {
        value: new StringRefVal('hello'),
        type: BytesType,
        expected: new BytesRefVal(new TextEncoder().encode('hello')),
      },
      {
        value: new StringRefVal('2021-01-01T00:00:00Z'),
        type: TimestampType,
        expected: new TimestampRefVal(
          timestampFromDate(new Date('2021-01-01T00:00:00Z'))
        ),
      },
      {
        value: new StringRefVal('42s'),
        type: DurationType,
        expected: new DurationRefVal(duration(BigInt(42), 0)),
      },
      {
        value: new StringRefVal('1h5s'),
        type: DurationType,
        expected: new DurationRefVal(duration(BigInt(3605), 0)),
      },
      {
        value: new StringRefVal('3.14s'),
        type: DurationType,
        expected: new DurationRefVal(duration(BigInt(3), 0.14 * 1e9)),
      },
    ];
    for (const test of tests) {
      expect(test.value.convertToType(test.type)).toStrictEqual(test.expected);
    }
  });

  it('equalStringValue', () => {
    expect(
      new StringRefVal('hello').equal(new StringRefVal('hello'))
    ).toStrictEqual(new BoolRefVal(true));
    expect(
      new StringRefVal('hello').equal(new StringRefVal('world'))
    ).toStrictEqual(new BoolRefVal(false));
    expect(new StringRefVal('hello').equal(new DoubleRefVal(42))).toStrictEqual(
      new BoolRefVal(false)
    );
  });

  it('isZeroStringValue', () => {
    expect(new StringRefVal('hello').isZeroValue()).toStrictEqual(false);
    expect(new StringRefVal('').isZeroValue()).toStrictEqual(true);
  });

  it('addStringValue', () => {
    expect(
      new StringRefVal('hello').add(new StringRefVal('world'))
    ).toStrictEqual(new StringRefVal('helloworld'));
    expect(new StringRefVal('hello').add(new DoubleRefVal(2))).toStrictEqual(
      ErrorRefVal.errNoSuchOverload
    );
  });

  it('compareStringValue', () => {
    const a = new StringRefVal('a');
    const b = new StringRefVal('bbbb');
    const c = new StringRefVal('c');
    expect(a.compare(b)).toStrictEqual(IntRefVal.IntNegOne);
    expect(a.compare(a)).toStrictEqual(IntRefVal.IntZero);
    expect(c.compare(b)).toStrictEqual(IntRefVal.IntOne);
    expect(a.compare(new DoubleRefVal(42))).toStrictEqual(
      ErrorRefVal.errNoSuchOverload
    );
  });

  it('matchStringValue', () => {
    const str = new StringRefVal('hello 1 world');
    const sw = new StringRefVal('^hello');
    const ew = new StringRefVal('\\d world$');
    expect(str.match(sw)).toStrictEqual(new BoolRefVal(true));
    expect(str.match(ew)).toStrictEqual(new BoolRefVal(true));
    expect(new StringRefVal('ello 1 worlds').match(sw)).toStrictEqual(
      new BoolRefVal(false)
    );
    expect(str.match(new DoubleRefVal(42))).toStrictEqual(
      ErrorRefVal.errNoSuchOverload
    );
  });

  it('receiveStringValue', () => {
    // Unknown overload
    expect(new StringRefVal('hello').receive('unknown', '', [])).toStrictEqual(
      ErrorRefVal.errNoSuchOverload
    );

    // Contains
    expect(
      new StringRefVal('goodbye').receive(CONTAINS_OVERLOAD, '', [
        new StringRefVal('db'),
      ])
    ).toStrictEqual(new BoolRefVal(true));
    expect(
      new StringRefVal('goodbye').receive(CONTAINS_OVERLOAD, '', [
        new StringRefVal('aa'),
      ])
    ).toStrictEqual(new BoolRefVal(false));
    expect(
      new StringRefVal('goodbye').receive(CONTAINS_OVERLOAD, '', [
        new DoubleRefVal(42),
      ])
    ).toStrictEqual(ErrorRefVal.errNoSuchOverload);

    // StartsWith
    expect(
      new StringRefVal('goodbye').receive('startsWith', '', [
        new StringRefVal('good'),
      ])
    ).toStrictEqual(new BoolRefVal(true));
    expect(
      new StringRefVal('goodbye').receive('startsWith', '', [
        new StringRefVal('bye'),
      ])
    ).toStrictEqual(new BoolRefVal(false));
    expect(
      new StringRefVal('goodbye').receive('startsWith', '', [
        new DoubleRefVal(42),
      ])
    ).toStrictEqual(ErrorRefVal.errNoSuchOverload);

    // EndsWith
    expect(
      new StringRefVal('goodbye').receive('endsWith', '', [
        new StringRefVal('bye'),
      ])
    ).toStrictEqual(new BoolRefVal(true));
    expect(
      new StringRefVal('goodbye').receive('endsWith', '', [
        new StringRefVal('good'),
      ])
    ).toStrictEqual(new BoolRefVal(false));
    expect(
      new StringRefVal('goodbye').receive('endsWith', '', [
        new DoubleRefVal(42),
      ])
    ).toStrictEqual(ErrorRefVal.errNoSuchOverload);
  });

  it('sizeStringValue', () => {
    expect(new StringRefVal('').size()).toStrictEqual(new IntRefVal(BigInt(0)));
    expect(new StringRefVal('hello world').size()).toStrictEqual(
      new IntRefVal(BigInt(11))
    );
    expect(new StringRefVal('\u65e5\u672c\u8a9e').size()).toStrictEqual(
      new IntRefVal(BigInt(3))
    );
  });
});
