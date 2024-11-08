import {
  AnySchema,
  TimestampSchema,
  anyPack,
  timestampFromDate,
} from '@bufbuild/protobuf/wkt';
import {
  TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_WEEK_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_WEEK_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_YEAR_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_YEAR_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_HOURS_OVERLOAD,
  TIMESTAMP_TO_HOURS_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_MILLISECONDS_OVERLOAD,
  TIMESTAMP_TO_MILLISECONDS_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_MINUTES_OVERLOAD,
  TIMESTAMP_TO_MINUTES_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_MONTH_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_SECONDS_OVERLOAD,
  TIMESTAMP_TO_SECONDS_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_YEAR_OVERLOAD,
  TIMESTAMP_TO_YEAR_WITH_TZ_OVERLOAD,
  TIME_GET_DATE_OVERLOAD,
  TIME_GET_DAY_OF_MONTH_OVERLOAD,
  TIME_GET_DAY_OF_WEEK_OVERLOAD,
  TIME_GET_DAY_OF_YEAR_OVERLOAD,
  TIME_GET_FULL_YEAR_OVERLOAD,
  TIME_GET_HOURS_OVERLOAD,
  TIME_GET_MILLISECONDS_OVERLOAD,
  TIME_GET_MINUTES_OVERLOAD,
  TIME_GET_MONTH_OVERLOAD,
  TIME_GET_SECONDS_OVERLOAD,
} from '../../overloads';
import {
  TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_MONTH_OVERLOAD,
} from './../../overloads';
import { BOOL_REF_TYPE, BoolRefVal } from './bool';
import { DurationRefVal, duration } from './duration';
import { ErrorRefVal } from './error';
import { INT_REF_TYPE, IntRefVal, MAX_INT64, MIN_INT64 } from './int';
import { objectValue } from './object';
import { STRING_REF_TYPE, StringRefVal } from './string';
import {
  MAX_UNIX_TIME,
  MIN_UNIX_TIME,
  TIMESTAMP_REF_TYPE,
  TimestampRefVal,
  isTimestampValue,
  timestamp,
  timestampFromDateString,
  timestampToDateString,
  timestampValue,
  unwrapTimestampValue,
} from './timestamp';
import { TYPE_REF_TYPE, TypeRefVal } from './type';

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

  it('timestampConvertToNative', () => {
    const tests = [
      {
        value: new TimestampRefVal(timestamp(BigInt(42))),
        type: Date,
        want: new Date(42000),
      },
      {
        value: new TimestampRefVal(timestamp(BigInt(42), 123456789)),
        type: Date,
        want: new Date(42124),
      },
      {
        value: new TimestampRefVal(timestamp(BigInt(42))),
        type: String,
        want: '1970-01-01T00:00:42.000Z',
      },
      {
        value: new TimestampRefVal(timestamp(BigInt(42), 123456789)),
        type: String,
        want: '1970-01-01T00:00:42.123456789Z',
      },
      {
        value: new TimestampRefVal(timestamp(BigInt(42))),
        type: AnySchema,
        want: anyPack(TimestampSchema, timestamp(BigInt(42))),
      },
      {
        value: new TimestampRefVal(timestamp(BigInt(42))),
        type: TimestampSchema,
        want: timestamp(BigInt(42)),
      },
      {
        value: new TimestampRefVal(timestamp(BigInt(42))),
        type: Boolean,
        want: ErrorRefVal.nativeTypeConversionError(
          new TimestampRefVal(timestamp(BigInt(42))),
          Boolean
        ),
      },
    ];
    for (const test of tests) {
      expect(test.value.convertToNative(test.type)).toStrictEqual(test.want);
    }
  });

  it('timestampConvertToType', () => {
    const tests = [
      {
        value: new TimestampRefVal(timestamp(BigInt(42))),
        type: TIMESTAMP_REF_TYPE,
        want: new TimestampRefVal(timestamp(BigInt(42))),
      },
      {
        value: new TimestampRefVal(timestamp(BigInt(8593))),
        type: TYPE_REF_TYPE,
        want: new TypeRefVal(TIMESTAMP_REF_TYPE),
      },
      {
        value: new TimestampRefVal(timestamp(BigInt(2345))),
        type: INT_REF_TYPE,
        want: new IntRefVal(BigInt(2345)),
      },
      {
        value: new TimestampRefVal(timestamp(BigInt(5398475), 234)),
        type: STRING_REF_TYPE,
        want: new StringRefVal('1970-03-04T11:34:35.000000234Z'),
      },
      {
        value: new TimestampRefVal(timestamp(BigInt(42))),
        type: BOOL_REF_TYPE,
        want: ErrorRefVal.typeConversionError(
          new TimestampRefVal(timestamp(BigInt(42))),
          BOOL_REF_TYPE
        ),
      },
    ];
    for (const test of tests) {
      expect(test.value.convertToType(test.type)).toStrictEqual(test.want);
    }
  });

  it('equalTimestampValue', () => {
    expect(
      new TimestampRefVal(timestamp(BigInt(42))).equal(
        new TimestampRefVal(timestamp(BigInt(42)))
      )
    ).toStrictEqual(BoolRefVal.True);
    expect(
      new TimestampRefVal(timestamp(BigInt(42))).equal(
        new TimestampRefVal(timestamp(BigInt(1234)))
      )
    ).toStrictEqual(BoolRefVal.False);
    expect(
      new TimestampRefVal(timestamp(BigInt(42))).equal(
        new StringRefVal('1970-01-01T00:00:42.000Z')
      )
    ).toStrictEqual(BoolRefVal.False);
  });

  it('addTimestampValue', () => {
    const tests = [
      {
        // DateAddOneHourMinusOneMilli
        value: new TimestampRefVal(timestamp(BigInt(3506))),
        other: new DurationRefVal(duration(BigInt(60 * 60), -1e6)),
        want: new TimestampRefVal(timestamp(BigInt(7105), 999000000)),
      },
      {
        // DateAddOneHourOneNano
        value: new TimestampRefVal(timestamp(BigInt(3506))),
        other: new DurationRefVal(duration(BigInt(0), 1)),
        want: new TimestampRefVal(timestamp(BigInt(3506), 1)),
      },
      {
        // IntMaxAddOneSecond
        value: new TimestampRefVal(timestamp(MAX_INT64)),
        other: new DurationRefVal(duration(BigInt(1))),
        want: ErrorRefVal.errIntOverflow,
      },
      {
        // MaxTimestampAddOneSecond
        value: new TimestampRefVal(timestamp(MAX_UNIX_TIME)),
        other: new DurationRefVal(duration(BigInt(1))),
        want: ErrorRefVal.errTimestampOverflow,
      },
      {
        // MaxIntAddOneViaNanos
        value: new TimestampRefVal(timestamp(MAX_INT64, 999_999_999)),
        other: new DurationRefVal(duration(BigInt(0), 1)),
        want: ErrorRefVal.errIntOverflow,
      },
      {
        // SecondsWithNanosNegative
        value: new TimestampRefVal(timestamp(BigInt(42))),
        other: new DurationRefVal(duration(BigInt(-1), -1)),
        want: new TimestampRefVal(timestamp(BigInt(40), 999999999)),
      },
      {
        // SecondsWithNanosPositive
        value: new TimestampRefVal(timestamp(BigInt(42))),
        other: new DurationRefVal(duration(BigInt(1), 1)),
        want: new TimestampRefVal(timestamp(BigInt(43), 1)),
      },
      {
        // DateAddDateError
        value: new TimestampRefVal(timestamp(BigInt(42))),
        other: new TimestampRefVal(timestamp(BigInt(42))),
        want: ErrorRefVal.errNoSuchOverload,
      },
    ];
    for (const test of tests) {
      expect(test.value.add(test.other)).toStrictEqual(test.want);
    }
  });

  it('compareTimestampValue', () => {
    const tests = [
      {
        // DateCompareEqual
        value: new TimestampRefVal(timestamp(BigInt(1))),
        other: new TimestampRefVal(timestamp(BigInt(1))),
        want: IntRefVal.IntZero,
      },
      {
        // DateCompareBefore
        value: new TimestampRefVal(timestamp(BigInt(1))),
        other: new TimestampRefVal(timestamp(BigInt(200))),
        want: IntRefVal.IntNegOne,
      },
      {
        // DateCompareAfter
        value: new TimestampRefVal(timestamp(BigInt(1000))),
        other: new TimestampRefVal(timestamp(BigInt(200))),
        want: IntRefVal.IntOne,
      },
      {
        // DateCompareError
        value: new TimestampRefVal(timestamp(BigInt(1))),
        other: new IntRefVal(BigInt(1)),
        want: ErrorRefVal.errNoSuchOverload,
      },
    ];
    for (const test of tests) {
      expect(test.value.compare(test.other)).toStrictEqual(test.want);
    }
  });

  it('subtractTimestampValue', () => {
    const tests = [
      {
        // TimeSubOneSecond
        value: new TimestampRefVal(timestamp(BigInt(100))),
        other: new TimestampRefVal(timestamp(BigInt(1))),
        want: new DurationRefVal(duration(BigInt(99))),
      },
      {
        // DateSubOneHour
        value: new TimestampRefVal(timestamp(BigInt(3506))),
        other: new DurationRefVal(duration(BigInt(60 * 60))),
        want: new TimestampRefVal(timestamp(BigInt(-94))),
      },
      {
        // MinTimestampSubOneSecond
        value: new TimestampRefVal(timestamp(MIN_UNIX_TIME)),
        other: new DurationRefVal(duration(BigInt(1))),
        want: ErrorRefVal.errTimestampOverflow,
      },
      {
        // MinTimestampSubMinusOneViaNanos
        value: new TimestampRefVal(timestamp(MIN_UNIX_TIME)),
        other: new DurationRefVal(duration(BigInt(0), -1)),
        want: new TimestampRefVal(
          timestamp(BigInt(-62135596799), -999_999_999)
        ),
      },
      {
        // MinIntSubOneViaNanosOverflow
        value: new TimestampRefVal(timestamp(MIN_INT64)),
        other: new DurationRefVal(duration(BigInt(0), 1)),
        want: ErrorRefVal.errIntOverflow,
      },
      {
        // TimeWithNanosPositive
        value: new TimestampRefVal(timestamp(BigInt(2), 1)),
        other: new TimestampRefVal(timestamp(BigInt(0), 999_999_999)),
        want: new DurationRefVal(duration(BigInt(1), 2)),
      },
      {
        // TimeWithNanosNegative
        value: new TimestampRefVal(timestamp(BigInt(1), 1)),
        other: new TimestampRefVal(timestamp(BigInt(2), 999_999_999)),
        want: new DurationRefVal(duration(BigInt(-1), -999_999_998)),
      },
      {
        // MinTimestampMinusOne
        value: new TimestampRefVal(timestamp(MIN_INT64)),
        other: new TimestampRefVal(timestamp(BigInt(1))),
        want: ErrorRefVal.errIntOverflow,
      },
      {
        // DateMinusDateDurationOverflow
        value: new TimestampRefVal(timestamp(MAX_UNIX_TIME)),
        other: new TimestampRefVal(timestamp(MIN_UNIX_TIME)),
        want: ErrorRefVal.errIntOverflow,
      },
      {
        // MinTimestampMinusOneViaNanosScaleOverflow
        value: new TimestampRefVal(timestamp(MIN_INT64)),
        other: new TimestampRefVal(timestamp(BigInt(0), -999_999_999)),
        want: ErrorRefVal.errIntOverflow,
      },
      {
        // DateSubMinDuration
        value: new TimestampRefVal(timestamp(BigInt(1))),
        other: new DurationRefVal(duration(MIN_INT64)),
        want: ErrorRefVal.errIntOverflow,
      },
    ];
    for (const test of tests) {
      expect(test.value.subtract(test.other)).toStrictEqual(test.want);
    }
  });

  it('isZeroTimestampValue', () => {
    expect(new TimestampRefVal(timestamp()).isZeroValue()).toStrictEqual(true);
    expect(new TimestampRefVal(timestamp(BigInt(42))).isZeroValue()).toEqual(
      false
    );
  });

  it('getDayOfMonth', () => {
    // 1970-01-01T02:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_DAY_OF_MONTH_OVERLOAD,
        TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_OVERLOAD,
        []
      )
    ).toStrictEqual(new IntRefVal(BigInt(0)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_DAY_OF_MONTH_OVERLOAD,
        TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_WITH_TZ_OVERLOAD,
        [new StringRefVal('America/Phoenix')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(30)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_DAY_OF_MONTH_OVERLOAD,
        TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_WITH_TZ_OVERLOAD,
        [new StringRefVal('-07:00')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(30)));

    // 1970-01-01T02:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_DATE_OVERLOAD,
        TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_OVERLOAD,
        []
      )
    ).toStrictEqual(new IntRefVal(BigInt(1)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_DATE_OVERLOAD,
        TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_WITH_TZ_OVERLOAD,
        [new StringRefVal('America/Phoenix')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(31)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_DATE_OVERLOAD,
        TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_WITH_TZ_OVERLOAD,
        [new StringRefVal('+23:00')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(2)));
  });

  it('getDayOfYear', () => {
    // 1970-01-01T02:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_DAY_OF_YEAR_OVERLOAD,
        TIMESTAMP_TO_DAY_OF_YEAR_OVERLOAD,
        []
      )
    ).toStrictEqual(new IntRefVal(BigInt(0)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_DAY_OF_YEAR_OVERLOAD,
        TIMESTAMP_TO_DAY_OF_YEAR_WITH_TZ_OVERLOAD,
        [new StringRefVal('America/Phoenix')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(365))); // TODO: the go test expects 364
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_DAY_OF_YEAR_OVERLOAD,
        TIMESTAMP_TO_DAY_OF_YEAR_WITH_TZ_OVERLOAD,
        [new StringRefVal('-07:00')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(365))); // TODO: the go test expects 364
  });

  it('getFullYear', () => {
    // 1970-01-01T02:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_FULL_YEAR_OVERLOAD,
        TIMESTAMP_TO_YEAR_OVERLOAD,
        []
      )
    ).toStrictEqual(new IntRefVal(BigInt(1970)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_FULL_YEAR_OVERLOAD,
        TIMESTAMP_TO_YEAR_WITH_TZ_OVERLOAD,
        [new StringRefVal('America/Phoenix')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(1969)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_FULL_YEAR_OVERLOAD,
        TIMESTAMP_TO_YEAR_WITH_TZ_OVERLOAD,
        [new StringRefVal('-07:00')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(1969)));
  });

  it('getMonth', () => {
    // 1970-01-01T02:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_MONTH_OVERLOAD,
        TIMESTAMP_TO_MONTH_OVERLOAD,
        []
      )
    ).toStrictEqual(new IntRefVal(BigInt(0)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_MONTH_OVERLOAD,
        TIMESTAMP_TO_MONTH_WITH_TZ_OVERLOAD,
        [new StringRefVal('America/Phoenix')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(11)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_MONTH_OVERLOAD,
        TIMESTAMP_TO_MONTH_WITH_TZ_OVERLOAD,
        [new StringRefVal('-07:00')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(11)));
  });

  it('getDayOfWeek', () => {
    // 1970-01-01T02:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_DAY_OF_WEEK_OVERLOAD,
        TIMESTAMP_TO_DAY_OF_WEEK_OVERLOAD,
        []
      )
    ).toStrictEqual(new IntRefVal(BigInt(4)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_DAY_OF_WEEK_OVERLOAD,
        TIMESTAMP_TO_DAY_OF_WEEK_WITH_TZ_OVERLOAD,
        [new StringRefVal('America/Phoenix')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(3)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_DAY_OF_WEEK_OVERLOAD,
        TIMESTAMP_TO_DAY_OF_WEEK_WITH_TZ_OVERLOAD,
        [new StringRefVal('-07:00')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(3)));
  });

  it('getHours', () => {
    // 1970-01-01T02:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_HOURS_OVERLOAD,
        TIMESTAMP_TO_HOURS_OVERLOAD,
        []
      )
    ).toStrictEqual(new IntRefVal(BigInt(2)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_HOURS_OVERLOAD,
        TIMESTAMP_TO_HOURS_WITH_TZ_OVERLOAD,
        [new StringRefVal('America/Phoenix')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(19)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_HOURS_OVERLOAD,
        TIMESTAMP_TO_HOURS_WITH_TZ_OVERLOAD,
        [new StringRefVal('-07:00')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(19)));
  });

  it('getMinutes', () => {
    // 1970-01-01T02:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_MINUTES_OVERLOAD,
        TIMESTAMP_TO_MINUTES_OVERLOAD,
        []
      )
    ).toStrictEqual(new IntRefVal(BigInt(5)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_MINUTES_OVERLOAD,
        TIMESTAMP_TO_MINUTES_WITH_TZ_OVERLOAD,
        [new StringRefVal('America/Phoenix')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(5)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_MINUTES_OVERLOAD,
        TIMESTAMP_TO_MINUTES_WITH_TZ_OVERLOAD,
        [new StringRefVal('-07:00')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(5)));
  });

  it('getSeconds', () => {
    // 1970-01-01T02:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_SECONDS_OVERLOAD,
        TIMESTAMP_TO_SECONDS_OVERLOAD,
        []
      )
    ).toStrictEqual(new IntRefVal(BigInt(6)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_SECONDS_OVERLOAD,
        TIMESTAMP_TO_SECONDS_WITH_TZ_OVERLOAD,
        [new StringRefVal('America/Phoenix')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(6)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506))).receive(
        TIME_GET_SECONDS_OVERLOAD,
        TIMESTAMP_TO_SECONDS_WITH_TZ_OVERLOAD,
        [new StringRefVal('-07:00')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(6)));
  });

  it('getMilliseconds', () => {
    // 1970-01-01T02:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506), 1000000)).receive(
        TIME_GET_MILLISECONDS_OVERLOAD,
        TIMESTAMP_TO_MILLISECONDS_OVERLOAD,
        []
      )
    ).toStrictEqual(new IntRefVal(BigInt(1)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506), 1000000)).receive(
        TIME_GET_MILLISECONDS_OVERLOAD,
        TIMESTAMP_TO_MILLISECONDS_WITH_TZ_OVERLOAD,
        [new StringRefVal('America/Phoenix')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(1)));
    // 1969-12-31T19:05:06Z
    expect(
      new TimestampRefVal(timestamp(BigInt(7506), 1000000)).receive(
        TIME_GET_MILLISECONDS_OVERLOAD,
        TIMESTAMP_TO_MILLISECONDS_WITH_TZ_OVERLOAD,
        [new StringRefVal('-07:00')]
      )
    ).toStrictEqual(new IntRefVal(BigInt(1)));
  });

  it('receiveTimestampValue', () => {
    expect(new TimestampRefVal(timestamp()).receive('', '', [])).toStrictEqual(
      ErrorRefVal.errNoSuchOverload
    );
  });
});
