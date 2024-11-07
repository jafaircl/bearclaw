import { create } from '@bufbuild/protobuf';
import { AnySchema, DurationSchema, anyPack } from '@bufbuild/protobuf/wkt';
import {
  DURATION_TO_HOURS_OVERLOAD,
  DURATION_TO_MILLISECONDS_OVERLOAD,
  DURATION_TO_MINUTES_OVERLOAD,
  DURATION_TO_SECONDS_OVERLOAD,
  TIME_GET_HOURS_OVERLOAD,
  TIME_GET_MILLISECONDS_OVERLOAD,
  TIME_GET_MINUTES_OVERLOAD,
  TIME_GET_SECONDS_OVERLOAD,
} from '../../overloads';
import { BOOL_REF_TYPE, BoolRefVal } from './bool';
import {
  DURATION_REF_TYPE,
  DurationRefVal,
  duration,
  durationFromNanos,
  durationValue,
} from './duration';
import { ErrorRefVal } from './error';
import { INT_REF_TYPE, IntRefVal, MAX_INT64, MIN_INT64 } from './int';
import { objectValue } from './object';
import { STRING_REF_TYPE, StringRefVal } from './string';
import { TYPE_REF_TYPE, TypeRefVal } from './type';
import { UINT_REF_TYPE, UintRefVal } from './uint';

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

  it('convertDurationValueToNative', () => {
    const tests = [
      {
        value: new DurationRefVal(duration(BigInt(42), 1234)),
        type: BigInt,
        want: BigInt(42 * 1e9) + BigInt(1234),
      },
      {
        value: new DurationRefVal(duration(BigInt(867), 5309)),
        type: AnySchema,
        want: anyPack(DurationSchema, duration(BigInt(867), 5309)),
      },
      {
        value: new DurationRefVal(duration(BigInt(776), 2323)),
        type: DurationSchema,
        want: duration(BigInt(776), 2323),
      },
      {
        value: new DurationRefVal(duration(BigInt(42), 1234)),
        type: String,
        want: `42.000001234s`,
      },
      {
        value: new DurationRefVal(duration(BigInt(42), 1234)),
        type: Boolean,
        want: ErrorRefVal.errNoSuchOverload,
      },
    ];
    for (const test of tests) {
      expect(test.value.convertToNative(test.type)).toStrictEqual(test.want);
    }
  });

  it('convertDurationValueToType', () => {
    const tests = [
      {
        value: new DurationRefVal(duration(BigInt(42))),
        type: STRING_REF_TYPE,
        want: new StringRefVal('42s'),
      },
      {
        value: new DurationRefVal(duration(BigInt(42), 1234)),
        type: STRING_REF_TYPE,
        want: new StringRefVal('42.000001234s'),
      },
      {
        value: new DurationRefVal(duration(BigInt(42), 1234)),
        type: INT_REF_TYPE,
        want: new IntRefVal(BigInt(42000001234)),
      },
      {
        value: new DurationRefVal(duration(BigInt(42), 1234)),
        type: DURATION_REF_TYPE,
        want: new DurationRefVal(duration(BigInt(42), 1234)),
      },
      {
        value: new DurationRefVal(duration(BigInt(42), 1234)),
        type: TYPE_REF_TYPE,
        want: new TypeRefVal(DURATION_REF_TYPE),
      },
      {
        value: new DurationRefVal(duration(BigInt(42), 1234)),
        type: UINT_REF_TYPE,
        want: new UintRefVal(BigInt(42 * 1e9) + BigInt(1234)),
      },
      {
        value: new DurationRefVal(duration(BigInt(42), 1234)),
        type: BOOL_REF_TYPE,
        want: ErrorRefVal.errNoSuchOverload,
      },
    ];
    for (const test of tests) {
      expect(test.value.convertToType(test.type)).toStrictEqual(test.want);
    }
  });

  it('equalDurationValue', () => {
    expect(
      new DurationRefVal(duration(BigInt(42))).equal(
        new DurationRefVal(duration(BigInt(42)))
      )
    ).toStrictEqual(new BoolRefVal(true));
    expect(
      new DurationRefVal(duration(BigInt(42))).equal(
        new DurationRefVal(duration(BigInt(43)))
      )
    ).toStrictEqual(new BoolRefVal(false));
    expect(
      new DurationRefVal(duration(BigInt(42))).equal(new BoolRefVal(true))
    ).toStrictEqual(BoolRefVal.False);
  });

  it('addDurationValue', () => {
    expect(
      new DurationRefVal(duration(BigInt(42))).add(
        new DurationRefVal(duration(BigInt(43)))
      )
    ).toStrictEqual(new DurationRefVal(duration(BigInt(85))));
    expect(
      new DurationRefVal(duration(MAX_INT64)).add(
        new DurationRefVal(duration(BigInt(0), 1))
      )
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
    expect(
      new DurationRefVal(duration(MAX_INT64)).add(
        new DurationRefVal(duration(BigInt(1)))
      )
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
    expect(
      new DurationRefVal(duration(MIN_INT64)).add(
        new DurationRefVal(duration(BigInt(0), -1))
      )
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
    expect(
      new DurationRefVal(duration(MIN_INT64)).add(
        new DurationRefVal(duration(BigInt(-1)))
      )
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
    // TODO: timestamps
  });

  it('compareDurationValue', () => {
    expect(
      new DurationRefVal(duration(BigInt(42))).compare(
        new DurationRefVal(duration(BigInt(42)))
      )
    ).toStrictEqual(IntRefVal.IntZero);
    expect(
      new DurationRefVal(duration(BigInt(42))).compare(
        new DurationRefVal(duration(BigInt(43)))
      )
    ).toStrictEqual(IntRefVal.IntNegOne);
    expect(
      new DurationRefVal(duration(BigInt(43))).compare(
        new DurationRefVal(duration(BigInt(42)))
      )
    ).toStrictEqual(IntRefVal.IntOne);
  });

  it('negateDurationValue', () => {
    expect(new DurationRefVal(duration(BigInt(42))).negate()).toStrictEqual(
      new DurationRefVal(duration(BigInt(-42)))
    );
    expect(
      new DurationRefVal(durationFromNanos(MIN_INT64)).negate()
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
  });

  it('durationGetHours', () => {
    expect(
      new DurationRefVal(duration(BigInt(7506)))
        .receive(TIME_GET_HOURS_OVERLOAD, DURATION_TO_HOURS_OVERLOAD, [])
        .value()
    ).toStrictEqual(new IntRefVal(BigInt(2)).value());
  });

  it('durationGetMinutes', () => {
    expect(
      new DurationRefVal(duration(BigInt(7506)))
        .receive(TIME_GET_MINUTES_OVERLOAD, DURATION_TO_MINUTES_OVERLOAD, [])
        .value()
    ).toStrictEqual(new IntRefVal(BigInt(125)).value());
  });

  it('durationGetSeconds', () => {
    expect(
      new DurationRefVal(duration(BigInt(7506)))
        .receive(TIME_GET_SECONDS_OVERLOAD, DURATION_TO_SECONDS_OVERLOAD, [])
        .value()
    ).toStrictEqual(new IntRefVal(BigInt(7506)).value());
  });

  it('durationGetMilliseconds', () => {
    expect(
      new DurationRefVal(duration(BigInt(7506)))
        .receive(
          TIME_GET_MILLISECONDS_OVERLOAD,
          DURATION_TO_MILLISECONDS_OVERLOAD,
          []
        )
        .value()
    ).toStrictEqual(new IntRefVal(BigInt(7506000)).value());
  });

  it('subtractDurationValue', () => {
    expect(
      new DurationRefVal(duration(BigInt(42))).subtract(
        new DurationRefVal(duration(BigInt(43)))
      )
    ).toStrictEqual(new DurationRefVal(duration(BigInt(-1))));
    expect(
      new DurationRefVal(duration(MAX_INT64)).subtract(
        new DurationRefVal(duration(BigInt(0), -1))
      )
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
    expect(
      new DurationRefVal(duration(MAX_INT64)).subtract(
        new DurationRefVal(duration(BigInt(-1)))
      )
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
    expect(
      new DurationRefVal(duration(MIN_INT64)).subtract(
        new DurationRefVal(duration(BigInt(0), 1))
      )
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
    expect(
      new DurationRefVal(duration(MIN_INT64)).subtract(
        new DurationRefVal(duration(BigInt(1)))
      )
    ).toStrictEqual(ErrorRefVal.errIntOverflow);
    // TODO: timestamps
  });

  it('durationValueIsZero', () => {
    expect(new DurationRefVal(duration(BigInt(0))).isZeroValue()).toEqual(true);
    expect(new DurationRefVal(duration(BigInt(1))).isZeroValue()).toEqual(
      false
    );
  });
});
