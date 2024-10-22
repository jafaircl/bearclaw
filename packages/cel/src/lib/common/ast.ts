import { SourceInfo } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';

export interface Location {
  line: number;
  column: number;
}

export interface OffsetRange {
  start: number;
  stop: number;
}

/**
 * Returns the line and column information for a given character offset.
 *
 * @param offset the 0-based character offset
 * @returns the line and column information
 */
export function getLocationByOffset(
  sourceInfo: SourceInfo,
  offset: number
): Location {
  let line = 1;
  let column = offset;
  for (let i = 0; i < sourceInfo.lineOffsets.length; i++) {
    const lineOffset = sourceInfo.lineOffsets[i];
    if (lineOffset > offset) {
      break;
    }
    line++;
    column = offset - lineOffset;
  }
  return { line, column };
}

/**
 * calculates the 0-based character offset from a 1-based line and 0-based
 * column.
 * @param line a 1-based line number
 * @param column a 0-based column number
 */
export function computeOffset(
  baseLine: number,
  baseColumn: number,
  sourceInfo: SourceInfo,
  line: number,
  column: number
) {
  line = baseLine + line;
  column = baseColumn + column;
  if (line === 1) {
    return column;
  }
  if (line < 1 || line > sourceInfo.lineOffsets.length) {
    return -1;
  }
  const offset = sourceInfo.lineOffsets[line - 2];
  return offset + column;
}
