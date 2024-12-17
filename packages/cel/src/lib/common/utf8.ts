/**
 * the "error" Rune or "Unicode replacement character"
 */
export const RuneError = 0xfffd;
/**
 * characters below RuneSelf are represented as themselves in a single byte.
 */
export const RuneSelf = 0x80;

/**
 * Code points in the surrogate range are not valid for UTF-8.
 */
export const surrogateMin = 0xd800;
export const surrogateMax = 0xdfff;

/**
 * The default lowest continuation byte.
 */
const locb = 0b10000000;
/**
 * The default highest continuation byte.
 */
const hicb = 0b10111111;

const t1 = 0b00000000;
const tx = 0b10000000;
const t2 = 0b11000000;
const t3 = 0b11100000;
const t4 = 0b11110000;
const t5 = 0b11111000;

const maskx = 0b00111111;
const mask2 = 0b00011111;
const mask3 = 0b00001111;
const mask4 = 0b00000111;

const rune1Max = 1 << (7 - 1);
const rune2Max = 1 << (11 - 1);
const rune3Max = 1 << (16 - 1);

// These names of these constants are chosen to give nice alignment in the
// table below. The first nibble is an index into acceptRanges or F for
// special one-byte cases. The second nibble is the Rune length or the
// Status for the special one-byte case.
/**
 * invalid: size 1
 */
const xx = 0xf1;
/**
 * ASCII: size 1
 */
const as = 0xf0;
/**
 * accept 0, size 2
 */
const s1 = 0x02;
/**
 * accept 1, size 2
 */
const s2 = 0x13;
/**
 * accept 2, size 2
 */
const s3 = 0x03;
/**
 * accept 3, size 2
 */
const s4 = 0x23;
/**
 * accept 4, size 2
 */
const s5 = 0x34;
/**
 * accept 0, size 4
 */
const s6 = 0x04;
/**
 * accept 1, size 4
 */
const s7 = 0x44; // accept 4, size 4

// prettier-ignore
const first = [
    //   1   2   3   4   5   6   7   8   9   A   B   C   D   E   F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x00-0x0F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x10-0x1F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x20-0x2F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x30-0x3F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x40-0x4F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x50-0x5F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x60-0x6F
	as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, as, // 0x70-0x7F
	//   1   2   3   4   5   6   7   8   9   A   B   C   D   E   F
	xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0x80-0x8F
	xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0x90-0x9F
	xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0xA0-0xAF
	xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0xB0-0xBF
	xx, xx, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, // 0xC0-0xCF
	s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, s1, // 0xD0-0xDF
	s2, s3, s3, s3, s3, s3, s3, s3, s3, s3, s3, s3, s3, s4, s3, s3, // 0xE0-0xEF
	s5, s6, s6, s6, s7, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, xx, // 0xF0-0xFF
]

type AcceptRange = { lo: number; hi: number };

const acceptRanges: AcceptRange[] = [
  { lo: locb, hi: hicb },
  { lo: 0xa0, hi: hicb },
  { lo: locb, hi: 0x9f },
  { lo: 0x90, hi: hicb },
  { lo: locb, hi: 0x8f },
];

/**
 * DecodeRuneInString is like [DecodeRune] but its input is a string. If s is
 * empty it returns ([RuneError], 0). Otherwise, if the encoding is invalid, it
 * returns (RuneError, 1). Both are impossible results for correct, non-empty
 * UTF-8.
 *
 * An encoding is invalid if it is incorrect UTF-8, encodes a rune that is
 * out of range, or is not the shortest possible UTF-8 encoding for the value.
 * No other validation is performed.
 */
export function decodeRuneInString(s: string): [number, number] {
  const n = s.length;
  if (n < 1) {
    return [RuneError, 0];
  }

  const s0 = s.charCodeAt(0);
  const x = first[s0];
  if (x >= as) {
    // Simulate the mask-and-or operation to prevent an additional branch.
    const mask = (x << 31) >> 31; // Create 0x0000 or 0xFFFF.
    return [(s0 & ~mask) | (RuneError & mask), 1];
  }

  const sz = x & 7;
  const accept = acceptRanges[x >> 4];
  if (n < sz) {
    return [RuneError, 1];
  }

  const s1 = s.charCodeAt(1);
  if (s1 < accept.lo || accept.hi < s1) {
    return [RuneError, 1];
  }

  if (sz <= 2) {
    return [((s0 & mask2) << 6) | (s1 & maskx), 2];
  }

  const s2 = s.charCodeAt(2);
  if (s2 < locb || hicb < s2) {
    return [RuneError, 1];
  }

  if (sz <= 3) {
    return [((s0 & mask3) << 12) | ((s1 & maskx) << 6) | (s2 & maskx), 3];
  }

  const s3 = s.charCodeAt(3);
  if (s3 < locb || hicb < s3) {
    return [RuneError, 1];
  }

  return [
    ((s0 & mask4) << 18) |
      ((s1 & maskx) << 12) |
      ((s2 & maskx) << 6) |
      (s3 & maskx),
    4,
  ];
}
