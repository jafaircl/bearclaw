import {
  NestedTestAllTypesSchema,
  TestAllTypesSchema,
} from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto3/test_all_types_pb.js';
import { create, MessageInitShape, toJsonString } from '@bufbuild/protobuf';
import { FieldMaskSchema } from '@bufbuild/protobuf/wkt';
import { applyFieldMask } from './apply';
import { fieldMask } from './fieldmask';

function testAllTypes(message?: MessageInitShape<typeof TestAllTypesSchema>) {
  return create(TestAllTypesSchema, message);
}

describe('apply', () => {
  it('should throw an error for an invalid field mask', () => {
    expect(() =>
      applyFieldMask(
        TestAllTypesSchema,
        testAllTypes(),
        fieldMask(['no_such_field'])
      )
    ).toThrow('invalid field mask');
    expect(() =>
      applyFieldMask(
        TestAllTypesSchema,
        testAllTypes(),
        fieldMask(['single_nested_message.*.bb'])
      )
    ).toThrow('invalid field mask');
  });

  const testCases = [
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({ singleInt32: 1 }),
      fieldMask: fieldMask(['*']),
      inverse: false,
      expected: testAllTypes({ singleInt32: 1 }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({ singleInt32: 1 }),
      fieldMask: fieldMask(['*']),
      inverse: true,
      expected: testAllTypes(),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({ singleInt32: 1 }),
      fieldMask: fieldMask(['single_int32']),
      inverse: false,
      expected: testAllTypes({ singleInt32: 1 }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({ singleInt32: 1 }),
      fieldMask: fieldMask(['single_int32']),
      inverse: true,
      expected: testAllTypes(),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        singleInt64: BigInt(2),
      }),
      fieldMask: fieldMask(['single_int32']),
      inverse: false,
      expected: testAllTypes({ singleInt32: 1 }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        singleInt64: BigInt(2),
      }),
      fieldMask: fieldMask(['single_int32']),
      inverse: true,
      expected: testAllTypes({
        singleInt64: BigInt(2),
      }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        singleInt64: BigInt(2),
      }),
      fieldMask: fieldMask(['single_int32', 'single_int64']),
      inverse: false,
      expected: testAllTypes({
        singleInt32: 1,
        singleInt64: BigInt(2),
      }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        singleInt64: BigInt(2),
      }),
      fieldMask: fieldMask(['single_int32', 'single_int64']),
      inverse: true,
      expected: testAllTypes(),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        standaloneMessage: {
          bb: 1,
        },
      }),
      fieldMask: fieldMask(['standalone_message']),
      inverse: false,
      expected: testAllTypes({
        standaloneMessage: {
          bb: 1,
        },
      }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        standaloneMessage: {
          bb: 1,
        },
      }),
      fieldMask: fieldMask(['standalone_message']),
      inverse: true,
      expected: testAllTypes({ singleInt32: 1 }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        nestedType: {
          case: 'singleNestedMessage',
          value: {
            bb: 1,
          },
        },
      }),
      fieldMask: fieldMask(['single_nested_message']),
      inverse: false,
      expected: testAllTypes({
        nestedType: {
          case: 'singleNestedMessage',
          value: {
            bb: 1,
          },
        },
      }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        nestedType: {
          case: 'singleNestedMessage',
          value: {
            bb: 1,
          },
        },
      }),
      fieldMask: fieldMask(['single_int32']),
      inverse: false,
      expected: testAllTypes({ singleInt32: 1 }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        nestedType: {
          case: 'singleNestedMessage',
          value: {
            bb: 1,
          },
        },
      }),
      fieldMask: fieldMask(['single_nested_message']),
      inverse: true,
      expected: testAllTypes({ singleInt32: 1 }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        mapUint32Timestamp: {
          1: {
            nanos: 1,
            seconds: BigInt(1),
          },
          2: {
            nanos: 2,
            seconds: BigInt(2),
          },
        },
      }),
      fieldMask: fieldMask(['map_uint32_timestamp.*.seconds']),
      inverse: false,
      expected: testAllTypes({
        mapUint32Timestamp: {
          1: {
            seconds: BigInt(1),
          },
          2: {
            seconds: BigInt(2),
          },
        },
      }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        mapUint32Timestamp: {
          1: {
            nanos: 1,
            seconds: BigInt(1),
          },
          2: {
            nanos: 2,
            seconds: BigInt(2),
          },
        },
      }),
      fieldMask: fieldMask(['map_uint32_timestamp.*.seconds']),
      inverse: true,
      expected: testAllTypes({
        singleInt32: 1,
        mapUint32Timestamp: {
          1: {
            nanos: 1,
          },
          2: {
            nanos: 2,
          },
        },
      }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        repeatedTimestamp: [
          { nanos: 1, seconds: BigInt(1) },
          { nanos: 2, seconds: BigInt(2) },
        ],
      }),
      fieldMask: fieldMask(['repeated_timestamp.*.seconds']),
      inverse: false,
      expected: testAllTypes({
        repeatedTimestamp: [{ seconds: BigInt(1) }, { seconds: BigInt(2) }],
      }),
    },
    {
      schema: TestAllTypesSchema,
      message: testAllTypes({
        singleInt32: 1,
        repeatedTimestamp: [
          { nanos: 1, seconds: BigInt(1) },
          { nanos: 2, seconds: BigInt(2) },
        ],
      }),
      fieldMask: fieldMask(['repeated_timestamp.*.seconds']),
      inverse: true,
      expected: testAllTypes({
        singleInt32: 1,
        repeatedTimestamp: [{ nanos: 1 }, { nanos: 2 }],
      }),
    },
    {
      schema: NestedTestAllTypesSchema,
      message: create(NestedTestAllTypesSchema, {
        child: {
          payload: {
            singleInt32: 1,
            singleBool: true,
          },
        },
        payload: {
          singleInt32: 1,
          singleBool: true,
        },
      }),
      fieldMask: fieldMask(['child.payload.single_int32']),
      inverse: false,
      expected: create(NestedTestAllTypesSchema, {
        child: {
          payload: {
            singleInt32: 1,
          },
        },
      }),
    },
    {
      schema: NestedTestAllTypesSchema,
      message: create(NestedTestAllTypesSchema, {
        child: {
          payload: {
            singleInt32: 1,
            singleBool: true,
          },
        },
        payload: {
          singleInt32: 1,
          singleBool: true,
        },
      }),
      fieldMask: fieldMask(['child.payload.single_int32']),
      inverse: true,
      expected: create(NestedTestAllTypesSchema, {
        child: {
          payload: {
            singleBool: true,
          },
        },
        payload: {
          singleInt32: 1,
          singleBool: true,
        },
      }),
    },
    {
      schema: NestedTestAllTypesSchema,
      message: create(NestedTestAllTypesSchema, {
        child: {
          child: {
            payload: {
              mapInt32Timestamp: {
                1: {
                  nanos: 1,
                  seconds: BigInt(1),
                },
                2: {
                  nanos: 2,
                  seconds: BigInt(2),
                },
              },
            },
          },
        },
        payload: {
          singleInt32: 1,
          singleBool: true,
        },
      }),
      fieldMask: fieldMask([
        'child.child.payload.map_int32_timestamp.*.seconds',
      ]),
      inverse: false,
      expected: create(NestedTestAllTypesSchema, {
        child: {
          child: {
            payload: {
              mapInt32Timestamp: {
                1: {
                  seconds: BigInt(1),
                },
                2: {
                  seconds: BigInt(2),
                },
              },
            },
          },
        },
      }),
    },
    {
      schema: NestedTestAllTypesSchema,
      message: create(NestedTestAllTypesSchema, {
        child: {
          child: {
            payload: {
              mapInt32Timestamp: {
                1: {
                  nanos: 1,
                  seconds: BigInt(1),
                },
                2: {
                  nanos: 2,
                  seconds: BigInt(2),
                },
              },
            },
          },
        },
        payload: {
          singleInt32: 1,
          singleBool: true,
        },
      }),
      fieldMask: fieldMask([
        'child.child.payload.map_int32_timestamp.*.seconds',
      ]),
      inverse: true,
      expected: create(NestedTestAllTypesSchema, {
        child: {
          child: {
            payload: {
              mapInt32Timestamp: {
                1: {
                  nanos: 1,
                },
                2: {
                  nanos: 2,
                },
              },
            },
          },
        },
        payload: {
          singleInt32: 1,
          singleBool: true,
        },
      }),
    },
  ];
  for (const tc of testCases) {
    it(`should apply${
      tc.inverse ? ' an inverse' : ''
    } field mask ${toJsonString(FieldMaskSchema, tc.fieldMask)} to ${
      tc.schema.typeName
    }`, () => {
      const result = applyFieldMask(
        tc.schema,
        tc.message,
        tc.fieldMask,
        tc.inverse
      );
      expect(result).toEqual(tc.expected);
    });
  }
});
