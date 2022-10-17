import { assertWeakMap, isWeakMap, validateWeakMap } from './isWeakMap';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const weakMapValues: (keyof typeof values)[] = [
  'emptyWeakMap',
  'weakMap',
];

describe('isWeakMap', () => {
  it('should be a function', () => {
    expect(typeof isWeakMap).toEqual('function');
  });

  testIsAgainstValues(isWeakMap, weakMapValues);

  testValidateAgainstValues(validateWeakMap, weakMapValues);

  testAssertAgainstValues(assertWeakMap, weakMapValues);
});
