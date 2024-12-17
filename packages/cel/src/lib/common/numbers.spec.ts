import {
  int16,
  Int16,
  int32,
  Int32,
  Int64,
  int64,
  int8,
  Int8,
  Uint16,
  uint16,
  Uint32,
  uint32,
  Uint64,
  uint64,
  uint8,
  Uint8,
} from './numbers';

describe('numbers', () => {
  it('int8', () => {
    // Static properties
    expect(Int8.MAX_VALUE).toEqual(BigInt(127));
    expect(Int8.MIN_VALUE).toEqual(BigInt(-128));

    // Instance methods
    expect(int8(2).toLocaleString()).toEqual('2');
    expect(int8(2).toString()).toEqual('2');
    expect(int8(2).valueOf()).toEqual(BigInt(2));

    // Constructor with number
    expect(int8(0).value).toEqual(BigInt(0));
    expect(int8(127).value).toEqual(BigInt(127));
    expect(int8(-128).value).toEqual(BigInt(-128));
    expect(() => int8(128)).toThrow();
    expect(() => int8(-129)).toThrow();
    expect(int8(0x1).value).toEqual(BigInt(1));
    expect(int8(-0x1).value).toEqual(BigInt(-1));
    expect(int8(0o10).value).toEqual(BigInt(8));
    expect(int8(-0o10).value).toEqual(BigInt(-8));

    // Constructor with string
    expect(int8('0').value).toEqual(BigInt(0));
    expect(int8('127').value).toEqual(BigInt(127));
    expect(int8('-128').value).toEqual(BigInt(-128));
    expect(() => int8('128')).toThrow();
    expect(() => int8('-129')).toThrow();
    expect(int8('0x1').value).toEqual(BigInt(1));
    expect(int8('-0x1').value).toEqual(BigInt(-1));
    expect(int8('0o10').value).toEqual(BigInt(8));
    expect(int8('-0o10').value).toEqual(BigInt(-8));

    // Constructor with boolean
    expect(int8(true).value).toEqual(BigInt(1));
    expect(int8(false).value).toEqual(BigInt(0));

    // Constructor with bigint
    expect(int8(BigInt(0)).value).toEqual(BigInt(0));
    expect(int8(BigInt(127)).value).toEqual(BigInt(127));
    expect(int8(BigInt(-128)).value).toEqual(BigInt(-128));
    expect(() => int8(BigInt(128))).toThrow();
    expect(() => int8(BigInt(-129))).toThrow();

    // Constructor with Int8
    expect(int8(int8(0)).value).toEqual(BigInt(0));
    expect(int8(int8(127)).value).toEqual(BigInt(127));
    expect(int8(int8(-128)).value).toEqual(BigInt(-128));

    // Constructor with Uint8
    expect(int8(uint8(0)).value).toEqual(BigInt(0));
    expect(int8(uint8(127)).value).toEqual(BigInt(127));
  });

  it('uint8', () => {
    // Static properties
    expect(Uint8.MAX_VALUE).toEqual(BigInt(255));
    expect(Uint8.MIN_VALUE).toEqual(BigInt(0));

    // Instance methods
    expect(uint8(2).toLocaleString()).toEqual('2');
    expect(uint8(2).toString()).toEqual('2');
    expect(uint8(2).valueOf()).toEqual(BigInt(2));

    // Constructor with number
    expect(uint8(0).value).toEqual(BigInt(0));
    expect(uint8(255).value).toEqual(BigInt(255));
    expect(() => uint8(256)).toThrow();
    expect(() => uint8(-1)).toThrow();
    expect(uint8(0x1).value).toEqual(BigInt(1));
    expect(uint8(0o10).value).toEqual(BigInt(8));

    // Constructor with string
    expect(uint8('0').value).toEqual(BigInt(0));
    expect(uint8('255').value).toEqual(BigInt(255));
    expect(() => uint8('256')).toThrow();
    expect(() => uint8('-1')).toThrow();
    expect(uint8('0x1').value).toEqual(BigInt(1));
    expect(uint8('0o10').value).toEqual(BigInt(8));

    // Constructor with boolean
    expect(uint8(true).value).toEqual(BigInt(1));
    expect(uint8(false).value).toEqual(BigInt(0));

    // Constructor with bigint
    expect(uint8(BigInt(0)).value).toEqual(BigInt(0));
    expect(uint8(BigInt(255)).value).toEqual(BigInt(255));
    expect(() => uint8(BigInt(256))).toThrow();

    // Constructor with Int8
    expect(uint8(int8(0)).value).toEqual(BigInt(0));
    expect(uint8(int8(127)).value).toEqual(BigInt(127));

    // Constructor with Uint8
    expect(uint8(uint8(0)).value).toEqual(BigInt(0));
    expect(uint8(uint8(255)).value).toEqual(BigInt(255));
  });

  it('int16', () => {
    // Static properties
    expect(Int16.MAX_VALUE).toEqual(BigInt(32767));
    expect(Int16.MIN_VALUE).toEqual(BigInt(-32768));

    // Instance methods
    expect(int16(2).toLocaleString()).toEqual('2');
    expect(int16(2).toString()).toEqual('2');
    expect(int16(2).valueOf()).toEqual(BigInt(2));

    // Constructor with number
    expect(int16(0).value).toEqual(BigInt(0));
    expect(int16(32767).value).toEqual(BigInt(32767));
    expect(int16(-32768).value).toEqual(BigInt(-32768));
    expect(() => int16(32768)).toThrow();
    expect(() => int16(-32769)).toThrow();
    expect(int16(0x1).value).toEqual(BigInt(1));
    expect(int16(-0x1).value).toEqual(BigInt(-1));
    expect(int16(0o10).value).toEqual(BigInt(8));
    expect(int16(-0o10).value).toEqual(BigInt(-8));

    // Constructor with string
    expect(int16('0').value).toEqual(BigInt(0));
    expect(int16('32767').value).toEqual(BigInt(32767));
    expect(int16('-32768').value).toEqual(BigInt(-32768));
    expect(() => int16('32768')).toThrow();
    expect(() => int16('-32769')).toThrow();
    expect(int16('0x1').value).toEqual(BigInt(1));
    expect(int16('-0x1').value).toEqual(BigInt(-1));
    expect(int16('0o10').value).toEqual(BigInt(8));
    expect(int16('-0o10').value).toEqual(BigInt(-8));

    // Constructor with boolean
    expect(int16(true).value).toEqual(BigInt(1));
    expect(int16(false).value).toEqual(BigInt(0));

    // Constructor with bigint
    expect(int16(BigInt(0)).value).toEqual(BigInt(0));
    expect(int16(BigInt(32767)).value).toEqual(BigInt(32767));
    expect(int16(BigInt(-32768)).value).toEqual(BigInt(-32768));
    expect(() => int16(BigInt(32768))).toThrow();
    expect(() => int16(BigInt(-32769))).toThrow();

    // Constructor with Int16
    expect(int16(int16(0)).value).toEqual(BigInt(0));
    expect(int16(int16(32767)).value).toEqual(BigInt(32767));
    expect(int16(int16(-32768)).value).toEqual(BigInt(-32768));

    // Constructor with Uint16
    expect(int16(uint16(0)).value).toEqual(BigInt(0));
    expect(int16(uint16(32767)).value).toEqual(BigInt(32767));
  });

  it('uint16', () => {
    // Static properties
    expect(Uint16.MAX_VALUE).toEqual(BigInt(65535));
    expect(Uint16.MIN_VALUE).toEqual(BigInt(0));

    // Instance methods
    expect(uint16(2).toLocaleString()).toEqual('2');
    expect(uint16(2).toString()).toEqual('2');
    expect(uint16(2).valueOf()).toEqual(BigInt(2));

    // Constructor with number
    expect(uint16(0).value).toEqual(BigInt(0));
    expect(uint16(65535).value).toEqual(BigInt(65535));
    expect(() => uint16(65536)).toThrow();
    expect(() => uint16(-1)).toThrow();
    expect(uint16(0x1).value).toEqual(BigInt(1));
    expect(uint16(0o10).value).toEqual(BigInt(8));

    // Constructor with string
    expect(uint16('0').value).toEqual(BigInt(0));
    expect(uint16('65535').value).toEqual(BigInt(65535));
    expect(() => uint16('65536')).toThrow();
    expect(() => uint16('-1')).toThrow();
    expect(uint16('0x1').value).toEqual(BigInt(1));
    expect(uint16('0o10').value).toEqual(BigInt(8));

    // Constructor with boolean
    expect(uint16(true).value).toEqual(BigInt(1));
    expect(uint16(false).value).toEqual(BigInt(0));

    // Constructor with bigint
    expect(uint16(BigInt(0)).value).toEqual(BigInt(0));
    expect(uint16(BigInt(65535)).value).toEqual(BigInt(65535));
    expect(() => uint16(BigInt(65536))).toThrow();

    // Constructor with Int16
    expect(uint16(int16(0)).value).toEqual(BigInt(0));
    expect(uint16(int16(32767)).value).toEqual(BigInt(32767));

    // Constructor with Uint16
    expect(uint16(uint16(0)).value).toEqual(BigInt(0));
    expect(uint16(uint16(65535)).value).toEqual(BigInt(65535));
  });

  it('int32', () => {
    // Static properties
    expect(Int32.MAX_VALUE).toEqual(BigInt(2147483647));
    expect(Int32.MIN_VALUE).toEqual(BigInt(-2147483648));

    // Instance methods
    expect(int32(2).toLocaleString()).toEqual('2');
    expect(int32(2).toString()).toEqual('2');
    expect(int32(2).valueOf()).toEqual(BigInt(2));

    // Constructor with number
    expect(int32(0).value).toEqual(BigInt(0));
    expect(int32(2147483647).value).toEqual(BigInt(2147483647));
    expect(int32(-2147483648).value).toEqual(BigInt(-2147483648));
    expect(() => int32(2147483648)).toThrow();
    expect(() => int32(-2147483649)).toThrow();
    expect(int32(0x1).value).toEqual(BigInt(1));
    expect(int32(-0x1).value).toEqual(BigInt(-1));
    expect(int32(0o10).value).toEqual(BigInt(8));
    expect(int32(-0o10).value).toEqual(BigInt(-8));

    // Constructor with string
    expect(int32('0').value).toEqual(BigInt(0));
    expect(int32('2147483647').value).toEqual(BigInt(2147483647));
    expect(int32('-2147483648').value).toEqual(BigInt(-2147483648));
    expect(() => int32('2147483648')).toThrow();
    expect(() => int32('-2147483649')).toThrow();
    expect(int32('0x1').value).toEqual(BigInt(1));
    expect(int32('-0x1').value).toEqual(BigInt(-1));
    expect(int32('0o10').value).toEqual(BigInt(8));
    expect(int32('-0o10').value).toEqual(BigInt(-8));

    // Constructor with boolean
    expect(int32(true).value).toEqual(BigInt(1));
    expect(int32(false).value).toEqual(BigInt(0));

    // Constructor with bigint
    expect(int32(BigInt(0)).value).toEqual(BigInt(0));
    expect(int32(BigInt(2147483647)).value).toEqual(BigInt(2147483647));
    expect(int32(BigInt(-2147483648)).value).toEqual(BigInt(-2147483648));

    // Constructor with Int32
    expect(int32(int32(0)).value).toEqual(BigInt(0));
    expect(int32(int32(2147483647)).value).toEqual(BigInt(2147483647));
    expect(int32(int32(-2147483648)).value).toEqual(BigInt(-2147483648));

    // Constructor with Uint32
    expect(int32(uint32(0)).value).toEqual(BigInt(0));
    expect(int32(uint32(2147483647)).value).toEqual(BigInt(2147483647));
  });

  it('uint32', () => {
    // Static properties
    expect(Uint32.MAX_VALUE).toEqual(BigInt(4294967295));
    expect(Uint32.MIN_VALUE).toEqual(BigInt(0));

    // Instance methods
    expect(uint32(2).toLocaleString()).toEqual('2');
    expect(uint32(2).toString()).toEqual('2');
    expect(uint32(2).valueOf()).toEqual(BigInt(2));

    // Constructor with number
    expect(uint32(0).value).toEqual(BigInt(0));
    expect(uint32(4294967295).value).toEqual(BigInt(4294967295));
    expect(() => uint32(4294967296)).toThrow();
    expect(() => uint32(-1)).toThrow();
    expect(uint32(0x1).value).toEqual(BigInt(1));
    expect(uint32(0o10).value).toEqual(BigInt(8));

    // Constructor with string
    expect(uint32('0').value).toEqual(BigInt(0));
    expect(uint32('4294967295').value).toEqual(BigInt(4294967295));
    expect(() => uint32('4294967296')).toThrow();
    expect(() => uint32('-1')).toThrow();
    expect(uint32('0x1').value).toEqual(BigInt(1));
    expect(uint32('0o10').value).toEqual(BigInt(8));

    // Constructor with boolean
    expect(uint32(true).value).toEqual(BigInt(1));
    expect(uint32(false).value).toEqual(BigInt(0));

    // Constructor with bigint
    expect(uint32(BigInt(0)).value).toEqual(BigInt(0));
    expect(uint32(BigInt(4294967295)).value).toEqual(BigInt(4294967295));
    expect(() => uint32(BigInt(4294967296))).toThrow();

    // Constructor with Int32
    expect(uint32(int32(0)).value).toEqual(BigInt(0));
    expect(uint32(int32(2147483647)).value).toEqual(BigInt(2147483647));

    // Constructor with Uint32
    expect(uint32(uint32(0)).value).toEqual(BigInt(0));
    expect(uint32(uint32(4294967295)).value).toEqual(BigInt(4294967295));
  });

  it('int64', () => {
    // Static properties
    expect(Int64.MAX_VALUE).toEqual(BigInt('9223372036854775807'));
    expect(Int64.MIN_VALUE).toEqual(BigInt('-9223372036854775808'));

    // Instance methods
    expect(int64(2).toLocaleString()).toEqual('2');
    expect(int64(2).toString()).toEqual('2');
    expect(int64(2).valueOf()).toEqual(BigInt(2));

    // Constructor with number
    expect(int64(0).value).toEqual(BigInt(0));
    expect(int64('9223372036854775807').value).toEqual(
      BigInt('9223372036854775807')
    );
    expect(int64(-9223372036854775808).value).toEqual(
      BigInt('-9223372036854775808')
    );
    expect(() => int64(9223372036854775808)).toThrow();
    expect(() => int64('-9223372036854775809')).toThrow();
    expect(int64(0x1).value).toEqual(BigInt(1));
    expect(int64(-0x1).value).toEqual(BigInt(-1));
    expect(int64(0o10).value).toEqual(BigInt(8));
    expect(int64(-0o10).value).toEqual(BigInt(-8));

    // Constructor with string
    expect(int64('0').value).toEqual(BigInt(0));
    expect(int64('9223372036854775807').value).toEqual(
      BigInt('9223372036854775807')
    );
    expect(int64('-9223372036854775808').value).toEqual(
      BigInt('-9223372036854775808')
    );
    expect(() => int64('9223372036854775808')).toThrow();
    expect(() => int64('-9223372036854775809')).toThrow();
    expect(int64('0x1').value).toEqual(BigInt(1));
    expect(int64('-0x1').value).toEqual(BigInt(-1));
    expect(int64('0o10').value).toEqual(BigInt(8));
    expect(int64('-0o10').value).toEqual(BigInt(-8));

    // Constructor with boolean
    expect(int64(true).value).toEqual(BigInt(1));
    expect(int64(false).value).toEqual(BigInt(0));

    // Constructor with bigint
    expect(int64(BigInt(0)).value).toEqual(BigInt(0));
    expect(int64(BigInt('9223372036854775807')).value).toEqual(
      BigInt('9223372036854775807')
    );
    expect(int64(BigInt('-9223372036854775808')).value).toEqual(
      BigInt('-9223372036854775808')
    );
    expect(() => int64(BigInt('9223372036854775808'))).toThrow();
    expect(() => int64(BigInt('-9223372036854775809'))).toThrow();

    // Constructor with Int64
    expect(int64(int64(0)).value).toEqual(BigInt(0));
    expect(int64(int64('9223372036854775807')).value).toEqual(
      BigInt('9223372036854775807')
    );
    expect(int64(int64('-9223372036854775808')).value).toEqual(
      BigInt('-9223372036854775808')
    );

    // Constructor with Uint64
    expect(int64(uint64(0)).value).toEqual(BigInt(0));
    expect(int64(uint64('9223372036854775807')).value).toEqual(
      BigInt('9223372036854775807')
    );
  });

  it('uint64', () => {
    // Static properties
    expect(Uint64.MAX_VALUE).toEqual(BigInt('18446744073709551615'));
    expect(Uint64.MIN_VALUE).toEqual(BigInt(0));

    // Instance methods
    expect(uint64(2).toLocaleString()).toEqual('2');
    expect(uint64(2).toString()).toEqual('2');
    expect(uint64(2).valueOf()).toEqual(BigInt(2));

    // Constructor with number
    expect(uint64(0).value).toEqual(BigInt(0));
    expect(uint64('18446744073709551615').value).toEqual(
      BigInt('18446744073709551615')
    );
    expect(() => uint64('18446744073709551616')).toThrow();
    expect(() => uint64(-1)).toThrow();
    expect(uint64(0x1).value).toEqual(BigInt(1));
    expect(uint64(0o10).value).toEqual(BigInt(8));

    // Constructor with string
    expect(uint64('0').value).toEqual(BigInt(0));
    expect(uint64('18446744073709551615').value).toEqual(
      BigInt('18446744073709551615')
    );
    expect(() => uint64('18446744073709551616')).toThrow();
    expect(() => uint64('-1')).toThrow();
    expect(uint64('0x1').value).toEqual(BigInt(1));
    expect(uint64('0o10').value).toEqual(BigInt(8));

    // Constructor with boolean
    expect(uint64(true).value).toEqual(BigInt(1));
    expect(uint64(false).value).toEqual(BigInt(0));

    // Constructor with bigint
    expect(uint64(BigInt(0)).value).toEqual(BigInt(0));
    expect(uint64(BigInt('18446744073709551615')).value).toEqual(
      BigInt('18446744073709551615')
    );
    expect(() => uint64(BigInt('18446744073709551616'))).toThrow();

    // Constructor with Int64
    expect(uint64(int64(0)).value).toEqual(BigInt(0));
    expect(uint64(int64('9223372036854775807')).value).toEqual(
      BigInt('9223372036854775807')
    );

    // Constructor with Uint64
    expect(uint64(uint64(0)).value).toEqual(BigInt(0));
    expect(uint64(uint64('18446744073709551615')).value).toEqual(
      BigInt('18446744073709551615')
    );

    // Constructor with Int64
    expect(uint64(int64(0)).value).toEqual(BigInt(0));
    expect(uint64(int64('9223372036854775807')).value).toEqual(
      BigInt('9223372036854775807')
    );
  });
});
