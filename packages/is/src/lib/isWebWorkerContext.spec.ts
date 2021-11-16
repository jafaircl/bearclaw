import { isWebWorkerContext } from './isWebWorkerContext';

describe('isBrowserContext', () => {
  it('should return false in a jest test', () => {
    expect(isWebWorkerContext()).toEqual(false);
  });
});
