import {
  assertDenoContext,
  isDenoContext,
  validateDenoContext,
} from './isDenoContext';
import { ValidationException } from './ValidationException';

describe('isDenoContext', () => {
  afterEach(() => {
    delete global.window;
  });

  it('should return false in a jest test', () => {
    expect(isDenoContext()).toEqual(false);
  });

  it('should return a ValidationException in a jest test', () => {
    expect(validateDenoContext()).toBeInstanceOf(ValidationException);
  });

  it('should throw in a jest test', () => {
    expect(() => {
      assertDenoContext();
    }).toThrow(`isDenoContext`);
  });

  it('should return true if Deno and Deno.core are defined', () => {
    global.Deno = { core: {} };
    expect(isDenoContext()).toEqual(true);
  });

  it('should return null if Deno and Deno.core are defined', () => {
    global.Deno = { core: {} };
    expect(validateDenoContext()).toEqual(null);
  });

  it('should not throw if Deno and Deno.core are defined', () => {
    global.Deno = { core: {} };
    expect(() => {
      assertDenoContext();
    }).not.toThrow();
  });
});
