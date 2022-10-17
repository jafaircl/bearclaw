import { assert } from './assert';
import { AssertionException } from './AssertionException';

describe('assert', () => {
  it('should not throw if the assertion is true', () => {
    expect(() => {
      assert(true, '');
    }).not.toThrow();
  });

  it('should throw if the assertion is false', () => {
    expect(() => {
      assert(false, '');
    }).toThrow();
  });

  it('should throw an AssertionException if the assertion is false', () => {
    try {
      assert(false, '');
    } catch (e) {
      expect(e).toBeInstanceOf(AssertionException);
    }
  });

  it('should throw a custom error if one is provided', () => {
    class MyCustomError extends Error {}

    try {
      assert(false, new MyCustomError());
    } catch (e) {
      expect(e).toBeInstanceOf(MyCustomError);
    }
  });
});
