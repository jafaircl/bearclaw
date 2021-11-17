import { isDateObject } from './isDateObject';
import { testValues } from './test-utils.spec';

describe('isDateObject', () => {
  it('should be a function', () => {
    expect(typeof isDateObject).toEqual('function');
  });

  testValues(isDateObject, ['dateObject']);
});
