import { isNullOrUndefined } from './isNullOrUndefined';
import { testValues } from './test-utils.spec';

describe('isNullOrUndefined', () => {
  it('should be a function', () => {
    expect(typeof isNullOrUndefined).toEqual('function');
  });

  testValues(isNullOrUndefined, ['null', 'undefined']);
});
