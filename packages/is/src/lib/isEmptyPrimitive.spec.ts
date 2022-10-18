import {
  assertEmptyPrimitive,
  isEmptyPrimitive,
  validateEmptyPrimitive,
} from './isEmptyPrimitive';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const emptyPrimitiveValues: (keyof typeof values)[] = [
  'emptyString',
  'NaN',
  'null',
  'undefined',
  'void0',
];

describe('isEmptyPrimitive', () => {
  it('should be a function', () => {
    expect(typeof isEmptyPrimitive).toEqual('function');
  });

  testIsAgainstValues(isEmptyPrimitive, emptyPrimitiveValues);

  testValidateAgainstValues(validateEmptyPrimitive, emptyPrimitiveValues);

  testAssertAgainstValues(assertEmptyPrimitive, emptyPrimitiveValues);
});
