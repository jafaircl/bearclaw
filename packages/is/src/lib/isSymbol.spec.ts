import { isSymbol } from './isSymbol';
import { testValues } from './test-utils.spec';

describe('isString', () => {
  it('should be a function', () => {
    expect(typeof isSymbol).toEqual('function');
  });

  testValues(isSymbol, ['symbol']);
});
