import { isFalsy } from './isFalsy';
import { testValues } from './test-utils.spec';

export const falsyValues = [
  'emptyString',
  'false',
  'NaN',
  'negativeZero',
  'null',
  'undefined',
  'zero',
  'zeroBigInt',
];

describe('isFalsy', () => {
  it('should be a function', () => {
    expect(typeof isFalsy).toEqual('function');
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testValues(isFalsy, falsyValues as any);
});
