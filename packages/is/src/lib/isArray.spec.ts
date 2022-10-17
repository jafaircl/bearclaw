import { assertArray, isArray, validateArray } from './isArray';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const arrayValues: (keyof typeof values)[] = [
  'arrayOfObjects',
  'arrayOfPrimitives',
  'emptyArray',
];

describe('isArray', () => {
  it('should be a function', () => {
    expect(typeof isArray).toEqual('function');
  });

  testIsAgainstValues(isArray, arrayValues);

  testValidateAgainstValues(validateArray, arrayValues);

  testAssertAgainstValues(assertArray, arrayValues);
});
