import { assertNull, isNull, validateNull } from './isNull';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const nullValues: (keyof typeof values)[] = ['null'];

describe('isNull', () => {
  it('should be a function', () => {
    expect(typeof isNull).toEqual('function');
  });

  testIsAgainstValues(isNull, nullValues);

  testValidateAgainstValues(validateNull, nullValues);

  testAssertAgainstValues(assertNull, nullValues);
});
