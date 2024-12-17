import { decodeRuneInString, RuneError } from './utf8';

const utf8map = new Map([
  [0x0000, '\x00'],
  [0x0001, '\x01'],
  [0x007e, '\x7e'],
  [0x007f, '\x7f'],
  [0x0080, '\xc2\x80'],
  [0x0081, '\xc2\x81'],
  [0x00bf, '\xc2\xbf'],
  [0x00c0, '\xc3\x80'],
  [0x00c1, '\xc3\x81'],
  [0x00c8, '\xc3\x88'],
  [0x00d0, '\xc3\x90'],
  [0x00e0, '\xc3\xa0'],
  [0x00f0, '\xc3\xb0'],
  [0x00f8, '\xc3\xb8'],
  [0x00ff, '\xc3\xbf'],
  [0x0100, '\xc4\x80'],
  [0x07ff, '\xdf\xbf'],
  [0x0400, '\xd0\x80'],
  [0x0800, '\xe0\xa0\x80'],
  [0x0801, '\xe0\xa0\x81'],
  [0x1000, '\xe1\x80\x80'],
  [0xd000, '\xed\x80\x80'],
  [0xd7ff, '\xed\x9f\xbf'], // last code point before surrogate half.
  [0xe000, '\xee\x80\x80'], // first code point after surrogate half.
  [0xfffe, '\xef\xbf\xbe'],
  [0xffff, '\xef\xbf\xbf'],
  [0x10000, '\xf0\x90\x80\x80'],
  [0x10001, '\xf0\x90\x80\x81'],
  [0x40000, '\xf1\x80\x80\x80'],
  [0x10fffe, '\xf4\x8f\xbf\xbe'],
  [0x10ffff, '\xf4\x8f\xbf\xbf'],
  [0xfffd, '\xef\xbf\xbd'],
]);

const surrogateMap = new Map([
  [0xd800, '\xed\xa0\x80'], // surrogate min decodes to (RuneError, 1)
  [0xdfff, '\xed\xbf\xbf'], // surrogate max decodes to (RuneError, 1)
]);

const testStrings = [
  '',
  'abcd',
  '☺☻☹',
  '日a本b語ç日ð本Ê語þ日¥本¼語i日©',
  '日a本b語ç日ð本Ê語þ日¥本¼語i日©日a本b語ç日ð本Ê語þ日¥本¼語i日©日a本b語ç日ð本Ê語þ日¥本¼語i日©',
  '\x80\x80\x80\x80',
];

describe('utf8', () => {
  it('decodeRuneInString - utf8', () => {
    for (const [key, value] of utf8map) {
      expect(decodeRuneInString(value)).toEqual([key, value.length]);

      // there's an extra byte that bytes left behind - make sure trailing byte works
      expect(decodeRuneInString(value + '\x00')).toEqual([key, value.length]);

      // make sure missing bytes fail
      let wantsize = 1;
      if (wantsize >= value.length) {
        wantsize = 0;
      }
      expect(decodeRuneInString(value.slice(0, -1))).toEqual([
        RuneError,
        wantsize,
      ]);
    }
  });

  it('decodeRuneInString - surrogate', () => {
    for (const [key, value] of surrogateMap) {
      expect(decodeRuneInString(value)).toEqual([RuneError, 1]);
    }
  });

  it('decodeRuneInString - invalid', () => {
    const invalidSequenceTests = [
      '\xed\xa0\x80\x80', // surrogate min
      '\xed\xbf\xbf\x80', // surrogate max

      // xx
      '\x91\x80\x80\x80',

      // s1
      '\xC2\x7F\x80\x80',
      '\xC2\xC0\x80\x80',
      '\xDF\x7F\x80\x80',
      '\xDF\xC0\x80\x80',

      // s2
      '\xE0\x9F\xBF\x80',
      '\xE0\xA0\x7F\x80',
      '\xE0\xBF\xC0\x80',
      '\xE0\xC0\x80\x80',

      // s3
      '\xE1\x7F\xBF\x80',
      '\xE1\x80\x7F\x80',
      '\xE1\xBF\xC0\x80',
      '\xE1\xC0\x80\x80',

      // s4
      '\xED\x7F\xBF\x80',
      '\xED\x80\x7F\x80',
      '\xED\x9F\xC0\x80',
      '\xED\xA0\x80\x80',

      // s5
      '\xF0\x8F\xBF\xBF',
      '\xF0\x90\x7F\xBF',
      '\xF0\x90\x80\x7F',
      '\xF0\xBF\xBF\xC0',
      '\xF0\xBF\xC0\x80',
      '\xF0\xC0\x80\x80',

      // s6
      '\xF1\x7F\xBF\xBF',
      '\xF1\x80\x7F\xBF',
      '\xF1\x80\x80\x7F',
      '\xF1\xBF\xBF\xC0',
      '\xF1\xBF\xC0\x80',
      '\xF1\xC0\x80\x80',

      // s7
      '\xF4\x7F\xBF\xBF',
      '\xF4\x80\x7F\xBF',
      '\xF4\x80\x80\x7F',
      '\xF4\x8F\xBF\xC0',
      '\xF4\x8F\xC0\x80',
      '\xF4\x90\x80\x80',
    ];

    for (const value of invalidSequenceTests) {
      expect(decodeRuneInString(value)).toEqual([RuneError, 1]);
    }
  });
});
