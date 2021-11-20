import { isWeakMap } from './isWeakMap';
import { testValues } from './test-utils.spec';

describe('isWeakMap', () => {
  it('should be a function', () => {
    expect(typeof isWeakMap).toEqual('function');
  });

  testValues(isWeakMap, ['emptyWeakMap', 'weakMap']);
});
