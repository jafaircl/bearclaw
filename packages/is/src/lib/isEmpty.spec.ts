import { assertEmpty, isEmpty, validateEmpty } from './isEmpty';
import { emptyPrimitiveValues } from './isEmptyPrimitive.spec';
import { emptyStructuralValues } from './isEmptyStructural.spec';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const emptyValues: (keyof typeof values)[] = [
  ...emptyPrimitiveValues,
  ...emptyStructuralValues,
];

describe('isEmpty', () => {
  it('should be a function', () => {
    expect(typeof isEmpty).toEqual('function');
  });

  testIsAgainstValues(isEmpty, emptyValues);

  testValidateAgainstValues(validateEmpty, emptyValues);

  testAssertAgainstValues(assertEmpty, emptyValues);
});
