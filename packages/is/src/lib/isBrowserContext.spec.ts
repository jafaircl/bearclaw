import {
  assertBrowserContext,
  isBrowserContext,
  validateBrowserContext,
} from './isBrowserContext';
import { ValidationException } from './ValidationException';

describe('isBrowserContext', () => {
  afterEach(() => {
    delete global.window;
  });

  it('should return false in a jest test', () => {
    expect(isBrowserContext()).toEqual(false);
  });

  it('should return a ValidationException in a jest test', () => {
    expect(validateBrowserContext()).toBeInstanceOf(ValidationException);
  });

  it('should throw in a jest test', () => {
    expect(() => {
      assertBrowserContext();
    }).toThrow(`isBrowserContext`);
  });

  it('should return true if window and window.document are defined', () => {
    global.window = { document: {} as Document } as Window & typeof globalThis;
    expect(isBrowserContext()).toEqual(true);
  });

  it('should return a null if window and document are defined', () => {
    global.window = { document: {} as Document } as Window & typeof globalThis;
    expect(validateBrowserContext()).toEqual(null);
  });

  it('should not throw if window and window.document are defined', () => {
    global.window = { document: {} as Document } as Window & typeof globalThis;
    expect(() => {
      assertBrowserContext();
    }).not.toThrow();
  });
});
