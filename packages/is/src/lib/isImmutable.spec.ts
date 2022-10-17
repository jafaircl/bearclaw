import { assertImmutable, isImmutable, validateImmutable } from './isImmutable';
import { primitiveValues } from './isPrimitive.spec';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const immutableValues: (keyof typeof values)[] = [
  ...primitiveValues,
  'frozenObject',
  'frozenEmptyObject',
  'sealedEmptyObject',
];

describe('isImmutable', () => {
  it('should be a function', () => {
    expect(typeof isImmutable).toEqual('function');
  });

  testIsAgainstValues(isImmutable, immutableValues);

  testValidateAgainstValues(validateImmutable, immutableValues);

  testAssertAgainstValues(assertImmutable, immutableValues);
});
