import { assertPrimitive, isPrimitive, validatePrimitive } from './isPrimitive';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const primitiveValues: (keyof typeof values)[] = [
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
  'void0',
  'zero',
  'zeroBigInt',
];

describe('isPrimitive', () => {
  it('should be a function', () => {
    expect(typeof isPrimitive).toEqual('function');
  });

  testIsAgainstValues(isPrimitive, primitiveValues);

  testValidateAgainstValues(validatePrimitive, primitiveValues);

  testAssertAgainstValues(assertPrimitive, primitiveValues);
});
