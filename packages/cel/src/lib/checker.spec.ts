import { isNil } from '@bearclaw/is';
import {
  Type,
  Type_PrimitiveType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { CELChecker } from './checker';
import { CELContainer } from './container';
import { CELEnvironment } from './environment';
import { CELParser } from './parser';
import {
  DYN_TYPE,
  ERROR_TYPE,
  NULL_TYPE,
  listType,
  mapType,
  primitiveType,
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

const defaultEnv = new CELEnvironment({
  declarations: [
    functionDecl('"fg_s"', {
      overloads: [
        {
          overloadId: 'fg_s_0',
          resultType: primitiveType(Type_PrimitiveType.STRING),
        },
      ],
    }),
    functionDecl('"ffi_s_s"', {
      overloads: [
        {
          overloadId: 'fi_s_s_0',
          params: [primitiveType(Type_PrimitiveType.STRING)],
          resultType: primitiveType(Type_PrimitiveType.STRING),
          isInstanceFunction: true,
        },
      ],
    }),
    identDecl('is', { type: primitiveType(Type_PrimitiveType.STRING) }),
    identDecl('ii', { type: primitiveType(Type_PrimitiveType.INT64) }),
    identDecl('iu', { type: primitiveType(Type_PrimitiveType.UINT64) }),
    identDecl('iz', { type: primitiveType(Type_PrimitiveType.BOOL) }),
    identDecl('ib', { type: primitiveType(Type_PrimitiveType.BYTES) }),
    identDecl('id', { type: primitiveType(Type_PrimitiveType.DOUBLE) }),
    identDecl('ix', { type: NULL_TYPE }),
  ],
});

const testCases: TestInfo[] = [
  // Development tests
  {
    in: `a.b`,
    out: `a.b~bool`,
    outType: primitiveType(Type_PrimitiveType.STRING),
    env: new CELEnvironment({
      declarations: [
        identDecl('a', {
          type: mapType({
            keyType: primitiveType(Type_PrimitiveType.STRING),
            valueType: primitiveType(Type_PrimitiveType.STRING),
          }),
        }),
      ],
    }),
  },
  // Const types
  {
    in: `"A"`,
    out: `"A"~string`,
    outType: primitiveType(Type_PrimitiveType.STRING),
  },
  {
    in: `12`,
    out: `12~int`,
    outType: primitiveType(Type_PrimitiveType.INT64),
  },
  {
    in: `12u`,
    out: `12u~uint`,
    outType: primitiveType(Type_PrimitiveType.UINT64),
  },
  {
    in: `true`,
    out: `true~bool`,
    outType: primitiveType(Type_PrimitiveType.BOOL),
  },
  {
    in: `false`,
    out: `false~bool`,
    outType: primitiveType(Type_PrimitiveType.BOOL),
  },
  {
    in: `12.23`,
    out: `12.23~double`,
    outType: primitiveType(Type_PrimitiveType.DOUBLE),
  },
  {
    in: `null`,
    out: `null~null`,
    outType: NULL_TYPE,
  },
  {
    in: `b"ABC"`,
    out: `b"ABC"~bytes`,
    outType: primitiveType(Type_PrimitiveType.BYTES),
  },
  // Ident types
  {
    in: `is`,
    out: `is~string^is`,
    outType: primitiveType(Type_PrimitiveType.STRING),
    env: defaultEnv,
  },
  {
    in: `ii`,
    out: `ii~int^ii`,
    outType: primitiveType(Type_PrimitiveType.INT64),
    env: defaultEnv,
  },
  {
    in: `iu`,
    out: `iu~uint^iu`,
    outType: primitiveType(Type_PrimitiveType.UINT64),
    env: defaultEnv,
  },
  {
    in: `iz`,
    out: `iz~bool^iz`,
    outType: primitiveType(Type_PrimitiveType.BOOL),
    env: defaultEnv,
  },
  {
    in: `id`,
    out: `id~double^id`,
    outType: primitiveType(Type_PrimitiveType.DOUBLE),
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
    outType: primitiveType(Type_PrimitiveType.BYTES),
    env: defaultEnv,
  },
  {
    in: `id`,
    out: `id~double^id`,
    outType: primitiveType(Type_PrimitiveType.DOUBLE),
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
    outType: listType({ elemType: primitiveType(Type_PrimitiveType.INT64) }),
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
