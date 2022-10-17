import { assertWeakSet, isWeakSet, validateWeakSet } from './isWeakSet';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const weakSetValues: (keyof typeof values)[] = [
  'emptyWeakSet',
  'weakSet',
];

describe('isWeakSet', () => {
  it('should be a function', () => {
    expect(typeof isWeakSet).toEqual('function');
  });

  testIsAgainstValues(isWeakSet, weakSetValues);

  testValidateAgainstValues(validateWeakSet, weakSetValues);

  testAssertAgainstValues(assertWeakSet, weakSetValues);
});
