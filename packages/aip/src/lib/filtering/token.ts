import { Position } from './position';
import { TokenType, TokenTypeString } from './tokentype';

/**
 * Token represents a token in a filter expression.
 */
export class Token {
  /**
   * Position of the token.
   */
  position: Position;
  /**
   * Type of the token.
   */
  type: TokenType;
  /**
   * Value of the token, if the token is a text or a string.
   */
  value: string;

  constructor(position: Position, type: TokenType, value: string) {
    this.position = position;
    this.type = type;
    this.value = value;
  }

  unquote(): string {
    if (this.type.value === TokenTypeString.value) {
      if (this.value.length <= 2) {
        return '';
      }
      return this.value.slice(1, this.value.length - 1);
    }
    return this.value;
  }
}
