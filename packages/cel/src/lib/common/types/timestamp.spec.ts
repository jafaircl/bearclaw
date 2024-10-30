import {
  TimestampSchema,
  anyPack,
  timestampFromDate,
} from '@bufbuild/protobuf/wkt';
import { objectValue } from './object';
import {
  isTimestampValue,
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
});
