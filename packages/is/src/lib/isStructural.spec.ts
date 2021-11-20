import { primitiveValues } from './isPrimitive.spec';
import { isStructural } from './isStructural';
import { testValues, values } from './test-utils.spec';

describe('isStructural', () => {
  it('should be a function', () => {
    expect(typeof isStructural).toEqual('function');
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testValues(
    isStructural,
    Object.keys(values).filter(
      (key) => primitiveValues.indexOf(key) === -1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any
  );
});
