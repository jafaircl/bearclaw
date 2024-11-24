import { BoolRefVal } from './bool';
import { DoubleRefVal } from './double';
import { ErrorRefVal } from './error';
import { IntRefVal } from './int';
import { OptionalNone, OptionalRefVal, OptionalType } from './optional';
import { StringRefVal } from './string';
import { TypeType } from './types';

describe('Optional', () => {
  it('getValue', () => {
    expect(new OptionalRefVal(IntRefVal.IntOne).getValue()).toStrictEqual(
      IntRefVal.IntOne
    );
    expect(OptionalNone.getValue()).toStrictEqual(
      new ErrorRefVal('optional.none() dereference')
    );
  });

  it('convertToNative', () => {
    expect(OptionalNone.convertToNative(IntRefVal)).toStrictEqual(
      new ErrorRefVal('optional.none() dereference')
    );
    expect(
      new OptionalRefVal(new StringRefVal('hello')).convertToNative(String)
    ).toStrictEqual('hello');
  });

  it('convertToType', () => {
    expect(OptionalNone.convertToType(OptionalType)).toStrictEqual(
      new OptionalRefVal()
    );
    expect(OptionalNone.convertToType(TypeType)).toStrictEqual(OptionalType);
  });

  it('equal', () => {
    const testCases = [
      {
        a: OptionalNone,
        b: OptionalNone,
        out: true,
      },
      {
        a: IntRefVal.IntOne,
        b: OptionalNone,
        out: false,
      },
      {
        a: new OptionalRefVal(IntRefVal.IntOne),
        b: OptionalNone,
        out: false,
      },
      {
        a: OptionalNone,
        b: new OptionalRefVal(IntRefVal.IntOne),
        out: false,
      },
      {
        a: new OptionalRefVal(IntRefVal.IntOne),
        b: new OptionalRefVal(new DoubleRefVal(0.0)),
        out: false,
      },
      {
        a: new OptionalRefVal(IntRefVal.IntOne),
        b: new OptionalRefVal(new DoubleRefVal(1.0)),
        out: true,
      },
    ];
    for (const testCase of testCases) {
      expect(testCase.a.equal(testCase.b).value()).toStrictEqual(testCase.out);
    }
  });

  it('type', () => {
    expect(new OptionalRefVal(BoolRefVal.False).type()).toStrictEqual(
      OptionalType
    );
  });

  it('value', () => {
    expect(new OptionalRefVal(BoolRefVal.False).value()).toEqual(false);
    expect(OptionalNone.value()).toBeNull();
  });
});
