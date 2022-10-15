import { isUndefined } from './isUndefined';
import { testValues } from './test-utils.spec';

describe('isUndefined', () => {
  it('should be a function', () => {
    expect(typeof isUndefined).toEqual('function');
  });

  testValues(isUndefined, ['undefined', 'void0']);
});
