import { isEmptyObject } from './isEmptyObject';
import { testValues } from './test-utils.spec';

describe('isEmptyObject', () => {
  it('should be a function', () => {
    expect(typeof isEmptyObject).toEqual('function');
  });

  testValues(isEmptyObject, [
    'emptyObject',
    'frozenEmptyObject',
    'sealedEmptyObject',
  ]);
});
