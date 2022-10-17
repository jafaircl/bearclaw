import {
  assertEmptyArray,
  isEmptyArray,
  validateEmptyArray,
} from './isEmptyArray';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const emptyArrayValues: (keyof typeof values)[] = ['emptyArray'];

describe('isEmptyArray', () => {
  it('should be a function', () => {
    expect(typeof isEmptyArray).toEqual('function');
  });

  testIsAgainstValues(isEmptyArray, emptyArrayValues);

  testValidateAgainstValues(validateEmptyArray, emptyArrayValues);

  testAssertAgainstValues(assertEmptyArray, emptyArrayValues);
});
