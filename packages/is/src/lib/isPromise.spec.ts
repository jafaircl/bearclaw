import { assertPromise, isPromise, validatePromise } from './isPromise';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const promiseValues: (keyof typeof values)[] = [
  'promiseNew',
  'promiseResolve',
];

describe('isPromise', () => {
  it('should be a function', () => {
    expect(typeof isPromise).toEqual('function');
  });

  testIsAgainstValues(isPromise, promiseValues);

  testValidateAgainstValues(validatePromise, promiseValues);

  testAssertAgainstValues(assertPromise, promiseValues);
});
