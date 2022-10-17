import {
  assertWebWorkerContext,
  isWebWorkerContext,
  validateWebWorkerContext,
} from './isWebWorkerContext';
import { ValidationException } from './ValidationException';

describe('isWebWorkerContext', () => {
  afterEach(() => {
    delete global.importScripts;
  });

  it('should return false in a jest test', () => {
    expect(isWebWorkerContext()).toEqual(false);
  });

  it('should return a ValidationException in a jest test', () => {
    expect(validateWebWorkerContext()).toBeInstanceOf(ValidationException);
  });

  it('should throw in a jest test', () => {
    expect(() => {
      assertWebWorkerContext();
    }).toThrow(`isWebWorkerContext`);
  });

  it('should return true if importScripts is defined', () => {
    global.importScripts = () => void 0;
    expect(isWebWorkerContext()).toEqual(true);
  });

  it('should return null if importScripts is defined', () => {
    global.importScripts = () => void 0;
    expect(validateWebWorkerContext()).toEqual(null);
  });

  it('should not throw if importScripts is defined', () => {
    global.importScripts = () => void 0;
    expect(() => {
      assertWebWorkerContext();
    }).not.toThrow();
  });
});
