import {
  assertDateObject,
  isDateObject,
  validateDateObject,
} from './isDateObject';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const dateObjectValues: (keyof typeof values)[] = ['dateObject'];

describe('isDateObject', () => {
  it('should be a function', () => {
    expect(typeof isDateObject).toEqual('function');
  });

  testIsAgainstValues(isDateObject, dateObjectValues);

  testValidateAgainstValues(validateDateObject, dateObjectValues);

  testAssertAgainstValues(assertDateObject, dateObjectValues);
});
