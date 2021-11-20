import { isEmptyArray } from './isEmptyArray';
import { testValues } from './test-utils.spec';

describe('isEmptyArray', () => {
  it('should be a function', () => {
    expect(typeof isEmptyArray).toEqual('function');
  });

  testValues(isEmptyArray, ['emptyArray']);
});
