import { assertFunction, isFunction, validateFunction } from './isFunction';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const functionValues: (keyof typeof values)[] = [
  'arrayCtor',
  'arrowFunction',
  'asyncArrowFunction',
  'asyncTraditionalFunction',
  'bigIntCtor',
  'booleanCtor',
  'boundFunction',
  'classCtor',
  'dateCtor',
  'generatorFunction',
  'mapCtor',
  'numberCtor',
  'promiseCtor',
  'setCtor',
  'stringCtor',
  'symbolCtor',
  'traditionalFunction',
  'weakMapCtor',
  'weakSetCtor',
];

describe('isFunction', () => {
  it('should be a function', () => {
    expect(typeof isFunction).toEqual('function');
  });

  testIsAgainstValues(isFunction, functionValues);

  testValidateAgainstValues(validateFunction, functionValues);

  testAssertAgainstValues(assertFunction, functionValues);
});
