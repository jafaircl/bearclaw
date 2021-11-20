import { isBigInt } from './isBigInt';
import { testValues } from './test-utils.spec';

describe('isBigInt', () => {
  it('should be a function', () => {
    expect(typeof isBigInt).toEqual('function');
  });

  testValues(isBigInt, ['bigIntObject', 'zeroBigInt']);
});
