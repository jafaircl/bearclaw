import {
  assertPlainObject,
  isPlainObject,
  validatePlainObject,
} from './isPlainObject';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const plainObjectValues: (keyof typeof values)[] = [
  'emptyObject',
  'frozenEmptyObject',
  'frozenObject',
  'nonEmptyObject',
  'sealedEmptyObject',
  'sealedObject',
];

describe('isPlainObject', () => {
  it('should be a function', () => {
    expect(typeof isPlainObject).toEqual('function');
  });

  testIsAgainstValues(isPlainObject, plainObjectValues);

  testValidateAgainstValues(validatePlainObject, plainObjectValues);

  testAssertAgainstValues(assertPlainObject, plainObjectValues);
});
