import {
  assertEmptyObject,
  isEmptyObject,
  validateEmptyObject,
} from './isEmptyObject';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const emptyObjectValues: (keyof typeof values)[] = [
  'emptyObject',
  'frozenEmptyObject',
  'sealedEmptyObject',
];

describe('isEmptyObject', () => {
  it('should be a function', () => {
    expect(typeof isEmptyObject).toEqual('function');
  });

  testIsAgainstValues(isEmptyObject, emptyObjectValues);

  testValidateAgainstValues(validateEmptyObject, emptyObjectValues);

  testAssertAgainstValues(assertEmptyObject, emptyObjectValues);
});
