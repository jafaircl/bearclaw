import { assertSymbol, isSymbol, validateSymbol } from './isSymbol';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const symbolValues: (keyof typeof values)[] = ['symbol'];

describe('isString', () => {
  it('should be a function', () => {
    expect(typeof isSymbol).toEqual('function');
  });

  testIsAgainstValues(isSymbol, symbolValues);

  testValidateAgainstValues(validateSymbol, symbolValues);

  testAssertAgainstValues(assertSymbol, symbolValues);
});
