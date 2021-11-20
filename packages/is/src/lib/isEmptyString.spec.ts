import { isEmptyString } from './isEmptyString';
import { testValues } from './test-utils.spec';

describe('isEmptyString', () => {
  it('should be a function', () => {
    expect(typeof isEmptyString).toEqual('function');
  });

  testValues(isEmptyString, ['emptyString']);
});
