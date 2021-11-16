import { isPlainObject } from './isPlainObject';
import { testValues } from './test-utils.spec';

describe('isPlainObject', () => {
  it('should be a function', () => {
    expect(typeof isPlainObject).toEqual('function');
  });

  testValues(isPlainObject, ['emptyObject']);
});
