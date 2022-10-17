import { assertEmptySet, isEmptySet, validateEmptySet } from './isEmptySet';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const emptySetValues: (keyof typeof values)[] = ['emptySet'];

describe('isEmptySet', () => {
  it('should be a function', () => {
    expect(typeof isEmptySet).toEqual('function');
  });

  testIsAgainstValues(isEmptySet, emptySetValues);

  testValidateAgainstValues(validateEmptySet, emptySetValues);

  testAssertAgainstValues(assertEmptySet, emptySetValues);
});
