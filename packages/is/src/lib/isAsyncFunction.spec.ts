import { isAsyncFunction } from './isAsyncFunction';
import { testValues } from './test-utils.spec';

describe('isAsyncFunction', () => {
  it('should be a function', () => {
    expect(typeof isAsyncFunction).toEqual('function');
  });

  testValues(isAsyncFunction, [
    'asyncArrowFunction',
    'asyncTraditionalFunction',
  ]);
});
