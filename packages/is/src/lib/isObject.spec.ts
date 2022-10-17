import { assertObject, isObject, validateObject } from './isObject';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const objectValues: (keyof typeof values)[] = [
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
];

describe('isObject', () => {
  it('should be a function', () => {
    expect(typeof isObject).toEqual('function');
  });

  testIsAgainstValues(isObject, objectValues);

  testValidateAgainstValues(validateObject, objectValues);

  testAssertAgainstValues(assertObject, objectValues);
});
