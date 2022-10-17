import { assertEmptyMap, isEmptyMap, validateEmptyMap } from './isEmptyMap';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const emptyMapValues: (keyof typeof values)[] = ['emptyMap'];

describe('isEmptyMap', () => {
  it('should be a function', () => {
    expect(typeof isEmptyMap).toEqual('function');
  });

  testIsAgainstValues(isEmptyMap, emptyMapValues);

  testValidateAgainstValues(validateEmptyMap, emptyMapValues);

  testAssertAgainstValues(assertEmptyMap, emptyMapValues);
});
