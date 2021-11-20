import { isObject } from './isObject';
import { testValues } from './test-utils.spec';

describe('isObject', () => {
  it('should be a function', () => {
    expect(typeof isObject).toEqual('function');
  });

  testValues(isObject, [
    'arrayOfObjects',
    'arrayOfPrimitives',
    'dateObject',
    'emptyArray',
    'emptyMap',
    'emptyObject',
    'emptySet',
    'emptyWeakMap',
    'emptyWeakSet',
    'frozenEmptyObject',
    'frozenObject',
    'map',
    'nonEmptyObject',
    'numberObject',
    'promiseNew',
    'promiseResolve',
    'sealedEmptyObject',
    'sealedObject',
    'set',
    'stringObject',
    'weakMap',
    'weakSet',
  ]);
});
