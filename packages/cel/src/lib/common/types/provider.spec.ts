/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  TestAllTypes_NestedEnum,
  TestAllTypes_NestedEnumSchema,
  TestAllTypes_NestedMessageSchema,
  TestAllTypesSchema,
} from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto3/test_all_types_pb.js';
import {
  DeclSchema,
  ReferenceSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { create } from '@bufbuild/protobuf';
import {
  BoolValueSchema,
  BytesValueSchema,
  DoubleValueSchema,
  FloatValueSchema,
  Int32ValueSchema,
  Int64ValueSchema,
  StringValueSchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
} from '@bufbuild/protobuf/wkt';
import { BoolRefVal } from './bool';
import { BytesRefVal } from './bytes';
import { DoubleRefVal } from './double';
import { duration, DurationRefVal } from './duration';
import { ErrorRefVal } from './error';
import { IntRefVal } from './int';
import { DynamicList, RefValList, StringList } from './list';
import { NullRefVal } from './null';
import { Registry } from './provider';
import { StringRefVal } from './string';
import { timestamp, TimestampRefVal } from './timestamp';
import { Trait } from './traits/trait';
import {
  AnyType,
  BoolType,
  checkedWellKnowns,
  DurationType,
  IntType,
  Kind,
  newListType,
  newMapType,
  newObjectType,
  newOpaqueType,
  newTypeParamType,
  StringType,
  TimestampType,
  Type,
} from './types';
import { UintRefVal } from './uint';

describe('Registry', () => {
  it('should create', () => {
    // Act
    const registry = new Registry();

    // Assert
    expect(registry).toBeTruthy();
  });

  it('copy', () => {
    const original = new Registry();
    const copy = original.copy();
    expect(copy).not.toBe(original);
    expect(copy).toStrictEqual(original);
  });

  it('register differing type definition conflict', () => {
    const registry = new Registry();
    const err = registry.registerType(
      newObjectType('http.Request', Trait.RECEIVER_TYPE),
      new Type({
        kind: Kind.OPAQUE,
        runtimeTypeName: 'http.Request',
        traitMask: new Set([Trait.RECEIVER_TYPE]),
      })
    );
    expect(err).toStrictEqual(
      new ErrorRefVal(
        'type registration conflict. found: http.Request, input: http.Request'
      )
    );
  });

  it('register no conflict', () => {
    const registry = new Registry();
    const err = registry.registerType(
      newOpaqueType('http.Request', newTypeParamType('T')),
      newOpaqueType('http.Request', newTypeParamType('V'))
    );
    expect(err).toBeNull();
  });

  it('register differing type definition with same name fails', () => {
    const registry = new Registry();
    const err = registry.registerType(
      newOpaqueType(
        'http.Request',
        newTypeParamType('T'),
        newTypeParamType('V')
      ),
      newOpaqueType('http.Request', newTypeParamType('V'))
    );
    expect(err).toStrictEqual(
      new ErrorRefVal(
        'type registration conflict. found: http.Request(T, V), input: http.Request(V)'
      )
    );
  });

  it('enumValue', () => {
    const registry = new Registry();
    const err = registry.registerDescriptor(TestAllTypes_NestedEnumSchema);
    expect(err).toBeNull();

    // Invalid enum name
    let enumValue = registry.enumValue('foo');
    expect(enumValue.value().message).toEqual(`invalid enum name 'foo'`);

    // Valid but not found
    enumValue = registry.enumValue('abc.def.GHI');
    expect(enumValue.value().message).toEqual(
      `unknown enum name 'abc.def.GHI'`
    );

    // Valid cases
    enumValue = registry.enumValue(
      'google.api.expr.test.v1.proto3.TestAllTypes.NestedEnum.FOO'
    );
    expect(enumValue.value()).toEqual(BigInt(TestAllTypes_NestedEnum.FOO));
    enumValue = registry.enumValue(
      'google.api.expr.test.v1.proto3.TestAllTypes.NestedEnum.BAR'
    );
    expect(enumValue.value()).toEqual(BigInt(TestAllTypes_NestedEnum.BAR));
    enumValue = registry.enumValue(
      'google.api.expr.test.v1.proto3.TestAllTypes.NestedEnum.BAZ'
    );
    expect(enumValue.value()).toEqual(BigInt(TestAllTypes_NestedEnum.BAZ));

    // Valid enum but invalid value
    enumValue = registry.enumValue(
      'google.api.expr.test.v1.proto3.TestAllTypes.NestedEnum.QUX'
    );
    expect(enumValue.value().message).toEqual(
      `unknown enum value 'google.api.expr.test.v1.proto3.TestAllTypes.NestedEnum.QUX'`
    );
  });

  it('findStructType', () => {
    const registry = new Registry();
    const err = registry.registerDescriptor(TestAllTypesSchema);
    expect(err).toBeNull();

    const msgTypeName = '.google.api.expr.test.v1.proto3.TestAllTypes';
    const celType = registry.findStructType(msgTypeName);
    expect(celType).not.toBeNull();
    expect(celType?.parameters()[0].typeName()).toEqual(
      'google.api.expr.test.v1.proto3.TestAllTypes'
    );

    const und = registry.findStructType(`${msgTypeName}Undefined`);
    expect(und).toBeNull();
  });

  it('findStructFieldNames', () => {
    const registry = new Registry();
    registry.registerDescriptor(DeclSchema);
    registry.registerDescriptor(ReferenceSchema);
    expect(registry.findStructFieldNames(ReferenceSchema.typeName)).toEqual([
      'name',
      'overload_id',
      'value',
    ]);
    expect(registry.findStructFieldNames(DeclSchema.typeName)).toEqual([
      'name',
      'ident',
      'function',
    ]);
    expect(registry.findStructFieldNames('invalid.TypeName')).toEqual([]);
  });

  it('findStructFieldType', () => {
    const registry = new Registry();
    registry.registerDescriptor(TestAllTypesSchema);
    const msgTypeName = '.google.api.expr.test.v1.proto3.TestAllTypes';
    const tests = [
      {
        msgTypeName,
        fieldName: 'single_bool',
        want: BoolType,
      },
      {
        msgTypeName,
        fieldName: 'single_nested_message',
        want: newObjectType(TestAllTypes_NestedMessageSchema.typeName),
      },
      {
        msgTypeName,
        fieldName: 'standalone_enum',
        want: IntType,
      },
      {
        msgTypeName,
        fieldName: 'single_duration',
        want: DurationType,
      },
      {
        msgTypeName,
        fieldName: 'single_timestamp',
        want: TimestampType,
      },
      {
        msgTypeName,
        fieldName: 'single_any',
        want: AnyType,
      },
      {
        msgTypeName,
        fieldName: 'single_int64_wrapper',
        want: checkedWellKnowns.get('google.protobuf.Int64Value')!,
      },
      {
        msgTypeName,
        fieldName: 'repeated_bool',
        want: newListType(BoolType),
      },
      {
        msgTypeName,
        fieldName: 'map_string_string',
        want: newMapType(StringType, StringType),
      },
      {
        msgTypeName,
        fieldName: 'foobar',
        want: undefined,
      },
    ];
    for (const test of tests) {
      expect(
        registry.findStructFieldType(test.msgTypeName, test.fieldName)?.type
      ).toStrictEqual(test.want);
    }
  });

  it('nativeToValue - wrappers', () => {
    // TODO: anyPack
    const tests = [
      {
        in: create(BoolValueSchema, { value: true }),
        want: BoolRefVal.True,
      },
      {
        in: create(BoolValueSchema, { value: false }),
        want: BoolRefVal.False,
      },
      {
        in: create(BytesValueSchema, {
          value: new TextEncoder().encode('hello'),
        }),
        want: new BytesRefVal(new Uint8Array([104, 101, 108, 108, 111])),
      },
      {
        in: create(DoubleValueSchema, { value: 3.14 }),
        want: new DoubleRefVal(3.14),
      },
      {
        in: create(FloatValueSchema, { value: 6.4 }),
        want: new DoubleRefVal(6.4),
      },
      {
        in: create(Int32ValueSchema, { value: 42 }),
        want: new IntRefVal(BigInt(42)),
      },
      {
        in: create(Int64ValueSchema, { value: BigInt(-42) }),
        want: new IntRefVal(BigInt(-42)),
      },
      {
        in: create(StringValueSchema, { value: 'hello' }),
        want: new StringRefVal('hello'),
      },
      {
        in: create(UInt32ValueSchema, { value: 34 }),
        want: new UintRefVal(BigInt(34)),
      },
      {
        in: create(UInt64ValueSchema, { value: BigInt(34) }),
        want: new UintRefVal(BigInt(34)),
      },
    ];
    const registry = new Registry();
    for (const test of tests) {
      expect(registry.nativeToValue(test.in)).toStrictEqual(test.want);
    }
  });

  it('nativeToValue - primitives', () => {
    const registry = new Registry();
    const tests = [
      {
        in: null,
        want: new NullRefVal(),
      },
      {
        in: undefined,
        want: new NullRefVal(),
      },
      {
        in: true,
        want: BoolRefVal.True,
      },
      {
        in: BigInt(-10),
        want: new IntRefVal(BigInt(-10)),
      },
      {
        in: 5.5,
        want: new DoubleRefVal(5.5),
      },
      {
        in: 'hello world',
        want: new StringRefVal('hello world'),
      },
      {
        in: new Uint8Array([104, 101, 108, 108, 111]),
        want: new BytesRefVal(new TextEncoder().encode('hello')),
      },
      {
        in: new Date(42e3),
        want: new TimestampRefVal(timestamp(BigInt(42))),
      },
      {
        in: timestamp(BigInt(8675309)),
        want: new TimestampRefVal(timestamp(BigInt(8675309))),
      },
      {
        in: duration(BigInt(348490)),
        want: new DurationRefVal(duration(BigInt(348490), 0)),
      },
    ];
    for (const test of tests) {
      expect(registry.nativeToValue(test.in)).toStrictEqual(test.want);
    }
    // Lists don't pass the expect call but the instance and value are correct.
    expect(registry.nativeToValue([1, 2, 3])).toBeInstanceOf(DynamicList);
    expect(registry.nativeToValue([1, 2, 3]).value()).toStrictEqual([1, 2, 3]);
    expect(registry.nativeToValue(['a', 'b', 'c'])).toBeInstanceOf(StringList);
    expect(registry.nativeToValue(['a', 'b', 'c']).value()).toStrictEqual([
      'a',
      'b',
      'c',
    ]);
    expect(registry.nativeToValue([new StringRefVal('a')])).toBeInstanceOf(
      RefValList
    );
    expect(
      registry.nativeToValue([new StringRefVal('a')]).value()
    ).toStrictEqual([new StringRefVal('a')]);
  });
});
