import { Expr } from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/syntax_pb.js';
import { drillDownOnErrorMessage } from './errors';
import {
  and,
  duration,
  equals,
  float,
  func,
  greaterEquals,
  greaterThan,
  has,
  int,
  lessEquals,
  lessThan,
  member,
  not,
  notEquals,
  or,
  sequence,
  string,
  text,
  timestamp,
} from './expr';
import { parsedFloat, parsedInt } from './parsedexpr';
import { Parser } from './parser';

describe('Parser', () => {
  const testCases = [
    {
      filter: 'New York Giants',
      expected: sequence(text('New'), text('York'), text('Giants')),
    },
    {
      filter: 'New York Giants OR Yankees',
      expected: sequence(
        text('New'),
        text('York'),
        or(text('Giants'), text('Yankees'))
      ),
    },
    {
      filter: 'New York (Giants OR Yankees)',
      expected: sequence(
        text('New'),
        text('York'),
        or(text('Giants'), text('Yankees'))
      ),
    },
    {
      filter: 'a b AND c AND d',
      expected: and(sequence(text('a'), text('b')), text('c'), text('d')),
    },
    {
      filter: '(a b) AND c AND d',
      expected: and(sequence(text('a'), text('b')), text('c'), text('d')),
    },
    {
      filter: 'a < 10 OR a >= 100',
      expected: or(
        lessThan(text('a'), int(BigInt(10))),
        greaterEquals(text('a'), int(BigInt(100)))
      ),
    },
    {
      filter: 'a OR b OR c',
      expected: or(text('a'), text('b'), text('c')),
    },
    {
      filter: 'NOT (a OR b)',
      expected: not(or(text('a'), text('b'))),
    },
    {
      filter: `-file:".java"`,
      expected: not(has(text('file'), string('.java'))),
    },
    {
      filter: '-30',
      expected: int(-BigInt(30)),
    },
    {
      filter: 'package=com.google',
      expected: equals(text('package'), member(text('com'), 'google')),
    },
    {
      filter: `msg != 'hello'`,
      expected: notEquals(text('msg'), string('hello')),
    },
    {
      filter: `1 > 0`,
      expected: greaterThan(int(BigInt(1)), int(BigInt(0))),
    },
    {
      filter: `2.5 >= 2.4`,
      expected: greaterEquals(float(2.5), float(2.4)),
    },
    {
      filter: `foo >= -2.4`,
      expected: greaterEquals(text('foo'), float(-2.4)),
    },
    {
      filter: `foo >= (-2.4)`,
      expected: greaterEquals(text('foo'), float(-2.4)),
    },
    {
      filter: `-2.5 >= -2.4`,
      expected: not(greaterEquals(float(2.5), float(-2.4))),
    },
    {
      filter: `yesterday < request.time`,
      expected: lessThan(text('yesterday'), member(text('request'), 'time')),
    },
    {
      filter: `experiment.rollout <= cohort(request.user)`,
      expected: lessEquals(
        member(text('experiment'), 'rollout'),
        func('cohort', member(text('request'), 'user'))
      ),
    },
    {
      filter: `prod`,
      expected: text('prod'),
    },
    {
      filter: `expr.type_map.1.type`,
      expected: member(member(member(text('expr'), 'type_map'), '1'), 'type'),
    },
    {
      filter: `regex(m.key, '^.*prod.*$')`,
      expected: func('regex', member(text('m'), 'key'), string('^.*prod.*$')),
    },
    {
      filter: `math.mem('30mb')`,
      expected: func('math.mem', string('30mb')),
    },
    {
      filter: `(msg.endsWith('world') AND retries < 10)`,
      expected: and(
        func('msg.endsWith', string('world')),
        lessThan(text('retries'), int(10))
      ),
    },
    {
      filter: `(endsWith(msg, 'world') AND retries < 10)`,
      expected: and(
        func('endsWith', text('msg'), string('world')),
        lessThan(text('retries'), int(10))
      ),
    },
    {
      filter: 'time.now()',
      expected: func('time.now'),
    },
    {
      filter: `timestamp("2012-04-21T11:30:00-04:00")`,
      expected: timestamp('2012-04-21T11:30:00-04:00'),
    },
    {
      filter: `duration("32s")`,
      expected: duration('32s'),
    },
    {
      filter: `duration("4h0m0s")`,
      expected: duration('4h0m0s'),
    },
    {
      filter: `
            start_time > timestamp("2006-01-02T15:04:05+07:00") AND 
            (driver = "driver1" OR start_driver = "driver1" OR end_driver = "driver1")
        `,
      expected: and(
        greaterThan(text('start_time'), timestamp('2006-01-02T15:04:05+07:00')),
        or(
          equals(text('driver'), string('driver1')),
          equals(text('start_driver'), string('driver1')),
          equals(text('end_driver'), string('driver1'))
        )
      ),
    },
    {
      filter: `annotations:schedule`,
      expected: has(text('annotations'), string('schedule')),
    },
    {
      filter: `annotations.schedule = "test"`,
      expected: equals(member(text('annotations'), 'schedule'), string('test')),
    },
    {
      filter: '<',
      errorContains: 'unexpected token <',
    },
    {
      filter: `(-2.5) >= -2.4`,
      errorContains: 'unexpected token >=',
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
  for (const testCase of testCases) {
    it(`should parse "${testCase.filter}"`, () => {
      const parser = new Parser(testCase.filter);
      const result = parser.parse();
      if (result instanceof Error) {
        expect(drillDownOnErrorMessage(result)).toContain(
          testCase.errorContains
        );
        return;
      }
      expect(setIdsToZero(result.expr)).toEqual(testCase.expected);
    });
  }

  function setIdsToZero(expr: Expr | undefined) {
    if (!expr) {
      return expr;
    }
    expr.id = BigInt(0);
    if (expr.exprKind?.case === 'callExpr') {
      for (const arg of expr.exprKind.value.args) {
        setIdsToZero(arg);
      }
    }
    if (expr.exprKind?.case === 'selectExpr' && expr.exprKind.value.operand) {
      setIdsToZero(expr.exprKind.value.operand);
    }
    return expr;
  }

  it('parseNumger', () => {
    expect(new Parser('123.456').parseNumber()).toEqual(
      parsedFloat(BigInt(0), 123.456)
    );
    expect(new Parser('-123').parseNumber()).toEqual(
      parsedInt(BigInt(0), -BigInt(123))
    );
  });

  it('parseFloat', () => {
    expect(new Parser('123.456').parseFloat()).toEqual(
      parsedFloat(BigInt(0), 123.456)
    );
    expect(new Parser('-123.456').parseFloat()).toEqual(
      parsedFloat(BigInt(0), -123.456)
    );
    expect(new Parser('.456').parseFloat()).toEqual(
      parsedFloat(BigInt(0), 0.456)
    );
    expect(new Parser('-.456').parseFloat()).toEqual(
      parsedFloat(BigInt(0), -0.456)
    );
    expect(new Parser('123.').parseFloat()).toEqual(
      parsedFloat(BigInt(0), 123.0)
    );
  });

  it('parseInt', () => {
    expect(new Parser('123').parseInt()).toEqual(
      parsedInt(BigInt(0), BigInt(123))
    );
    expect(new Parser('-123').parseInt()).toEqual(
      parsedInt(BigInt(0), -BigInt(123))
    );
    expect(new Parser('0x123').parseInt()).toEqual(
      parsedInt(BigInt(0), BigInt(291))
    );
    expect(new Parser('-0x123').parseInt()).toEqual(
      parsedInt(BigInt(0), -BigInt(291))
    );
  });
});
