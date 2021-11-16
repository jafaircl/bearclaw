import { isSet } from './isSet';
import { testValues } from './test-utils.spec';

describe('isSet', () => {
  it('should be a function', () => {
    expect(typeof isSet).toEqual('function');
  });

  testValues(isSet, ['emptySet', 'set']);
});
