import {
  assertEmptyString,
  isEmptyString,
  validateEmptyString,
} from './isEmptyString';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const emptyStringValues: (keyof typeof values)[] = ['emptyString'];

describe('isEmptyString', () => {
  it('should be a function', () => {
    expect(typeof isEmptyString).toEqual('function');
  });

  testIsAgainstValues(isEmptyString, emptyStringValues);

  testValidateAgainstValues(validateEmptyString, emptyStringValues);

  testAssertAgainstValues(assertEmptyString, emptyStringValues);
});
