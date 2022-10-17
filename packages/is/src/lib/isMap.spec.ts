import { assertMap, isMap, validateMap } from './isMap';
import {
  testAssertAgainstValues,
  testIsAgainstValues,
  testValidateAgainstValues,
  values,
} from './test-utils.spec';

export const mapValues: (keyof typeof values)[] = ['emptyMap', 'map'];

describe('isMap', () => {
  it('should be a function', () => {
    expect(typeof isMap).toEqual('function');
  });

  testIsAgainstValues(isMap, mapValues);

  testValidateAgainstValues(validateMap, mapValues);

  testAssertAgainstValues(assertMap, mapValues);
});
