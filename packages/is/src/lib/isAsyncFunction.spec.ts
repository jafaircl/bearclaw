import {
  assertAsyncFunction,
  isAsyncFunction,
  validateAsyncFunction,
} from './isAsyncFunction';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const asyncFunctionValues: (keyof typeof values)[] = [
  'asyncArrowFunction',
  'asyncTraditionalFunction',
];

describe('isAsyncFunction', () => {
  it('should be a function', () => {
    expect(typeof isAsyncFunction).toEqual('function');
  });

  testIsAgainstValues(isAsyncFunction, asyncFunctionValues);

  testValidateAgainstValues(validateAsyncFunction, asyncFunctionValues);

  testAssertAgainstValues(assertAsyncFunction, asyncFunctionValues);
});
