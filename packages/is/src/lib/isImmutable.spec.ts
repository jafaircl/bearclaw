import { isImmutable } from './isImmutable';
import { primitiveValues } from './isPrimitive.spec';
import { testValues } from './test-utils.spec';

describe('isImmutable', () => {
  it('should be a function', () => {
    expect(typeof isImmutable).toEqual('function');
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testValues(isImmutable, [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(primitiveValues as any),
    'frozenObject',
    'frozenEmptyObject',
    'sealedEmptyObject',
  ]);
});
