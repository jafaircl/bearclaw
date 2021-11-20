import { isJSON } from './isJSON';
import { testValues } from './test-utils.spec';

describe('isJSON', () => {
  it('should be a function', () => {
    expect(typeof isJSON).toEqual('function');
  });

  testValues(isJSON, [
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
  ]);
});
