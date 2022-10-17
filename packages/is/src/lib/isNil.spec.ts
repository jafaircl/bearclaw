import { assertNil, isNil, validateNil } from './isNil';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const nilValues: (keyof typeof values)[] = [
  'null',
  'undefined',
  'void0',
];

describe('isNil', () => {
  it('should be a function', () => {
    expect(typeof isNil).toEqual('function');
  });

  testIsAgainstValues(isNil, nilValues);

  testValidateAgainstValues(validateNil, nilValues);

  testAssertAgainstValues(assertNil, nilValues);
});
