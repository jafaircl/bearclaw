import { isMap } from './isMap';
import { testValues } from './test-utils.spec';

describe('isMap', () => {
  it('should be a function', () => {
    expect(typeof isMap).toEqual('function');
  });

  testValues(isMap, ['emptyMap', 'map']);
});
