import { isFunction } from './isFunction';
import { testValues } from './test-utils.spec';

describe('isFunction', () => {
  it('should be a function', () => {
    expect(typeof isFunction).toEqual('function');
  });

  testValues(isFunction, [
    'arrayCtor',
    'arrowFunction',
    'bigIntCtor',
    'booleanCtor',
    'mapCtor',
    'numberCtor',
    'setCtor',
    'stringCtor',
    'symbolCtor',
    'traditionalFunction',
  ]);
});
