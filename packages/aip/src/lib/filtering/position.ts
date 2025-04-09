/**
 * Position represents a position in a filter expression.
 */
export class Position {
  /**
   * Offset is the byte offset, starting at 0.
   */
  offset: number;
  /**
   * Line is the line number, starting at 1.
   */
  line: number;
  /**
   * Column is the column number, starting at 1 (character count per line).
   */
  column: number;

  constructor(offset: number, line: number, column: number) {
    this.offset = offset;
    this.line = line;
    this.column = column;
  }

  /**
   * String returns a string representation of the position on the format
   * <line>:<column>.
   */
  toString(): string {
    return `${this.line}:${this.column}`;
  }

  static from(pos: Position) {
    return new Position(pos.offset, pos.line, pos.column);
  }
}
