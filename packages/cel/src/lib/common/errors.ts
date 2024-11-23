import { Type } from './types/types';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Expr } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { ErrorListener, RecognitionException, Recognizer, Token } from 'antlr4';
import { ReferenceInfo } from './ast';
import { Container } from './container';
import { CELError } from './error';
import { formatFunctionDeclType } from './format';
import { Location } from './location';
import { Source, TextSource } from './source';

export class Errors {
  public readonly errors: CELError[] = [];

  constructor(
    public readonly source: Source = new TextSource(''),
    public readonly maxErrorsToReport = 100
  ) {}

  public reportError(location: Location, message: string) {
    this.reportErrorAtId(BigInt(0), location, message);
  }

  public reportErrorAtId(id: bigint, location: Location, message: string) {
    if (this.errors.length > this.maxErrorsToReport) {
      return;
    }
    this.errors.push(new CELError(id, location, message));
  }

  public reportInternalError(message: string) {
    this.reportError({ line: -1, column: -1 }, message);
  }

  public reportSyntaxError(location: Location, message: string) {
    this.reportError(location, `Syntax error: ${message}`);
  }

  public reportUnexpectedAstTypeError(
    id: bigint,
    location: Location,
    kind: string,
    typeName: string
  ) {
    return this.reportErrorAtId(
      id,
      location,
      `unexpected ${kind} type: ${typeName}`
    );
  }

  public reportUndeclaredReference(
    id: bigint,
    location: Location,
    container: Container,
    name: string
  ) {
    return this.reportErrorAtId(
      id,
      location,
      `undeclared reference to '${name}' (in container '${container.name}')`
    );
  }

  public reportTypeMismatch(
    id: bigint,
    location: Location,
    expected: Type,
    actual: Type
  ) {
    return this.reportErrorAtId(
      id,
      location,
      `expected type ${expected?.typeName() ?? 'null'} but found ${
        actual?.typeName() ?? 'null'
      }`
    );
  }

  public reportTypeDoesNotSupportFieldSelection(
    id: bigint,
    location: Location,
    type: Type
  ) {
    return this.reportErrorAtId(
      id,
      location,
      `type '${type.toString()}' does not support field selection`
    );
  }

  public reportUndefinedField(id: bigint, location: Location, field: string) {
    return this.reportErrorAtId(id, location, `undefined field '${field}'`);
  }

  public reportNotAnOptionalFieldSelection(
    id: bigint,
    location: Location,
    field: Expr
  ) {
    return this.reportErrorAtId(
      id,
      location,
      `unsupported optional field selection: ${field}`
    );
  }

  public reportNoMatchingOverload(
    id: bigint,
    location: Location,
    name: string,
    args: Type[],
    isInstance: boolean
  ) {
    const signature = formatFunctionDeclType(null, args, isInstance);
    return this.reportErrorAtId(
      id,
      location,
      `found no matching overload for '${name}' applied to '${signature}'`
    );
  }

  public reportNotAType(id: bigint, location: Location, name: string) {
    return this.reportErrorAtId(id, location, `'${name}' is not a type`);
  }

  public reportNotAMessageType(id: bigint, location: Location, name: string) {
    return this.reportErrorAtId(
      id,
      location,
      `'${name}' is not a message type`
    );
  }

  public reportFieldTypeMismatch(
    id: bigint,
    location: Location,
    name: string,
    field: Type,
    value: Type
  ) {
    return this.reportErrorAtId(
      id,
      location,
      `expected type of field '${name}' is '${field.toString()}' but provided type is '${value.toString()}'`
    );
  }

  public reportUnexpectedFailedResolution(
    id: bigint,
    location: Location,
    name: string
  ) {
    return this.reportErrorAtId(
      id,
      location,
      `unexpected failed resolution of '${name}'`
    );
  }

  public reportNotAComprehensionRange(id: bigint, location: Location, t: Type) {
    return this.reportErrorAtId(
      id,
      location,
      `expression of type '${t.toString()}' cannot be range of a comprehension (must be list, map, or dynamic)`
    );
  }

  public reportIncompatibleTypes(
    id: bigint,
    location: Location,
    ex: Expr,
    prev: Type,
    next: Type
  ) {
    return this.reportErrorAtId(
      id,
      location,
      `incompatible type already exists for expression: ${ex}(${
        ex.id
      }) old:${prev.toString()}, new:${next.toString()}`
    );
  }

  public reportReferenceRedefinition(
    id: bigint,
    location: Location,
    ex: Expr,
    prev: ReferenceInfo,
    next: ReferenceInfo
  ) {
    return this.reportErrorAtId(
      id,
      location,
      `reference already exists for expression: ${ex}(${
        ex.id
      }) old:${prev.toString()}, new:${next.toString()}`
    );
  }

  public toDisplayString() {
    let hasRecursionError = false;
    const errors = [];
    for (const error of this.errors) {
      const str = error.toDisplayString(this.source);
      // Deduplicate recursion errors.
      if (
        str.includes('expression recursion limit exceeded') ||
        str.includes('max recursion depth exceeded')
      ) {
        if (!hasRecursionError) {
          hasRecursionError = true;
          errors.push(str);
        }
      } else {
        errors.push(str);
      }
    }

    return errors.join('\n ');
  }
}

export class LexerErrorListener extends ErrorListener<number> {
  constructor(private readonly errors: Errors) {
    super();
  }

  override syntaxError(
    recognizer: Recognizer<number>,
    offendingSymbol: number,
    line: number,
    charPositionInLine: number,
    msg: string,
    e: RecognitionException | undefined
  ): void {
    this.errors.reportSyntaxError({ line, column: charPositionInLine }, msg);
  }
}

export class ParserErrorListener extends ErrorListener<Token> {
  constructor(
    // private readonly parserHelper: ParserHelper,
    private readonly errors: Errors
  ) {
    super();
  }

  override syntaxError(
    recognizer: Recognizer<Token>,
    offendingSymbol: Token,
    line: number,
    charPositionInLine: number,
    msg: string,
    e: RecognitionException | undefined
  ): void {
    // const offset = this.parserHelper
    //   .getSourceInfo()
    //   .computeOffset(line, charPositionInLine);
    // const l = this.parserHelper.getLocationByOffset(offset);
    // // // Hack to keep existing error messages consistent with previous versions of CEL when a reserved word
    // // // is used as an identifier. This behavior needs to be overhauled to provide consistent, normalized error
    // // // messages out of ANTLR to prevent future breaking changes related to error message content.
    // // if (msg.indexOf("no viable alternative") > -1) {
    // // 	msg = reservedIdentifier.ReplaceAllString(msg, mismatchedReservedIdentifier)
    // // }
    // // Ensure that no more than 100 syntax errors are reported as this will halt attempts to recover from a
    // // seriously broken expression.
    // if (this.errors.errors.length < this.errors.maxErrorsToReport) {
    //   this.errors.reportSyntaxError(l, msg);
    // } else {
    //   this.errors.reportSyntaxError(
    //     l,
    //     `More than ${this.errors.maxErrorsToReport} errors.`
    //   );
    //   throw new Error('too many errors');
    // }
    if (msg.startsWith('expression recursion limit exceeded')) {
      this.errors.reportInternalError(msg);
    } else {
      this.errors.reportSyntaxError({ line, column: charPositionInLine }, msg);
    }
  }
}
