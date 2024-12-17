/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

/**
 * Buffer is an interface for accessing a contiguous array of code points.
 */
export interface Buffer {
  get(i: number): string;
  slice(i: number, j: number): string;
  len(): number;
}

export class EmptyBuffer implements Buffer {
  get(i: number): string {
    throw new Error('slice index out of bounds');
  }

  slice(i: number, j: number): string {
    if (i !== 0 || j !== 0) {
      throw new Error('slice index out of bounds');
    }
    return '';
  }

  len() {
    return 0;
  }
}

/**
 * asciiBuffer is an implementation for an array of code points that contain
 * code points only from the ASCII character set.
 */
export class AsciiBuffer implements Buffer {
  constructor(private readonly _arr: Uint8Array) {}

  get(i: number): string {
    return String.fromCharCode(this._arr[i]);
  }

  slice(i: number, j: number): string {
    return String.fromCharCode(...this._arr.slice(i, j));
  }

  len() {
    return this._arr.length;
  }
}

/**
 * basicBuffer is an implementation for an array of code points that contain
 * code points from both the Latin-1 character set and Basic Multilingual Plane.
 */
export class BasicBuffer implements Buffer {
  constructor(private readonly _arr: Uint16Array) {}

  get(i: number): string {
    return String.fromCharCode(this._arr[i]);
  }

  slice(i: number, j: number): string {
    return Array.from(this._arr.slice(i, j))
      .map((code) => String.fromCharCode(code))
      .join('');
  }

  len() {
    return this._arr.length;
  }
}

/**
 * supplementalBuffer is an implementation for an array of code points that
 * contain code points from the Latin-1 character set, Basic Multilingual
 * Plane, or the Supplemental Multilingual Plane.
 */
export class SupplementalBuffer implements Buffer {
  constructor(private readonly _arr: Uint32Array) {}

  get(i: number): string {
    return String.fromCodePoint(this._arr[i]);
  }

  slice(i: number, j: number): string {
    return String.fromCodePoint(...this._arr.slice(i, j));
  }

  len() {
    return this._arr.length;
  }
}

/**
 * NewBuffer returns an efficient implementation of Buffer for the given text
 * based on the ranges of the encoded code points contained within.
 *
 * Code points are represented as an array of byte, uint16, or rune. This
 * approach ensures that each index represents a code point by itself without
 * needing to use an array of rune. At first we assume all code points are less
 * than or equal to '\u007f'. If this holds true, the underlying storage is a
 * byte array containing only ASCII characters. If we encountered a code point
 * above this range but less than or equal to '\uffff' we allocate a uint16
 * array, copy the elements of previous byte array to the uint16 array, and
 * continue. If this holds true, the underlying storage is a uint16 array
 * containing only Unicode characters in the Basic Multilingual Plane. If we
 * encounter a code point above '\uffff' we allocate an rune array, copy the
 * previous elements of the byte or uint16 array, and continue. The underlying
 * storage is an rune array containing any Unicode character.
 */
export function newBuffer(data: string, lines: boolean): [Buffer, number[]] {
  if (data.length === 0) {
    return [new EmptyBuffer(), [0]];
  }

  data = convertUnicodeEscapes(data);
  data = lowerCaseUtf8Encoding(data);

  let idx = 0;
  let charIndex = 0;
  let buf8: number[] = [];
  let buf16: number[] | null = null;
  let buf32: number[] | null = null;
  const offs: number[] = [];

  while (idx < data.length) {
    // Get the code point and calculate whether we need to advance by 1 or 2
    const codePoint = data.codePointAt(idx)!;
    const advance = codePoint > 0xffff ? 2 : 1;

    if (lines && codePoint === '\n'.codePointAt(0)) {
      offs.push(charIndex + 1);
    }

    if (codePoint < 0x80) {
      // ASCII (code points < 0x80)
      buf8.push(codePoint);
      idx += advance;
      charIndex++;
      continue;
    }

    if (codePoint <= 0xffff) {
      // BMP (code points <= 0xFFFF)
      if (buf8.length > 0) {
        buf16 = buf8.map((v) => v);
        buf8 = [];
      }
      buf16?.push(codePoint);
      idx += advance;
      charIndex++;
      return copy16();
    }

    // Supplemental (code points > 0xFFFF)
    if (buf8.length > 0 || buf16) {
      buf32 = [...buf8, ...(buf16 || [])];
      buf8 = [];
      buf16 = null;
    }
    buf32?.push(codePoint);
    idx += advance;
    charIndex++;
    return copy32();
  }

  if (lines) {
    offs.push(charIndex + 1);
  }

  // If we're still in 8-bit buffer, return AsciiBuffer
  if (buf8.length > 0) {
    return [new AsciiBuffer(Uint8Array.from(buf8)), offs];
  }

  // Fallback to empty buffer if something goes wrong
  return [new EmptyBuffer(), [0]];

  function copy16(): [Buffer, number[]] {
    while (idx < data.length) {
      const codePoint = data.codePointAt(idx)!;
      const advance = codePoint > 0xffff ? 2 : 1;

      if (lines && codePoint === '\n'.codePointAt(0)) {
        offs.push(charIndex + 1);
      }

      if (codePoint <= 0xffff) {
        buf16!.push(codePoint);
        idx += advance;
        charIndex++;
        continue;
      }

      // Transition to 32-bit buffer for supplemental characters
      buf32 = buf16!.map((v) => v);
      buf16 = null;
      buf32.push(codePoint);
      idx += advance;
      charIndex++;
      return copy32();
    }

    if (lines) {
      offs.push(charIndex + 1);
    }

    return [new BasicBuffer(Uint16Array.from(buf16!)), offs];
  }

  function copy32(): [Buffer, number[]] {
    while (idx < data.length) {
      const codePoint = data.codePointAt(idx)!;
      const advance = codePoint > 0xffff ? 2 : 1;

      if (lines && codePoint === '\n'.codePointAt(0)) {
        offs.push(charIndex + 1);
      }

      buf32!.push(codePoint);
      idx += advance;
      charIndex++;
    }

    if (lines) {
      offs.push(charIndex + 1);
    }

    return [new SupplementalBuffer(Uint32Array.from(buf32!)), offs];
  }
}

/**
 * Convert Unicode escape sequences to their corresponding code points. This
 * will ensure that strings like 'hello w\U0001F642rld!' are converted to
 * 'hello w🙂rld!'. when processed
 */
export function convertUnicodeEscapes(str: string) {
  // prettier-ignore
  return str.replace(/\U([0-9A-Fa-f]{8})/gi, (_, p1) => {
    return String.fromCodePoint(parseInt(p1, 16));
  });
}

/**
 * Lower case the UTF-8 encoding of the input string. This will ensure strings
 * like "\XBF" are converted to "\xbf".
 */
export function lowerCaseUtf8Encoding(s: string): string {
  return s.replace(/\X([0-9A-Fa-f]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16)).toLowerCase();
  });
}
