import { create, createMutableRegistry } from '@bufbuild/protobuf';
import { ParsedExprSchema } from '../../protogen/cel/expr/syntax_pb.js';
import { BoolRefVal } from './bool';
import { DoubleRefVal } from './double';
import { ErrorRefVal } from './error';
import { IntRefVal } from './int';
import { ObjectRefVal } from './object';
import { Registry } from './provider';
import { StringRefVal } from './string';
import { Lister } from './traits/lister';
import { TypeType } from './types';

describe('object', () => {
  it('should create from the registry', () => {
    const registry = new Registry(
      new Map(),
      createMutableRegistry(ParsedExprSchema)
    );
    const msg = create(ParsedExprSchema, {
      sourceInfo: {
        lineOffsets: [1, 2, 3],
      },
    });
    const obj = registry.nativeToValue(msg) as ObjectRefVal;
    expect(obj).toBeInstanceOf(ObjectRefVal);
    const si = obj.get(new StringRefVal('source_info')) as ObjectRefVal;
    const lo = si.get(new StringRefVal('line_offsets')) as Lister;
    expect(lo.get(new IntRefVal(BigInt(2)))).toStrictEqual(new DoubleRefVal(3));
  });

  it('isSet', () => {
    const registry = new Registry(
      new Map(),
      createMutableRegistry(ParsedExprSchema)
    );
    const msg = create(ParsedExprSchema, {
      sourceInfo: {
        lineOffsets: [1, 2, 3],
      },
    });
    const obj = registry.nativeToValue(msg) as ObjectRefVal;
    expect(obj.isSet(new StringRefVal('source_info'))).toStrictEqual(
      BoolRefVal.True
    );
    expect(obj.isSet(new StringRefVal('expr'))).toStrictEqual(BoolRefVal.False);
    expect(obj.isSet(new StringRefVal('bad_field'))).toStrictEqual(
      new ErrorRefVal(`no such field 'bad_field'`)
    );
    expect(obj.isSet(IntRefVal.IntZero)).toStrictEqual(
      ErrorRefVal.errNoSuchOverload
    );
  });

  it('isZeroValue', () => {
    const registry = new Registry(
      new Map(),
      createMutableRegistry(ParsedExprSchema)
    );
    const emptyMsg = create(ParsedExprSchema);
    const emptyObj = registry.nativeToValue(emptyMsg) as ObjectRefVal;
    expect(emptyObj.isZeroValue()).toEqual(true);

    const msg = create(ParsedExprSchema, {
      sourceInfo: {
        lineOffsets: [1, 2, 3],
      },
    });
    const obj = registry.nativeToValue(msg) as ObjectRefVal;
    expect(obj.isZeroValue()).toEqual(false);
  });

  it('get', () => {
    const registry = new Registry(
      new Map(),
      createMutableRegistry(ParsedExprSchema)
    );
    const msg = create(ParsedExprSchema, {
      sourceInfo: {
        lineOffsets: [1, 2, 3],
      },
    });
    const obj = registry.nativeToValue(msg) as ObjectRefVal;
    expect(
      obj
        .get(new StringRefVal('source_info'))
        .equal(registry.nativeToValue(msg.sourceInfo))
    ).toStrictEqual(BoolRefVal.True);
    expect(obj.get(new StringRefVal('bad_field'))).toStrictEqual(
      new ErrorRefVal(`no such field 'bad_field'`)
    );
    expect(obj.get(IntRefVal.IntZero)).toStrictEqual(
      ErrorRefVal.errNoSuchOverload
    );
  });

  it('convertToType', () => {
    const registry = new Registry(
      new Map(),
      createMutableRegistry(ParsedExprSchema)
    );
    const msg = create(ParsedExprSchema, {
      sourceInfo: {
        lineOffsets: [1, 2, 3],
      },
    });
    const obj = registry.nativeToValue(msg) as ObjectRefVal;
    expect(obj.convertToType(TypeType)).toStrictEqual(obj.type());
    expect(obj.convertToType(obj.type()) === obj).toBeTruthy();
  });

  it('convertToNative', () => {
    const registry = new Registry(
      new Map(),
      createMutableRegistry(ParsedExprSchema)
    );
    const msg = create(ParsedExprSchema, {
      sourceInfo: {
        lineOffsets: [1, 2, 3],
      },
    });
    const obj = registry.nativeToValue(msg) as ObjectRefVal;
    expect(obj.convertToNative(obj.typeDesc)).toStrictEqual(msg);
  });
});
