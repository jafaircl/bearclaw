import { isString } from '@bearclaw/is';
import { safeParseInt } from './utils';

// TODO: should be able to use this to differntiate between int/uint

function calculateMaxValue(bits: number, signed: boolean) {
  return signed
    ? BigInt(2) ** BigInt(bits - 1) - BigInt(1)
    : BigInt(2) ** BigInt(bits) - BigInt(1);
}

function calculateMinValue(bits: number, signed: boolean) {
  return signed ? BigInt(-1) * BigInt(2) ** BigInt(bits - 1) : BigInt(0);
}

class IntN {
  public bits: number;
  public value: bigint;
  public signed: boolean;

  constructor(
    bits: number,
    value: bigint | boolean | number | string | IntN,
    signed: boolean
  ) {
    this.bits = bits;
    this.signed = signed;
    const bigint = isString(value)
      ? safeParseInt(value, bits, signed)
      : BigInt(value instanceof IntN ? value.value : value);
    this.value = signed
      ? BigInt.asIntN(bits, bigint)
      : BigInt.asUintN(bits, bigint);
    if (
      // BigInt.asIntN wraps the value to fit in the specified number of bits.
      // So, if the value is not equal to the wrapped value, then it means
      // that the value does not fit in the specified number of bits.
      bigint !== this.value ||
      this.value > this.#max ||
      this.value < this.#min
    ) {
      throw new Error(`Invalid value: ${value} does not fit in ${bits} bits`);
    }
  }

  /**
   * The largest signed integer that can be represented.
   * Equal to 2^(bits - 1) - 1. For example, if bits is 8, then the maximum
   * value is 127. For 64 bits, the maximum value is 9223372036854775807.
   */
  get #max() {
    return calculateMaxValue(this.bits, this.signed);
  }

  /**
   * The smallest signed integer that can be represented.
   * Equal to -2^(bits - 1). For example, if bits is 8, then the minimum
   * value is -128. For 64 bits, the minimum value is -9223372036854775808.
   */
  get #min() {
    return calculateMinValue(this.bits, this.signed);
  }

  /**
   * Returns a string representation appropriate to the host environment's
   * current locale.
   */
  toLocaleString() {
    return this.value.toLocaleString();
  }

  /**
   * Returns a string representation of an object.
   *
   * @param radix Specifies a radix for converting numeric values to strings.
   */
  toString(radix?: number) {
    return this.value.toString(radix);
  }

  /**
   * Returns the primitive value of the specified object.
   */
  valueOf() {
    return this.value.valueOf();
  }
}

/**
 * Represents a signed 8-bit integer.
 */
export class Int8 extends IntN {
  constructor(value: bigint | boolean | number | string | IntN) {
    super(8, value, true);
  }

  /**
   * The largest signed 8-bit integer that can be represented.
   * Equal to 127.
   */
  static MAX_VALUE = calculateMaxValue(8, true);

  /**
   * The smallest signed 8-bit integer that can be represented.
   * Equal to -128.
   */
  static MIN_VALUE = calculateMinValue(8, true);
}

/**
 * Creates a new Int8 instance.
 */
export function int8(value: bigint | boolean | number | string | IntN) {
  return new Int8(value);
}

/**
 * Represents an unsigned 8-bit integer.
 */
export class Uint8 extends IntN {
  constructor(value: bigint | boolean | number | string | IntN) {
    super(8, value, false);
  }

  /**
   * The largest unsigned 8-bit integer that can be represented.
   * Equal to 255.
   */
  static MAX_VALUE = calculateMaxValue(8, false);

  /**
   * The smallest unsigned 8-bit integer that can be represented.
   * Equal to 0.
   */
  static MIN_VALUE = calculateMinValue(8, false);
}

/**
 * Creates a new Uint8 instance.
 */
export function uint8(value: bigint | boolean | number | string | IntN) {
  return new Uint8(value);
}

/**
 * Represents a signed 16-bit integer.
 */
export class Int16 extends IntN {
  constructor(value: bigint | boolean | number | string | IntN) {
    super(16, value, true);
  }

  /**
   * The largest signed 16-bit integer that can be represented.
   * Equal to 32767.
   */
  static MAX_VALUE = calculateMaxValue(16, true);

  /**
   * The smallest signed 16-bit integer that can be represented.
   * Equal to -32768.
   */
  static MIN_VALUE = calculateMinValue(16, true);
}

/**
 * Creates a new Int16 instance.
 */
export function int16(value: bigint | boolean | number | string | IntN) {
  return new Int16(value);
}

/**
 * Represents an unsigned 16-bit integer.
 */
export class Uint16 extends IntN {
  constructor(value: bigint | boolean | number | string | IntN) {
    super(16, value, false);
  }

  /**
   * The largest unsigned 16-bit integer that can be represented.
   * Equal to 65535.
   */
  static MAX_VALUE = calculateMaxValue(16, false);

  /**
   * The smallest unsigned 16-bit integer that can be represented.
   * Equal to 0.
   */
  static MIN_VALUE = calculateMinValue(16, false);
}

/**
 * Creates a new Uint16 instance.
 */
export function uint16(value: bigint | boolean | number | string | IntN) {
  return new Uint16(value);
}

/**
 * Represents a signed 32-bit integer.
 */
export class Int32 extends IntN {
  constructor(value: bigint | boolean | number | string | IntN) {
    super(32, value, true);
  }

  /**
   * The largest signed 32-bit integer that can be represented.
   * Equal to 2147483647.
   */
  static MAX_VALUE = calculateMaxValue(32, true);

  /**
   * The smallest signed 32-bit integer that can be represented.
   * Equal to -2147483648.
   */
  static MIN_VALUE = calculateMinValue(32, true);
}

/**
 * Creates a new Int32 instance.
 */
export function int32(value: bigint | boolean | number | string | IntN) {
  return new Int32(value);
}

/**
 * Represents an unsigned 32-bit integer.
 */
export class Uint32 extends IntN {
  constructor(value: bigint | boolean | number | string | IntN) {
    super(32, value, false);
  }

  /**
   * The largest unsigned 32-bit integer that can be represented.
   * Equal to 4294967295.
   */
  static MAX_VALUE = calculateMaxValue(32, false);

  /**
   * The smallest unsigned 32-bit integer that can be represented.
   * Equal to 0.
   */
  static MIN_VALUE = calculateMinValue(32, false);
}

/**
 * Creates a new Uint32 instance.
 */
export function uint32(value: bigint | boolean | number | string | IntN) {
  return new Uint32(value);
}

/**
 * Represents a signed 64-bit integer.
 */
export class Int64 extends IntN {
  constructor(value: bigint | boolean | number | string | IntN) {
    super(64, value, true);
  }

  /**
   * The largest signed 64-bit integer that can be represented.
   * Equal to 9223372036854775807.
   */
  static MAX_VALUE = calculateMaxValue(64, true);

  /**
   * The smallest signed 64-bit integer that can be represented.
   * Equal to -9223372036854775808.
   */
  static MIN_VALUE = calculateMinValue(64, true);
}

/**
 * Creates a new Int64 instance.
 */
export function int64(value: bigint | boolean | number | string | IntN) {
  return new Int64(value);
}

/**
 * Represents an unsigned 64-bit integer.
 */
export class Uint64 extends IntN {
  constructor(value: bigint | boolean | number | string | IntN) {
    super(64, value, false);
  }

  /**
   * The largest unsigned 64-bit integer that can be represented.
   * Equal to 18446744073709551615.
   */
  static MAX_VALUE = calculateMaxValue(64, false);

  /**
   * The smallest unsigned 64-bit integer that can be represented.
   * Equal to 0.
   */
  static MIN_VALUE = calculateMinValue(64, false);
}

/**
 * Creates a new Uint64 instance.
 */
export function uint64(value: bigint | boolean | number | string | IntN) {
  return new Uint64(value);
}
