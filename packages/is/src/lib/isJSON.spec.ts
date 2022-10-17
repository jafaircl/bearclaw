import { assertJSON, isJSON, validateJSON } from './isJSON';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const jsonValues: (keyof typeof values)[] = [
  'arrayOfObjects',
  'arrayOfPrimitives',
  'booleanObject',
  'dateNow',
  'emptyArray',
  'emptyObject',
  'emptyString',
  'false',
  'frozenEmptyObject',
  'frozenObject',
  'negativeZero',
  'nonEmptyObject',
  'null',
  'number',
  'numberObject',
  'sealedEmptyObject',
  'sealedObject',
  'string',
  'stringObject',
  'true',
  'zero',
];

describe('isJSON', () => {
  it('should be a function', () => {
    expect(typeof isJSON).toEqual('function');
  });

  testIsAgainstValues(isJSON, jsonValues);

  testValidateAgainstValues(validateJSON, jsonValues);

  testAssertAgainstValues(assertJSON, jsonValues);
});
