import { isValidHexString, unquote } from './utils';

describe('utils', () => {
  it('unquote', () => {
    expect(unquote('a')).toEqual('a');
    expect(unquote('"a"')).toEqual('a');
    expect(unquote("'a'")).toEqual('a');
    expect(unquote('`a`')).toEqual('a');
  });

  const isValidHexStringTestCases = [
    // 4-bit tests (range: -8 to 7 signed, 0 to 15 unsigned)
    { input: '0x0', bits: 4, expected: true }, // 0
    { input: '0x7', bits: 4, expected: true }, // 7
    { input: '0x8', bits: 4, expected: true }, // 8
    { input: '0xF', bits: 4, expected: true }, // 15
    { input: '0x10', bits: 4, expected: false }, // 16 (too large)
    { input: '-0x8', bits: 4, expected: true }, // -8 (min negative)
    { input: '-0x1', bits: 4, expected: true }, // -1
    { input: '-0x9', bits: 4, expected: false }, // -9 (too negative)

    // 8-bit tests (range: -128 to 127 signed, 0 to 255 unsigned)
    { input: '0x0', bits: 8, expected: true }, // 0
    { input: '0x7F', bits: 8, expected: true }, // 127
    { input: '0xFF', bits: 8, expected: true }, // 255
    { input: '0x100', bits: 8, expected: false }, // 256 (too large)
    { input: '-0x80', bits: 8, expected: true }, // -128 (min negative)
    { input: '-0x1', bits: 8, expected: true }, // -1
    { input: '-0x81', bits: 8, expected: false }, // -129 (too negative)

    // 16-bit tests (range: -32768 to 32767 signed, 0 to 65535 unsigned)
    { input: '0x0', bits: 16, expected: true }, // 0
    { input: '0x7FFF', bits: 16, expected: true }, // 32767
    { input: '0xFFFF', bits: 16, expected: true }, // 65535
    { input: '0x10000', bits: 16, expected: false }, // 65536 (too large)
    { input: '-0x8000', bits: 16, expected: true }, // -32768 (min negative)
    { input: '-0x1', bits: 16, expected: true }, // -1
    { input: '-0x8001', bits: 16, expected: false }, // -32769 (too negative)

    // 32-bit tests (range: -2^31 to 2^31-1 signed, 0 to 2^32-1 unsigned)
    { input: '0x0', bits: 32, expected: true }, // 0
    { input: '0x7FFFFFFF', bits: 32, expected: true }, // 2^31-1
    { input: '0xFFFFFFFF', bits: 32, expected: true }, // 2^32-1
    { input: '0x100000000', bits: 32, expected: false }, // 2^32 (too large)
    { input: '-0x80000000', bits: 32, expected: true }, // -2^31 (min negative)
    { input: '-0x1', bits: 32, expected: true }, // -1
    { input: '-0x80000001', bits: 32, expected: false }, // -2^31-1 (too negative)

    // 64-bit tests (range: -2^63 to 2^63-1 signed, 0 to 2^64-1 unsigned)
    { input: '0x0', bits: 64, expected: true }, // 0
    { input: '0x7FFFFFFFFFFFFFFF', bits: 64, expected: true }, // 2^63-1
    { input: '0xFFFFFFFFFFFFFFFF', bits: 64, expected: true }, // 2^64-1
    { input: '0x10000000000000000', bits: 64, expected: false }, // 2^64 (too large)
    { input: '-0x8000000000000000', bits: 64, expected: true }, // -2^63 (min negative)
    { input: '-0x1', bits: 64, expected: true }, // -1
    { input: '-0x8000000000000001', bits: 64, expected: false }, // -2^63-1 (too negative)

    // Format edge cases
    { input: '0x0001', bits: 16, expected: true }, // leading zeros
    { input: '0x1', bits: 16, expected: true }, // single digit
    { input: '0xf', bits: 8, expected: true }, // lowercase
    { input: '0xF', bits: 8, expected: true }, // uppercase
    { input: '-0x0', bits: 8, expected: true }, // negative zero
    { input: '-0x00', bits: 8, expected: true }, // negative zero with leading zeros

    // Invalid format cases
    { input: '0x', bits: 8, expected: false }, // empty hex
    { input: '', bits: 8, expected: false }, // empty string
    { input: '0xG', bits: 8, expected: false }, // invalid hex char
    { input: '-0xG', bits: 8, expected: false }, // invalid hex char in negative
    { input: '0x1G', bits: 8, expected: false }, // invalid hex char
    { input: '-', bits: 8, expected: false }, // just minus sign
    { input: '-0x', bits: 8, expected: false }, // minus with empty hex
    { input: '--0x1', bits: 8, expected: false }, // double negative
    { input: '-+0x1', bits: 8, expected: false }, // mixed signs

    // Small bit size edge cases
    { input: '0x0', bits: 1, expected: true }, // 0 in 1 bit
    { input: '0x1', bits: 1, expected: true }, // 1 in 1 bit
    { input: '0x2', bits: 1, expected: false }, // too big for 1 bit
    { input: '-0x1', bits: 1, expected: true }, // -1 in 1 bit
    { input: '-0x2', bits: 1, expected: false }, // too negative for 1 bit
    { input: '0x3', bits: 2, expected: true }, // max value in 2 bits
    { input: '-0x2', bits: 2, expected: true }, // min value in 2 bits
    { input: '-0x3', bits: 2, expected: false }, // too negative for 2 bits
  ];

  for (const testCase of isValidHexStringTestCases) {
    it(`isHexString - should return ${testCase.expected} for ${testCase.input}`, () => {
      expect(isValidHexString(testCase.input, testCase.bits)).toEqual(
        testCase.expected
      );
    });
  }
});
