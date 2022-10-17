import { falsyValues } from './isFalsy.spec';
import { assertTruthy, isTruthy, validateTruthy } from './isTruthy';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const truthyValues: (keyof typeof values)[] = Object.keys(values).filter(
  (key: keyof typeof values) => falsyValues.indexOf(key) === -1
) as (keyof typeof values)[];

describe('isTruthy', () => {
  it('should be a function', () => {
    expect(typeof isTruthy).toEqual('function');
  });

  testIsAgainstValues(isTruthy, truthyValues);

  testValidateAgainstValues(validateTruthy, truthyValues);

  testAssertAgainstValues(assertTruthy, truthyValues);
});
