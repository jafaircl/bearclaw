import { isNil } from '@bearclaw/is';
import { TestAllTypesSchema } from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto3/test_all_types_pb.js';
import { Type } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { createMutableRegistry } from '@bufbuild/protobuf';
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
  messageType,
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

// TODO: The package name for TestAllTypes is different in cel-go because we have to import from a different package.

function getDefaultEnv() {
  return STANDARD_ENV().extend({
    registry: createMutableRegistry(TestAllTypesSchema),
    idents: [
      identDecl('is', { type: STRING_TYPE }),
      identDecl('ii', { type: INT64_TYPE }),
      identDecl('iu', { type: UINT64_TYPE }),
      identDecl('iz', { type: BOOL_TYPE }),
      identDecl('ib', { type: BYTES_TYPE }),
      identDecl('id', { type: DOUBLE_TYPE }),
      identDecl('ix', { type: NULL_TYPE }),
    ],
    functions: [
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
    ],
  });
}

const testCases: TestInfo[] = [
  // Development tests
  {
    in: `a.b`,
    out: `a.b~bool`,
    outType: STRING_TYPE,
    env: new CELEnvironment({
      idents: [
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
    env: getDefaultEnv(),
  },
  {
    in: `ii`,
    out: `ii~int^ii`,
    outType: INT64_TYPE,
    env: getDefaultEnv(),
  },
  {
    in: `iu`,
    out: `iu~uint^iu`,
    outType: UINT64_TYPE,
    env: getDefaultEnv(),
  },
  {
    in: `iz`,
    out: `iz~bool^iz`,
    outType: BOOL_TYPE,
    env: getDefaultEnv(),
  },
  {
    in: `id`,
    out: `id~double^id`,
    outType: DOUBLE_TYPE,
    env: getDefaultEnv(),
  },
  {
    in: `ix`,
    out: `ix~null^ix`,
    outType: NULL_TYPE,
    env: getDefaultEnv(),
  },
  {
    in: `ib`,
    out: `ib~bytes^ib`,
    outType: BYTES_TYPE,
    env: getDefaultEnv(),
  },
  {
    in: `id`,
    out: `id~double^id`,
    outType: DOUBLE_TYPE,
    env: getDefaultEnv(),
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
    env: getDefaultEnv(),
  },
  {
    in: `is.fi_s_s()`,
    out: `is~string^is.fi_s_s()~string^fi_s_s_0`,
    outType: STRING_TYPE,
    env: getDefaultEnv(),
  },
  {
    in: `1 + 2`,
    out: `_+_(1~int, 2~int)~int^add_int64`,
    outType: INT64_TYPE,
    env: getDefaultEnv(),
  },
  {
    in: `1 + ii`,
    out: `_+_(1~int, ii~int^ii)~int^add_int64`,
    outType: INT64_TYPE,
    env: getDefaultEnv(),
  },
  {
    in: `[1] + [2]`,
    out: `_+_([1~int]~list(int), [2~int]~list(int))~list(int)^add_list`,
    outType: listType({ elemType: INT64_TYPE }),
    env: getDefaultEnv(),
  },
  {
    in: `[] + [1,2,3,] + [4]`,
    outType: listType({ elemType: INT64_TYPE }),
    out: `
_+_(
  _+_(
      []~list(int),
      [1~int, 2~int, 3~int]~list(int))~list(int)^add_list,
      [4~int]~list(int))
~list(int)^add_list
`,
  },
  {
    in: `[1, 2u] + []`,
    out: `_+_(
      [
          1~int,
          2u~uint
      ]~list(dyn),
      []~list(dyn)
  )~list(dyn)^add_list`,
    outType: listType({ elemType: DYN_TYPE }),
  },
  {
    in: `{1:2u, 2:3u}`,
    outType: mapType({ keyType: INT64_TYPE, valueType: UINT64_TYPE }),
    out: `{1~int : 2u~uint, 2~int : 3u~uint}~map(int, uint)`,
  },
  {
    in: `{"a":1, "b":2}.a`,
    outType: INT64_TYPE,
    out: `{"a"~string : 1~int, "b"~string : 2~int}~map(string, int).a~int`,
  },
  {
    in: `{1:2u, 2u:3}`,
    outType: mapType({ keyType: DYN_TYPE, valueType: DYN_TYPE }),
    out: `{1~int : 2u~uint, 2u~uint : 3~int}~map(dyn, dyn)`,
  },
  {
    // TODO: this test container is different than in cel-go because we have to import from a different package
    in: `TestAllTypes{single_int32: 1, single_int64: 2}`,
    container: 'google.api.expr.test.v1.proto3',
    out: `
  google.api.expr.test.v1.proto3estAllTypes{
      single_int32 : 1~int,
      single_int64 : 2~int
  }~google.api.expr.test.v1.proto3.TestAllTypes^google.api.expr.test.v1.proto3.TestAllTypes`,
    outType: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
    env: getDefaultEnv().extend({
      container: new CELContainer('google.api.expr.test.v1.proto3'),
    }),
  },
  {
    // TODO: this test container is different than in cel-go because we have to import from a different package
    in: `TestAllTypes{single_int32: 1u}`,
    container: 'google.api.expr.test.v1.proto3',
    err: `
ERROR: <input>:1:26: expected type of field 'single_int32' is 'int' but provided type is 'uint'
| TestAllTypes{single_int32: 1u}
| .........................^`,
    env: getDefaultEnv().extend({
      container: new CELContainer('google.api.expr.test.v1.proto3'),
    }),
  },
  {
    // TODO: this test container is different than in cel-go because we have to import from a different package
    in: `TestAllTypes{single_int32: 1, undefined: 2}`,
    container: 'google.api.expr.test.v1.proto3',
    err: `
ERROR: <input>:1:40: undefined field 'undefined'
| TestAllTypes{single_int32: 1, undefined: 2}
| .......................................^`,
    env: getDefaultEnv().extend({
      container: new CELContainer('google.api.expr.test.v1.proto3'),
    }),
  },
  {
    in: `size(x) == x.size()`,
    out: `
_==_(size(x~list(int)^x)~int^size_list, x~list(int)^x.size()~int^list_size)
~bool^equals`,
    env: getDefaultEnv().extend({
      idents: [identDecl('x', { type: listType({ elemType: INT64_TYPE }) })],
    }),
    outType: BOOL_TYPE,
  },
  {
    in: `int(1u) + int(uint("1"))`,
    out: `
_+_(int(1u~uint)~int^uint64_to_int64,
int(uint("1"~string)~uint^string_to_uint64)~int^uint64_to_int64)
~int^add_int64`,
    outType: INT64_TYPE,
  },
  {
    in: `false && !true || false ? 2 : 3`,
    out: `
_?_:_(_||_(_&&_(false~bool, !_(true~bool)~bool^logical_not)~bool^logical_and,
      false~bool)
  ~bool^logical_or,
2~int,
3~int)
~int^conditional
`,
    outType: INT64_TYPE,
  },
  {
    in: `b"abc" + b"def"`,
    out: `_+_(b"abc"~bytes, b"def"~bytes)~bytes^add_bytes`,
    outType: BYTES_TYPE,
  },
  {
    in: `1.0 + 2.0 * 3.0 - 1.0 / 2.20202 != 66.6`,
    out: `
_!=_(_-_(_+_(1~double, _*_(2~double, 3~double)~double^multiply_double)
     ~double^add_double,
     _/_(1~double, 2.20202~double)~double^divide_double)
 ~double^subtract_double,
66.6~double)
~bool^not_equals`,
    outType: BOOL_TYPE,
  },
  {
    in: `null == null && null != null`,
    out: `
  _&&_(
      _==_(
          null~null,
          null~null
      )~bool^equals,
      _!=_(
          null~null,
          null~null
      )~bool^not_equals
  )~bool^logical_and`,
    outType: BOOL_TYPE,
  },
  {
    in: `1 == 1 && 2 != 1`,
    out: `
  _&&_(
      _==_(
          1~int,
          1~int
      )~bool^equals,
      _!=_(
          2~int,
          1~int
      )~bool^not_equals
  )~bool^logical_and`,
    outType: BOOL_TYPE,
  },
  {
    in: `1 + 2 * 3 - 1 / 2 == 6 % 1`,
    out: ` _==_(_-_(_+_(1~int, _*_(2~int, 3~int)~int^multiply_int64)~int^add_int64, _/_(1~int, 2~int)~int^divide_int64)~int^subtract_int64, _%_(6~int, 1~int)~int^modulo_int64)~bool^equals`,
    outType: BOOL_TYPE,
  },
  {
    in: `"abc" + "def"`,
    out: `_+_("abc"~string, "def"~string)~string^add_string`,
    outType: STRING_TYPE,
  },
  {
    in: `1u + 2u * 3u - 1u / 2u == 6u % 1u`,
    out: `_==_(_-_(_+_(1u~uint, _*_(2u~uint, 3u~uint)~uint^multiply_uint64)
       ~uint^add_uint64,
       _/_(1u~uint, 2u~uint)~uint^divide_uint64)
   ~uint^subtract_uint64,
  _%_(6u~uint, 1u~uint)~uint^modulo_uint64)
~bool^equals`,
    outType: BOOL_TYPE,
  },
  {
    in: `x.single_int32 != null`,
    env: getDefaultEnv().extend({
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.Proto2Message'),
        }),
      ],
    }),
    err: `
ERROR: <input>:1:2: unexpected failed resolution of 'google.api.expr.test.v1.proto3.Proto2Message'
| x.single_int32 != null
| .^
`,
  },
  // TODO: these 2 tests fail with "found no matching overload for '_[_]' applied to '(google.protobuf.Struct, string) -> unknown'"
  {
    // TODO: this test container is different than in cel-go because we have to import from a different package
    in: `x.single_value + 1 / x.single_struct.y == 23`,
    env: getDefaultEnv().extend({
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    out: `_==_(
        _+_(
          x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_value~dyn,
          _/_(
            1~int,
            x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_struct~map(string, dyn).y~dyn
          )~int^divide_int64
        )~int^add_int64,
        23~int
      )~bool^equals`,
    outType: BOOL_TYPE,
  },
  {
    // TODO: this test container is different than in cel-go because we have to import from a different package
    in: `x.single_value[23] + x.single_struct['y']`,
    env: getDefaultEnv().extend({
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    out: `_+_(
        _[_](
          x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_value~dyn,
          23~int
        )~dyn^index_list|index_map,
        _[_](
          x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_struct~map(string, dyn),
          "y"~string
        )~dyn^index_map
      )~dyn^add_bytes|add_double|add_duration_duration|add_duration_timestamp|add_int64|add_list|add_string|add_timestamp_duration|add_uint64
      `,
    outType: DYN_TYPE,
  },
  //   { // TODO: calling the enum like this doesn't work
  //     in: `TestAllTypes.NestedEnum.BAR != 99`,
  //     container: 'google.api.expr.test.v1.proto3',
  //     env: getDefaultEnv().extend({
  //       container: new CELContainer('google.api.expr.test.v1.proto3'),
  //     }),
  //     out: `_!=_(google.api.expr.test.v1.proto3.TestAllTypes.NestedEnum.BAR
  //  ~int^google.api.expr.test.v1.proto3.TestAllTypes.NestedEnum.BAR,
  // 99~int)
  // ~bool^not_equals`,
  //     outType: BOOL_TYPE,
  //   },
  {
    in: `size([] + [1])`,
    out: `size(_+_([]~list(int), [1~int]~list(int))~list(int)^add_list)~int^size_list`,
    outType: INT64_TYPE,
  },
  {
    in: `x["claims"]["groups"][0].name == "dummy"
&& x.claims["exp"] == y[1].time
&& x.claims.structured == {'key': z}
&& z == 1.0`,
    out: `_&&_(
    _&&_(
        _==_(
            _[_](
                _[_](
                    _[_](
                        x~map(string, dyn)^x,
                        "claims"~string
                    )~dyn^index_map,
                    "groups"~string
                )~list(dyn)^index_map,
                0~int
            )~dyn^index_list.name~dyn,
            "dummy"~string
        )~bool^equals,
        _==_(
            _[_](
                x~map(string, dyn)^x.claims~dyn,
                "exp"~string
            )~dyn^index_map,
            _[_](
                y~list(dyn)^y,
                1~int
            )~dyn^index_list.time~dyn
        )~bool^equals
    )~bool^logical_and,
    _&&_(
        _==_(
            x~map(string, dyn)^x.claims~dyn.structured~dyn,
            {
                "key"~string:z~dyn^z
            }~map(string, dyn)
        )~bool^equals,
        _==_(
            z~dyn^z,
            1~double
        )~bool^equals
    )~bool^logical_and
)~bool^logical_and`,
    env: getDefaultEnv().extend({
      idents: [
        identDecl('x', { type: messageType('google.protobuf.Struct') }),
        identDecl('y', { type: messageType('google.protobuf.ListValue') }),
        identDecl('z', { type: messageType('google.protobuf.Value') }),
      ],
    }),
    outType: BOOL_TYPE,
  },
  // TODO: this test does not throw an error when it should
  //   {
  //     in: `x + y`,
  //     env: getDefaultEnv().extend({
  //       idents: [
  //         identDecl('x', {
  //           type: listType({
  //             elemType: messageType(
  //               'google.api.expr.test.v1.proto3.TestAllTypes'
  //             ),
  //           }),
  //         }),
  //         identDecl('y', { type: listType({ elemType: INT64_TYPE }) }),
  //       ],
  //     }),
  //     err: `
  //   ERROR: <input>:1:3: found no matching overload for '_+_' applied to '(list(google.api.expr.test.v1.proto3.TestAllTypes), list(int))'
  //   | x + y
  //   | ..^
  //     `,
  //   },
  {
    in: `x[1u]`,
    env: getDefaultEnv().extend({
      idents: [
        identDecl('x', {
          type: listType({
            elemType: messageType(
              'google.api.expr.test.v1.proto3.TestAllTypes'
            ),
          }),
        }),
      ],
    }),
    err: `
ERROR: <input>:1:2: found no matching overload for '_[_]' applied to '(list(google.api.expr.test.v1.proto3.TestAllTypes), uint)'
  | x[1u]
  | .^
`,
  },
  {
    in: `(x + x)[1].single_int32 == size(x)`,
    env: getDefaultEnv().extend({
      idents: [
        identDecl('x', {
          type: listType({
            elemType: messageType(
              'google.api.expr.test.v1.proto3.TestAllTypes'
            ),
          }),
        }),
      ],
    }),
    out: `
_==_(_[_](_+_(x~list(google.api.expr.test.v1.proto3.TestAllTypes)^x,
          x~list(google.api.expr.test.v1.proto3.TestAllTypes)^x)
      ~list(google.api.expr.test.v1.proto3.TestAllTypes)^add_list,
     1~int)
 ~google.api.expr.test.v1.proto3.TestAllTypes^index_list
 .
 single_int32
 ~int,
size(x~list(google.api.expr.test.v1.proto3.TestAllTypes)^x)~int^size_list)
~bool^equals
`,
    outType: BOOL_TYPE,
  },
  {
    in: `x.repeated_int64[x.single_int32] == 23`,
    env: getDefaultEnv().extend({
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    out: `
_==_(_[_](x~google.api.expr.test.v1.proto3.TestAllTypes^x.repeated_int64~list(int),
   x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_int32~int)
~int^index_list,
23~int)
~bool^equals`,
    outType: BOOL_TYPE,
  },
  {
    in: `size(x.map_int64_nested_type) == 0`,
    env: getDefaultEnv().extend({
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    out: `
_==_(size(x~google.api.expr.test.v1.proto3.TestAllTypes^x.map_int64_nested_type
    ~map(int, google.api.expr.test.v1.proto3.NestedTestAllTypes))
~int^size_map,
0~int)
~bool^equals
`,
    outType: BOOL_TYPE,
  },
  {
    in: `x.all(y, y == true)`,
    env: getDefaultEnv().extend({
      idents: [identDecl('x', { type: BOOL_TYPE })],
    }),
    out: `
  __comprehension__(
  // Variable
  y,
  // Target
  x~bool^x,
  // Accumulator
  __result__,
  // Init
  true~bool,
  // LoopCondition
  @not_strictly_false(
      __result__~bool^__result__
  )~bool^not_strictly_false,
  // LoopStep
  _&&_(
      __result__~bool^__result__,
      _==_(
      y~!error!^y,
      true~bool
      )~bool^equals
  )~bool^logical_and,
  // Result
  __result__~bool^__result__)~bool
  `,
    err: `ERROR: <input>:1:1: expression of type 'bool' cannot be range of a comprehension (must be list, map, or dynamic)
  | x.all(y, y == true)
  | ^`,
  },
  {
    // TODO: this test fails
    in: `x.repeated_int64.map(x, double(x))`,
    env: getDefaultEnv().extend({
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    out: `
      __comprehension__(
            // Variable
            x,
            // Target
            x~google.api.expr.test.v1.proto3.TestAllTypes^x.repeated_int64~list(int),
            // Accumulator
            __result__,
            // Init
            []~list(double),
            // LoopCondition
            true~bool,
            // LoopStep
            _+_(
              __result__~list(double)^__result__,
              [
                double(
                  x~int^x
                )~double^int64_to_double
              ]~list(double)
            )~list(double)^add_list,
            // Result
            __result__~list(double)^__result__)~list(double)
      `,
    outType: listType({ elemType: DOUBLE_TYPE }),
  },
  // TODO: this test does not throw an error when it should
  //   {
  //     in: `x[2].single_int32 == 23`,
  //     env: getDefaultEnv().extend({
  //       idents: [
  //         identDecl('x', {
  //           type: mapType({
  //             keyType: STRING_TYPE,
  //             valueType: messageType(
  //               'google.api.expr.test.v1.proto3.TestAllTypes'
  //             ),
  //           }),
  //         }),
  //       ],
  //     }),
  //     err: `
  // ERROR: <input>:1:2: found no matching overload for '_[_]' applied to '(map(string, google.api.expr.test.v1.proto3.TestAllTypes), int)'
  //   | x[2].single_int32 == 23
  //   | .^
  // 		`,
  //   },
];

describe('CELChecker', () => {
  for (const testCase of testCases) {
    it(`should check ${testCase.in}`, () => {
      const container = new CELContainer(testCase.container ?? '');
      const env = testCase.env ?? getDefaultEnv().extend({ container });
      const parser = new CELParser(testCase.in);
      const parsed = parser.parse();
      if (isNil(parsed.expr)) {
        throw new Error('parsed.expr is nil');
      }
      const checker = new CELChecker(parsed, testCase.in, env);
      const result = checker.check();
      if (testCase.outType) {
        try {
          expect(result.typeMap[parsed.expr.id.toString()]).toEqual(
            testCase.outType
          );
          if (
            testCase.outType !== ERROR_TYPE &&
            !testCase.err &&
            checker.errors.errors.errors.length > 0
          ) {
            throw new Error(
              'Unexpected errors: ' + checker.errors.toDisplayString()
            );
          }
        } catch (e) {
          console.log(checker.errors.toDisplayString());
          throw e;
        }
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
