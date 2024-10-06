import { isNil } from '@bearclaw/is';
import { Type } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { CELChecker } from './checker';
import { CELContainer } from './container';
import { CELEnvironment, STANDARD_ENV } from './environment';
import { CELParser } from './parser';
import {
  BOOL_TYPE,
  BYTES_TYPE,
  DOUBLE_TYPE,
  DYN_TYPE,
  ERROR_TYPE,
  INT64_TYPE,
  NULL_TYPE,
  STRING_TYPE,
  UINT64_TYPE,
  listType,
  mapType,
} from './types';
import { functionDecl, identDecl } from './utils';

interface TestInfo {
  // in contains the expression to be parsed.
  in: string;

  // out contains the output.
  out?: string;

  // outType is the expected type of the expression
  outType?: Type;

  // container is the container name to use for test.
  container?: string;

  // env is the environment to use for testing.
  env?: CELEnvironment;

  // err is the expected error for negative test cases.
  err?: string;

  // disableStdEnv indicates whether the standard functions should be disabled.
  disableStdEnv?: boolean;

  // opts is the set of checker Option flags to use when type-checking.
  // opts []Option
}

const defaultEnv = STANDARD_ENV.extend({
  declarations: [
    functionDecl('fg_s', {
      overloads: [
        {
          overloadId: 'fg_s_0',
          resultType: STRING_TYPE,
        },
      ],
    }),
    functionDecl('fi_s_s', {
      overloads: [
        {
          overloadId: 'fi_s_s_0',
          params: [STRING_TYPE],
          resultType: STRING_TYPE,
          isInstanceFunction: true,
        },
      ],
    }),
    identDecl('is', { type: STRING_TYPE }),
    identDecl('ii', { type: INT64_TYPE }),
    identDecl('iu', { type: UINT64_TYPE }),
    identDecl('iz', { type: BOOL_TYPE }),
    identDecl('ib', { type: BYTES_TYPE }),
    identDecl('id', { type: DOUBLE_TYPE }),
    identDecl('ix', { type: NULL_TYPE }),
  ],
});

const testCases: TestInfo[] = [
  // Development tests
  {
    in: `a.b`,
    out: `a.b~bool`,
    outType: STRING_TYPE,
    env: new CELEnvironment({
      declarations: [
        identDecl('a', {
          type: mapType({
            keyType: STRING_TYPE,
            valueType: STRING_TYPE,
          }),
        }),
      ],
    }),
  },
  // Const types
  {
    in: `"A"`,
    out: `"A"~string`,
    outType: STRING_TYPE,
  },
  {
    in: `12`,
    out: `12~int`,
    outType: INT64_TYPE,
  },
  {
    in: `12u`,
    out: `12u~uint`,
    outType: UINT64_TYPE,
  },
  {
    in: `true`,
    out: `true~bool`,
    outType: BOOL_TYPE,
  },
  {
    in: `false`,
    out: `false~bool`,
    outType: BOOL_TYPE,
  },
  {
    in: `12.23`,
    out: `12.23~double`,
    outType: DOUBLE_TYPE,
  },
  {
    in: `null`,
    out: `null~null`,
    outType: NULL_TYPE,
  },
  {
    in: `b"ABC"`,
    out: `b"ABC"~bytes`,
    outType: BYTES_TYPE,
  },
  // Ident types
  {
    in: `is`,
    out: `is~string^is`,
    outType: STRING_TYPE,
    env: defaultEnv,
  },
  {
    in: `ii`,
    out: `ii~int^ii`,
    outType: INT64_TYPE,
    env: defaultEnv,
  },
  {
    in: `iu`,
    out: `iu~uint^iu`,
    outType: UINT64_TYPE,
    env: defaultEnv,
  },
  {
    in: `iz`,
    out: `iz~bool^iz`,
    outType: BOOL_TYPE,
    env: defaultEnv,
  },
  {
    in: `id`,
    out: `id~double^id`,
    outType: DOUBLE_TYPE,
    env: defaultEnv,
  },
  {
    in: `ix`,
    out: `ix~null^ix`,
    outType: NULL_TYPE,
    env: defaultEnv,
  },
  {
    in: `ib`,
    out: `ib~bytes^ib`,
    outType: BYTES_TYPE,
    env: defaultEnv,
  },
  {
    in: `id`,
    out: `id~double^id`,
    outType: DOUBLE_TYPE,
    env: defaultEnv,
  },
  {
    in: `[]`,
    out: `[]~list(dyn)`,
    outType: listType({ elemType: DYN_TYPE }),
  },
  {
    in: `[1]`,
    out: `[1~int]~list(int)`,
    outType: listType({ elemType: INT64_TYPE }),
  },
  {
    in: `[1, "A"]`,
    out: `[1~int, "A"~string]~list(dyn)`,
    outType: listType({ elemType: DYN_TYPE }),
  },
  {
    in: `foo`,
    out: `foo~!error!`,
    outType: ERROR_TYPE,
    err: `ERROR: <input>:1:1: undeclared reference to 'foo' (in container '')
| foo
| ^`,
  },
  // Call resolution
  {
    in: `fg_s()`,
    out: `fg_s()~string^fg_s_0`,
    outType: STRING_TYPE,
    env: defaultEnv,
  },
  {
    in: `is.fi_s_s()`,
    out: `is~string^is.fi_s_s()~string^fi_s_s_0`,
    outType: STRING_TYPE,
    env: defaultEnv,
  },
  {
    in: `1 + 2`,
    out: `_+_(1~int, 2~int)~int^add_int64`,
    outType: INT64_TYPE,
    env: defaultEnv,
  },
  {
    in: `1 + ii`,
    out: `_+_(1~int, ii~int^ii)~int^add_int64`,
    outType: INT64_TYPE,
    env: defaultEnv,
  },
];

describe('CELChecker', () => {
  for (const testCase of testCases) {
    it(`should parse ${testCase.in}`, () => {
      const env =
        testCase.env ??
        new CELEnvironment({ container: new CELContainer(testCase.container) });
      const parser = new CELParser(testCase.in);
      const parsed = parser.parse();
      if (isNil(parsed.expr)) {
        throw new Error('parsed.expr is nil');
      }
      const checker = new CELChecker(parsed, testCase.in, env);
      const result = checker.check();
      if (testCase.outType) {
        expect(result.typeMap[parsed.expr.id.toString()]).toEqual(
          testCase.outType
        );
      }
      if (testCase.err) {
        expect(checker.errors.toDisplayString()).toEqual(
          // Account for the difference in spacing between the test case and
          // the error message
          testCase.err
            .trim()
            .split('\n')
            .map((line) => line.trim())
            .join('\n ')
        );
      }
    });
  }
});
