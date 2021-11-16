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
    'emptyArray',
    'emptyObject',
    'emptyString',
    'false',
    'null',
    'number',
    'numberObject',
    'string',
    'stringObject',
    'true',
    'zero',
  ]);
});
