import {
  CheckedExpr,
  Decl,
} from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/checked_pb.js';
import { ParsedExpr } from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/syntax_pb.js';
import { createMutableRegistry } from '@bufbuild/protobuf';
import { Checker } from './checker';
import { Declarations, EnumDecl } from './declarations';
import { drillDownOnErrorMessage } from './errors';
import { standardFunctionDeclarations } from './functions';
import { Parser } from './parser';

/**
 * Parses a filter string into a ParsedExpr object.
 *
 * @param filter The filter string to parse.
 * @returns a ParsedExpr object.
 * @throws an error if the filter string is invalid.
 */
export function parseFilter(filter: string): ParsedExpr {
  const parser = new Parser(filter);
  const result = parser.parse();
  if (result instanceof Error) {
    const message = drillDownOnErrorMessage(result);
    throw new Error(message);
  }
  return result;
}

/**
 * Checks a ParsedExpr object for type correctness.
 *
 * @param expr the ParsedExpr to check
 * @param declarations the Declarations to use for checking
 * @returns the CheckedExpr
 * @throws an error if the checker fails
 */
export function checkParsedExpression(
  expr: ParsedExpr,
  declarations: Declarations = new Declarations()
): CheckedExpr {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const checker = new Checker(expr.expr!, expr.sourceInfo!, declarations);
  const result = checker.check();
  if (result instanceof Error) {
    const message = drillDownOnErrorMessage(result);
    throw new Error(message);
  }
  return result;
}

/**
 * Parses and checks a filter string.
 *
 * @param filter The filter string to parse and check.
 * @param declarations The Declarations to use for checking.
 * @returns A CheckedExpr object.
 * @throws An error if the parsing or checking fails.
 */
export function parseAndCheckFilter(
  filter: string,
  declarations: Declarations = extendStandardFilterDeclarations([])
): CheckedExpr {
  const parsed = parseFilter(filter);
  return checkParsedExpression(parsed, declarations);
}

/**
 * Extends the standard function declarations with additional declarations.
 *
 * @param declarations the additional declarations to add
 * @param typeRegistry an optional MutableRegistry to use for protobuf types
 * @returns
 */
export function extendStandardFilterDeclarations(
  declarations: (Decl | EnumDecl)[],
  typeRegistry = createMutableRegistry()
) {
  const extendedDeclarations = new Declarations({
    declarations: [...standardFunctionDeclarations(), ...declarations],
    typeRegistry,
  });
  return extendedDeclarations;
}
