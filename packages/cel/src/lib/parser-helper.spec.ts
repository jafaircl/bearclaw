import { ParserHelper } from './parser-helper';

describe('ParserHelper', () => {
  it('should compute the line offsets', () => {
    const source = 'c.d &&\n\t b.c.arg(10) &&\n\t test(10)';
    const helper = new ParserHelper(source);
    expect(helper.sourceInfo.lineOffsets).toEqual([7, 24, 35]);
  });

  it('should compute the offset', () => {
    const source = 'c.d &&\n\t b.c.arg(10) &&\n\t test(10)';
    const helper = new ParserHelper(source);
    expect(helper.computeOffset(1, 0)).toEqual(0);
    expect(helper.computeOffset(1, 5)).toEqual(5);
    expect(helper.computeOffset(2, 1)).toEqual(8);
    expect(helper.computeOffset(3, 1)).toEqual(25);
  });

  it('should get the location by offset', () => {
    const source = 'c.d &&\n\t b.c.arg(10) &&\n\t test(10)';
    const helper = new ParserHelper(source);
    expect(helper.getLocationByOffset(0)).toEqual({ line: 1, column: 0 });
    expect(helper.getLocationByOffset(5)).toEqual({ line: 1, column: 5 });
    expect(helper.getLocationByOffset(8)).toEqual({ line: 2, column: 1 });
    expect(helper.getLocationByOffset(25)).toEqual({ line: 3, column: 1 });
  });
});
