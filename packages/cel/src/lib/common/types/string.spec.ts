import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import {
  AnySchema,
  StringValueSchema,
  anyPack,
  timestampFromDate,
} from '@bufbuild/protobuf/wkt';
import { CONTAINS_OVERLOAD } from '../../overloads';
import { BOOL_REF_TYPE, BoolRefVal } from './bool';
import { BYTES_REF_TYPE, BytesRefVal } from './bytes';
import { DOUBLE_REF_TYPE, DoubleRefVal } from './double';
import { DURATION_REF_TYPE, DurationRefVal, duration } from './duration';
import { ErrorRefVal } from './error';
import { INT_REF_TYPE, IntRefVal } from './int';
import {
  STRING_REF_TYPE,
  StringRefVal,
  stringConstant,
  stringExpr,
  stringValue,
} from './string';
import { TIMESTAMP_REF_TYPE, TimestampRefVal } from './timestamp';
import { TYPE_REF_TYPE } from './type';
import { UINT_REF_TYPE, UintRefVal } from './uint';

describe('string', () => {
  it('stringConstant', () => {
    expect(stringConstant('hello')).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'stringValue',
          value: 'hello',
        },
      })
    );
  });

  it('stringExpr', () => {
    expect(stringExpr(BigInt(1), 'hello')).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'stringValue',
              value: 'hello',
            },
          }),
        },
      })
    );
  });

  it('stringValue', () => {
    expect(stringValue('hello')).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'stringValue',
          value: 'hello',
        },
      })
    );
  });

  // TODO: validations

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
        type: TYPE_REF_TYPE,
        expected: STRING_REF_TYPE,
      },
      {
        value: new StringRefVal('hello'),
        type: STRING_REF_TYPE,
        expected: new StringRefVal('hello'),
      },
      {
        value: new StringRefVal('-1'),
        type: INT_REF_TYPE,
        expected: new IntRefVal(BigInt(-1)),
      },
      {
        value: new StringRefVal('3.14'),
        type: DOUBLE_REF_TYPE,
        expected: new DoubleRefVal(3.14),
      },
      {
        value: new StringRefVal('42'),
        type: UINT_REF_TYPE,
        expected: new UintRefVal(BigInt(42)),
      },
      {
        value: new StringRefVal('true'),
        type: BOOL_REF_TYPE,
        expected: new BoolRefVal(true),
      },
      {
        value: new StringRefVal('false'),
        type: BOOL_REF_TYPE,
        expected: new BoolRefVal(false),
      },
      {
        value: new StringRefVal('hello'),
        type: BYTES_REF_TYPE,
        expected: new BytesRefVal(new TextEncoder().encode('hello')),
      },
      // TODO: timestamp & duration types
      {
        value: new StringRefVal('2021-01-01T00:00:00Z'),
        type: TIMESTAMP_REF_TYPE,
        expected: new TimestampRefVal(
          timestampFromDate(new Date('2021-01-01T00:00:00Z'))
        ),
      },
      {
        value: new StringRefVal('42s'),
        type: DURATION_REF_TYPE,
        expected: new DurationRefVal(duration(BigInt(42), 0)),
      },
      {
        value: new StringRefVal('1h5s'),
        type: DURATION_REF_TYPE,
        expected: new DurationRefVal(duration(BigInt(3605), 0)),
      },
      {
        value: new StringRefVal('3.14s'),
        type: DURATION_REF_TYPE,
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
