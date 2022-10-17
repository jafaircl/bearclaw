import { validate } from './validate';
import { ValidationException } from './ValidationException';

describe('validate', () => {
  it('should return null if the assertion is true', () => {
    expect(validate(true, '')).toEqual(null);
  });

  it('should return a ValidationException if the assertion is false', () => {
    expect(validate(false, '')).toBeInstanceOf(ValidationException);
  });

  it('should return a custom error if one is provided', () => {
    class MyCustomError extends Error {}

    expect(validate(false, new MyCustomError())).toBeInstanceOf(MyCustomError);
  });
});
