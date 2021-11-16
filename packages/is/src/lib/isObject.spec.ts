import { isObject } from './isObject';
import { testValues } from './test-utils.spec';

describe('isObject', () => {
  it('should be a function', () => {
    expect(typeof isObject).toEqual('function');
  });

  testValues(isObject, [
    'arrayOfObjects',
    'arrayOfPrimitives',
    'emptyArray',
    'emptyMap',
    'emptyObject',
    'emptySet',
    'map',
    'numberObject',
    'set',
    'stringObject',
  ]);
});
