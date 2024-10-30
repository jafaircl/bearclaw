import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { create } from '@bufbuild/protobuf';
import { AnySchema, BoolValueSchema, anyPack } from '@bufbuild/protobuf/wkt';
import {
  BOOL_TYPE,
  boolConstant,
  boolExpr,
  boolValue,
  compareBoolValue,
  convertBoolValueToNative,
  convertBoolValueToType,
  equalBoolValue,
  isZeroBoolValue,
  negateBoolValue,
} from './bool';
import { int64Value } from './int';
import { STRING_TYPE, stringValue } from './string';
import { TYPE_TYPE } from './type';

describe('bool', () => {
  it('boolConstant', () => {
    expect(boolConstant(true)).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'boolValue',
          value: true,
        },
      })
    );
  });

  it('boolExpr', () => {
    expect(boolExpr(BigInt(1), true)).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'boolValue',
              value: true,
            },
          }),
        },
      })
    );
  });

  it('boolValue', () => {
    expect(boolValue(true)).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'boolValue',
          value: true,
        },
      })
    );
  });

  // TODO: validations

  it('convertBoolValueToNative - js boolean', () => {
    expect(() => {
      convertBoolValueToNative(stringValue('true'), Boolean);
    }).toThrow();
    const value = boolValue(true);
    expect(convertBoolValueToNative(value, Boolean)).toEqual(true);
  });

  it('convertBoolValueToNative - anyPack', () => {
    const value = boolValue(true);
    const packed = anyPack(
      BoolValueSchema,
      create(BoolValueSchema, { value: true })
    );
    expect(convertBoolValueToNative(value, AnySchema)).toEqual(packed);
  });

  it('convertBoolValueToNative - bool wrapper', () => {
    const value = boolValue(true);
    expect(convertBoolValueToNative(value, BoolValueSchema)).toEqual(
      create(BoolValueSchema, { value: true })
    );
  });

  it('convertBoolValueToNative - invalid type', () => {
    const value = boolValue(true);
    expect(convertBoolValueToNative(value, Array)).toEqual(
      new Error(`type conversion error from 'bool' to 'Array'`)
    );
  });

  it('convertBoolValueToType', () => {
    expect(() => {
      convertBoolValueToType(stringValue('true'), BOOL_TYPE);
    }).toThrow();
    const value = boolValue(true);
    expect(convertBoolValueToType(value, BOOL_TYPE)).toEqual(boolValue(true));
    expect(convertBoolValueToType(value, STRING_TYPE)).toEqual(
      stringValue('true')
    );
    expect(convertBoolValueToType(value, TYPE_TYPE)).toEqual(BOOL_TYPE);
  });

  it('equalBoolValue', () => {
    expect(() => {
      equalBoolValue(stringValue('true'), boolValue(true));
    }).toThrow();
    expect(equalBoolValue(boolValue(true), boolValue(true))).toEqual(
      boolValue(true)
    );
    expect(equalBoolValue(boolValue(false), boolValue(true))).toEqual(
      boolValue(false)
    );
    expect(equalBoolValue(boolValue(true), boolValue(false))).toEqual(
      boolValue(false)
    );
  });

  it('isZeroBoolValue', () => {
    expect(() => {
      isZeroBoolValue(stringValue('true'));
    }).toThrow();
    expect(isZeroBoolValue(boolValue(true))).toEqual(boolValue(false));
    expect(isZeroBoolValue(boolValue(false))).toEqual(boolValue(true));
  });

  it('compareBoolValue', () => {
    expect(() => {
      compareBoolValue(stringValue('true'), boolValue(true));
    }).toThrow();
    expect(compareBoolValue(boolValue(true), boolValue(true))).toEqual(
      int64Value(BigInt(0))
    );
    expect(compareBoolValue(boolValue(false), boolValue(true))).toEqual(
      int64Value(BigInt(-1))
    );
    expect(compareBoolValue(boolValue(true), boolValue(false))).toEqual(
      int64Value(BigInt(1))
    );
    expect(compareBoolValue(boolValue(true), stringValue('true'))).toEqual(
      new Error('no such overload')
    );
  });

  it('negateBoolValue', () => {
    expect(() => {
      negateBoolValue(stringValue('true'));
    }).toThrow();
    expect(negateBoolValue(boolValue(true))).toEqual(boolValue(false));
    expect(negateBoolValue(boolValue(false))).toEqual(boolValue(true));
  });
});
