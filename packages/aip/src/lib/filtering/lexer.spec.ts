import { Lexer } from './lexer';
import { Position } from './position';
import { Token } from './token';
import {
  TokenTypeAnd,
  TokenTypeComma,
  TokenTypeDot,
  TokenTypeEquals,
  TokenTypeGreaterEquals,
  TokenTypeGreaterThan,
  TokenTypeHas,
  TokenTypeHexNumber,
  TokenTypeLeftParen,
  TokenTypeLessEquals,
  TokenTypeLessThan,
  TokenTypeMinus,
  TokenTypeNot,
  TokenTypeNotEquals,
  TokenTypeNumber,
  TokenTypeOr,
  TokenTypeRightParen,
  TokenTypeString,
  TokenTypeText,
  TokenTypeWhitespace,
} from './tokentype';

describe('Lexer', () => {
  const tests: {
    filter: string;
    expected?: Token[];
    errorContains?: string;
  }[] = [
    {
      filter: `New York Giants`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, `New`),
        new Token(new Position(3, 1, 4), TokenTypeWhitespace, ' '),
        new Token(new Position(4, 1, 5), TokenTypeText, `York`),
        new Token(new Position(8, 1, 9), TokenTypeWhitespace, ' '),
        new Token(new Position(9, 1, 10), TokenTypeText, `Giants`),
      ],
    },
    {
      filter: `New York Giants OR Yankees`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, `New`),
        new Token(new Position(3, 1, 4), TokenTypeWhitespace, ' '),
        new Token(new Position(4, 1, 5), TokenTypeText, `York`),
        new Token(new Position(8, 1, 9), TokenTypeWhitespace, ' '),
        new Token(new Position(9, 1, 10), TokenTypeText, `Giants`),
        new Token(new Position(15, 1, 16), TokenTypeWhitespace, ' '),
        new Token(new Position(16, 1, 17), TokenTypeOr, `OR`),
        new Token(new Position(18, 1, 19), TokenTypeWhitespace, ' '),
        new Token(new Position(19, 1, 20), TokenTypeText, `Yankees`),
      ],
    },
    {
      filter: `New York (Giants OR Yankees)`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, `New`),
        new Token(new Position(3, 1, 4), TokenTypeWhitespace, ' '),
        new Token(new Position(4, 1, 5), TokenTypeText, `York`),
        new Token(new Position(8, 1, 9), TokenTypeWhitespace, ' '),
        new Token(new Position(9, 1, 10), TokenTypeLeftParen, `(`),
        new Token(new Position(10, 1, 11), TokenTypeText, 'Giants'),
        new Token(new Position(16, 1, 17), TokenTypeWhitespace, ' '),
        new Token(new Position(17, 1, 18), TokenTypeOr, 'OR'),
        new Token(new Position(19, 1, 20), TokenTypeWhitespace, ' '),
        new Token(new Position(20, 1, 21), TokenTypeText, 'Yankees'),
        new Token(new Position(27, 1, 28), TokenTypeRightParen, ')'),
      ],
    },
    {
      filter: `a b AND c AND d`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, 'a'),
        new Token(new Position(1, 1, 2), TokenTypeWhitespace, ' '),
        new Token(new Position(2, 1, 3), TokenTypeText, 'b'),
        new Token(new Position(3, 1, 4), TokenTypeWhitespace, ' '),
        new Token(new Position(4, 1, 5), TokenTypeAnd, 'AND'),
        new Token(new Position(7, 1, 8), TokenTypeWhitespace, ' '),
        new Token(new Position(8, 1, 9), TokenTypeText, 'c'),
        new Token(new Position(9, 1, 10), TokenTypeWhitespace, ' '),
        new Token(new Position(10, 1, 11), TokenTypeAnd, 'AND'),
        new Token(new Position(13, 1, 14), TokenTypeWhitespace, ' '),
        new Token(new Position(14, 1, 15), TokenTypeText, 'd'),
      ],
    },
    {
      filter: `(a b) AND c AND d`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeLeftParen, '('),
        new Token(new Position(1, 1, 2), TokenTypeText, 'a'),
        new Token(new Position(2, 1, 3), TokenTypeWhitespace, ' '),
        new Token(new Position(3, 1, 4), TokenTypeText, 'b'),
        new Token(new Position(4, 1, 5), TokenTypeRightParen, ')'),
        new Token(new Position(5, 1, 6), TokenTypeWhitespace, ' '),
        new Token(new Position(6, 1, 7), TokenTypeAnd, 'AND'),
        new Token(new Position(9, 1, 10), TokenTypeWhitespace, ' '),
        new Token(new Position(10, 1, 11), TokenTypeText, 'c'),
        new Token(new Position(11, 1, 12), TokenTypeWhitespace, ' '),
        new Token(new Position(12, 1, 13), TokenTypeAnd, 'AND'),
        new Token(new Position(15, 1, 16), TokenTypeWhitespace, ' '),
        new Token(new Position(16, 1, 17), TokenTypeText, 'd'),
      ],
    },
    {
      filter: `a < 10 OR a >= 100`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, 'a'),
        new Token(new Position(1, 1, 2), TokenTypeWhitespace, ' '),
        new Token(new Position(2, 1, 3), TokenTypeLessThan, '<'),
        new Token(new Position(3, 1, 4), TokenTypeWhitespace, ' '),
        new Token(new Position(4, 1, 5), TokenTypeNumber, '10'),
        new Token(new Position(6, 1, 7), TokenTypeWhitespace, ' '),
        new Token(new Position(7, 1, 8), TokenTypeOr, 'OR'),
        new Token(new Position(9, 1, 10), TokenTypeWhitespace, ' '),
        new Token(new Position(10, 1, 11), TokenTypeText, 'a'),
        new Token(new Position(11, 1, 12), TokenTypeWhitespace, ' '),
        new Token(new Position(12, 1, 13), TokenTypeGreaterEquals, '>='),
        new Token(new Position(14, 1, 15), TokenTypeWhitespace, ' '),
        new Token(new Position(15, 1, 16), TokenTypeNumber, '100'),
      ],
    },
    {
      filter: `NOT (a OR b)`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeNot, 'NOT'),
        new Token(new Position(3, 1, 4), TokenTypeWhitespace, ' '),
        new Token(new Position(4, 1, 5), TokenTypeLeftParen, '('),
        new Token(new Position(5, 1, 6), TokenTypeText, 'a'),
        new Token(new Position(6, 1, 7), TokenTypeWhitespace, ' '),
        new Token(new Position(7, 1, 8), TokenTypeOr, 'OR'),
        new Token(new Position(9, 1, 10), TokenTypeWhitespace, ' '),
        new Token(new Position(10, 1, 11), TokenTypeText, 'b'),
        new Token(new Position(11, 1, 12), TokenTypeRightParen, ')'),
      ],
    },
    {
      filter: `-file:".java"`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeMinus, '-'),
        new Token(new Position(1, 1, 2), TokenTypeText, 'file'),
        new Token(new Position(5, 1, 6), TokenTypeHas, ':'),
        new Token(new Position(6, 1, 7), TokenTypeString, '".java"'),
      ],
    },
    {
      filter: `-30`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeMinus, '-'),
        new Token(new Position(1, 1, 2), TokenTypeNumber, '30'),
      ],
    },
    {
      filter: `package=com.google`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, 'package'),
        new Token(new Position(7, 1, 8), TokenTypeEquals, '='),
        new Token(new Position(8, 1, 9), TokenTypeText, 'com'),
        new Token(new Position(11, 1, 12), TokenTypeDot, '.'),
        new Token(new Position(12, 1, 13), TokenTypeText, 'google'),
      ],
    },
    {
      filter: `msg != 'hello'`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, 'msg'),
        new Token(new Position(3, 1, 4), TokenTypeWhitespace, ' '),
        new Token(new Position(4, 1, 5), TokenTypeNotEquals, '!='),
        new Token(new Position(6, 1, 7), TokenTypeWhitespace, ' '),
        new Token(new Position(7, 1, 8), TokenTypeString, "'hello'"),
      ],
    },
    {
      filter: `1 > 0`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeNumber, '1'),
        new Token(new Position(1, 1, 2), TokenTypeWhitespace, ' '),
        new Token(new Position(2, 1, 3), TokenTypeGreaterThan, '>'),
        new Token(new Position(3, 1, 4), TokenTypeWhitespace, ' '),
        new Token(new Position(4, 1, 5), TokenTypeNumber, '0'),
      ],
    },
    {
      filter: `2.5 >= 2.4`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeNumber, '2'),
        new Token(new Position(1, 1, 2), TokenTypeDot, '.'),
        new Token(new Position(2, 1, 3), TokenTypeNumber, '5'),
        new Token(new Position(3, 1, 4), TokenTypeWhitespace, ' '),
        new Token(new Position(4, 1, 5), TokenTypeGreaterEquals, '>='),
        new Token(new Position(6, 1, 7), TokenTypeWhitespace, ' '),
        new Token(new Position(7, 1, 8), TokenTypeNumber, '2'),
        new Token(new Position(8, 1, 9), TokenTypeDot, '.'),
        new Token(new Position(9, 1, 10), TokenTypeNumber, '4'),
      ],
    },
    {
      filter: `yesterday < request.time`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, 'yesterday'),
        new Token(new Position(9, 1, 10), TokenTypeWhitespace, ' '),
        new Token(new Position(10, 1, 11), TokenTypeLessThan, '<'),
        new Token(new Position(11, 1, 12), TokenTypeWhitespace, ' '),
        new Token(new Position(12, 1, 13), TokenTypeText, 'request'),
        new Token(new Position(19, 1, 20), TokenTypeDot, '.'),
        new Token(new Position(20, 1, 21), TokenTypeText, 'time'),
      ],
    },
    {
      filter: `experiment.rollout <= cohort(request.user)`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, 'experiment'),
        new Token(new Position(10, 1, 11), TokenTypeDot, '.'),
        new Token(new Position(11, 1, 12), TokenTypeText, 'rollout'),
        new Token(new Position(18, 1, 19), TokenTypeWhitespace, ' '),
        new Token(new Position(19, 1, 20), TokenTypeLessEquals, '<='),
        new Token(new Position(21, 1, 22), TokenTypeWhitespace, ' '),
        new Token(new Position(22, 1, 23), TokenTypeText, 'cohort'),
        new Token(new Position(28, 1, 29), TokenTypeLeftParen, '('),
        new Token(new Position(29, 1, 30), TokenTypeText, 'request'),
        new Token(new Position(36, 1, 37), TokenTypeDot, '.'),
        new Token(new Position(37, 1, 38), TokenTypeText, 'user'),
        new Token(new Position(41, 1, 42), TokenTypeRightParen, ')'),
      ],
    },
    {
      filter: `prod`,
      expected: [new Token(new Position(0, 1, 1), TokenTypeText, 'prod')],
    },
    {
      filter: `expr.type_map.1.type`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, 'expr'),
        new Token(new Position(4, 1, 5), TokenTypeDot, '.'),
        new Token(new Position(5, 1, 6), TokenTypeText, 'type_map'),
        new Token(new Position(13, 1, 14), TokenTypeDot, '.'),
        new Token(new Position(14, 1, 15), TokenTypeNumber, '1'),
        new Token(new Position(15, 1, 16), TokenTypeDot, '.'),
        new Token(new Position(16, 1, 17), TokenTypeText, 'type'),
      ],
    },
    {
      filter: `regex(m.key, '^.*prod.*$')`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, 'regex'),
        new Token(new Position(5, 1, 6), TokenTypeLeftParen, '('),
        new Token(new Position(6, 1, 7), TokenTypeText, 'm'),
        new Token(new Position(7, 1, 8), TokenTypeDot, '.'),
        new Token(new Position(8, 1, 9), TokenTypeText, 'key'),
        new Token(new Position(11, 1, 12), TokenTypeComma, ','),
        new Token(new Position(12, 1, 13), TokenTypeWhitespace, ' '),
        new Token(new Position(13, 1, 14), TokenTypeString, "'^.*prod.*$'"),
        new Token(new Position(25, 1, 26), TokenTypeRightParen, ')'),
      ],
    },
    {
      filter: `math.mem('30mb')`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, 'math'),
        new Token(new Position(4, 1, 5), TokenTypeDot, '.'),
        new Token(new Position(5, 1, 6), TokenTypeText, 'mem'),
        new Token(new Position(8, 1, 9), TokenTypeLeftParen, '('),
        new Token(new Position(9, 1, 10), TokenTypeString, "'30mb'"),
        new Token(new Position(15, 1, 16), TokenTypeRightParen, ')'),
      ],
    },
    {
      filter: `(msg.endsWith('world') AND retries < 10)`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeLeftParen, '('),
        new Token(new Position(1, 1, 2), TokenTypeText, 'msg'),
        new Token(new Position(4, 1, 5), TokenTypeDot, '.'),
        new Token(new Position(5, 1, 6), TokenTypeText, 'endsWith'),
        new Token(new Position(13, 1, 14), TokenTypeLeftParen, '('),
        new Token(new Position(14, 1, 15), TokenTypeString, "'world'"),
        new Token(new Position(21, 1, 22), TokenTypeRightParen, ')'),
        new Token(new Position(22, 1, 23), TokenTypeWhitespace, ' '),
        new Token(new Position(23, 1, 24), TokenTypeAnd, 'AND'),
        new Token(new Position(26, 1, 27), TokenTypeWhitespace, ' '),
        new Token(new Position(27, 1, 28), TokenTypeText, 'retries'),
        new Token(new Position(34, 1, 35), TokenTypeWhitespace, ' '),
        new Token(new Position(35, 1, 36), TokenTypeLessThan, '<'),
        new Token(new Position(36, 1, 37), TokenTypeWhitespace, ' '),
        new Token(new Position(37, 1, 38), TokenTypeNumber, '10'),
        new Token(new Position(39, 1, 40), TokenTypeRightParen, ')'),
      ],
    },
    {
      filter: `foo = 0xdeadbeef`,
      expected: [
        new Token(new Position(0, 1, 1), TokenTypeText, 'foo'),
        new Token(new Position(3, 1, 4), TokenTypeWhitespace, ' '),
        new Token(new Position(4, 1, 5), TokenTypeEquals, '='),
        new Token(new Position(5, 1, 6), TokenTypeWhitespace, ' '),
        new Token(new Position(6, 1, 7), TokenTypeHexNumber, '0xdeadbeef'),
      ],
    },
    {
      filter: `a = "foo`,
      errorContains: 'unterminated string',
    },
    {
      filter: 'invalid = foo\xa0\x01bar',
      errorContains: 'invalid UTF-8',
    },
  ];
  for (const test of tests) {
    it(`should lex ${test.filter}`, () => {
      testLexer(test.filter, test.expected, test.errorContains);
    });
  }

  it('sniffRune', () => {
    expect(new Lexer('abc').sniffRune('a')).toEqual(true);
    expect(new Lexer('abc').sniffRune('b')).toEqual(false);
  });
});

function testLexer(filter: string, expected?: Token[], errorContains?: string) {
  const lexer = new Lexer(filter);
  const actual = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const token = lexer.lex();
    if (token instanceof Error) {
      if (token.message !== 'EOF') {
        expect(token.message).toContain(errorContains);
        return;
      }
      break;
    }
    actual.push(token);
  }
  expect(actual).toEqual(expected);
}
