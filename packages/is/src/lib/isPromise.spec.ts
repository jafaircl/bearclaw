import { isPromise } from './isPromise';
import { testValues } from './test-utils.spec';

describe('isPromise', () => {
  it('should be a function', () => {
    expect(typeof isPromise).toEqual('function');
  });

  testValues(isPromise, ['promiseNew', 'promiseResolve']);
});
