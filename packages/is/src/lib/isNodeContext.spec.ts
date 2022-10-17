import {
  assertNodeContext,
  isNodeContext,
  validateNodeContext,
} from './isNodeContext';

describe('isNodeContext', () => {
  it('should return true in a jest test', () => {
    expect(isNodeContext()).toEqual(true);
  });

  it('should return null in a jest test', () => {
    expect(validateNodeContext()).toEqual(null);
  });

  it('should not throw in a jest test', () => {
    expect(() => {
      assertNodeContext();
    }).not.toThrow();
  });
});
