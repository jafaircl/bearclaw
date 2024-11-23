/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { isNil } from '@bearclaw/is';
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
