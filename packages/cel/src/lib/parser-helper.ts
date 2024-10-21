import { SourceInfoSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { ParserRuleContext, Token } from 'antlr4';
import { Location, OffsetRange } from './types';
import { computeOffset, getLocationByOffset } from './utils';

export class ParserHelper {
  #id = BigInt(1);
  #sourceInfo = create(SourceInfoSchema);
  #baseLine = 0;
  #baseColumn = 0;

  constructor(public readonly source: string) {
    this._computeSourceOffsets(source);
  }

  public get sourceInfo() {
    return this.#sourceInfo;
  }

  public currentId() {
    return this.#id;
  }

  public nextId(
    ctx?: ParserRuleContext | Token | Location | OffsetRange | null
  ) {
    const id = this.#id++;
    if (ctx) {
      let offsetRange: OffsetRange = { start: 0, stop: 0 };
      if (ctx instanceof ParserRuleContext) {
        offsetRange.start = this.computeOffset(
          ctx.start.line,
          ctx.start.column
        );
        offsetRange.stop = offsetRange.start + ctx.getText().length;
      } else if (ctx instanceof Token) {
        offsetRange.start = this.computeOffset(ctx.line, ctx.column);
        offsetRange.stop = offsetRange.start + ctx.text.length;
      } else if ('line' in ctx && 'column' in ctx) {
        // Location
        offsetRange.start = this.computeOffset(ctx.line, ctx.column);
        offsetRange.stop = offsetRange.start;
      } else {
        offsetRange = ctx as OffsetRange;
      }
      this.#sourceInfo.positions[id.toString()] = offsetRange.start;
    }
    return id;
  }

  /**
   * calculates the 0-based character offset from a 1-based line and 0-based
   * column.
   * @param line a 1-based line number
   * @param column a 0-based column number
   */
  computeOffset(line: number, column: number) {
    return computeOffset(
      this.#baseLine,
      this.#baseColumn,
      this.#sourceInfo,
      line,
      column
    );
  }

  /**
   * Returns the line and column information for a given character offset.
   *
   * @param offset the 0-based character offset
   * @returns the line and column information
   */
  getLocationByOffset(offset: number): Location {
    return getLocationByOffset(this.#sourceInfo, offset);
  }

  /**
   * Computes line offsets for the source code.
   *
   * @param source the source code
   */
  private _computeSourceOffsets(source: string) {
    const lines = source.split('\n');
    let offset = 0;
    for (const line of lines) {
      offset += line.length + 1;
      this.#sourceInfo.lineOffsets.push(offset);
    }
  }
}
