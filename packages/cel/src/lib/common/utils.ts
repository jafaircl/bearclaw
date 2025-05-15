/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { isNil } from '@bearclaw/is';
import { Expr } from '../protogen/cel/expr/syntax_pb.js';

export function unquote(str: string) {
  const reg = /['"`]/;
  if (!str) {
    return '';
  }
  if (reg.test(str.charAt(0))) {
    str = str.substr(1);
  }
  if (reg.test(str.charAt(str.length - 1))) {
    str = str.substr(0, str.length - 1);
  }
  return str;
}

export function mapToObject<K extends string | number | symbol, V>(
  map: Map<K, V>
) {
  const obj = {} as Record<K, V>;
  for (const [key, value] of map.entries()) {
    obj[key] = value;
  }
  return obj;
}

/**
 * ObjectToMap is a helper function to convert a record to a map. For use in
 * cases where a map's structure is complicated and would be easier to define
 * as a record. The limitation is that only string, number, and symbol keys are
 * supported. But, a Map can be a value in the record. So, nested maps with
 * arbitrary keys are still supported.
 */
export function objectToMap<K extends string | number | symbol, V>(
  obj: Record<K, V>
) {
  const map = new Map<K, V>();
  for (const key of Object.keys(obj) as K[]) {
    map.set(key, obj[key]);
  }
  return map;
}

export function reverseMap<K, V>(m: Map<K, V>): Map<V, K> {
  const result = new Map<V, K>();
  for (const [k, v] of m) {
    result.set(v, k);
  }
  return result;
}

/**
 * Converts an expression AST into a qualified name if possible, or an empty
 * string otherwise.
 *
 * @param expr the expression AST
 * @returns a qualified name or an empty string
 */
export function toQualifiedName(expr: Expr): string | null {
  switch (expr.exprKind.case) {
    case 'identExpr':
      return expr.exprKind.value.name;
    case 'selectExpr':
      const sel = expr.exprKind.value;
      // Test only expressions are not valid as qualified names.
      if (sel.testOnly) {
        return null;
      }
      const qual = toQualifiedName(sel.operand!);
      if (!isNil(qual)) {
        return `${qual}.${sel.field}`;
      }
      break;
    default:
      break;
  }
  return null;
}

export function isHexString(input: string) {
  return /^-?0x[0-9a-f]+$/i.test(input);
}

export function isOctalString(input: string) {
  return /^-?0o[0-7]+$/i.test(input);
}

export function isScientificNotationString(input: string) {
  return /^-?\d+\.?\d*e-?\d+$/i.test(input);
}

/**
 * FitsInBits returns true if the value fits within the specified number of
 * bits. The signed flag is used to determine if the value is signed or
 * unsigned.
 */
export function fitsInBits(value: bigint, bits: number, signed: boolean) {
  if (signed) {
    return BigInt.asIntN(bits, value) === value;
  }
  return BigInt.asUintN(bits, value) === value;
}

/**
 * SafeParseInt parses a string into an integer, ensuring that the value fits
 * within the specified number of bits.
 */
export function safeParseInt(
  input: string,
  bits: number,
  signed: boolean
): bigint {
  // Clean the string
  input = input.trim().toLowerCase();

  // Determine if the number is negative
  const isNegative = input.startsWith('-');
  if (isNegative) {
    if (!signed) {
      throw new Error(
        `Invalid value: unsigned value ${input} cannot be negative`
      );
    }

    input = input.substring(1);
  }

  let value = BigInt(input);
  if (isNegative) {
    value = -value;
  }

  if (!fitsInBits(value, bits, signed)) {
    throw new Error(`Invalid value: ${value} does not fit in ${bits} bits`);
  }
  return value;
}

/**
 * SafeParseFloat parses a string into a float, ensuring that the value fits
 * within the specified number of bits.
 *
 * TODO: this probably cannot actually parse a 64 bit float since JS loses precision past 2^53
 */
export function safeParseFloat(
  input: string,
  bits: number,
  signed: boolean
): number {
  if (bits <= 0 || bits > 64) {
    throw new Error(`Invalid bits: ${bits} is not a valid number of bits`);
  }
  const value = parseFloat(input);
  if (isNaN(value)) {
    throw new Error(`Invalid value: ${input} is not a number`);
  }

  if (signed) {
    if (value < -(2 ** (bits - 1)) || value >= 2 ** (bits - 1)) {
      throw new Error(`Invalid value: ${value} does not fit in ${bits} bits`);
    }
  } else {
    if (value < 0 || value >= 2 ** bits) {
      throw new Error(`Invalid value: ${value} does not fit in ${bits} bits`);
    }
  }
  return value;
}
