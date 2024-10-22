/* eslint-disable @typescript-eslint/no-unused-vars */
import { Type } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import { ErrorSetSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb.js';
import {
  SourceInfo,
  SourceInfoSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import {
  Status,
  StatusSchema,
} from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb.js';
import { create, createRegistry } from '@bufbuild/protobuf';
import { anyPack, anyUnpack } from '@bufbuild/protobuf/wkt';
import { ErrorListener, RecognitionException, Recognizer, Token } from 'antlr4';
import { CELContainer } from './container';
import { Location, formatCELType, formatFunctionType } from './types';

export class Errors {
  public readonly errors = create(ErrorSetSchema);
  public numErrors = 0;

  constructor(
    public readonly source: string,
    public readonly sourceDescription = '<input>',
    public readonly maxErrorsToReport = 100
  ) {}

  public reportError(location: Location, message: string) {
    this.reportErrorAtId(BigInt(0), location, message);
  }

  public reportErrorAtId(id: bigint, location: Location, message: string) {
    this.numErrors++;
    if (this.numErrors > this.maxErrorsToReport) {
      return;
    }
    const err = create(StatusSchema, {
      code: 0,
      message,
      details: [
        anyPack(
          SourceInfoSchema,
          create(SourceInfoSchema, {
            positions: {
              [id.toString()]: location.column,
            },
            lineOffsets: [location.line],
            location: `${location.line}:${location.column}`,
            syntaxVersion: 'cel1',
          })
        ),
      ],
    });
    this.errors.errors.push(err);
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
    container: CELContainer,
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
      `expected type ${expected.$typeName} but found ${actual.$typeName}`
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
      `type '${formatCELType(type)}' does not support field selection`
    );
  }

  public reportUndefinedField(id: bigint, location: Location, field: string) {
    return this.reportErrorAtId(id, location, `undefined field '${field}'`);
  }

  public reportNotAnOptionalFieldSelection(
    id: bigint,
    location: Location,
    field: string
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
    const signature = formatFunctionType(null, args, isInstance);
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
      `expected type of field '${name}' is '${formatCELType(
        field
      )}' but provided type is '${formatCELType(value)}'`
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
      `expression of type '${formatCELType(
        t
      )}' cannot be range of a comprehension (must be list, map, or dynamic)`
    );
  }

  public toDisplayString() {
    let hasRecursionError = false;
    const errors = [];
    for (const error of this.errors.errors) {
      const str = this._errorToDisplayString(error);
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

  private _errorToDisplayString(err: Status) {
    const sourceInfo = anyUnpack(
      err.details[0],
      createRegistry(SourceInfoSchema)
    ) as SourceInfo;
    if (sourceInfo?.$typeName !== SourceInfoSchema.typeName) {
      throw new Error('Invalid source info');
    }
    const [line, column] = sourceInfo.location.split(':').map(Number);
    const result = `ERROR: ${this.sourceDescription}:${line}:${column + 1}: ${
      err.message
    }`;
    if (line < 0 || column < 0) {
      return result;
    }
    const sourceLine = '\n | ' + this.source.split('\n')[line - 1];
    let indLine = '\n | ';
    for (let i = 0; i < column; i++) {
      indLine += '.';
    }
    indLine += '^';
    return result + sourceLine + indLine;
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
  constructor(private readonly errors: Errors) {
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
    if (msg.startsWith('expression recursion limit exceeded')) {
      this.errors.reportInternalError(msg);
    } else {
      this.errors.reportSyntaxError({ line, column: charPositionInLine }, msg);
    }
  }
}
