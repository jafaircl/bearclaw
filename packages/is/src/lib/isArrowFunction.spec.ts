import {
  assertArrowFunction,
  isArrowFunction,
  validateArrowFunction,
} from './isArrowFunction';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const arrowFunctionValues: (keyof typeof values)[] = [
  'arrowFunction',
  'asyncArrowFunction',
];

describe('isArrowFunction', () => {
  it('should be a function', () => {
    expect(typeof isArrowFunction).toEqual('function');
  });

  testIsAgainstValues(isArrowFunction, arrowFunctionValues);

  testValidateAgainstValues(validateArrowFunction, arrowFunctionValues);

  testAssertAgainstValues(assertArrowFunction, arrowFunctionValues);
});
