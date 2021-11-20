import { isEmptySet } from './isEmptySet';
import { testValues } from './test-utils.spec';

describe('isEmptySet', () => {
  it('should be a function', () => {
    expect(typeof isEmptySet).toEqual('function');
  });

  testValues(isEmptySet, ['emptySet']);
});
