import { isEmptyMap } from './isEmptyMap';
import { testValues } from './test-utils.spec';

describe('isEmptyMap', () => {
  it('should be a function', () => {
    expect(typeof isEmptyMap).toEqual('function');
  });

  testValues(isEmptyMap, ['emptyMap']);
});
