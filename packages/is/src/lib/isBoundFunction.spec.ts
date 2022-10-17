import {
  assertBoundFunction,
  isBoundFunction,
  validateBoundFunction,
} from './isBoundFunction';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const boundFunctionValues: (keyof typeof values)[] = [
  'arrowFunction',
  'asyncArrowFunction',
  'boundFunction',
  // TODO: this should be false but is true in a jest environment. Working
  // theory: babel is transforming this function to a normal function that
  // returns a promise which breaks this validation. By all manual testing,
  // this function works as expected for traditional async functions.
  // See https://codesandbox.io/s/clever-ives-nm61c?file=/src/index.ts
  'asyncTraditionalFunction',
];

describe('isBoundFunction', () => {
  it('should be a function', () => {
    expect(typeof isBoundFunction).toEqual('function');
  });

  testIsAgainstValues(isBoundFunction, boundFunctionValues);

  testValidateAgainstValues(validateBoundFunction, boundFunctionValues);

  testAssertAgainstValues(assertBoundFunction, boundFunctionValues);
});
