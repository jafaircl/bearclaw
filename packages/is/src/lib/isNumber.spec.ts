import { assertNumber, isNumber, validateNumber } from './isNumber';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const numberValues: (keyof typeof values)[] = [
  'dateNow',
  'infinity',
  'infinityNegative',
  'NaN',
  'negativeZero',
  'number',
  'numberObject',
  'zero',
];

describe('isNumber', () => {
  it('should be a function', () => {
    expect(typeof isNumber).toEqual('function');
  });

  testIsAgainstValues(isNumber, numberValues);

  testValidateAgainstValues(validateNumber, numberValues);

  testAssertAgainstValues(assertNumber, numberValues);
});
