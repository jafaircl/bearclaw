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
import { BOOL_TYPE, boolValue } from './bool';
import { BYTES_TYPE, bytesValue } from './bytes';
import { DOUBLE_TYPE, doubleValue } from './double';
import { durationValue } from './duration';
import { INT64_TYPE, int64Value } from './int';
import {
  STRING_TYPE,
  addStringValue,
  compareStringValue,
  convertStringValueToNative,
  convertStringValueToType,
  equalStringValue,
  isZeroStringValue,
  matchStringValue,
  receiveStringValue,
  sizeStringValue,
  stringConstant,
  stringExpr,
  stringValue,
} from './string';
import { timestampValue } from './timestamp';
import { TYPE_TYPE } from './type';
import { UINT64_TYPE, uint64Value } from './uint';
import { DURATION_TYPE, TIMESTAMP_TYPE } from './wkt';

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
    expect(() => {
      convertStringValueToNative(doubleValue(42), String);
    }).toThrow();
    expect(convertStringValueToNative(stringValue('hello'), String)).toEqual(
      'hello'
    );
    expect(
      convertStringValueToNative(stringValue('world'), Uint8Array)
    ).toEqual(new TextEncoder().encode('world'));
    expect(
      convertStringValueToNative(stringValue('hey buddy'), AnySchema)
    ).toEqual(
      anyPack(
        StringValueSchema,
        create(StringValueSchema, { value: 'hey buddy' })
      )
    );
    expect(
      convertStringValueToNative(stringValue('hey buddy'), StringValueSchema)
    ).toEqual(create(StringValueSchema, { value: 'hey buddy' }));
    expect(
      convertStringValueToNative(stringValue('hey buddy'), Number)
    ).toEqual(new Error(`type conversion error from 'string' to 'Number'`));
  });

  it('convertStringValueToType', () => {
    expect(() => {
      convertStringValueToType(doubleValue(42), STRING_TYPE);
    }).toThrow();
    const tests = [
      {
        value: stringValue('hello'),
        type: TYPE_TYPE,
        expected: STRING_TYPE,
      },
      {
        value: stringValue('hello'),
        type: STRING_TYPE,
        expected: stringValue('hello'),
      },
      {
        value: stringValue('-1'),
        type: INT64_TYPE,
        expected: int64Value(BigInt(-1)),
      },
      {
        value: stringValue('3.14'),
        type: DOUBLE_TYPE,
        expected: doubleValue(3.14),
      },
      {
        value: stringValue('42'),
        type: UINT64_TYPE,
        expected: uint64Value(BigInt(42)),
      },
      {
        value: stringValue('true'),
        type: BOOL_TYPE,
        expected: boolValue(true),
      },
      {
        value: stringValue('false'),
        type: BOOL_TYPE,
        expected: boolValue(false),
      },
      {
        value: stringValue('hello'),
        type: BYTES_TYPE,
        expected: bytesValue(new TextEncoder().encode('hello')),
      },
      {
        value: stringValue('2021-01-01T00:00:00Z'),
        type: TIMESTAMP_TYPE,
        expected: timestampValue(
          timestampFromDate(new Date('2021-01-01T00:00:00Z'))
        ),
      },
      {
        value: stringValue('42s'),
        type: DURATION_TYPE,
        expected: durationValue({ seconds: BigInt(42), nanos: 0 }),
      },
      {
        value: stringValue('1h5s'),
        type: DURATION_TYPE,
        expected: durationValue({ seconds: BigInt(3605), nanos: 0 }),
      },
      {
        value: stringValue('3.14s'),
        type: DURATION_TYPE,
        expected: durationValue({ seconds: BigInt(3), nanos: 0.14 * 1e9 }),
      },
    ];
    for (const test of tests) {
      expect(convertStringValueToType(test.value, test.type)).toEqual(
        test.expected
      );
    }
  });

  it('equalStringValue', () => {
    expect(() => {
      equalStringValue(doubleValue(42), stringValue('hello'));
    }).toThrow();
    expect(
      equalStringValue(stringValue('hello'), stringValue('hello'))
    ).toEqual(boolValue(true));
    expect(
      equalStringValue(stringValue('hello'), stringValue('world'))
    ).toEqual(boolValue(false));
    expect(equalStringValue(stringValue('hello'), doubleValue(42))).toEqual(
      boolValue(false)
    );
  });

  it('isZeroStringValue', () => {
    expect(() => {
      isZeroStringValue(doubleValue(42));
    }).toThrow();
    expect(isZeroStringValue(stringValue('hello'))).toEqual(boolValue(false));
    expect(isZeroStringValue(stringValue(''))).toEqual(boolValue(true));
  });

  it('addStringValue', () => {
    expect(() => {
      addStringValue(doubleValue(42), stringValue('hello'));
    }).toThrow();
    expect(addStringValue(stringValue('hello'), stringValue('world'))).toEqual(
      stringValue('helloworld')
    );
    expect(addStringValue(stringValue('hello'), doubleValue(2))).toEqual(
      new Error('no such overload')
    );
  });

  it('compareStringValue', () => {
    expect(() => {
      compareStringValue(doubleValue(42), stringValue('hello'));
    });
    const a = stringValue('a');
    const b = stringValue('bbbb');
    const c = stringValue('c');
    expect(compareStringValue(a, b)).toEqual(int64Value(BigInt(-1)));
    expect(compareStringValue(a, a)).toEqual(int64Value(BigInt(0)));
    expect(compareStringValue(c, b)).toEqual(int64Value(BigInt(1)));
    expect(compareStringValue(a, doubleValue(42))).toEqual(
      new Error('no such overload')
    );
  });

  it('matchStringValue', () => {
    expect(() => {
      matchStringValue(doubleValue(42), stringValue('hello'));
    }).toThrow();
    const str = stringValue('hello 1 world');
    const sw = stringValue('^hello');
    const ew = stringValue('\\d world$');
    expect(matchStringValue(str, sw)).toEqual(boolValue(true));
    expect(matchStringValue(str, ew)).toEqual(boolValue(true));
    expect(matchStringValue(stringValue('ello 1 worlds'), sw)).toEqual(
      boolValue(false)
    );
    expect(matchStringValue(str, doubleValue(42))).toEqual(
      new Error('no such overload')
    );
  });

  it('receiveStringValue', () => {
    expect(() => {
      receiveStringValue(doubleValue(42), '', '');
    }).toThrow();
    // Unknown overload
    expect(
      receiveStringValue(stringValue('hello'), 'unknown', '', stringValue(''))
    ).toEqual(new Error('no such overload'));

    // Contains
    expect(
      receiveStringValue(
        stringValue('goodbye'),
        CONTAINS_OVERLOAD,
        '',
        stringValue('db')
      )
    ).toEqual(boolValue(true));
    expect(
      receiveStringValue(
        stringValue('goodbye'),
        CONTAINS_OVERLOAD,
        '',
        stringValue('aa')
      )
    ).toEqual(boolValue(false));
    expect(
      receiveStringValue(
        stringValue('goodbye'),
        CONTAINS_OVERLOAD,
        '',
        doubleValue(42)
      )
    ).toEqual(new Error('no such overload'));

    // StartsWith
    expect(
      receiveStringValue(
        stringValue('goodbye'),
        'startsWith',
        '',
        stringValue('good')
      )
    ).toEqual(boolValue(true));
    expect(
      receiveStringValue(
        stringValue('goodbye'),
        'startsWith',
        '',
        stringValue('bye')
      )
    ).toEqual(boolValue(false));
    expect(
      receiveStringValue(
        stringValue('goodbye'),
        'startsWith',
        '',
        doubleValue(42)
      )
    ).toEqual(new Error('no such overload'));

    // EndsWith
    expect(
      receiveStringValue(
        stringValue('goodbye'),
        'endsWith',
        '',
        stringValue('bye')
      )
    ).toEqual(boolValue(true));
    expect(
      receiveStringValue(
        stringValue('goodbye'),
        'endsWith',
        '',
        stringValue('good')
      )
    ).toEqual(boolValue(false));
    expect(
      receiveStringValue(
        stringValue('goodbye'),
        'endsWith',
        '',
        doubleValue(42)
      )
    ).toEqual(new Error('no such overload'));
  });

  it('sizeStringValue', () => {
    expect(() => {
      sizeStringValue(doubleValue(42));
    }).toThrow();
    expect(sizeStringValue(stringValue(''))).toEqual(int64Value(BigInt(0)));
    expect(sizeStringValue(stringValue('hello world'))).toEqual(
      int64Value(BigInt(11))
    );
    expect(sizeStringValue(stringValue('\u65e5\u672c\u8a9e'))).toEqual(
      int64Value(BigInt(3))
    );
  });
});
