import {
  TimestampSchema,
  anyPack,
  timestampFromDate,
} from '@bufbuild/protobuf/wkt';
import { objectValue } from './object';
import {
  isTimestampValue,
  timestamp,
  timestampFromRfc3339nano,
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

  it('timestampFromRfc3339nano', () => {
    const ts = timestampFromDate(new Date('1970-01-01T02:07:34.000Z'));
    expect(
      timestampFromRfc3339nano('1970-01-01T02:07:34.000000321Z')
    ).toStrictEqual(timestamp(ts.seconds, 321));
  });
});
