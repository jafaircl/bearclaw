import { isBoundFunction } from './isBoundFunction';
import { testValues } from './test-utils.spec';

describe('isBoundFunction', () => {
  it('should be a function', () => {
    expect(typeof isBoundFunction).toEqual('function');
  });

  testValues(isBoundFunction, [
    'arrowFunction',
    'asyncArrowFunction',
    'boundFunction',
    // TODO: this should be false but is true in a jest environment. Working
    // theory: babel is transforming this function to a normal function that
    // returns a promise which breaks this validation. By all manual testing,
    // this function works as expected for traditional async functions.
    // See https://codesandbox.io/s/clever-ives-nm61c?file=/src/index.ts
    'asyncTraditionalFunction',
  ]);
});
