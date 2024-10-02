/* eslint-disable @typescript-eslint/no-unused-vars */
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

export class Errors {
  public readonly errors = create(ErrorSetSchema);
  public numErrors = 0;

  constructor(
    public readonly source: string,
    public readonly sourceDescription = '<input>',
    public readonly maxErrorsToReport = 100
  ) {}

  public reportError(line: number, column: number, message: string) {
    this.reportErrorAtId(BigInt(0), line, column, message);
  }

  public reportErrorAtId(
    id: bigint,
    line: number,
    column: number,
    message: string
  ) {
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
              [id.toString()]: column,
            },
            lineOffsets: [line],
            location: `${line}:${column}`,
            syntaxVersion: 'cel1',
          })
        ),
      ],
    });
    this.errors.errors.push(err);
  }

  public toDisplayString() {
    return this.errors.errors
      .map((err) => this._errorToDisplayString(err))
      .join('\n ');
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
    this.errors.reportErrorAtId(
      BigInt(offendingSymbol ?? 0),
      line,
      charPositionInLine,
      `Syntax error: ${msg}`
    );
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
    this.errors.reportErrorAtId(
      BigInt(offendingSymbol?.tokenIndex ?? 0),
      line,
      charPositionInLine,
      `Syntax error: ${msg}`
    );
  }
}
