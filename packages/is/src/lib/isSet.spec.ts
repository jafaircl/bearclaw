import { assertSet, isSet, validateSet } from './isSet';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const setValues: (keyof typeof values)[] = ['emptySet', 'set'];

describe('isSet', () => {
  it('should be a function', () => {
    expect(typeof isSet).toEqual('function');
  });

  testIsAgainstValues(isSet, setValues);

  testValidateAgainstValues(validateSet, setValues);

  testAssertAgainstValues(assertSet, setValues);
});
