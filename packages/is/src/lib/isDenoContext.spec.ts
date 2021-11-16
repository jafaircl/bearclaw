import { isDenoContext } from './isDenoContext';

describe('isDenoContext', () => {
  it('should return false in a jest test', () => {
    expect(isDenoContext()).toEqual(false);
  });
});
