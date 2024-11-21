import { isNil } from '@bearclaw/is';
import { Location } from './location';
import { Source } from './source';
import { decodeRuneInString } from './utf8';

const dot = '.';
const ind = '^';
const wideDot = '\uff0e';
const wideInd = '\uff3e';

/**
 * maxSnippetLength is the largest number of characters which can be rendered
 * in an error message snippet.
 */
const maxSnippetLength = 16384;

/**
 * Error type which references an expression id, a location within source, and a message.
 */
export class CELError {
  constructor(
    public readonly id: bigint,
    public readonly location: Location,
    public readonly message: string
  ) {}

  /**
   * ToDisplayString decorates the error message with the source location.
   */
  toDisplayString(source: Source): string {
    let result = `ERROR: ${source.description()}:${this.location.line}:${
      this.location.column + 1
    }: ${this.message}`;
    let snippet = source.snippet(this.location.line);
    if (!isNil(snippet) && snippet.length <= maxSnippetLength) {
      snippet = snippet.replace(/\t/g, ' ');
      const srcLine = `\n | ${snippet}`;
      let bytesStr = snippet;
      let indLine = '\n | ';
      for (let i = 0; i < this.location.column; i++) {
        const [_, sz] = decodeRuneInString(bytesStr);
        bytesStr = bytesStr.slice(sz);
        if (sz > 1) {
          indLine += wideDot;
        } else {
          indLine += dot;
        }
      }
      const [_, sz] = decodeRuneInString(bytesStr);
      if (sz > 1) {
        indLine += wideInd;
      } else {
        indLine += ind;
      }
      result += srcLine + indLine;
    }
    return result;
  }
}
