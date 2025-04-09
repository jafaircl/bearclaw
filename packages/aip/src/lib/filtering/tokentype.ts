/**
 * TokenType represents the type of a filter expression token.
 *
 * See: https://google.aip.dev/assets/misc/ebnf-filtering.txt
 */
export class TokenType {
  constructor(public readonly value: string) {}

  function() {
    if (this.isComparator() || this.isKeyword()) {
      return this.value;
    }
    return '';
  }

  /**
   * IsValue returns true if the token is a valid value.
   */
  isValue() {
    switch (this.value) {
      case TokenTypeText.value:
      case TokenTypeString.value:
        return true;
      default:
        return false;
    }
  }

  /**
   * IsField returns true if the token is a valid field.
   */
  isField() {
    return (
      this.isValue() || this.isKeyword() || this.value === TokenTypeNumber.value
    );
  }

  /**
   * IsName returns true if the token is a valid name.
   */
  isName() {
    return this.value === TokenTypeText.value || this.isKeyword();
  }

  test(other: TokenType) {
    return this.value === other.value;
  }

  /**
   * IsKeyword returns true if the token is a valid keyword.
   */
  isKeyword() {
    switch (this.value) {
      case TokenTypeNot.value:
      case TokenTypeAnd.value:
      case TokenTypeOr.value:
        return true;
      default:
        return false;
    }
  }

  /**
   * IsComparator returns true if the token is a valid comparator.
   */
  isComparator() {
    switch (this.value) {
      case TokenTypeLessEquals.value:
      case TokenTypeLessThan.value:
      case TokenTypeGreaterEquals.value:
      case TokenTypeGreaterThan.value:
      case TokenTypeNotEquals.value:
      case TokenTypeEquals.value:
      case TokenTypeHas.value:
        return true;
      default:
        return false;
    }
  }
}

// Value token types.
export const TokenTypeWhitespace = new TokenType('WS');
export const TokenTypeText = new TokenType('TEXT');
export const TokenTypeString = new TokenType('STRING');

// Keyword token types.
export const TokenTypeNot = new TokenType('NOT');
export const TokenTypeAnd = new TokenType('AND');
export const TokenTypeOr = new TokenType('OR');

// Numeric token types.
export const TokenTypeNumber = new TokenType('NUM');
export const TokenTypeHexNumber = new TokenType('HEX');

// Operator token types.
export const TokenTypeLeftParen = new TokenType('(');
export const TokenTypeRightParen = new TokenType(')');
export const TokenTypeMinus = new TokenType('-');
export const TokenTypeDot = new TokenType('.');
export const TokenTypeEquals = new TokenType('=');
export const TokenTypeHas = new TokenType(':');
export const TokenTypeLessThan = new TokenType('<');
export const TokenTypeGreaterThan = new TokenType('>');
export const TokenTypeExclaim = new TokenType('!');
export const TokenTypeComma = new TokenType(',');
export const TokenTypeLessEquals = new TokenType('<=');
export const TokenTypeGreaterEquals = new TokenType('>=');
export const TokenTypeNotEquals = new TokenType('!=');
