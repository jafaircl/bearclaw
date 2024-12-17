import { create } from '@bufbuild/protobuf';
import {
  anyPack,
  AnySchema,
  BoolValueSchema,
  BytesValueSchema,
  DoubleValueSchema,
  DurationSchema,
  FloatValueSchema,
  Int32ValueSchema,
  Int64ValueSchema,
  ListValueSchema,
  StringValueSchema,
  StructSchema,
  TimestampSchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
  ValueSchema,
} from '@bufbuild/protobuf/wkt';
import { duration } from './duration';
import { reflectNativeType } from './native';
import { timestamp } from './timestamp';

class TestCls {}

describe('native', () => {
  it('reflectNativeType', () => {
    const tests = [
      {
        in: false,
        want: Boolean,
      },
      {
        in: 1,
        want: Number,
      },
      {
        in: 'hello',
        want: String,
      },
      {
        in: BigInt(42),
        want: BigInt,
      },
      {
        in: Symbol('foo'),
        want: Symbol,
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        in: () => {},
        want: Function,
      },
      {
        in: new Date(),
        want: Date,
      },
      {
        in: [],
        want: Array,
      },
      {
        in: {},
        want: Object,
      },
      {
        in: new Uint8Array(),
        want: Uint8Array,
      },
      {
        in: null,
        want: Object,
      },
      {
        in: undefined,
        want: Object,
      },
      {
        in: anyPack(Int32ValueSchema, create(Int32ValueSchema, { value: 42 })),
        want: AnySchema,
      },
      {
        in: create(BoolValueSchema, { value: true }),
        want: BoolValueSchema,
      },
      {
        in: create(BytesValueSchema, { value: new Uint8Array() }),
        want: BytesValueSchema,
      },
      {
        in: create(DoubleValueSchema, { value: 3.14 }),
        want: DoubleValueSchema,
      },
      {
        in: duration(BigInt(3)),
        want: DurationSchema,
      },
      {
        in: create(FloatValueSchema, { value: 3.14 }),
        want: FloatValueSchema,
      },
      {
        in: create(ListValueSchema, { values: [] }),
        want: ListValueSchema,
      },
      {
        in: create(Int32ValueSchema, { value: 42 }),
        want: Int32ValueSchema,
      },
      {
        in: create(Int64ValueSchema, { value: BigInt(42) }),
        want: Int64ValueSchema,
      },
      {
        in: create(StringValueSchema, { value: 'hello' }),
        want: StringValueSchema,
      },
      {
        in: create(StructSchema, { fields: {} }),
        want: StructSchema,
      },
      {
        in: timestamp(),
        want: TimestampSchema,
      },
      {
        in: create(UInt32ValueSchema, { value: 42 }),
        want: UInt32ValueSchema,
      },
      {
        in: create(UInt64ValueSchema, { value: BigInt(42) }),
        want: UInt64ValueSchema,
      },
      {
        in: create(ValueSchema),
        want: ValueSchema,
      },
      {
        in: new TestCls(),
        want: TestCls,
      },
      {
        in: new Map(),
        want: Map,
      },
      {
        in: new Set(),
        want: Set,
      },
    ];
    for (const test of tests) {
      expect(reflectNativeType(test.in)).toStrictEqual(test.want);
    }
  });
});
