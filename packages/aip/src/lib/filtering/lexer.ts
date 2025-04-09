import { LexError } from './errors';
import { Position } from './position';
import { Token } from './token';
import {
  TokenType,
  TokenTypeHexNumber,
  TokenTypeNumber,
  TokenTypeString,
  TokenTypeText,
  TokenTypeWhitespace,
} from './tokentype';
import { decodeRuneInString, RuneError } from './utf8';

/**
 * Lexer is a filter expression lexer.
 */
export class Lexer {
  private _filter: string;
  private _tokenStart: Position;
  private _tokenEnd: Position;
  private _lineOffsets: number[];

  constructor(filter: string) {
    this._filter = filter.trim();
    this._tokenStart = new Position(0, 1, 1);
    this._tokenEnd = new Position(0, 1, 1);
    this._lineOffsets = [];
  }

  lex() {
    const [r, err] = this.nextRune();
    if (err !== null) {
      return err;
    }
    switch (String.fromCharCode(r)) {
      // Single-character operator?
      case '(':
      case ')':
      case '-':
      case '.':
      case '=':
      case ':':
      case ',':
        return this.emit(new TokenType(this.tokenValue()));
      // Two-character operator?
      case '<':
      case '>':
      case '!':
        if (this.sniffRune('=')) {
          this.nextRune();
        }
        return this.emit(new TokenType(this.tokenValue()));
      // String?
      case "'":
      case '"':
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const [r2, err] = this.nextRune();
          if (err !== null) {
            if (err.message === 'EOF') {
              return this.errorf('unterminated string');
            }
            return err;
          }
          if (r === r2) {
            return this.emit(TokenTypeString);
          }
        }
      // Number?
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        // Hex number?
        if (this.sniffRune('x')) {
          this.nextRune();
          while (this.sniff(isHexDigit)) {
            this.nextRune();
          }
          return this.emit(TokenTypeHexNumber);
        }
        while (this.sniff(isDigit)) {
          this.nextRune();
        }
        return this.emit(TokenTypeNumber);
    }
    // Space?
    if (isSpace(r)) {
      while (this.sniff(isSpace)) {
        this.nextRune();
      }
      return this.emit(TokenTypeWhitespace);
    }
    // Text or keyword.
    while (this.sniff(isText)) {
      this.nextRune();
    }
    // Keyword?
    const tokenType = new TokenType(this.tokenValue());
    if (tokenType.isKeyword()) {
      return this.emit(tokenType);
    }
    // Text.
    return this.emit(TokenTypeText);
  }

  /**
   * Position returns the current position of the lexer.
   */
  position() {
    return this._tokenStart;
  }

  /**
   * LineOffsets returns a monotonically increasing list of character offsets
   * where newlines appear.
   */
  lineOffsets() {
    return this._lineOffsets;
  }

  emit(t: TokenType) {
    const token = new Token(
      Position.from(this._tokenStart),
      t,
      this.tokenValue()
    );
    this._tokenStart = Position.from(this._tokenEnd);
    return token;
  }

  tokenValue() {
    return this._filter.slice(this._tokenStart.offset, this._tokenEnd.offset);
  }

  remainingFilter() {
    return this._filter.slice(this._tokenEnd.offset);
  }

  nextRune(): [number, Error | null] {
    const [r, n] = decodeRuneInString(this.remainingFilter());
    if (n === 0) {
      return [r, new Error('EOF')];
    }
    if (r === RuneError) {
      return [r, this.errorf('invalid UTF-8')];
    }
    if (r === '\n'.charCodeAt(0)) {
      this._lineOffsets.push(this._tokenEnd.offset);
      this._tokenEnd.line++;
      this._tokenEnd.column = 1;
    } else {
      this._tokenEnd.column++;
    }
    this._tokenEnd.offset += n;
    return [r, null];
  }

  sniff(...wantFns: ((r: number) => boolean)[]): boolean {
    let remaining = this.remainingFilter();
    for (const wantFn of wantFns) {
      const [r, n] = decodeRuneInString(remaining);
      if (!wantFn(r)) {
        return false;
      }
      remaining = remaining.slice(n);
    }
    return true;
  }

  sniffRune(want: string) {
    const [r] = decodeRuneInString(this.remainingFilter());
    return r === want.charCodeAt(0);
  }

  errorf(message: string) {
    return new LexError(message, this._filter, this._tokenStart);
  }

  static from(lexer: Lexer) {
    const newLexer = new Lexer(lexer._filter);
    newLexer._tokenStart = Position.from(lexer._tokenStart);
    newLexer._tokenEnd = Position.from(lexer._tokenEnd);
    newLexer._lineOffsets = [...lexer._lineOffsets];
    return newLexer;
  }
}

function isText(r: number) {
  switch (r) {
    case RuneError:
    case '('.charCodeAt(0):
    case ')'.charCodeAt(0):
    case '-'.charCodeAt(0):
    case '.'.charCodeAt(0):
    case '='.charCodeAt(0):
    case ':'.charCodeAt(0):
    case '<'.charCodeAt(0):
    case '>'.charCodeAt(0):
    case '!'.charCodeAt(0):
    case ','.charCodeAt(0):
      return false;
    default:
      return !isSpace(r);
  }
}

function isSpace(r: number) {
  switch (r) {
    case ' '.charCodeAt(0):
    case '\t'.charCodeAt(0):
    case '\n'.charCodeAt(0):
    case '\r'.charCodeAt(0):
    case 0x85:
    case 0xa0:
      return true;
    default:
      return false;
  }
}

function isHexDigit(codePoint: number): boolean {
  return (
    (codePoint >= 'a'.charCodeAt(0) && codePoint <= 'f'.charCodeAt(0)) ||
    (codePoint >= 'A'.charCodeAt(0) && codePoint <= 'F'.charCodeAt(0)) ||
    (codePoint >= '0'.charCodeAt(0) && codePoint <= '9'.charCodeAt(0))
  );
}

function isDigit(codePoint: number): boolean {
  return codePoint >= '0'.charCodeAt(0) && codePoint <= '9'.charCodeAt(0);
}
