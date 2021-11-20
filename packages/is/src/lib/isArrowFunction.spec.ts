import { isArrowFunction } from './isArrowFunction';
import { testValues } from './test-utils.spec';

describe('isArrowFunction', () => {
  it('should be a function', () => {
    expect(typeof isArrowFunction).toEqual('function');
  });

  testValues(isArrowFunction, ['arrowFunction', 'asyncArrowFunction']);
});
