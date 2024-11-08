import {
  TimestampSchema,
  anyPack,
  timestampFromDate,
} from '@bufbuild/protobuf/wkt';
import { objectValue } from './object';
import {
  isTimestampValue,
  timestamp,
  timestampFromDateString,
  timestampToDateString,
  timestampValue,
  unwrapTimestampValue,
} from './timestamp';

describe('timestamp', () => {
  it('timestampValue', () => {
    const now = new Date();
    const value = timestampValue(timestampFromDate(now));
    expect(value).toEqual(
      objectValue(anyPack(TimestampSchema, timestampFromDate(now)))
    );
    expect(isTimestampValue(value)).toBe(true);
    expect(unwrapTimestampValue(value)).toEqual(timestampFromDate(now));
  });

  it('timestampFromDateString', () => {
    // Iso8601 without timezone
    expect(timestampFromDateString('2011-10-05T14:48:00.000Z')).toStrictEqual(
      timestamp(BigInt(1317826080), 0)
    );

    // Iso8601 with timezone
    expect(
      timestampFromDateString('2011-10-05T14:48:00.000-04:00')
    ).toStrictEqual(timestamp(BigInt(1317811680), 0));

    // Nanos without timezone
    expect(
      timestampFromDateString('1970-01-01T02:07:34.000000321Z')
    ).toStrictEqual(timestamp(BigInt(7654), 321));

    // Nanos with timezone
    expect(
      timestampFromDateString('1970-01-01T02:07:34.000000321+07:00')
    ).toStrictEqual(timestamp(BigInt(32854), 321));
  });

  it('timestampToDateString', () => {
    expect(timestampToDateString(timestamp(BigInt(1317826080), 0))).toEqual(
      '2011-10-05T14:48:00.000Z'
    );
    expect(timestampToDateString(timestamp(BigInt(1317826080), 321))).toEqual(
      '2011-10-05T14:48:00.000000321Z'
    );
  });
});
