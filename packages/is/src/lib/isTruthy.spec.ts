import { falsyValues } from './isFalsy.spec';
import { isTruthy } from './isTruthy';
import { testValues, values } from './test-utils.spec';

describe('isTruthy', () => {
  it('should be a function', () => {
    expect(typeof isTruthy).toEqual('function');
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  testValues(
    isTruthy,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.keys(values).filter((key) => falsyValues.indexOf(key) === -1) as any
  );
});
