import { isNumber } from './isNumber';
import { testValues } from './test-utils.spec';

describe('isNumber', () => {
  it('should be a function', () => {
    expect(typeof isNumber).toEqual('function');
  });

  testValues(isNumber, [
    'dateNow',
    'infinity',
    'infinityNegative',
    'NaN',
    'negativeZero',
    'number',
    'numberObject',
    'zero',
  ]);
});
