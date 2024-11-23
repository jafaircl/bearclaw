/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { isNil, isString } from '@bearclaw/is';
import { Expr } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';

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

/**
 * IsHexString returns true if the input string is a valid hexadecimal string.
 *
 * TODO: don't love this. Need a way to get the number value out so we don't parse it twice
 */
export function isValidHexString(input: string, bits = 64) {
  // Validate inputs
  if (bits <= 0) {
    throw new Error('Bits must be positive');
  }
  if (!isString(input) || !isHexString(input)) {
    return false;
  }

  // Clean the input string
  let str = input.toLowerCase().trim();

  // Handle negative numbers
  const isNegative = str.startsWith('-');
  if (isNegative) {
    str = str.substring(1);
  }

  try {
    let value: bigint;

    // Handle different number formats
    if (str.startsWith('0x')) {
      // Hex string with prefix
      str = str.substring(2);
      if (!/^[0-9a-f]+$/.test(str)) {
        return false;
      }
      value = BigInt(`0x${str}`);
    } else {
      // Decimal string or hex string without prefix
      if (/^[0-9a-f]+$/.test(str)) {
        // Try parsing as decimal first
        try {
          value = BigInt(str);
        } catch {
          // If decimal parsing fails, try as hex
          value = BigInt(`0x${str}`);
        }
      } else {
        return false;
      }
    }

    if (isNegative) {
      // Calculate max values based on bits
      const maxSigned = BigInt(2) ** BigInt(bits - 1) - BigInt(1);
      const minSigned = -(BigInt(2) ** BigInt(bits - 1));
      // For negative numbers, check if it's within the valid signed range
      return value <= maxSigned + BigInt(1) && -value >= minSigned;
    } else {
      // Calculate max value based on bits
      const maxUnsigned = BigInt(2) ** BigInt(bits) - BigInt(1);
      // For positive numbers, check if it's within the valid unsigned range
      return value <= maxUnsigned && value >= BigInt(0);
    }
  } catch (e) {
    return false;
  }
}

export function isScientificNotationString(input: string) {
  return /^-?\d+\.?\d*e-?\d+$/.test(input);
}

// TODO: don't love this. Need a way to get the number value out so we don't parse it twice
export function isValidScientificNotationString(input: string, bits = 64) {
  if (bits <= 0) {
    throw new Error('Bits must be positive');
  }

  if (!isString(input) || !isScientificNotationString(input)) {
    return false;
  }

  const isNegative = input.startsWith('-');
  const parts = input.split('e');
  if (parts.length !== 2) {
    return false;
  }

  const [mantissa, exponent] = parts;
  if (!/^-?\d+\.?\d*$/.test(mantissa) || !/^-?\d+$/.test(exponent)) {
    return false;
  }

  try {
    const value = Number(input);
    if (isNegative) {
      const maxSigned = 2 ** (bits - 1) - 1;
      const minSigned = -(2 ** (bits - 1));
      return value <= maxSigned + 1 && -value >= minSigned;
    } else {
      const maxUnsigned = 2 ** bits - 1;
      return value <= maxUnsigned && value >= 0;
    }
  } catch {
    return false;
  }
}

// TODO: don't love this. Need a way to get the number value out so we don't parse it twice
export function numberStringFitsInBits(value: string, bits: number) {
  if (bits <= 0) {
    throw new Error('Bits must be positive');
  }
  // Handle hex strings
  if (isHexString(value)) {
    return isValidHexString(value, bits);
  }

  // Handle scientific notation strings
  if (isScientificNotationString(value)) {
    return isValidScientificNotationString(value, bits);
  }

  // Handle decimal strings
  const isNegative = value.startsWith('-');
  try {
    const parsed = Number(value);
    if (isNaN(parsed)) {
      return false;
    }

    if (isNegative) {
      const maxSigned = 2 ** (bits - 1) - 1;
      const minSigned = -(2 ** (bits - 1));
      return parsed <= maxSigned + 1 && -parsed >= minSigned;
    } else {
      const maxUnsigned = 2 ** bits - 1;
      return parsed <= maxUnsigned && parsed >= 0;
    }
  } catch {
    return false;
  }
}
