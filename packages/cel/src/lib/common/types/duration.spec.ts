import { create } from '@bufbuild/protobuf';
import { DurationSchema, anyPack } from '@bufbuild/protobuf/wkt';
import { convertDurationValueToType, durationValue } from './duration';
import { INT64_TYPE, int64Value } from './int';
import { objectValue } from './object';
import { STRING_TYPE, stringValue } from './string';
import { TYPE_TYPE } from './type';
import { UINT64_TYPE } from './uint';
import { DURATION_TYPE } from './wkt';

describe('duration', () => {
  it('durationValue', () => {
    expect(durationValue({ seconds: BigInt(100) })).toEqual(
      objectValue(
        anyPack(
          DurationSchema,
          create(DurationSchema, { seconds: BigInt(100) })
        )
      )
    );
  });

  // TODO: validations

  // TODO: convertDurationValueToNative

  it('convertDurationValueToType', () => {
    expect(() => {
      convertDurationValueToType(stringValue('foo'), INT64_TYPE);
    }).toThrow();
    expect(
      convertDurationValueToType(
        durationValue({ seconds: BigInt(42) }),
        STRING_TYPE
      )
    ).toEqual(stringValue('42s'));
    expect(
      convertDurationValueToType(
        durationValue({ seconds: BigInt(7506), nanos: 1000 }),
        STRING_TYPE
      )
    ).toEqual(stringValue('7506.000001s'));
    expect(
      convertDurationValueToType(
        durationValue({ seconds: BigInt(7506), nanos: 1000 }),
        INT64_TYPE
      )
    ).toEqual(int64Value(BigInt(7506000001000)));
    expect(
      convertDurationValueToType(
        durationValue({ seconds: BigInt(42) }),
        DURATION_TYPE
      )
    ).toEqual(durationValue({ seconds: BigInt(42) }));
    expect(
      convertDurationValueToType(
        durationValue({ seconds: BigInt(42) }),
        TYPE_TYPE
      )
    ).toEqual(DURATION_TYPE);
    expect(
      convertDurationValueToType(
        durationValue({ seconds: BigInt(42) }),
        UINT64_TYPE
      )
    ).toEqual(new Error(`type conversion error from 'duration' to 'uint'`));
  });
});
