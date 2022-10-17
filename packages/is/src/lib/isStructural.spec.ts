import { primitiveValues } from './isPrimitive.spec';
import {
  assertStructural,
  isStructural,
  validateStructural,
} from './isStructural';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const structuralValues: (keyof typeof values)[] = Object.keys(
  values
).filter(
  (key: keyof typeof values) => primitiveValues.indexOf(key) === -1
) as (keyof typeof values)[];

describe('isStructural', () => {
  it('should be a function', () => {
    expect(typeof isStructural).toEqual('function');
  });

  testIsAgainstValues(isStructural, structuralValues);

  testValidateAgainstValues(validateStructural, structuralValues);

  testAssertAgainstValues(assertStructural, structuralValues);
});
