import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { create } from '@bufbuild/protobuf';
import { AnySchema, BytesValueSchema, anyPack } from '@bufbuild/protobuf/wkt';
import { boolValue } from './bool';
import {
  BYTES_TYPE,
  addBytesValue,
  bytesConstant,
  bytesExpr,
  bytesValue,
  compareBytesValue,
  convertBytesValueToNative,
  convertBytesValueToType,
  equalBytesValue,
  isZeroBytesValue,
  sizeBytesValue,
} from './bytes';
import { int64Value } from './int';
import { STRING_TYPE, stringValue } from './string';
import { TYPE_TYPE } from './type';

describe('bytes', () => {
  it('bytesConstant', () => {
    expect(bytesConstant(new Uint8Array([1, 2, 3]))).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'bytesValue',
          value: new Uint8Array([1, 2, 3]),
        },
      })
    );
  });

  it('bytesExpr', () => {
    expect(bytesExpr(BigInt(1), new Uint8Array([1, 2, 3]))).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'bytesValue',
              value: new Uint8Array([1, 2, 3]),
            },
          }),
        },
      })
    );
  });

  it('bytesValue', () => {
    expect(bytesValue(new Uint8Array([1, 2, 3]))).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'bytesValue',
          value: new Uint8Array([1, 2, 3]),
        },
      })
    );
  });

  // TODO: validations

  it('convertBytesValueToNative - js Uint8Array', () => {
    expect(() => {
      convertBytesValueToNative(stringValue('foo'), Uint8Array);
    }).toThrow();
    expect(
      convertBytesValueToNative(
        bytesValue(new Uint8Array([1, 2, 3])),
        Uint8Array
      )
    ).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('convertBytesValueToNative - anyPack', () => {
    const value = bytesValue(new Uint8Array([1, 2, 3]));
    const packed = anyPack(
      BytesValueSchema,
      create(BytesValueSchema, { value: new Uint8Array([1, 2, 3]) })
    );
    expect(convertBytesValueToNative(value, AnySchema)).toEqual(packed);
  });

  it('convertBytesValueToNative - bytes wrapper', () => {
    const value = bytesValue(new Uint8Array([1, 2, 3]));
    expect(convertBytesValueToNative(value, BytesValueSchema)).toEqual(
      create(BytesValueSchema, { value: new Uint8Array([1, 2, 3]) })
    );
  });

  it('convertBytesValueToNative - invalid type', () => {
    const value = bytesValue(new Uint8Array([1, 2, 3]));
    expect(convertBytesValueToNative(value, Boolean)).toEqual(
      new Error(`type conversion error from 'bytes' to 'Boolean'`)
    );
  });

  it('convertBytesValueToType', () => {
    expect(() => {
      convertBytesValueToType(stringValue('true'), BYTES_TYPE);
    }).toThrow();
    const value = bytesValue(new TextEncoder().encode('helloworld'));
    expect(convertBytesValueToType(value, BYTES_TYPE)).toEqual(value);
    expect(convertBytesValueToType(value, STRING_TYPE)).toEqual(
      stringValue('helloworld')
    );
    expect(convertBytesValueToType(value, TYPE_TYPE)).toEqual(BYTES_TYPE);
  });

  it('equalBytesValue', () => {
    expect(() => {
      equalBytesValue(
        stringValue('foo'),
        bytesValue(new Uint8Array([1, 2, 3]))
      );
    }).toThrow();
    expect(
      equalBytesValue(
        bytesValue(new Uint8Array([1, 2, 3])),
        bytesValue(new Uint8Array([1, 2, 3]))
      )
    ).toEqual(boolValue(true));
    expect(
      equalBytesValue(
        bytesValue(new Uint8Array([1, 2, 3])),
        bytesValue(new Uint8Array([1, 2]))
      )
    ).toEqual(boolValue(false));
    expect(
      equalBytesValue(bytesValue(new Uint8Array([1, 2, 3])), stringValue(''))
    ).toEqual(boolValue(false));
  });

  it('isZeroBytesValue', () => {
    expect(() => {
      isZeroBytesValue(stringValue('foo'));
    }).toThrow();
    expect(isZeroBytesValue(bytesValue(new Uint8Array([1, 2, 3])))).toEqual(
      boolValue(false)
    );
    expect(isZeroBytesValue(bytesValue(new Uint8Array([])))).toEqual(
      boolValue(true)
    );
  });

  it('addBytesValue', () => {
    expect(() => {
      addBytesValue(stringValue('foo'), bytesValue(new Uint8Array([1, 2, 3])));
    }).toThrow();
    expect(
      addBytesValue(
        bytesValue(new TextEncoder().encode('foo')),
        bytesValue(new TextEncoder().encode('bar'))
      )
    ).toEqual(bytesValue(new TextEncoder().encode('foobar')));
    expect(
      addBytesValue(
        bytesValue(new TextEncoder().encode('foo')),
        stringValue('bar')
      )
    ).toEqual(new Error('no such overload'));
  });

  it('compareBytesValue', () => {
    expect(() => {
      compareBytesValue(
        stringValue('foo'),
        bytesValue(new Uint8Array([1, 2, 3]))
      );
    }).toThrow();
    expect(
      compareBytesValue(
        bytesValue(new TextEncoder().encode('1234')),
        bytesValue(new TextEncoder().encode('2345'))
      )
    ).toEqual(int64Value(BigInt(-1)));
    expect(
      compareBytesValue(
        bytesValue(new TextEncoder().encode('1234')),
        bytesValue(new TextEncoder().encode('1234'))
      )
    ).toEqual(int64Value(BigInt(0)));
    expect(
      compareBytesValue(
        bytesValue(new TextEncoder().encode('2345')),
        bytesValue(new TextEncoder().encode('1234'))
      )
    ).toEqual(int64Value(BigInt(1)));
    expect(
      compareBytesValue(
        bytesValue(new TextEncoder().encode('1234')),
        stringValue('1234')
      )
    ).toEqual(new Error('no such overload'));
  });

  it('sizeBytesValue', () => {
    expect(() => {
      sizeBytesValue(stringValue('foo'));
    }).toThrow();
    expect(
      sizeBytesValue(bytesValue(new TextEncoder().encode('1234567890'))).kind
        .value
    ).toEqual(BigInt(10));
  });
});
