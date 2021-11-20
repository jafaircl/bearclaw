import { isString } from './isString';
import { testValues } from './test-utils.spec';

describe('isString', () => {
  it('should be a function', () => {
    expect(typeof isString).toEqual('function');
  });

  testValues(isString, ['emptyString', 'string', 'stringObject']);
});
