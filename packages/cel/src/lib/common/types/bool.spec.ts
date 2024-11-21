import { create } from '@bufbuild/protobuf';
import { AnySchema, BoolValueSchema, anyPack } from '@bufbuild/protobuf/wkt';
import { BoolRefVal } from './bool';
import { ErrorRefVal } from './error';
import { IntRefVal } from './int';
import { StringRefVal } from './string';
import { BoolType, StringType, TypeType } from './types';

describe('bool', () => {
  it('convertBoolValueToNative - js boolean', () => {
    const value = new BoolRefVal(true);
    expect(value.convertToNative(Boolean)).toEqual(true);
  });

  it('convertBoolValueToNative - anyPack', () => {
    const value = new BoolRefVal(true);
    const packed = anyPack(
      BoolValueSchema,
      create(BoolValueSchema, { value: true })
    );
    expect(value.convertToNative(AnySchema)).toEqual(packed);
  });

  it('convertBoolValueToNative - bool wrapper', () => {
    const value = new BoolRefVal(true);
    expect(value.convertToNative(BoolValueSchema)).toEqual(
      create(BoolValueSchema, { value: true })
    );
  });

  it('convertBoolValueToNative - invalid type', () => {
    const value = new BoolRefVal(true);
    expect(value.convertToNative(Array)).toEqual(
      ErrorRefVal.nativeTypeConversionError(value, Array)
    );
  });

  it('convertBoolValueToType', () => {
    const value = new BoolRefVal(true);
    expect(value.convertToType(BoolType)).toStrictEqual(new BoolRefVal(true));
    expect(value.convertToType(StringType)).toStrictEqual(
      new StringRefVal('true')
    );
    expect(value.convertToType(TypeType)).toStrictEqual(BoolType);
  });

  it('equalBoolValue', () => {
    expect(BoolRefVal.True.equal(BoolRefVal.True)).toStrictEqual(
      BoolRefVal.True
    );
    expect(BoolRefVal.False.equal(BoolRefVal.True)).toStrictEqual(
      BoolRefVal.False
    );
    expect(BoolRefVal.True.equal(BoolRefVal.False)).toStrictEqual(
      BoolRefVal.False
    );
  });

  it('isZeroBoolValue', () => {
    expect(BoolRefVal.True.isZeroValue()).toEqual(false);
    expect(BoolRefVal.False.isZeroValue()).toEqual(true);
  });

  it('compareBoolValue', () => {
    expect(BoolRefVal.True.compare(BoolRefVal.True)).toStrictEqual(
      IntRefVal.IntZero
    );
    expect(BoolRefVal.False.compare(BoolRefVal.True)).toStrictEqual(
      IntRefVal.IntNegOne
    );
    expect(BoolRefVal.True.compare(BoolRefVal.False)).toStrictEqual(
      IntRefVal.IntOne
    );
    expect(BoolRefVal.True.compare(new IntRefVal(BigInt(1)))).toStrictEqual(
      ErrorRefVal.errNoSuchOverload
    );
  });

  it('negateBoolValue', () => {
    expect(BoolRefVal.True.negate()).toStrictEqual(BoolRefVal.False);
    expect(BoolRefVal.False.negate()).toStrictEqual(BoolRefVal.True);
  });
});
