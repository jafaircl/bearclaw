import {
  TestAllTypes_NestedEnum,
  TestAllTypesSchema,
} from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto3/test_all_types_pb.js';
import { create, DescField } from '@bufbuild/protobuf';
import { isMessageFieldSet, sanitizeProtoName } from './utils';

describe('utils', () => {
  it('isMessageFieldSet', () => {
    const empty = create(TestAllTypesSchema);
    const set = create(TestAllTypesSchema, {
      singleInt64: BigInt(42),
      standaloneEnum: TestAllTypes_NestedEnum.BAR,
      listValue: {
        values: [{ kind: { case: 'stringValue', value: 'hello world' } }],
      },
      mapStringDouble: { a: 3.14 },
      standaloneMessage: { bb: 867.5309 },
    });

    const scalarField = TestAllTypesSchema.fields.find(
      (f) => f.name === 'single_int64'
    ) as DescField;
    expect(isMessageFieldSet(scalarField, empty)).toEqual(false);
    expect(isMessageFieldSet(scalarField, set)).toEqual(true);

    const enumField = TestAllTypesSchema.fields.find(
      (f) => f.name === 'standalone_enum'
    ) as DescField;
    expect(isMessageFieldSet(enumField, empty)).toEqual(false);
    expect(isMessageFieldSet(enumField, set)).toEqual(true);

    const listField = TestAllTypesSchema.fields.find(
      (f) => f.name === 'list_value'
    ) as DescField;
    expect(isMessageFieldSet(listField, empty)).toEqual(false);
    expect(isMessageFieldSet(listField, set)).toEqual(true);

    const mapField = TestAllTypesSchema.fields.find(
      (f) => f.name === 'map_string_double'
    ) as DescField;
    expect(isMessageFieldSet(mapField, empty)).toEqual(false);
    expect(isMessageFieldSet(mapField, set)).toEqual(true);

    const nestedMessage = TestAllTypesSchema.fields.find(
      (f) => f.name === 'standalone_message'
    ) as DescField;
    expect(isMessageFieldSet(nestedMessage, empty)).toEqual(false);
    expect(isMessageFieldSet(nestedMessage, set)).toEqual(true);
  });

  it('sanitizeProtoName', () => {
    expect(sanitizeProtoName(' foo  ')).toEqual('foo');
    expect(sanitizeProtoName('foo.bar.baz')).toEqual('foo.bar.baz');
    expect(sanitizeProtoName('.foo.bar.baz')).toEqual('foo.bar.baz');
  });
});
