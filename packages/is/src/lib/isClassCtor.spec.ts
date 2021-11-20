import { isClassCtor } from './isClassCtor';
import { testValues } from './test-utils.spec';

describe('isClassCtor', () => {
  it('should be a function', () => {
    expect(typeof isClassCtor).toEqual('function');
  });

  testValues(isClassCtor, ['classCtor']);
});
