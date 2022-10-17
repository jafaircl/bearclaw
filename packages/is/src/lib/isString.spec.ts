import { assertString, isString, validateString } from './isString';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const stringValues: (keyof typeof values)[] = [
  'emptyString',
  'string',
  'stringObject',
];

describe('isString', () => {
  it('should be a function', () => {
    expect(typeof isString).toEqual('function');
  });

  testIsAgainstValues(isString, stringValues);

  testValidateAgainstValues(validateString, stringValues);

  testAssertAgainstValues(assertString, stringValues);
});
