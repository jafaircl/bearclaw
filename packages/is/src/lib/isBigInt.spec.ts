import { assertBigInt, isBigInt, validateBigInt } from './isBigInt';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const bigIntValues: (keyof typeof values)[] = [
  'bigIntObject',
  'zeroBigInt',
];

describe('isBigInt', () => {
  it('should be a function', () => {
    expect(typeof isBigInt).toEqual('function');
  });

  testIsAgainstValues(isBigInt, bigIntValues);

  testValidateAgainstValues(validateBigInt, bigIntValues);

  testAssertAgainstValues(assertBigInt, bigIntValues);
});
