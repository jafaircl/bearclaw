import { assertFalsy, isFalsy, validateFalsy } from './isFalsy';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const falsyValues: (keyof typeof values)[] = [
  'emptyString',
  'false',
  'NaN',
  'negativeZero',
  'null',
  'undefined',
  'void0',
  'zero',
  'zeroBigInt',
];

describe('isFalsy', () => {
  it('should be a function', () => {
    expect(typeof isFalsy).toEqual('function');
  });

  testIsAgainstValues(isFalsy, falsyValues);

  testValidateAgainstValues(validateFalsy, falsyValues);

  testAssertAgainstValues(assertFalsy, falsyValues);
});
