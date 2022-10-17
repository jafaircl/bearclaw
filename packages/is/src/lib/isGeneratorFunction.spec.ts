import {
  assertGeneratorFunction,
  isGeneratorFunction,
  validateGeneratorFunction,
} from './isGeneratorFunction';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const generatorFunctionValues: (keyof typeof values)[] = [
  'generatorFunction',
];

describe('isGeneratorFunction', () => {
  it('should be a function', () => {
    expect(typeof isGeneratorFunction).toEqual('function');
  });

  testIsAgainstValues(isGeneratorFunction, generatorFunctionValues);

  testValidateAgainstValues(validateGeneratorFunction, generatorFunctionValues);

  testAssertAgainstValues(assertGeneratorFunction, generatorFunctionValues);
});
