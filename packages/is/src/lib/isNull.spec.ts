import { isNull } from './isNull';
import { testValues } from './test-utils.spec';

describe('isNull', () => {
  it('should be a function', () => {
    expect(typeof isNull).toEqual('function');
  });

  testValues(isNull, ['null']);
});
