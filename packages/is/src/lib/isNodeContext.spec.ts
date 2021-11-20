import { isNodeContext } from './isNodeContext';

describe('isNodeContext', () => {
  it('should return true in a jest test', () => {
    expect(isNodeContext()).toEqual(true);
  });
});
