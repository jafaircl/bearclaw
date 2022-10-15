import { isNil } from './isNil';
import { testValues } from './test-utils.spec';

describe('isNil', () => {
  it('should be a function', () => {
    expect(typeof isNil).toEqual('function');
  });

  testValues(isNil, ['null', 'undefined', 'void0']);
});
