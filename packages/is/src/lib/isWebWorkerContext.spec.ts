import { isWebWorkerContext } from './isWebWorkerContext';

describe('isWebWorkerContext', () => {
  it('should return false in a jest test', () => {
    expect(isWebWorkerContext()).toEqual(false);
  });
});
