import { isPrimitive } from './isPrimitive';
import { testValues } from './test-utils.spec';

export const primitiveValues = [
  'bigIntObject',
  'booleanObject',
  'dateNow',
  'emptyString',
  'false',
  'infinity',
  'infinityNegative',
  'NaN',
  'negativeZero',
  'null',
  'number',
  'numberObject',
  'string',
  'stringObject',
  'symbol',
  'true',
  'undefined',
  'zero',
  'zeroBigInt',
];

describe('isPrimitive', () => {
  it('should be a function', () => {
    expect(typeof isPrimitive).toEqual('function');
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testValues(isPrimitive, primitiveValues as any);
});
