/* eslint-disable no-useless-escape */
import { convertUnicodeEscapes, newBuffer } from './buffer';

describe('buffer', () => {
  it('convertUnicodeEscapes', () => {
    expect(convertUnicodeEscapes('hello')).toEqual('hello');
    // prettier-ignore
    expect(convertUnicodeEscapes('hello w\U0001F642rld!')).toEqual(
      'hello w\u{1F642}rld!'
    );
  });

  it('ascii', () => {
    const data = 'hello world!';
    const [rb] = newBuffer(data, false);
    expect(rb.len()).toEqual(data.length);
    expect(rb.slice(0, data.length)).toEqual(data);
    expect(rb.get(8)).toEqual('r');
  });

  it('basic', () => {
    const data = 'hello w\u04E7rld!';
    const [rb] = newBuffer(data, false);
    expect(rb.len()).toEqual(data.length);
    expect(rb.slice(0, data.length)).toEqual(data);
    expect(rb.get(8)).toEqual('r');
  });

  it('supplemental', () => {
    // prettier-ignore
    const data = 'hello w\U0001F642rld!';
    // const data = 'hello w\u{0001F642}rld!'
    const [rb] = newBuffer(data, false);
    expect(rb.len()).toEqual(12);
    expect(rb.slice(0, data.length)).toEqual(convertUnicodeEscapes(data));
    expect(rb.get(8)).toEqual('r');
  });

  it('all', () => {
    // prettier-ignore
    const data = "hell\u04E7 w\U0001F642rld!"
    const [rb] = newBuffer(data, false);
    expect(rb.len()).toEqual(12);
    expect(rb.slice(0, data.length)).toEqual(convertUnicodeEscapes(data));
    expect(rb.get(8)).toEqual('r');
  });

  it('empty', () => {
    const [rb] = newBuffer('', false);
    expect(rb.len()).toEqual(0);
    expect(rb.slice(0, 0)).toEqual('');
  });
});
