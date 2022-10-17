import { assertClassCtor, isClassCtor, validateClassCtor } from './isClassCtor';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const classCtorValues: (keyof typeof values)[] = ['classCtor'];

describe('isClassCtor', () => {
  it('should be a function', () => {
    expect(typeof isClassCtor).toEqual('function');
  });

  testIsAgainstValues(isClassCtor, classCtorValues);

  testValidateAgainstValues(validateClassCtor, classCtorValues);

  testAssertAgainstValues(assertClassCtor, classCtorValues);
});
