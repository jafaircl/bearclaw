import { unquote } from './utils';

describe('utils', () => {
  it('unquote', () => {
    expect(unquote('a')).toEqual('a');
    expect(unquote('"a"')).toEqual('a');
    expect(unquote("'a'")).toEqual('a');
    expect(unquote('`a`')).toEqual('a');
  });
});
