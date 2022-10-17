import { ValidationException } from './ValidationException';

describe('ValidationException', () => {
  it('should have the correct name', () => {
    const err = new ValidationException();
    expect(err.name).toEqual('ValidationException');
  });

  it('should have the correct message', () => {
    const err = new ValidationException('test');
    expect(err.message).toEqual('test');
  });
});
