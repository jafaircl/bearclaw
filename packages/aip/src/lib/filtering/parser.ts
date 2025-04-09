import {
  Expr,
  ParsedExpr,
  ParsedExprSchema,
  SourceInfoSchema,
} from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { ParseError } from './errors';
import { FunctionNot } from './functions';
import { Lexer } from './lexer';
import {
  parsedExpression,
  parsedFactor,
  parsedFloat,
  parsedFunction,
  parsedInt,
  parsedMember,
  parsedSequence,
  parsedString,
  parsedText,
} from './parsedexpr';
import { Position } from './position';
import { Token } from './token';
import {
  TokenType,
  TokenTypeAnd,
  TokenTypeComma,
  TokenTypeDot,
  TokenTypeHas,
  TokenTypeHexNumber,
  TokenTypeLeftParen,
  TokenTypeMinus,
  TokenTypeNot,
  TokenTypeNumber,
  TokenTypeOr,
  TokenTypeRightParen,
  TokenTypeString,
  TokenTypeWhitespace,
} from './tokentype';

/**
 * Parser for filter expressions.
 */
export class Parser {
  private _filter: string;
  private _lexer: Lexer;
  private _id: bigint;
  private _positions: number[];

  constructor(filter: string) {
    this._filter = filter.trim();
    this._lexer = new Lexer(filter);
    this._id = -BigInt(1);
    this._positions = [];
  }

  /**
   * Parse the filter
   */
  parse(): ParsedExpr | Error {
    const e = this.parseExpression();
    if (e instanceof Error) {
      return e;
    }
    const end = this._lexer.position();
    const token = this._lexer.lex();
    if (token instanceof Error) {
      if (token.message !== 'EOF') {
        return token;
      }
    } else {
      return this.errorf(end, `unexpected trailing token: ${token.type.value}`);
    }
    return create(ParsedExprSchema, {
      expr: e,
      sourceInfo: this.sourceInfo(),
    });
  }

  sourceInfo() {
    const positions: Record<number, number> = {};
    for (let i = 0; i < this._positions.length; i++) {
      positions[i] = this._positions[i];
    }
    return create(SourceInfoSchema, {
      lineOffsets: this._lexer.lineOffsets(),
      positions,
    });
  }

  /**
   * ParseExpression parses an Expression.
   *
   * EBNF
   *
   * expression
   *    : sequence {WS AND WS sequence}
   *    ;
   */
  parseExpression(): Expr | Error {
    const start = this._lexer.position();
    const sequences: Expr[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.eatTokens(TokenTypeWhitespace);
      const sequence = this.parseSequence();
      if (sequence instanceof Error) {
        return this.wrapf(sequence, start, 'expression');
      }
      sequences.push(sequence);
      if (
        this.eatTokens(TokenTypeWhitespace, TokenTypeAnd, TokenTypeWhitespace)
      ) {
        break;
      }
    }
    let exp = sequences[0];
    for (let i = 1; i < sequences.length; i++) {
      exp = parsedExpression(this.nextID(start), exp, sequences[i]);
    }
    return exp;
  }

  /**
   * ParseSequence parses a Sequence.
   *
   * EBNF
   *
   * sequence
   *    : factor {WS factor}
   *    ;
   */
  parseSequence(): Expr | Error {
    const start = this._lexer.position();
    const factors: Expr[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const factor = this.parseFactor();
      if (factor instanceof Error) {
        return this.wrapf(factor, start, 'sequence');
      }
      factors.push(factor);
      if (this.sniffTokens(TokenTypeWhitespace, TokenTypeAnd)) {
        break;
      }
      if (this.eatTokens(TokenTypeWhitespace) instanceof Error) {
        break;
      }
    }
    if (factors.length === 1) {
      return factors[0];
    }
    let result = parsedSequence(this.nextID(start), factors[0], factors[1]);
    for (let i = 2; i < factors.length; i++) {
      result = parsedSequence(this.nextID(start), result, factors[i]);
    }
    return result;
  }

  /**
   * ParseFactor parses a Factor.
   *
   * EBNF
   *
   * factor
   *    : term {WS OR WS term}
   *    ;
   */
  parseFactor(): Expr | Error {
    const start = this._lexer.position();
    const terms: Expr[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const term = this.parseTerm();
      if (term instanceof Error) {
        return this.wrapf(term, start, 'factor');
      }
      terms.push(term);
      if (
        this.eatTokens(TokenTypeWhitespace, TokenTypeOr, TokenTypeWhitespace)
      ) {
        break;
      }
    }
    if (terms.length === 1) {
      return terms[0];
    }
    let result = parsedFactor(this.nextID(start), terms[0], terms[1]);
    for (let i = 2; i < terms.length; i++) {
      result = parsedFactor(this.nextID(start), result, terms[i]);
    }
    return result;
  }

  /**
   * ParseTerm parses a Term.
   *
   * EBNF
   *
   * term
   *    : [(NOT WS | MINUS)] simple
   *    ;
   */
  parseTerm(): Expr | Error {
    const start = this._lexer.position();
    let not = false;
    let minus = false;
    if (!this.eatTokens(TokenTypeNot, TokenTypeWhitespace)) {
      not = true;
    } else if (!this.eatTokens(TokenTypeMinus)) {
      minus = true;
    }
    const simple = this.parseSimple();
    if (simple instanceof Error) {
      return this.wrapf(simple, start, 'term');
    }
    if (not || minus) {
      if (minus) {
        // Simplify MINUS number to negation of the constant value
        if (simple.exprKind.case === 'constExpr') {
          switch (simple.exprKind.value.constantKind.case) {
            case 'int64Value':
              simple.exprKind.value.constantKind.value *= -BigInt(1);
              return simple;
            case 'doubleValue':
              simple.exprKind.value.constantKind.value *= -1;
              return simple;
            default:
              break;
          }
        }
      }
      return parsedFunction(this.nextID(start), FunctionNot, simple);
    }
    return simple;
  }

  /**
   * ParseSimple parses a Simple.
   *
   * EBNF
   *
   * simple
   *    : restriction
   *    | composite
   *    ;
   */
  parseSimple() {
    const start = this._lexer.position();
    if (this.sniffTokens(TokenTypeLeftParen)) {
      const composite = this.parseComposite();
      if (composite instanceof Error) {
        return this.wrapf(composite, start, 'simple');
      }
      return composite;
    }
    const restriction = this.parseRestriction();
    if (restriction instanceof Error) {
      return this.wrapf(restriction, start, 'simple');
    }
    return restriction;
  }

  /**
   * ParseRestriction parses a Restriction.
   *
   * EBNF
   *
   * restriction
   *    : comparable [comparator arg]
   *    ;
   */
  parseRestriction(): Expr | Error {
    const start = this._lexer.position();
    const comp = this.parseComparable();
    if (comp instanceof Error) {
      return this.wrapf(comp, start, 'restriction');
    }
    if (
      !(
        this.sniff((t) => t.isComparator()) ||
        this.sniff(TokenTypeWhitespace.test.bind(TokenTypeWhitespace), (t) =>
          t.isComparator()
        )
      )
    ) {
      return comp;
    }
    this.eatTokens(TokenTypeWhitespace);
    const comparatorToken = this.parseToken((t) => t.isComparator());
    if (comparatorToken instanceof Error) {
      return this.wrapf(comparatorToken, start, 'restriction');
    }
    this.eatTokens(TokenTypeWhitespace);
    let arg = this.parseArg();
    if (arg instanceof Error) {
      return this.wrapf(arg, start, 'restriction');
    }
    // Special case for `:`
    if (
      comparatorToken.type.value === TokenTypeHas.value &&
      arg.exprKind.case === 'identExpr'
    ) {
      // m:foo - true if m contains the key "foo".
      arg = parsedString(arg.id, arg.exprKind.value.name);
    }
    return parsedFunction(
      this.nextID(start),
      comparatorToken.type.function(),
      comp,
      arg
    );
  }

  /**
   * ParseComparable parses a Comparable.
   *
   * EBNF
   *
   * comparable
   *    : member
   *    | function
   *    | number (custom)
   *    ;
   */
  parseComparable(): Expr | Error {
    const start = this._lexer.position();
    const fun = this.tryParseFunction();
    if (!(fun instanceof Error)) {
      return fun;
    }
    const number = this.tryParseNumber();
    if (!(number instanceof Error)) {
      return number;
    }
    const member = this.parseMember();
    if (member instanceof Error) {
      return this.wrapf(member, start, 'comparable');
    }
    return member;
  }

  /**
   * ParseFunction parses a Function.
   *
   * EBNF
   *
   * function
   *    : name {DOT name} LPAREN [argList] RPAREN
   *    ;
   *
   * name
   *    : TEXT
   *    | keyword
   *    ;
   */
  parseFunction(): Expr | Error {
    const start = this._lexer.position();

    let name = '';
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const nameToken = this.parseToken((t) => t.isName());
      if (nameToken instanceof Error) {
        return this.wrapf(nameToken, start, 'function');
      }
      name += nameToken.unquote();
      const err = this.eatTokens(TokenTypeDot);
      if (err instanceof Error) {
        break;
      }
      name += '.';
    }

    const err = this.eatTokens(TokenTypeLeftParen);
    if (err instanceof Error) {
      return this.wrapf(err, start, 'function');
    }
    this.eatTokens(TokenTypeWhitespace);

    const args: Expr[] = [];
    while (!this.sniffTokens(TokenTypeRightParen)) {
      const arg = this.parseArg();
      if (arg instanceof Error) {
        return this.wrapf(arg, start, 'function');
      }
      args.push(arg);
      this.eatTokens(TokenTypeWhitespace);
      const err = this.eatTokens(TokenTypeComma);
      if (err instanceof Error) {
        break;
      }
      this.eatTokens(TokenTypeWhitespace);
    }
    this.eatTokens(TokenTypeWhitespace);
    const err2 = this.eatTokens(TokenTypeRightParen);
    if (err2 instanceof Error) {
      return this.wrapf(err2, start, 'function');
    }
    return parsedFunction(this.nextID(start), name, ...args);
  }

  tryParseFunction(): Expr | Error {
    const copy = Parser.from(this);
    const result = copy.parseFunction();
    if (result instanceof Error) {
      return result;
    }
    this._lexer = copy._lexer;
    this._id = copy._id;
    this._positions = copy._positions;
    return result;
  }

  /**
   * ParseMember parses a Member.
   *
   * EBNF
   *
   * member
   *    : value {DOT field}
   *    ;
   *
   * value
   *    : TEXT
   *    | STRING
   *    ;
   *
   * field
   *    : value
   *    | keyword
   *    | number
   *    ;
   */
  parseMember(): Expr | Error {
    const start = this._lexer.position();
    const valueToken = this.parseToken((t) => t.isValue());
    if (valueToken instanceof Error) {
      return this.wrapf(valueToken, start, 'member');
    }
    if (!this.sniffTokens(TokenTypeDot)) {
      if (valueToken.type.value === TokenTypeString.value) {
        return parsedString(
          this.nextID(valueToken.position),
          valueToken.unquote()
        );
      }
      return parsedText(this.nextID(valueToken.position), valueToken.value);
    }
    const value = parsedText(
      this.nextID(valueToken.position),
      valueToken.unquote()
    );
    this.eatTokens(TokenTypeDot);
    const firstFieldToken = this.parseToken((t) => t.isField());
    if (firstFieldToken instanceof Error) {
      return this.wrapf(firstFieldToken, start, 'member');
    }
    let member = parsedMember(
      this.nextID(firstFieldToken.position),
      value,
      firstFieldToken.unquote()
    );
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const err = this.eatTokens(TokenTypeDot);
      if (err instanceof Error) {
        break;
      }
      const fieldToken = this.parseToken((t) => t.isField());
      if (fieldToken instanceof Error) {
        break;
      }
      member = parsedMember(
        this.nextID(fieldToken.position),
        member,
        fieldToken.unquote()
      );
    }
    if (member instanceof Error) {
      return this.wrapf(member, start, 'member');
    }
    return member;
  }

  /**
   * ParseComposite parses a Composite.
   *
   * EBNF
   *
   * composite
   *    : LPAREN expression RPAREN
   *    ;
   */
  parseComposite(): Expr | Error {
    const start = this._lexer.position();
    let err = this.eatTokens(TokenTypeLeftParen);
    if (err instanceof Error) {
      return this.wrapf(err, start, 'composite');
    }
    this.eatTokens(TokenTypeWhitespace);
    const expression = this.parseExpression();
    if (expression instanceof Error) {
      return this.wrapf(expression, start, 'composite');
    }
    this.eatTokens(TokenTypeWhitespace);
    err = this.eatTokens(TokenTypeRightParen);
    if (err instanceof Error) {
      return this.wrapf(err, start, 'composite');
    }
    return expression;
  }

  /**
   * ParseNumber parses a number.
   *
   * EBNF
   *
   * number
   *    : float
   *    | int
   *    ;
   *
   * float
   *    : MINUS? (NUMBER DOT NUMBER* | DOT NUMBER) EXP?
   *    ;
   *
   * int
   *    : MINUS? NUMBER
   *    | MINUS? HEX
   *    ;
   */
  parseNumber(): Expr | Error {
    const start = this._lexer.position();
    const float = this.tryParseFloat();
    if (!(float instanceof Error)) {
      return float;
    }
    const int = this.parseInt();
    if (int instanceof Error) {
      return this.wrapf(int, start, 'number');
    }
    return int;
  }

  tryParseNumber() {
    const copy = Parser.from(this);
    const result = copy.parseNumber();
    if (result instanceof Error) {
      return result;
    }
    this._lexer = copy._lexer;
    this._id = copy._id;
    this._positions = copy._positions;
    return result;
  }

  /**
   * ParseFloat parses a float.
   *
   * EBNF
   *
   * float
   *    : MINUS? (NUMBER DOT NUMBER* | DOT NUMBER) EXP?
   *    ;
   */
  parseFloat(): Expr | Error {
    const start = this._lexer.position();
    let minusToken: Token | Error | null = null;
    if (this.sniffTokens(TokenTypeMinus)) {
      minusToken = this._lexer.lex();
      if (minusToken instanceof Error) {
        return this.wrapf(minusToken, start, 'float');
      }
    }

    let intToken: Token | Error | null = null;
    if (this.sniffTokens(TokenTypeNumber)) {
      intToken = this._lexer.lex();
      if (intToken instanceof Error) {
        return this.wrapf(intToken, start, 'float');
      }
    }

    const dotToken = this.parseToken(TokenTypeDot.test.bind(TokenTypeDot));
    if (dotToken instanceof Error) {
      return this.wrapf(dotToken, start, 'float');
    }

    let fractionToken: Token | Error | null = null;
    if (this.sniffTokens(TokenTypeNumber)) {
      fractionToken = this._lexer.lex();
      if (fractionToken instanceof Error) {
        return this.wrapf(fractionToken, start, 'float');
      }
    }

    if (!fractionToken && !intToken) {
      return this.wrapf(
        this.errorf(start, 'expected int or fraction'),
        start,
        'float'
      );
    }

    let stringValue = '';
    if (minusToken) {
      stringValue += minusToken.value;
    }
    if (intToken) {
      stringValue += intToken.value;
    }
    stringValue += dotToken.value;
    if (fractionToken) {
      stringValue += fractionToken.value;
    }
    try {
      const floatValue = parseFloat(stringValue);
      return parsedFloat(this.nextID(start), floatValue);
    } catch (err) {
      return this.wrapf(err as Error, start, 'float');
    }
  }

  tryParseFloat(): Expr | Error {
    const copy = Parser.from(this);
    const result = copy.parseFloat();
    if (result instanceof Error) {
      return result;
    }
    this._lexer = copy._lexer;
    this._id = copy._id;
    this._positions = copy._positions;
    return result;
  }

  /**
   * ParseInt parses an int.
   *
   * EBNF
   *
   * int
   *    : MINUS? NUMBER
   *    | MINUS? HEX
   *    ;
   */
  parseInt(): Expr | Error {
    const start = this._lexer.position();
    const minus = this.eatTokens(TokenTypeMinus) === null;
    const token = this.parseToken(
      TokenTypeNumber.test.bind(TokenTypeNumber),
      TokenTypeHexNumber.test.bind(TokenTypeHexNumber)
    );
    if (token instanceof Error) {
      return this.wrapf(token, start, 'int');
    }
    try {
      let intValue = BigInt(token.value);
      if (minus) {
        intValue = -intValue;
      }
      return parsedInt(this.nextID(start), intValue);
    } catch (err) {
      return this.wrapf(err as Error, start, 'int');
    }
  }

  /**
   * ParseArg parses an Arg.
   *
   * EBNF
   *
   * arg
   *    : comparable
   *    | composite
   *    ;
   */
  parseArg(): Expr | Error {
    const start = this._lexer.position();
    if (this.sniffTokens(TokenTypeLeftParen)) {
      const composite = this.parseComposite();
      if (composite instanceof Error) {
        return this.wrapf(composite, start, 'arg');
      }
      return composite;
    }
    const comparable = this.parseComparable();
    if (comparable instanceof Error) {
      return this.wrapf(comparable, start, 'arg');
    }
    return comparable;
  }

  parseToken(...fns: ((t: TokenType) => boolean)[]) {
    const start = this._lexer.position();
    const token = this._lexer.lex();
    if (token instanceof Error) {
      return this.wrapf(token, start, 'parse token');
    }
    for (const fn of fns) {
      if (fn(token.type)) {
        return token;
      }
    }
    return this.errorf(token.position, `unexpected token ${token.type.value}`);
  }

  sniff(...fns: ((t: TokenType) => boolean)[]) {
    const copy = Lexer.from(this._lexer);
    for (const fn of fns) {
      const token = copy.lex();
      if (token instanceof Error || !fn(token.type)) {
        return false;
      }
    }
    return true;
  }

  sniffTokens(...wantTokenTypes: TokenType[]) {
    const copy = Lexer.from(this._lexer);
    for (const wantTokenType of wantTokenTypes) {
      const token = copy.lex();
      if (token instanceof Error || wantTokenType.value !== token.type.value) {
        return false;
      }
    }
    return true;
  }

  eatTokens(...wantTokenTypes: TokenType[]) {
    const copy = Lexer.from(this._lexer);
    for (const wantTokenType of wantTokenTypes) {
      const token = copy.lex();
      if (token instanceof Error || wantTokenType.value !== token.type.value) {
        return this.errorf(copy.position(), `expected ${wantTokenType}}`);
      }
    }
    this._lexer = copy;
    return null;
  }

  errorf(position: Position, message: string) {
    return new ParseError(message, this._filter, position);
  }

  wrapf(err: Error, position: Position, message: string) {
    return new ParseError(message, this._filter, position, err);
  }

  nextID(position: Position) {
    this._id++;
    this._positions.push(position.offset);
    return this._id;
  }

  static from(parser: Parser) {
    const newParser = new Parser(parser._filter);
    newParser._lexer = Lexer.from(parser._lexer);
    newParser._id = parser._id;
    newParser._positions = [...parser._positions];
    return newParser;
  }
}
