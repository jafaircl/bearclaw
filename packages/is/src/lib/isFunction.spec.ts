import { isFunction } from './isFunction';
import { testValues } from './test-utils.spec';

describe('isFunction', () => {
  it('should be a function', () => {
    expect(typeof isFunction).toEqual('function');
  });

  testValues(isFunction, [
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
  ]);
});
