import { isBrowserContext } from './isBrowserContext';

describe('isBrowserContext', () => {
  it('should return false in a jest test', () => {
    expect(isBrowserContext()).toEqual(false);
  });
});
