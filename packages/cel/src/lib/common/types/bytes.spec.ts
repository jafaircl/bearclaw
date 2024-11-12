import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { create } from '@bufbuild/protobuf';
import { AnySchema, BytesValueSchema, anyPack } from '@bufbuild/protobuf/wkt';
import { BOOL_REF_TYPE, BoolRefVal } from './bool';
import {
  BYTES_REF_TYPE,
  BytesRefVal,
  bytesConstant,
  bytesExpr,
  bytesValue,
} from './bytes';
import { ErrorRefVal } from './error';
import { IntRefVal } from './int';
import { STRING_REF_TYPE, StringRefVal } from './string';
import { TYPE_REF_TYPE } from './type';

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
    expect(
      new BytesRefVal(new Uint8Array([1, 2, 3])).convertToNative(Uint8Array)
    ).toStrictEqual(new Uint8Array([1, 2, 3]));
  });

  it('convertBytesValueToNative - anyPack', () => {
    const value = new BytesRefVal(new Uint8Array([1, 2, 3]));
    const packed = anyPack(
      BytesValueSchema,
      create(BytesValueSchema, { value: new Uint8Array([1, 2, 3]) })
    );
    expect(value.convertToNative(AnySchema)).toStrictEqual(packed);
  });

  it('convertBytesValueToNative - bytes wrapper', () => {
    const value = new BytesRefVal(new Uint8Array([1, 2, 3]));
    expect(value.convertToNative(BytesValueSchema)).toStrictEqual(
      create(BytesValueSchema, { value: new Uint8Array([1, 2, 3]) })
    );
  });

  it('convertBytesValueToNative - invalid type', () => {
    const value = new BytesRefVal(new Uint8Array([1, 2, 3]));
    expect(value.convertToNative(Boolean)).toStrictEqual(
      ErrorRefVal.nativeTypeConversionError(value, Boolean)
    );
  });

  it('convertBytesValueToType', () => {
    const value = new BytesRefVal(new TextEncoder().encode('helloworld'));
    expect(value.convertToType(BYTES_REF_TYPE)).toStrictEqual(value);
    expect(value.convertToType(STRING_REF_TYPE)).toStrictEqual(
      new StringRefVal('helloworld')
    );
    expect(value.convertToType(TYPE_REF_TYPE)).toStrictEqual(BYTES_REF_TYPE);
    expect(value.convertToType(BOOL_REF_TYPE)).toStrictEqual(
      ErrorRefVal.typeConversionError(value, BOOL_REF_TYPE)
    );
  });

  it('equalBytesValue', () => {
    const value = new BytesRefVal(new Uint8Array([1, 2, 3]));
    expect(
      value.equal(new BytesRefVal(new Uint8Array([1, 2, 3])))
    ).toStrictEqual(new BoolRefVal(true));
    expect(
      value.equal(new BytesRefVal(new Uint8Array([1, 2, 4])))
    ).toStrictEqual(new BoolRefVal(false));
    expect(value.equal(new BoolRefVal(true))).toStrictEqual(BoolRefVal.False);
  });

  it('isZeroBytesValue', () => {
    expect(new BytesRefVal(new Uint8Array([1, 2, 3])).isZeroValue()).toEqual(
      false
    );
    expect(new BytesRefVal(new Uint8Array([])).isZeroValue()).toEqual(true);
  });

  it('addBytesValue', () => {
    expect(
      new BytesRefVal(new Uint8Array([1, 2, 3])).add(
        new BytesRefVal(new Uint8Array([4, 5, 6]))
      )
    ).toStrictEqual(new BytesRefVal(new Uint8Array([1, 2, 3, 4, 5, 6])));
    expect(
      new BytesRefVal(new Uint8Array([1, 2, 3])).add(
        new BytesRefVal(new Uint8Array([]))
      )
    ).toStrictEqual(new BytesRefVal(new Uint8Array([1, 2, 3])));
    expect(
      new BytesRefVal(new Uint8Array([])).add(
        new BytesRefVal(new Uint8Array([1, 2, 3]))
      )
    ).toStrictEqual(new BytesRefVal(new Uint8Array([1, 2, 3])));
    expect(
      new BytesRefVal(new Uint8Array([])).add(new StringRefVal('foo'))
    ).toStrictEqual(ErrorRefVal.errNoSuchOverload);
  });

  it('compareBytesValue', () => {
    expect(
      new BytesRefVal(new Uint8Array([1, 2, 3, 4])).compare(
        new BytesRefVal(new Uint8Array([2, 3, 4, 5]))
      )
    ).toStrictEqual(IntRefVal.IntNegOne);
    expect(
      new BytesRefVal(new Uint8Array([1, 2, 3, 4])).compare(
        new BytesRefVal(new Uint8Array([1, 2, 3, 4]))
      )
    ).toStrictEqual(IntRefVal.IntZero);
    expect(
      new BytesRefVal(new Uint8Array([2, 3, 4, 5])).compare(
        new BytesRefVal(new Uint8Array([1, 2, 3, 4]))
      )
    ).toStrictEqual(IntRefVal.IntOne);
    expect(
      new BytesRefVal(new Uint8Array([1, 2, 3, 4])).compare(
        new StringRefVal('foo')
      )
    ).toStrictEqual(ErrorRefVal.errNoSuchOverload);
  });

  it('sizeBytesValue', () => {
    expect(new BytesRefVal(new Uint8Array([1, 2, 3])).size()).toStrictEqual(
      new IntRefVal(BigInt(3))
    );
    expect(new BytesRefVal(new Uint8Array([])).size()).toStrictEqual(
      new IntRefVal(BigInt(0))
    );
  });
});
