import { isArray } from './isArray';
import { testValues } from './test-utils.spec';

describe('isArray', () => {
  it('should be a function', () => {
    expect(typeof isArray).toEqual('function');
  });

  testValues(isArray, ['arrayOfObjects', 'arrayOfPrimitives', 'emptyArray']);
});
