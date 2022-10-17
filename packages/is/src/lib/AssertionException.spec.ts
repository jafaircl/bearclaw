import { AssertionException } from './AssertionException';

describe('AssertionException', () => {
  it('should have the correct name', () => {
    const err = new AssertionException();
    expect(err.name).toEqual('AssertionException');
  });

  it('should have the correct message', () => {
    const err = new AssertionException('test');
    expect(err.message).toEqual('test');
  });
});
