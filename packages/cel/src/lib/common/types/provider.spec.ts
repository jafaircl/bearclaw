/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  NestedTestAllTypesSchema,
  TestAllTypes_NestedEnum,
  TestAllTypes_NestedEnumSchema,
  TestAllTypes_NestedMessageSchema,
  TestAllTypesSchema,
} from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto3/test_all_types_pb.js';
import {
  DeclSchema,
  ReferenceSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { SourceInfoSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { create, Message } from '@bufbuild/protobuf';
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
  ValueSchema,
} from '@bufbuild/protobuf/wkt';
import { RefVal } from '../ref/reference';
import { objectToMap } from '../utils';
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

  it('TestRegistryNewValue', () => {
    const reg = new Registry();
    reg.registerDescriptor(TestAllTypesSchema);
    reg.registerDescriptor(NestedTestAllTypesSchema);
    reg.registerDescriptor(SourceInfoSchema);

    interface TestCase {
      typeName: string;
      fields: Map<string, RefVal>;
      out: Message;
    }
    const testCases: TestCase[] = [
      {
        typeName: 'google.api.expr.test.v1.proto3.TestAllTypes',
        fields: new Map(),
        out: create(TestAllTypesSchema),
      },
      {
        typeName: 'google.api.expr.test.v1.proto3.TestAllTypes',
        fields: objectToMap({
          standalone_enum: new IntRefVal(BigInt(1)),
        }),
        out: create(TestAllTypesSchema, {
          standaloneEnum: TestAllTypes_NestedEnum.BAR,
        }),
      },
      {
        typeName: 'google.api.expr.test.v1.proto3.TestAllTypes',
        fields: objectToMap({
          single_int32_wrapper: new IntRefVal(BigInt(123)),
          single_int64_wrapper: new NullRefVal(),
        }),
        out: create(TestAllTypesSchema, {
          singleInt32Wrapper: 123,
        }),
      },
      {
        typeName: 'google.api.expr.test.v1.proto3.TestAllTypes',
        fields: objectToMap({
          repeated_int64: reg.nativeToValue([BigInt(3), BigInt(2), BigInt(1)]),
        }),
        out: create(TestAllTypesSchema, {
          repeatedInt64: [BigInt(3), BigInt(2), BigInt(1)],
        }),
      },
      // TODO: this doesn't work
      // {
      //   typeName: 'google.api.expr.test.v1.proto3.TestAllTypes',
      //   fields: objectToMap({
      //     single_nested_enum: new IntRefVal(BigInt(2)),
      //   }),
      //   out: create(TestAllTypesSchema, {
      //     nestedType: {
      //       case: 'singleNestedEnum',
      //       value: TestAllTypes_NestedEnum.BAZ,
      //     },
      //   }),
      // },
      {
        typeName: 'google.api.expr.test.v1.proto3.TestAllTypes',
        fields: objectToMap({
          single_value: BoolRefVal.True,
        }),
        out: create(TestAllTypesSchema, {
          singleValue: {
            kind: {
              case: 'boolValue',
              value: true,
            },
          },
        }),
      },
      {
        typeName: 'google.api.expr.test.v1.proto3.TestAllTypes',
        fields: objectToMap({
          single_value: reg.nativeToValue(['hello', 10.2]),
        }),
        out: create(TestAllTypesSchema, {
          singleValue: {
            kind: {
              case: 'listValue',
              value: {
                values: [
                  create(ValueSchema, {
                    kind: { case: 'stringValue', value: 'hello' },
                  }),
                  create(ValueSchema, {
                    kind: { case: 'numberValue', value: 10.2 },
                  }),
                ],
              },
            },
          },
        }),
      },
      {
        typeName: 'google.api.expr.test.v1.proto3.TestAllTypes',
        fields: objectToMap({
          repeated_nested_message: reg.nativeToValue([
            create(TestAllTypes_NestedMessageSchema, { bb: 123 }),
          ]),
        }),
        out: create(TestAllTypesSchema, {
          repeatedNestedMessage: [{ bb: 123 }],
        }),
      },
      {
        typeName: 'google.api.expr.test.v1.proto3.TestAllTypes',
        fields: objectToMap({
          map_int64_nested_type: reg.nativeToValue(
            new Map([
              [
                BigInt(1234),
                create(NestedTestAllTypesSchema, {
                  payload: { singleInt32: 123 },
                }),
              ],
            ])
          ),
        }),
        out: create(TestAllTypesSchema, {
          mapInt64NestedType: { 1234: { payload: { singleInt32: 123 } } },
        }),
      },
      {
        typeName: 'cel.expr.SourceInfo',
        fields: objectToMap({
          location: new StringRefVal('TestRegistryNewValue'),
          line_offsets: reg.nativeToValue([BigInt(0), BigInt(2)]),
          positions: reg.nativeToValue(
            new Map([
              [BigInt(1), BigInt(2)],
              [BigInt(2), BigInt(4)],
            ])
          ),
        }),
        out: create(SourceInfoSchema, {
          location: 'TestRegistryNewValue',
          lineOffsets: [0, 2],
          positions: { 1: 2, 2: 4 },
        }),
      },
    ];
    for (const tc of testCases) {
      const out = reg.newValue(tc.typeName, tc.fields);
      expect(out.value()).toStrictEqual(tc.out);
    }
  });
});
