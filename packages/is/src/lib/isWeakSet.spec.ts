import { isWeakSet } from './isWeakSet';
import { testValues } from './test-utils.spec';

describe('isWeakSet', () => {
  it('should be a function', () => {
    expect(typeof isWeakSet).toEqual('function');
  });

  testValues(isWeakSet, ['emptyWeakSet', 'weakSet']);
});
