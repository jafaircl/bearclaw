import { emptyArrayValues } from './isEmptyArray.spec';
import { emptyMapValues } from './isEmptyMap.spec';
import { emptyObjectValues } from './isEmptyObject.spec';
import { emptySetValues } from './isEmptySet.spec';
import {
  assertEmptyStructural,
  isEmptyStructural,
  validateEmptyStructural,
} from './isEmptyStructural';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const emptyStructuralValues: (keyof typeof values)[] = [
  ...emptyArrayValues,
  ...emptyMapValues,
  ...emptyObjectValues,
  ...emptySetValues,
];

describe('isEmptyStructural', () => {
  it('should be a function', () => {
    expect(typeof isEmptyStructural).toEqual('function');
  });

  testIsAgainstValues(isEmptyStructural, emptyStructuralValues);

  testValidateAgainstValues(validateEmptyStructural, emptyStructuralValues);

  testAssertAgainstValues(assertEmptyStructural, emptyStructuralValues);
});
