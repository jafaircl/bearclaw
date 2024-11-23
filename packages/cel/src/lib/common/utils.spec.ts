import { isNil } from '@bearclaw/is';
import { safeParseFloat, safeParseInt, unquote } from './utils';

describe('utils', () => {
  it('unquote', () => {
    expect(unquote('a')).toEqual('a');
    expect(unquote('"a"')).toEqual('a');
    expect(unquote("'a'")).toEqual('a');
    expect(unquote('`a`')).toEqual('a');
  });

  const safeParseIntTestCases = [
    { input: ' . fwqeaf984', bits: 8, signed: false, expected: null }, // invalid number
    { input: '0', bits: -3, signed: false, expected: null }, // invalid bits
    { input: '0', bits: 8, signed: false, expected: BigInt(0) }, // 0 unsigned
    { input: '-1', bits: 16, signed: false, expected: null }, // negative unsigned
    { input: '-1', bits: 8, signed: true, expected: BigInt(-1) }, // -1 signed
    { input: '16', bits: 4, signed: false, expected: null }, // too large unsigned
    { input: '-10', bits: 4, signed: true, expected: null }, // too small signed
    { input: '18446744073709551616', bits: 64, signed: false, expected: null }, // too large unsigned 64-bit
    { input: '9223372036854775808', bits: 64, signed: true, expected: null }, // too large signed 64-bit
    { input: '-9223372036854775809', bits: 64, signed: true, expected: null }, // too small signed 64-bit
    { input: '0x1', bits: 8, signed: false, expected: BigInt(1) }, // valid hex string
    { input: '-0x1', bits: 8, signed: false, expected: null }, // negative unsigned hex string
    { input: '0x80', bits: 8, signed: true, expected: null }, // too large signed hex string
    { input: '0o10', bits: 8, signed: false, expected: BigInt(8) }, // valid octal string
    { input: '-0o10', bits: 8, signed: false, expected: null }, // negative unsigned octal string
    { input: '0o377777777777777777', bits: 32, signed: true, expected: null }, // too large signed octal string
    { input: '0b10', bits: 8, signed: false, expected: BigInt(2) }, // valid binary string
    { input: '-0b10', bits: 8, signed: false, expected: null }, // negative unsigned binary string
    {
      input: '0b01111111111111111111111111111111111111111111111111111111',
      bits: 32,
      signed: true,
      expected: null,
    }, // too large signed binary string
    { input: '127', bits: 8, signed: true, expected: BigInt(127) }, // max signed
    { input: '-128', bits: 8, signed: true, expected: BigInt(-128) }, // min signed
    { input: '128', bits: 8, signed: true, expected: null }, // too large signed
    { input: '-129', bits: 8, signed: true, expected: null }, // too small signed
    { input: '65535', bits: 16, signed: false, expected: BigInt(65535) }, // max unsigned 16-bit
    { input: '65536', bits: 16, signed: false, expected: null }, // too large unsigned 16-bit
    { input: '-32768', bits: 16, signed: true, expected: BigInt(-32768) }, // min signed 16-bit
    { input: '32767', bits: 16, signed: true, expected: BigInt(32767) }, // max signed 16-bit
    { input: '32768', bits: 16, signed: true, expected: null }, // too large signed 16-bit
    { input: '-32769', bits: 16, signed: true, expected: null }, // too small signed 16-bit
    {
      input: '4294967295',
      bits: 32,
      signed: false,
      expected: BigInt(4294967295),
    }, // max unsigned 32-bit
    { input: '4294967296', bits: 32, signed: false, expected: null }, // too large unsigned 32-bit
    {
      input: '-2147483648',
      bits: 32,
      signed: true,
      expected: BigInt(-2147483648),
    }, // min signed 32-bit
    {
      input: '2147483647',
      bits: 32,
      signed: true,
      expected: BigInt(2147483647),
    }, // max signed 32-bit
    { input: '2147483648', bits: 32, signed: true, expected: null }, // too large signed 32-bit
    { input: '-2147483649', bits: 32, signed: true, expected: null }, // too small signed 32-bit
    {
      input: '18446744073709551615',
      bits: 64,
      signed: false,
      expected: BigInt('18446744073709551615'),
    }, // max unsigned 64-bit
    { input: '18446744073709551616', bits: 64, signed: false, expected: null }, // too large unsigned 64-bit
    {
      input: '-9223372036854775808',
      bits: 64,
      signed: true,
      expected: BigInt('-9223372036854775808'),
    }, // min signed 64-bit
    {
      input: '9223372036854775807',
      bits: 64,
      signed: true,
      expected: BigInt('9223372036854775807'),
    }, // max signed 64-bit
    { input: '9223372036854775808', bits: 64, signed: true, expected: null }, // too large signed 64-bit
    { input: '-9223372036854775809', bits: 64, signed: true, expected: null }, // too small signed 64-bit
  ];
  for (const testCase of safeParseIntTestCases) {
    if (isNil(testCase.expected)) {
      it(`safeParseInt - should throw for ${testCase.input}`, () => {
        expect(() =>
          safeParseInt(testCase.input, testCase.bits, testCase.signed)
        ).toThrow();
      });
    } else {
      it(`safeParseInt - should return ${testCase.expected} for ${testCase.input}`, () => {
        expect(
          safeParseInt(testCase.input, testCase.bits, testCase.signed)
        ).toEqual(testCase.expected);
      });
    }
  }

  const safeParseFloatTestCases = [
    { input: ' . fwqeaf984', bits: 8, signed: false, expected: null }, // invalid number
    { input: '0', bits: -3, signed: false, expected: null }, // invalid bits
    { input: '0', bits: 8, signed: false, expected: 0 }, // 0 unsigned
    { input: '-1', bits: 16, signed: false, expected: null }, // negative unsigned
    { input: '-1', bits: 8, signed: true, expected: -1 }, // -1 signed
    { input: '16', bits: 4, signed: false, expected: null }, // too large unsigned
    { input: '-10', bits: 4, signed: true, expected: null }, // too small signed
    { input: '18446744073709551616', bits: 64, signed: false, expected: null }, // too large unsigned 64-bit
    { input: '9223372036854775808', bits: 64, signed: true, expected: null }, // too large signed 64-bit
    // TODO: this should fail but javascript handling of large numbers is weird
    // { input: '-9223372036854775809', bits: 64, signed: true, expected: null }, // too small signed 64-bit
    { input: '1e-1', bits: 8, signed: false, expected: 0.1 }, // valid scientific notation
    { input: '4e424', bits: 16, signed: false, expected: null }, // too large scientific notation
  ];
  for (const testCase of safeParseFloatTestCases) {
    if (isNil(testCase.expected)) {
      it(`safeParseFloat - should throw for ${testCase.input}`, () => {
        expect(() =>
          safeParseFloat(testCase.input, testCase.bits, testCase.signed)
        ).toThrow();
      });
    } else {
      it(`safeParseFloat - should return ${testCase.expected} for ${testCase.input}`, () => {
        expect(
          safeParseFloat(testCase.input, testCase.bits, testCase.signed)
        ).toEqual(testCase.expected);
      });
    }
  }
});
