import { assertUndefined, isUndefined, validateUndefined } from './isUndefined';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const undefinedValues: (keyof typeof values)[] = ['undefined', 'void0'];

describe('isUndefined', () => {
  it('should be a function', () => {
    expect(typeof isUndefined).toEqual('function');
  });

  testIsAgainstValues(isUndefined, undefinedValues);

  testValidateAgainstValues(validateUndefined, undefinedValues);

  testAssertAgainstValues(assertUndefined, undefinedValues);
});
