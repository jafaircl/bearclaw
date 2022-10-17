import { assertBindable, isBindable, validateBindable } from './isBindable';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const bindableValues: (keyof typeof values)[] = [
  'arrayCtor',
  'bigIntCtor',
  'booleanCtor',
  'classCtor',
  'dateCtor',
  'generatorFunction',
  'mapCtor',
  'numberCtor',
  'promiseCtor',
  'setCtor',
  'stringCtor',
  'symbolCtor',
  'traditionalFunction',
  'weakMapCtor',
  'weakSetCtor',
  // TODO: this should be true but is false in a jest environment. Working
  // theory: babel is transforming this function to a normal function that
  // returns a promise which breaks this validation. By all manual testing,
  // this function works as expected for traditional async functions.
  // See https://codesandbox.io/s/clever-ives-nm61c?file=/src/index.ts
  // 'asyncTraditionalFunction',
];

describe('isBindable', () => {
  it('should be a function', () => {
    expect(typeof isBindable).toEqual('function');
  });

  testIsAgainstValues(isBindable, bindableValues);

  testValidateAgainstValues(validateBindable, bindableValues);

  testAssertAgainstValues(assertBindable, bindableValues);
});
