import { isBoolean } from './isBoolean';
import { testValues } from './test-utils.spec';

describe('isBoolean', () => {
  it('should be a function', () => {
    expect(typeof isBoolean).toEqual('function');
  });

  testValues(isBoolean, ['booleanObject', 'false', 'true']);
});
