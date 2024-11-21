import { isNil } from '@bearclaw/is';
import {
  SourceInfo,
  SourceInfoSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { Buffer, newBuffer } from './buffer';
import { Location } from './location';

/**
 * Source interface for filter source contents.
 */
export interface Source {
  /**
   * Returns the source content represented as a string.
   * Examples contents are the single file contents, textbox field,
   * or url parameter.
   */
  content(): string;

  /**
   * Gives a brief description of the source.
   * Example descriptions are a file name or ui element.
   */
  description(): string;

  /**
   * Gives the character offsets at which lines occur.
   * The zero-th entry should refer to the break between the first
   * and second line, or EOF if there is only one line of source.
   */
  lineOffsets(): number[];

  /**
   * Translates a Location to an offset.
   * Given the line and column of the Location returns the
   * Location's character offset in the Source, and a bool
   * indicating whether the Location was found.
   */
  locationOffset(location: Location): number | null;

  /**
   * Translates a character offset to a Location, or
   * null if the conversion was not feasible.
   */
  offsetLocation(offset: number): Location | null;

  /**
   * Takes an input line and column and produces a Location.
   * The default behavior is to treat the line and column as absolute,
   * but concrete derivations may use this method to convert a relative
   * line and column position into an absolute location.
   */
  newLocation(line: number, col: number): Location;

  /**
   * Returns a line of content and whether the line was found.
   */
  snippet(line: number): string | null;
}

class BaseSource implements Source {
  private readonly _buffer: Buffer;
  private readonly _description: string;
  private readonly _lineOffsets: number[];

  constructor(buffer: Buffer, description: string, lineOffsets: number[]) {
    this._buffer = buffer;
    this._description = description;
    this._lineOffsets = lineOffsets;
  }

  content() {
    return this._buffer.slice(0, this._buffer.len());
  }

  description(): string {
    return this._description;
  }

  lineOffsets(): number[] {
    return this._lineOffsets;
  }

  locationOffset(location: Location): number | null {
    const lineOffset = this.findLineOffset(location.line);
    if (!isNil(lineOffset)) {
      return lineOffset + location.column;
    }
    return null;
  }

  newLocation(line: number, col: number): Location {
    return new Location(line, col);
  }

  offsetLocation(offset: number): Location | null {
    const [line, lineOffset] = this.findLine(offset);
    if (isNil(lineOffset)) {
      return null;
    }
    return this.newLocation(line, offset - lineOffset);
  }

  snippet(line: number): string | null {
    const charStart = this.findLineOffset(line);
    if (isNil(charStart)) {
      return null;
    }
    const charEnd = this.findLineOffset(line + 1);
    if (!isNil(charEnd)) {
      return this._buffer.slice(charStart, charEnd - 1);
    }
    return this._buffer.slice(charStart, this._buffer.len());
  }

  /**
   * findLineOffset returns the offset where the (1-indexed) line begins, or
   * null if line doesn't exist.
   */
  findLineOffset(line: number): number | null {
    if (line === 1) {
      return 0;
    }
    if (line > 1 && line <= this._lineOffsets.length) {
      return this._lineOffsets[line - 2];
    }
    return null;
  }

  /**
   * findLine finds the line that contains the given character offset and
   * returns the line number and offset of the beginning of that line. Note
   * that the last line is treated as if it contains all offsets beyond the end
   * of the actual source.
   */
  findLine(characterOffset: number): [number, number] {
    let line = 1;
    for (let i = 0; i < this._lineOffsets.length; i++) {
      const lineOffset = this._lineOffsets[i];
      if (lineOffset > characterOffset) {
        break;
      }
      line++;
    }
    if (line === 1) {
      return [line, 0];
    }
    return [line, this._lineOffsets[line - 2]];
  }
}

/**
 * NewInfoSource creates a new Source from a SourceInfo.
 */
export class InfoSource extends BaseSource {
  constructor(info: SourceInfo = create(SourceInfoSchema)) {
    super(newBuffer('', false)[0], info.location, info.lineOffsets);
  }
}

/**
 *  NewStringSource creates a new Source from the given contents and
 * description.
 */
export class StringSource extends BaseSource {
  constructor(contents: string, description: string) {
    const [buf, offs] = newBuffer(contents, true);
    super(buf, description, offs);
  }
}

/**
 * NewTextSource creates a new Source from the input text string.
 */
export class TextSource extends StringSource {
  constructor(contents: string) {
    super(contents, '<input>');
  }
}
