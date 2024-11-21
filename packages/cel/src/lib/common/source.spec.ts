/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Location } from './location';
import { StringSource } from './source';
describe('source', () => {
  it('StringSource - contents, description, snippets', () => {
    const contents = 'example content\nsecond line';
    const source = new StringSource(contents, 'description-test');
    // Verify the content and description are set correctly.
    expect(source.content()).toEqual(contents);
    expect(source.description()).toEqual('description-test');
    // Assert that the snippets on lines 1 & 2 are what was expected.
    expect(source.snippet(1)).toEqual('example content');
    expect(source.snippet(2)).toEqual('second line');
  });

  it('StringSource - locationOffset', () => {
    const contents = 'c.d &&\n\t b.c.arg(10) &&\n\t test(10)';
    const source = new StringSource(contents, 'offset-test');
    expect(source.lineOffsets()).toEqual([7, 24, 35]);
    // Ensure that selecting a set of characters across multiple lines works as
    // expected.
    const charStart = source.locationOffset(new Location(1, 2));
    const charEnd = source.locationOffset(new Location(3, 2));
    expect(contents.slice(charStart!, charEnd!)).toEqual(
      'd &&\n\t b.c.arg(10) &&\n\t '
    );
    expect(source.locationOffset(new Location(4, 0))).toBeNull();
  });

  it('StringSource - multiline snippet', () => {
    const source = new StringSource(
      'hello\nworld\nmy\nbub\n',
      'four-line-test'
    );
    expect(source.snippet(1)).toEqual('hello');
    expect(source.snippet(2)).toEqual('world');
    expect(source.snippet(3)).toEqual('my');
    expect(source.snippet(4)).toEqual('bub');
    expect(source.snippet(5)).toEqual('');
    expect(source.snippet(6)).toBeNull();
  });

  it('StringSource - single line snippet', () => {
    const source = new StringSource('hello, world', 'one-line-test');
    expect(source.snippet(1)).toEqual('hello, world');
    expect(source.snippet(2)).toBeNull();
  });
});
