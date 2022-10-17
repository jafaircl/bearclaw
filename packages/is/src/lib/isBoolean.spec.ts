import { assertBoolean, isBoolean, validateBoolean } from './isBoolean';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const booleanValues: (keyof typeof values)[] = [
  'booleanObject',
  'false',
  'true',
];

describe('isBoolean', () => {
  it('should be a function', () => {
    expect(typeof isBoolean).toEqual('function');
  });

  testIsAgainstValues(isBoolean, booleanValues);

  testValidateAgainstValues(validateBoolean, booleanValues);

  testAssertAgainstValues(assertBoolean, booleanValues);
});
