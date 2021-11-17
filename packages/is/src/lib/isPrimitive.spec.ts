import { isPrimitive } from './isPrimitive';
import { testValues } from './test-utils.spec';

describe('isPrimitive', () => {
  it('should be a function', () => {
    expect(typeof isPrimitive).toEqual('function');
  });

  testValues(isPrimitive, [
    'bigIntObject',
    'booleanObject',
    'dateNow',
    'emptyString',
    'false',
    'infinity',
    'infinityNegative',
    'NaN',
    'null',
    'number',
    'numberObject',
    'string',
    'stringObject',
    'symbol',
    'true',
    'undefined',
    'zero',
  ]);
});
