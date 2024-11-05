import { isNil } from '@bearclaw/is';
import {
  TestAllTypesSchema as TestAllTypesSchemaProto2,
  TestAllTypes_NestedEnumSchema as TestAllTypes_NestedEnumSchemaProto2,
  TestAllTypes_NestedMessageSchema as TestAllTypes_NestedMessageSchemaProto2,
} from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto2/test_all_types_pb.js';
import {
  TestAllTypesSchema as TestAllTypesSchemaProto3,
  TestAllTypes_NestedEnumSchema as TestAllTypes_NestedEnumSchemaProto3,
  TestAllTypes_NestedMessageSchema as TestAllTypes_NestedMessageSchemaProto3,
} from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto3/test_all_types_pb.js';
import {
  Decl,
  Type,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { createMutableRegistry } from '@bufbuild/protobuf';
import { CELContainer } from '../common/container';
import { functionDecl, overloadDecl } from '../common/decls/function-decl';
import { identDecl } from '../common/decls/ident-decl';
import { ProtoTypeRegistry } from '../common/pb/proto-type-registry';
import {
  STANDARD_DESCRIPTORS,
  STANDARD_FUNCTION_DECLARATIONS,
  STANDARD_IDENT_DECLARATIONS,
} from '../common/standard';
import { abstractType } from '../common/types/abstract';
import { BOOL_TYPE } from '../common/types/bool';
import { BYTES_TYPE } from '../common/types/bytes';
import { DOUBLE_TYPE } from '../common/types/double';
import { DYN_TYPE } from '../common/types/dyn';
import { ERROR_TYPE } from '../common/types/error';
import { INT64_TYPE } from '../common/types/int';
import { listType } from '../common/types/list';
import { mapType } from '../common/types/map';
import { messageType } from '../common/types/message';
import { NULL_TYPE } from '../common/types/null';
import { nullableType } from '../common/types/nullable';
import { ABSTRACT_OPTIONAL_TYPE, optionalType } from '../common/types/optional';
import { STRING_TYPE } from '../common/types/string';
import { typeParamType } from '../common/types/type-param';
import { UINT64_TYPE } from '../common/types/uint';
import { CELParser, CELParserOptions } from '../parser/parser';
import { CELChecker } from './checker';
import { CheckerEnv } from './env';

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
  env?: CheckerEnv;

  // err is the expected error for negative test cases.
  err?: string;

  // disableStdEnv indicates whether the standard functions should be disabled.
  disableStdEnv?: boolean;

  // opts is the set of checker Option flags to use when type-checking.
  // opts []Option
  parserOptions?: CELParserOptions;
}

function getDefaultEnv() {
  const container = new CELContainer();
  const registry = createMutableRegistry(
    ...STANDARD_DESCRIPTORS,
    TestAllTypesSchemaProto3,
    TestAllTypes_NestedMessageSchemaProto3,
    TestAllTypes_NestedEnumSchemaProto3,
    TestAllTypesSchemaProto2,
    TestAllTypes_NestedMessageSchemaProto2,
    TestAllTypes_NestedEnumSchemaProto2
  );
  const provider = new ProtoTypeRegistry(undefined, registry);
  const env = new CheckerEnv(container, provider);
  env.addIdents(
    ...STANDARD_IDENT_DECLARATIONS,
    identDecl('is', { type: STRING_TYPE }),
    identDecl('ii', { type: INT64_TYPE }),
    identDecl('iu', { type: UINT64_TYPE }),
    identDecl('iz', { type: BOOL_TYPE }),
    identDecl('ib', { type: BYTES_TYPE }),
    identDecl('id', { type: DOUBLE_TYPE }),
    identDecl('ix', { type: NULL_TYPE })
  );
  env.addFunctions(
    ...STANDARD_FUNCTION_DECLARATIONS,
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
    })
  );
  return env;
}

function extendEnv(
  env: CheckerEnv,
  options: { container?: CELContainer; idents?: Decl[]; functions?: Decl[] }
) {
  const container = options.container ?? env.container;
  const idents = options.idents ?? [];
  const functions = options.functions ?? [];
  const provider = env.provider;
  const newEnv = new CheckerEnv(container, provider);
  for (const ident of [...idents, ...env.declarations.scopes.idents.values()]) {
    newEnv.addIdent(ident);
  }
  for (const fn of [
    ...functions,
    ...env.declarations.scopes.functions.values(),
  ]) {
    newEnv.setFunction(fn);
  }
  return newEnv;
}

const testCases: TestInfo[] = [
  // Development tests
  {
    in: `a.b`,
    out: `a.b~bool`,
    outType: STRING_TYPE,
    env: extendEnv(getDefaultEnv(), {
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
    in: `TestAllTypes{single_int32: 1, single_int64: 2}`,
    container: 'google.api.expr.test.v1.proto3',
    out: `
  google.api.expr.test.v1.proto3estAllTypes{
      single_int32 : 1~int,
      single_int64 : 2~int
  }~google.api.expr.test.v1.proto3.TestAllTypes^google.api.expr.test.v1.proto3.TestAllTypes`,
    outType: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
    env: extendEnv(getDefaultEnv(), {
      container: new CELContainer('google.api.expr.test.v1.proto3'),
    }),
  },
  {
    in: `TestAllTypes{single_int32: 1u}`,
    container: 'google.api.expr.test.v1.proto3',
    err: `
ERROR: <input>:1:26: expected type of field 'single_int32' is 'int' but provided type is 'uint'
| TestAllTypes{single_int32: 1u}
| .........................^`,
    env: extendEnv(getDefaultEnv(), {
      container: new CELContainer('google.api.expr.test.v1.proto3'),
    }),
  },
  {
    in: `TestAllTypes{single_int32: 1, undefined: 2}`,
    container: 'google.api.expr.test.v1.proto3',
    err: `
ERROR: <input>:1:40: undefined field 'undefined'
| TestAllTypes{single_int32: 1, undefined: 2}
| .......................................^`,
    env: extendEnv(getDefaultEnv(), {
      container: new CELContainer('google.api.expr.test.v1.proto3'),
    }),
  },
  {
    in: `size(x) == x.size()`,
    out: `
_==_(size(x~list(int)^x)~int^size_list, x~list(int)^x.size()~int^list_size)
~bool^equals`,
    env: extendEnv(getDefaultEnv(), {
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
    env: extendEnv(getDefaultEnv(), {
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
  {
    in: `x.single_value + 1 / x.single_struct.y == 23`,
    env: extendEnv(getDefaultEnv(), {
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
    in: `x.single_value[23] + x.single_struct['y']`,
    env: extendEnv(getDefaultEnv(), {
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
  {
    in: `TestAllTypes.NestedEnum.BAR != 99`,
    container: 'google.api.expr.test.v1.proto3',
    env: extendEnv(getDefaultEnv(), {
      container: new CELContainer('google.api.expr.test.v1.proto3'),
    }),
    out: `_!=_(google.api.expr.test.v1.proto3.TestAllTypes.NestedEnum.BAR
   ~int^google.api.expr.test.v1.proto3.TestAllTypes.NestedEnum.BAR,
  99~int)
  ~bool^not_equals`,
    outType: BOOL_TYPE,
  },
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
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', { type: messageType('google.protobuf.Struct') }),
        identDecl('y', { type: messageType('google.protobuf.ListValue') }),
        identDecl('z', { type: messageType('google.protobuf.Value') }),
      ],
    }),
    outType: BOOL_TYPE,
  },
  {
    in: `x + y`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: listType({
            elemType: messageType(
              'google.api.expr.test.v1.proto3.TestAllTypes'
            ),
          }),
        }),
        identDecl('y', { type: listType({ elemType: INT64_TYPE }) }),
      ],
    }),
    err: `
    ERROR: <input>:1:3: found no matching overload for '_+_' applied to '(list(google.api.expr.test.v1.proto3.TestAllTypes), list(int))'
    | x + y
    | ..^
      `,
  },
  {
    in: `x[1u]`,
    env: extendEnv(getDefaultEnv(), {
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
    env: extendEnv(getDefaultEnv(), {
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
    env: extendEnv(getDefaultEnv(), {
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
    env: extendEnv(getDefaultEnv(), {
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
    env: extendEnv(getDefaultEnv(), {
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
    in: `x.repeated_int64.map(x, double(x))`,
    env: extendEnv(getDefaultEnv(), {
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
  {
    in: `x[2].single_int32 == 23`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: mapType({
            keyType: STRING_TYPE,
            valueType: messageType(
              'google.api.expr.test.v1.proto3.TestAllTypes'
            ),
          }),
        }),
      ],
    }),
    err: `
  ERROR: <input>:1:2: found no matching overload for '_[_]' applied to '(map(string, google.api.expr.test.v1.proto3.TestAllTypes), int)'
    | x[2].single_int32 == 23
    | .^
  		`,
  },
  {
    in: `x["a"].single_int32 == 23`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: mapType({
            keyType: STRING_TYPE,
            valueType: messageType(
              'google.api.expr.test.v1.proto3.TestAllTypes'
            ),
          }),
        }),
      ],
    }),
    out: `
    _==_(_[_](x~map(string,  google.api.expr.test.v1.proto3.TestAllTypes)^x, "a"~string)
    ~ google.api.expr.test.v1.proto3.TestAllTypes^index_map
    .
    single_int32
    ~int,
    23~int)
    ~bool^equals`,
    outType: BOOL_TYPE,
  },
  {
    in: `x.single_nested_message.bb == 43 && has(x.single_nested_message)`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    // Our implementation code is expanding the macro
    out: `_&&_(
    		  _==_(
    		    x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_nested_message~google.api.expr.test.v1.proto3.TestAllTypes.NestedMessage.bb~int,
    		    43~int
    		  )~bool^equals,
    		  x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_nested_message~test-only~~bool
    		)~bool^logical_and`,
    outType: BOOL_TYPE,
  },
  {
    in: `x.single_nested_message.undefined == x.undefined && has(x.single_int32) && has(x.repeated_int32)`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    err: `
ERROR: <input>:1:24: undefined field 'undefined'
| x.single_nested_message.undefined == x.undefined && has(x.single_int32) && has(x.repeated_int32)
| .......................^
ERROR: <input>:1:39: undefined field 'undefined'
| x.single_nested_message.undefined == x.undefined && has(x.single_int32) && has(x.repeated_int32)
| ......................................^`,
  },
  {
    in: `x.single_nested_message != null`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    out: `
  _!=_(x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_nested_message
  ~google.api.expr.test.v1.proto3.TestAllTypes.NestedMessage,
  null~null)
  ~bool^not_equals
  `,
    outType: BOOL_TYPE,
  },
  {
    in: `x.single_int64 != null`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    err: `
ERROR: <input>:1:16: found no matching overload for '_!=_' applied to '(int, null)'
| x.single_int64 != null
| ...............^
  `,
  },
  {
    in: `x.single_int64_wrapper == null`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    out: `
  _==_(x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_int64_wrapper
  ~wrapper(int),
  null~null)
  ~bool^equals
  `,
    outType: BOOL_TYPE,
  },
  {
    in: `x.single_bool_wrapper
  && x.single_bytes_wrapper == b'hi'
  && x.single_double_wrapper != 2.0
  && x.single_float_wrapper == 1.0
  && x.single_int32_wrapper != 2
  && x.single_int64_wrapper == 1
  && x.single_string_wrapper == 'hi'
  && x.single_uint32_wrapper == 1u
  && x.single_uint64_wrapper != 42u`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    out: `
  _&&_(
      _&&_(
          _&&_(
          _&&_(
              x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_bool_wrapper~wrapper(bool),
              _==_(
              x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_bytes_wrapper~wrapper(bytes),
              b"hi"~bytes
              )~bool^equals
          )~bool^logical_and,
          _!=_(
              x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_double_wrapper~wrapper(double),
              2~double
          )~bool^not_equals
          )~bool^logical_and,
          _&&_(
          _==_(
              x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_float_wrapper~wrapper(double),
              1~double
          )~bool^equals,
          _!=_(
              x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_int32_wrapper~wrapper(int),
              2~int
          )~bool^not_equals
          )~bool^logical_and
      )~bool^logical_and,
      _&&_(
          _&&_(
          _==_(
              x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_int64_wrapper~wrapper(int),
              1~int
          )~bool^equals,
          _==_(
              x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_string_wrapper~wrapper(string),
              "hi"~string
          )~bool^equals
          )~bool^logical_and,
          _&&_(
          _==_(
              x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_uint32_wrapper~wrapper(uint),
              1u~uint
          )~bool^equals,
          _!=_(
              x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_uint64_wrapper~wrapper(uint),
              42u~uint
          )~bool^not_equals
          )~bool^logical_and
      )~bool^logical_and
  )~bool^logical_and`,
    outType: BOOL_TYPE,
  },
  {
    in: `x.single_timestamp == google.protobuf.Timestamp{seconds: 20} &&
     x.single_duration < google.protobuf.Duration{seconds: 10}`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    outType: BOOL_TYPE,
  },
  {
    in: `x.single_bool_wrapper == google.protobuf.BoolValue{value: true}
      && x.single_bytes_wrapper == google.protobuf.BytesValue{value: b'hi'}
      && x.single_double_wrapper != google.protobuf.DoubleValue{value: 2.0}
      && x.single_float_wrapper == google.protobuf.FloatValue{value: 1.0}
      && x.single_int32_wrapper != google.protobuf.Int32Value{value: -2}
      && x.single_int64_wrapper == google.protobuf.Int64Value{value: 1}
      && x.single_string_wrapper == google.protobuf.StringValue{value: 'hi'}
      && x.single_string_wrapper == google.protobuf.Value{string_value: 'hi'}
      && x.single_uint32_wrapper == google.protobuf.UInt32Value{value: 1u}
      && x.single_uint64_wrapper != google.protobuf.UInt64Value{value: 42u}`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    outType: BOOL_TYPE,
  },
  {
    in: `x.repeated_int64.exists(y, y > 10) && y < 5`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    err: `ERROR: <input>:1:39: undeclared reference to 'y' (in container '')
  | x.repeated_int64.exists(y, y > 10) && y < 5
  | ......................................^`,
  },
  {
    in: `x.repeated_int64.all(e, e > 0) && x.repeated_int64.exists(e, e < 0) && x.repeated_int64.exists_one(e, e == 0)`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    out: `_&&_(
      _&&_(
        __comprehension__(
          // Variable
          e,
          // Target
          x~google.api.expr.test.v1.proto3.TestAllTypes^x.repeated_int64~list(int),
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
            _>_(
              e~int^e,
              0~int
            )~bool^greater_int64
          )~bool^logical_and,
          // Result
          __result__~bool^__result__)~bool,
        __comprehension__(
          // Variable
          e,
          // Target
          x~google.api.expr.test.v1.proto3.TestAllTypes^x.repeated_int64~list(int),
          // Accumulator
          __result__,
          // Init
          false~bool,
          // LoopCondition
          @not_strictly_false(
            !_(
              __result__~bool^__result__
            )~bool^logical_not
          )~bool^not_strictly_false,
          // LoopStep
          _||_(
            __result__~bool^__result__,
            _<_(
              e~int^e,
              0~int
            )~bool^less_int64
          )~bool^logical_or,
          // Result
          __result__~bool^__result__)~bool
      )~bool^logical_and,
      __comprehension__(
        // Variable
        e,
        // Target
        x~google.api.expr.test.v1.proto3.TestAllTypes^x.repeated_int64~list(int),
        // Accumulator
        __result__,
        // Init
        0~int,
        // LoopCondition
        true~bool,
        // LoopStep
        _?_:_(
          _==_(
            e~int^e,
            0~int
          )~bool^equals,
          _+_(
            __result__~int^__result__,
            1~int
          )~int^add_int64,
          __result__~int^__result__
        )~int^conditional,
        // Result
        _==_(
          __result__~int^__result__,
          1~int
        )~bool^equals)~bool
    )~bool^logical_and`,
    outType: BOOL_TYPE,
  },
  {
    in: `x.all(e, 0)`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    // TODO: this is the "correct" error message, but the second line doesn't match
    //     err: `
    // ERROR: <input>:1:1: expression of type 'google.api.expr.test.v1.proto3.TestAllTypes' cannot be range of a comprehension (must be list, map, or dynamic)
    // | x.all(e, 0)
    // | ^
    // ERROR: <input>:1:10: expected type 'bool' but found 'int'
    // | x.all(e, 0)
    // | .........^
    // `,
    err: `
ERROR: <input>:1:1: expression of type 'google.api.expr.test.v1.proto3.TestAllTypes' cannot be range of a comprehension (must be list, map, or dynamic)
| x.all(e, 0)
| ^
ERROR: <input>:1:1: found no matching overload for '_&&_' applied to '(bool, int)'
| x.all(e, 0)
| ^
`,
  },
  {
    in: `lists.filter(x, x > 1.5)`,
    out: `__comprehension__(
      // Variable
      x,
      // Target
      lists~dyn^lists,
      // Accumulator
      __result__,
      // Init
      []~list(dyn),
      // LoopCondition
      true~bool,
      // LoopStep
      _?_:_(
        _>_(
          x~dyn^x,
          1.5~double
        )~bool^greater_double|greater_int64_double|greater_uint64_double,
        _+_(
          __result__~list(dyn)^__result__,
          [
            x~dyn^x
          ]~list(dyn)
        )~list(dyn)^add_list,
        __result__~list(dyn)^__result__
      )~list(dyn)^conditional,
      // Result
      __result__~list(dyn)^__result__)~list(dyn)`,
    outType: listType({ elemType: DYN_TYPE }),
    env: extendEnv(getDefaultEnv(), {
      idents: [identDecl('lists', { type: DYN_TYPE })],
    }),
  },
  // TODO: incorrect outType
  //   {
  //     in: `.google.api.expr.test.v1.proto3.TestAllTypes`,
  //     out: `google.api.expr.test.v1.proto3.TestAllTypes
  // ~type(google.api.expr.test.v1.proto3.TestAllTypes)
  // ^google.api.expr.test.v1.proto3.TestAllTypes`,
  //     outType: typeType(
  //       messageType('google.api.expr.test.v1.proto3.TestAllTypes')
  //     ),
  //   },
  {
    in: `proto3.TestAllTypes`,
    container: 'google.api.expr.test.v1',
    out: `
google.api.expr.test.v1.proto3.TestAllTypes
~type(google.api.expr.test.v1.proto3.TestAllTypes)
^google.api.expr.test.v1.proto3.TestAllTypes
`,
    outType: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
  },
  {
    in: `1 + x`,
    err: `
ERROR: <input>:1:5: undeclared reference to 'x' (in container '')
| 1 + x
| ....^`,
  },
  // TODO: these two fail because nullable and any don't have less than/greater equals operators. Should we add them?
  //   {
  //     in: `x == google.protobuf.Any{
  //         type_url:'types.googleapis.com/google.api.expr.test.v1.proto3.TestAllTypes'
  //     } && x.single_nested_message.bb == 43
  //     || x == google.api.expr.test.v1.proto3.TestAllTypes{}
  //     || y < x
  //     || x >= x`,
  //     env: extendEnv(getDefaultEnv(), {
  //       idents: [
  //         identDecl('x', { type: ANY_TYPE }),
  //         identDecl('y', { type: nullableType(INT64_TYPE) }),
  //       ],
  //     }),
  //     out: `
  // _||_(
  //     _||_(
  //         _&&_(
  //             _==_(
  //                 x~any^x,
  //                 google.protobuf.Any{
  //                     type_url:"types.googleapis.com/google.api.expr.test.v1.proto3.TestAllTypes"~string
  //                 }~any^google.protobuf.Any
  //             )~bool^equals,
  //             _==_(
  //                 x~any^x.single_nested_message~dyn.bb~dyn,
  //                 43~int
  //             )~bool^equals
  //         )~bool^logical_and,
  //         _==_(
  //             x~any^x,
  //             google.api.expr.test.v1.proto3.TestAllTypes{}~google.api.expr.test.v1.proto3.TestAllTypes^google.api.expr.test.v1.proto3.TestAllTypes
  //         )~bool^equals
  //     )~bool^logical_or,
  //     _||_(
  //         _<_(
  //             y~wrapper(int)^y,
  //             x~any^x
  //         )~bool^less_int64|less_int64_double|less_int64_uint64,
  //         _>=_(
  //             x~any^x,
  //             x~any^x
  //         )~bool^greater_equals_bool|greater_equals_bytes|greater_equals_double|greater_equals_double_int64|greater_equals_double_uint64|greater_equals_duration|greater_equals_int64|greater_equals_int64_double|greater_equals_int64_uint64|greater_equals_string|greater_equals_timestamp|greater_equals_uint64|greater_equals_uint64_double|greater_equals_uint64_int64
  //     )~bool^logical_or
  // )~bool^logical_or
  // `,
  //     outType: BOOL_TYPE,
  //   },
  //   {
  //     in: `x == google.protobuf.Any{
  //         type_url:'types.googleapis.com/google.api.expr.test.v1.proto3.TestAllTypes'
  //     } && x.single_nested_message.bb == 43
  //     || x == google.api.expr.test.v1.proto3.TestAllTypes{}
  //     || y < x
  //     || x >= x`,
  //     env: extendEnv(getDefaultEnv(), {
  //       idents: [
  //         identDecl('x', { type: ANY_TYPE }),
  //         identDecl('y', { type: nullableType(INT64_TYPE) }),
  //       ],
  //     }),
  //     out: `
  // _||_(
  //     _&&_(
  //       _==_(
  //         x~any^x,
  //         google.protobuf.Any{
  //           type_url:"types.googleapis.com/google.api.expr.test.v1.proto3.TestAllTypes"~string
  //         }~any^google.protobuf.Any
  //       )~bool^equals,
  //       _==_(
  //         x~any^x.single_nested_message~dyn.bb~dyn,
  //         43~int
  //       )~bool^equals
  //     )~bool^logical_and,
  //     _==_(
  //       x~any^x,
  //       google.api.expr.test.v1.proto3.TestAllTypes{}~google.api.expr.test.v1.proto3.TestAllTypes^google.api.expr.test.v1.proto3.TestAllTypes
  //     )~bool^equals,
  //     _<_(
  //       y~wrapper(int)^y,
  //       x~any^x
  //     )~bool^less_int64|less_int64_double|less_int64_uint64,
  //     _>=_(
  //       x~any^x,
  //       x~any^x
  //     )~bool^greater_equals_bool|greater_equals_bytes|greater_equals_double|greater_equals_double_int64|greater_equals_double_uint64|greater_equals_duration|greater_equals_int64|greater_equals_int64_double|greater_equals_int64_uint64|greater_equals_string|greater_equals_timestamp|greater_equals_uint64|greater_equals_uint64_double|greater_equals_uint64_int64
  //   )~bool^logical_or
  // `,
  //     outType: types.BoolType,
  //   },
  // TODO: not sure why this fails. probably because of the decl name having the container name in it
  //   {
  //     in: `x`,
  //     container: 'container',
  //     env: extendEnv(getDefaultEnv(), {
  //       idents: [
  //         identDecl('container.x', {
  //           type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
  //         }),
  //       ],
  //     }),
  //     out: `container.x~google.api.expr.test.v1.proto3.TestAllTypes^container.x`,
  //     outType: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
  //   },
  {
    in: `list == type([1]) && map == type({1:2u})`,
    out: `
_&&_(_==_(list~type(list(dyn))^list,
   type([1~int]~list(int))~type(list(int))^type)
~bool^equals,
_==_(map~type(map(dyn, dyn))^map,
    type({1~int : 2u~uint}~map(int, uint))~type(map(int, uint))^type)
~bool^equals)
~bool^logical_and
`,
    outType: BOOL_TYPE,
  },
  {
    in: `size(x) > 4`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
      functions: [
        functionDecl('size', {
          overloads: [
            overloadDecl({
              overloadId: 'size_message',
              params: [
                messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
              ],
              resultType: INT64_TYPE,
            }),
          ],
        }),
      ],
    }),
    outType: BOOL_TYPE,
  },
  {
    in: `x.single_int64_wrapper + 1 != 23`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    out: `
_!=_(_+_(x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_int64_wrapper
~wrapper(int),
1~int)
~int^add_int64,
23~int)
~bool^not_equals
`,
    outType: BOOL_TYPE,
  },
  {
    in: `x.single_int64_wrapper + y != 23`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('x', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
        identDecl('y', { type: messageType('google.protobuf.Int32Value') }),
      ],
    }),
    out: `
_!=_(
    _+_(
      x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_int64_wrapper~wrapper(int),
      y~wrapper(int)^y
    )~int^add_int64,
    23~int
  )~bool^not_equals
`,
    outType: BOOL_TYPE,
  },
  {
    in: `1 in [1, 2, 3]`,
    out: `@in(
      1~int,
      [
        1~int,
        2~int,
        3~int
      ]~list(int)
    )~bool^in_list`,
    outType: BOOL_TYPE,
  },
  {
    in: `1 in dyn([1, 2, 3])`,
    out: `@in(
    1~int,
    dyn(
      [
        1~int,
        2~int,
        3~int
      ]~list(int)
    )~dyn^to_dyn
  )~bool^in_list|in_map`,
    outType: BOOL_TYPE,
  },
  {
    in: `type(null) == null_type`,
    out: `_==_(
      type(
        null~null
      )~type(null)^type,
      null_type~type(null)^null_type
    )~bool^equals`,
    outType: BOOL_TYPE,
  },
  {
    in: `type(type) == type`,
    out: `_==_(
  type(
    type~type(type)^type
  )~type(type(type))^type,
  type~type(type)^type
)~bool^equals`,
    outType: BOOL_TYPE,
  },
  {
    in: `([[[1]], [[2]], [[3]]][0][0] + [2, 3, {'four': {'five': 'six'}}])[3]`,
    out: `_[_](
    _+_(
        _[_](
            _[_](
                [
                    [
                        [
                            1~int
                        ]~list(int)
                    ]~list(list(int)),
                    [
                        [
                            2~int
                        ]~list(int)
                    ]~list(list(int)),
                    [
                        [
                            3~int
                        ]~list(int)
                    ]~list(list(int))
                ]~list(list(list(int))),
                0~int
            )~list(list(int))^index_list,
            0~int
        )~list(int)^index_list,
        [
            2~int,
            3~int,
            {
                "four"~string:{
                    "five"~string:"six"~string
                }~map(string, string)
            }~map(string, map(string, string))
        ]~list(dyn)
    )~list(dyn)^add_list,
    3~int
)~dyn^index_list`,
    outType: DYN_TYPE,
  },
  {
    in: `[1] + [dyn('string')]`,
    out: `_+_(
    [
        1~int
    ]~list(int),
    [
        dyn(
            "string"~string
        )~dyn^to_dyn
    ]~list(dyn)
)~list(dyn)^add_list`,
    outType: listType({ elemType: DYN_TYPE }),
  },
  {
    in: `[dyn('string')] + [1]`,
    out: `_+_(
    [
        dyn(
            "string"~string
        )~dyn^to_dyn
    ]~list(dyn),
    [
        1~int
    ]~list(int)
)~list(dyn)^add_list`,
    outType: listType({ elemType: DYN_TYPE }),
  },
  // TODO; this one throws the correct error and points to the right spot but the argTypes are (_var2, _var0) instead of (list(dyn), dyn)
  //   {
  //     in: `[].map(x, [].map(y, x in y && y in x))`,
  //     err: `
  //   ERROR: <input>:1:33: found no matching overload for '@in' applied to '(list(dyn), dyn)'
  //   | [].map(x, [].map(y, x in y && y in x))
  //   | ................................^`,
  //   },
  {
    in: `args.user["myextension"].customAttributes.filter(x, x.name == "hobbies")`,
    out: `__comprehension__(
      // Variable
      x,
      // Target
      _[_](
      args~map(string, dyn)^args.user~dyn,
      "myextension"~string
      )~dyn^index_map.customAttributes~dyn,
      // Accumulator
      __result__,
      // Init
      []~list(dyn),
      // LoopCondition
      true~bool,
      // LoopStep
      _?_:_(
      _==_(
          x~dyn^x.name~dyn,
          "hobbies"~string
      )~bool^equals,
      _+_(
          __result__~list(dyn)^__result__,
          [
          x~dyn^x
          ]~list(dyn)
      )~list(dyn)^add_list,
      __result__~list(dyn)^__result__
      )~list(dyn)^conditional,
      // Result
      __result__~list(dyn)^__result__)~list(dyn)`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('args', {
          type: mapType({ keyType: STRING_TYPE, valueType: DYN_TYPE }),
        }),
      ],
    }),
    outType: listType({ elemType: DYN_TYPE }),
  },
  {
    in: `a.b + 1 == a[0]`,
    out: `_==_(
    _+_(
      a~dyn^a.b~dyn,
      1~int
    )~int^add_int64,
    _[_](
      a~dyn^a,
      0~int
    )~dyn^index_list|index_map
  )~bool^equals`,
    env: extendEnv(getDefaultEnv(), {
      idents: [identDecl('a', { type: typeParamType('T') })],
    }),
    outType: BOOL_TYPE,
  },
  {
    in: `!has(pb2.single_int64)
  && !has(pb2.repeated_int32)
  && !has(pb2.map_string_string)
  && !has(pb3.single_int64)
  && !has(pb3.repeated_int32)
  && !has(pb3.map_string_string)`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('pb2', {
          type: messageType('google.api.expr.test.v1.proto2.TestAllTypes'),
        }),
        identDecl('pb3', {
          type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
        }),
      ],
    }),
    out: `
  _&&_(
      _&&_(
        _&&_(
          !_(
            pb2~google.api.expr.test.v1.proto2.TestAllTypes^pb2.single_int64~test-only~~bool
          )~bool^logical_not,
          !_(
            pb2~google.api.expr.test.v1.proto2.TestAllTypes^pb2.repeated_int32~test-only~~bool
          )~bool^logical_not
        )~bool^logical_and,
        !_(
          pb2~google.api.expr.test.v1.proto2.TestAllTypes^pb2.map_string_string~test-only~~bool
        )~bool^logical_not
      )~bool^logical_and,
      _&&_(
        _&&_(
          !_(
            pb3~google.api.expr.test.v1.proto3.TestAllTypes^pb3.single_int64~test-only~~bool
          )~bool^logical_not,
          !_(
            pb3~google.api.expr.test.v1.proto3.TestAllTypes^pb3.repeated_int32~test-only~~bool
          )~bool^logical_not
        )~bool^logical_and,
        !_(
          pb3~google.api.expr.test.v1.proto3.TestAllTypes^pb3.map_string_string~test-only~~bool
        )~bool^logical_not
      )~bool^logical_and
    )~bool^logical_and`,
    outType: BOOL_TYPE,
  },
  {
    in: `TestAllTypes{}.repeated_nested_message`,
    container: 'google.api.expr.test.v1.proto2',
    out: `
google.api.expr.test.v1.proto2.TestAllTypes{}~google.api.expr.test.v1.proto2.TestAllTypes^
google.api.expr.test.v1.proto2.TestAllTypes.repeated_nested_message
~list(google.api.expr.test.v1.proto2.TestAllTypes.NestedMessage)`,
    outType: listType({
      elemType: messageType(
        'google.api.expr.test.v1.proto2.TestAllTypes.NestedMessage'
      ),
    }),
  },
  {
    in: `TestAllTypes{}.repeated_nested_message`,
    container: 'google.api.expr.test.v1.proto3',
    out: `
  google.api.expr.test.v1.proto3.TestAllTypes{}~google.api.expr.test.v1.proto3.TestAllTypes^
  google.api.expr.test.v1.proto3.TestAllTypes.repeated_nested_message
  ~list(google.api.expr.test.v1.proto3.TestAllTypes.NestedMessage)`,
    outType: listType({
      elemType: messageType(
        'google.api.expr.test.v1.proto3.TestAllTypes.NestedMessage'
      ),
    }),
  },
  {
    in: `base64.encode('hello')`,
    env: extendEnv(getDefaultEnv(), {
      functions: [
        functionDecl('base64.encode', {
          overloads: [
            overloadDecl({
              overloadId: 'base64_encode_string',
              params: [STRING_TYPE],
              resultType: STRING_TYPE,
            }),
          ],
        }),
      ],
    }),
    out: `
  base64.encode(
      "hello"~string
  )~string^base64_encode_string`,
    outType: STRING_TYPE,
  },
  // TODO: namespaced functions
  //   {
  //     in: `encode('hello')`,
  //     container: `base64`,
  //     env: extendEnv(getDefaultEnv(), {
  //       functions: [
  //         functionDecl('base64.encode', {
  //           overloads: [
  //             overloadDecl({
  //               overloadId: 'base64_encode_string',
  //               params: [STRING_TYPE],
  //               resultType: STRING_TYPE,
  //             }),
  //           ],
  //         }),
  //       ],
  //     }),
  //     out: `
  // base64.encode(
  //     "hello"~string
  // )~string^base64_encode_string`,
  //     outType: STRING_TYPE,
  //   },
  {
    in: `{}`,
    out: `{}~map(dyn, dyn)`,
    outType: mapType({ keyType: DYN_TYPE, valueType: DYN_TYPE }),
  },
  {
    in: `set([1, 2, 3])`,
    out: `
set(
  [
    1~int,
    2~int,
    3~int
  ]~list(int)
)~set(int)^set_list`,
    env: extendEnv(getDefaultEnv(), {
      functions: [
        functionDecl('set', {
          overloads: [
            overloadDecl({
              overloadId: 'set_list',
              params: [listType({ elemType: typeParamType('T') })],
              resultType: abstractType({
                name: 'set',
                parameterTypes: [typeParamType('T')],
              }),
            }),
          ],
        }),
      ],
    }),
    outType: abstractType({ name: 'set', parameterTypes: [INT64_TYPE] }),
  },
  {
    in: `set([1, 2]) == set([2, 1])`,
    out: `
  _==_(
    set([1~int, 2~int]~list(int))~set(int)^set_list,
    set([2~int, 1~int]~list(int))~set(int)^set_list
  )~bool^equals`,
    env: extendEnv(getDefaultEnv(), {
      functions: [
        functionDecl('set', {
          overloads: [
            overloadDecl({
              overloadId: 'set_list',
              params: [listType({ elemType: typeParamType('T') })],
              resultType: abstractType({
                name: 'set',
                parameterTypes: [typeParamType('T')],
              }),
            }),
          ],
        }),
      ],
    }),
    outType: BOOL_TYPE,
  },
  {
    in: `set([1, 2]) == x`,
    out: `
_==_(
  set([1~int, 2~int]~list(int))~set(int)^set_list,
  x~set(int)^x
)~bool^equals`,
    env: extendEnv(getDefaultEnv(), {
      functions: [
        functionDecl('set', {
          overloads: [
            overloadDecl({
              overloadId: 'set_list',
              params: [listType({ elemType: typeParamType('T') })],
              resultType: abstractType({
                name: 'set',
                parameterTypes: [typeParamType('T')],
              }),
            }),
          ],
        }),
      ],
      idents: [
        identDecl('x', {
          type: abstractType({
            name: 'set',
            parameterTypes: [typeParamType('T')],
          }),
        }),
      ],
    }),
    outType: BOOL_TYPE,
  },
  {
    in: `int{}`,
    err: `
  ERROR: <input>:1:4: 'int' is not a message type
   | int{}
   | ...^
  `,
  },
  {
    in: `Msg{}`,
    err: `
  ERROR: <input>:1:4: undeclared reference to 'Msg' (in container '')
   | Msg{}
   | ...^
  `,
  },
  {
    in: `fun()`,
    err: `
  ERROR: <input>:1:4: undeclared reference to 'fun' (in container '')
   | fun()
   | ...^
  `,
  },
  {
    in: `'string'.fun()`,
    err: `
  ERROR: <input>:1:13: undeclared reference to 'fun' (in container '')
   | 'string'.fun()
   | ............^
  `,
  },
  {
    in: `[].length`,
    err: `
  ERROR: <input>:1:3: type 'list(_var0)' does not support field selection
   | [].length
   | ..^
  `,
  },
  // TODO: implement CrossTypeNumericComparisons flag. Right now they are always enabled
  //   {
  //     in: `1 <= 1.0 && 1u <= 1.0 && 1.0 <= 1 && 1.0 <= 1u && 1 <= 1u && 1u <= 1`,
  //     opts: []Option{CrossTypeNumericComparisons(false)},
  //     err: `
  //   ERROR: <input>:1:3: found no matching overload for '_<=_' applied to '(int, double)'
  //    | 1 <= 1.0 && 1u <= 1.0 && 1.0 <= 1 && 1.0 <= 1u && 1 <= 1u && 1u <= 1
  //    | ..^
  //   ERROR: <input>:1:16: found no matching overload for '_<=_' applied to '(uint, double)'
  //    | 1 <= 1.0 && 1u <= 1.0 && 1.0 <= 1 && 1.0 <= 1u && 1 <= 1u && 1u <= 1
  //    | ...............^
  //   ERROR: <input>:1:30: found no matching overload for '_<=_' applied to '(double, int)'
  //    | 1 <= 1.0 && 1u <= 1.0 && 1.0 <= 1 && 1.0 <= 1u && 1 <= 1u && 1u <= 1
  //    | .............................^
  //   ERROR: <input>:1:42: found no matching overload for '_<=_' applied to '(double, uint)'
  //    | 1 <= 1.0 && 1u <= 1.0 && 1.0 <= 1 && 1.0 <= 1u && 1 <= 1u && 1u <= 1
  //    | .........................................^
  //   ERROR: <input>:1:53: found no matching overload for '_<=_' applied to '(int, uint)'
  //    | 1 <= 1.0 && 1u <= 1.0 && 1.0 <= 1 && 1.0 <= 1u && 1 <= 1u && 1u <= 1
  //    | ....................................................^
  //   ERROR: <input>:1:65: found no matching overload for '_<=_' applied to '(uint, int)'
  //    | 1 <= 1.0 && 1u <= 1.0 && 1.0 <= 1 && 1.0 <= 1u && 1 <= 1u && 1u <= 1
  //    | ................................................................^
  //   `,
  //   },
  {
    in: `1 <= 1.0 && 1u <= 1.0 && 1.0 <= 1 && 1.0 <= 1u && 1 <= 1u && 1u <= 1`,
    // opts:    []Option{CrossTypeNumericComparisons(true)},
    outType: BOOL_TYPE,
    out: `
  _&&_(
      _&&_(
        _&&_(
          _<=_(
            1~int,
            1~double
          )~bool^less_equals_int64_double,
          _<=_(
            1u~uint,
            1~double
          )~bool^less_equals_uint64_double
        )~bool^logical_and,
        _<=_(
          1~double,
          1~int
        )~bool^less_equals_double_int64
      )~bool^logical_and,
      _&&_(
        _&&_(
          _<=_(
            1~double,
            1u~uint
          )~bool^less_equals_double_uint64,
          _<=_(
            1~int,
            1u~uint
          )~bool^less_equals_int64_uint64
        )~bool^logical_and,
        _<=_(
          1u~uint,
          1~int
        )~bool^less_equals_uint64_int64
      )~bool^logical_and
    )~bool^logical_and`,
  },
  {
    in: `1 < 1.0 && 1u < 1.0 && 1.0 < 1 && 1.0 < 1u && 1 < 1u && 1u < 1`,
    // opts:    []Option{CrossTypeNumericComparisons(true)},
    outType: BOOL_TYPE,
    out: `
  _&&_(
      _&&_(
        _&&_(
          _<_(
            1~int,
            1~double
          )~bool^less_int64_double,
          _<_(
            1u~uint,
            1~double
          )~bool^less_uint64_double
        )~bool^logical_and,
        _<_(
          1~double,
          1~int
        )~bool^less_double_int64
      )~bool^logical_and,
      _&&_(
        _&&_(
          _<_(
            1~double,
            1u~uint
          )~bool^less_double_uint64,
          _<_(
            1~int,
            1u~uint
          )~bool^less_int64_uint64
        )~bool^logical_and,
        _<_(
          1u~uint,
          1~int
        )~bool^less_uint64_int64
      )~bool^logical_and
    )~bool^logical_and`,
  },
  {
    in: `1 > 1.0 && 1u > 1.0 && 1.0 > 1 && 1.0 > 1u && 1 > 1u && 1u > 1`,
    // opts:    []Option{CrossTypeNumericComparisons(true)},
    outType: BOOL_TYPE,
    out: `
  _&&_(
      _&&_(
        _&&_(
          _>_(
            1~int,
            1~double
          )~bool^greater_int64_double,
          _>_(
            1u~uint,
            1~double
          )~bool^greater_uint64_double
        )~bool^logical_and,
        _>_(
          1~double,
          1~int
        )~bool^greater_double_int64
      )~bool^logical_and,
      _&&_(
        _&&_(
          _>_(
            1~double,
            1u~uint
          )~bool^greater_double_uint64,
          _>_(
            1~int,
            1u~uint
          )~bool^greater_int64_uint64
        )~bool^logical_and,
        _>_(
          1u~uint,
          1~int
        )~bool^greater_uint64_int64
      )~bool^logical_and
    )~bool^logical_and`,
  },
  {
    in: `1 >= 1.0 && 1u >= 1.0 && 1.0 >= 1 && 1.0 >= 1u && 1 >= 1u && 1u >= 1`,
    // opts:    []Option{CrossTypeNumericComparisons(true)},
    outType: BOOL_TYPE,
    out: `
  _&&_(
      _&&_(
        _&&_(
          _>=_(
            1~int,
            1~double
          )~bool^greater_equals_int64_double,
          _>=_(
            1u~uint,
            1~double
          )~bool^greater_equals_uint64_double
        )~bool^logical_and,
        _>=_(
          1~double,
          1~int
        )~bool^greater_equals_double_int64
      )~bool^logical_and,
      _&&_(
        _&&_(
          _>=_(
            1~double,
            1u~uint
          )~bool^greater_equals_double_uint64,
          _>=_(
            1~int,
            1u~uint
          )~bool^greater_equals_int64_uint64
        )~bool^logical_and,
        _>=_(
          1u~uint,
          1~int
        )~bool^greater_equals_uint64_int64
      )~bool^logical_and
    )~bool^logical_and`,
  },
  // TODO: implement variadicASTs option?
  {
    in: `1 >= 1.0 && 1u >= 1.0 && 1.0 >= 1 && 1.0 >= 1u && 1 >= 1u && 1u >= 1`,
    // opts:    []Option{CrossTypeNumericComparisons(true)},
    // env:     testEnv{variadicASTs: true},
    outType: BOOL_TYPE,
    out: `
  _&&_(
      _>=_(
        1~int,
        1~double
      )~bool^greater_equals_int64_double,
      _>=_(
        1u~uint,
        1~double
      )~bool^greater_equals_uint64_double,
      _>=_(
        1~double,
        1~int
      )~bool^greater_equals_double_int64,
      _>=_(
        1~double,
        1u~uint
      )~bool^greater_equals_double_uint64,
      _>=_(
        1~int,
        1u~uint
      )~bool^greater_equals_int64_uint64,
      _>=_(
        1u~uint,
        1~int
      )~bool^greater_equals_uint64_int64
    )~bool^logical_and`,
  },
  {
    in: `[1].map(x, [x, x]).map(x, [x, x])`,
    outType: listType({
      elemType: listType({ elemType: listType({ elemType: INT64_TYPE }) }),
    }),
    out: `__comprehension__(
    // Variable
    x,
    // Target
    __comprehension__(
      // Variable
      x,
      // Target
      [
        1~int
      ]~list(int),
      // Accumulator
      __result__,
      // Init
      []~list(list(int)),
      // LoopCondition
      true~bool,
      // LoopStep
      _+_(
        __result__~list(list(int))^__result__,
        [
          [
            x~int^x,
            x~int^x
          ]~list(int)
        ]~list(list(int))
      )~list(list(int))^add_list,
      // Result
      __result__~list(list(int))^__result__)~list(list(int)),
    // Accumulator
    __result__,
    // Init
    []~list(list(list(int))),
    // LoopCondition
    true~bool,
    // LoopStep
    _+_(
      __result__~list(list(list(int)))^__result__,
      [
        [
          x~list(int)^x,
          x~list(int)^x
        ]~list(list(int))
      ]~list(list(list(int)))
    )~list(list(list(int)))^add_list,
    // Result
    __result__~list(list(list(int)))^__result__)~list(list(list(int)))
  `,
  },
  {
    in: `values.filter(i, i.content != "").map(i, i.content)`,
    outType: listType({ elemType: STRING_TYPE }),
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('values', {
          type: listType({
            elemType: mapType({ keyType: STRING_TYPE, valueType: STRING_TYPE }),
          }),
        }),
      ],
    }),
    out: `__comprehension__(
      // Variable
      i,
      // Target
      __comprehension__(
        // Variable
        i,
        // Target
        values~list(map(string, string))^values,
        // Accumulator
        __result__,
        // Init
        []~list(map(string, string)),
        // LoopCondition
        true~bool,
        // LoopStep
        _?_:_(
          _!=_(
            i~map(string, string)^i.content~string,
            ""~string
          )~bool^not_equals,
          _+_(
            __result__~list(map(string, string))^__result__,
            [
              i~map(string, string)^i
            ]~list(map(string, string))
          )~list(map(string, string))^add_list,
          __result__~list(map(string, string))^__result__
        )~list(map(string, string))^conditional,
        // Result
        __result__~list(map(string, string))^__result__)~list(map(string, string)),
      // Accumulator
      __result__,
      // Init
      []~list(string),
      // LoopCondition
      true~bool,
      // LoopStep
      _+_(
        __result__~list(string)^__result__,
        [
          i~map(string, string)^i.content~string
        ]~list(string)
      )~list(string)^add_list,
      // Result
      __result__~list(string)^__result__)~list(string)`,
  },
  // TODO: Not sure the 3rd param for map is implemented
  //   {
  //     in: `[{}.map(c,c,c)]+[{}.map(c,c,c)]`,
  //     outType: listType({ elemType: listType({ elemType: BOOL_TYPE }) }),
  //     out: `_+_(
  //     [
  //       __comprehension__(
  //         // Variable
  //         c,
  //         // Target
  //         {}~map(bool, dyn),
  //         // Accumulator
  //         __result__,
  //         // Init
  //         []~list(bool),
  //         // LoopCondition
  //         true~bool,
  //         // LoopStep
  //         _?_:_(
  //           c~bool^c,
  //           _+_(
  //             __result__~list(bool)^__result__,
  //             [
  //               c~bool^c
  //             ]~list(bool)
  //           )~list(bool)^add_list,
  //           __result__~list(bool)^__result__
  //         )~list(bool)^conditional,
  //         // Result
  //         __result__~list(bool)^__result__)~list(bool)
  //     ]~list(list(bool)),
  //     [
  //       __comprehension__(
  //         // Variable
  //         c,
  //         // Target
  //         {}~map(bool, dyn),
  //         // Accumulator
  //         __result__,
  //         // Init
  //         []~list(bool),
  //         // LoopCondition
  //         true~bool,
  //         // LoopStep
  //         _?_:_(
  //           c~bool^c,
  //           _+_(
  //             __result__~list(bool)^__result__,
  //             [
  //               c~bool^c
  //             ]~list(bool)
  //           )~list(bool)^add_list,
  //           __result__~list(bool)^__result__
  //         )~list(bool)^conditional,
  //         // Result
  //         __result__~list(bool)^__result__)~list(bool)
  //     ]~list(list(bool))
  //   )~list(list(bool))^add_list`,
  //   },
  // TODO: nestedgroup does not exist on TestAllTypes. Revisit when we switch to the buf-managed proto
  //   {
  //     in: 'type(testAllTypes.nestedgroup.nested_id) == int',
  //     env: extendEnv(getDefaultEnv(), {
  //       idents: [
  //         identDecl('testAllTypes', {
  //           type: messageType('google.api.expr.test.v1.proto3.TestAllTypes'),
  //         }),
  //       ],
  //     }),
  //     outType: BOOL_TYPE,
  //     out: `_==_(
  // 			type(
  // 			  testAllTypes~google.api.expr.test.v1.proto3.TestAllTypes^testAllTypes.nestedgroup~google.api.expr.test.v1.proto3.TestAllTypes.NestedGroup.nested_id~int
  // 			)~type(int)^type,
  // 			int~type(int)^int
  // 		  )~bool^equals`,
  //   },
  // TODO: Optionals
  {
    in: `a.?b`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('a', {
          type: mapType({
            keyType: STRING_TYPE,
            valueType: STRING_TYPE,
          }),
        }),
      ],
    }),
    parserOptions: { enableOptionalSyntax: true },
    outType: optionalType(STRING_TYPE),
    out: `_?._(
  			a~map(string, string)^a,
  			"b"
  		  )~optional_type(string)^select_optional_field`,
  },
  {
    in: `type(a.?b) == optional_type`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('optional_type', { type: ABSTRACT_OPTIONAL_TYPE }),
        identDecl('a', {
          type: mapType({
            keyType: STRING_TYPE,
            valueType: STRING_TYPE,
          }),
        }),
      ],
    }),
    parserOptions: { enableOptionalSyntax: true },
    outType: BOOL_TYPE,
    out: `_==_(
          type(
            _?._(
              a~map(string, string)^a,
              "b"
            )~optional_type(string)^select_optional_field
          )~type(optional_type(string))^type,
          optional_type~type(optional_type)^optional_type
        )~bool^equals`,
  },
  {
    in: `a.b`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('a', {
          type: optionalType(
            mapType({
              keyType: STRING_TYPE,
              valueType: STRING_TYPE,
            })
          ),
        }),
      ],
    }),
    outType: optionalType(STRING_TYPE),
    out: `a~optional_type(map(string, string))^a.b~optional_type(string)`,
  },
  {
    in: `a.dynamic`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('a', {
          type: optionalType(DYN_TYPE),
        }),
      ],
    }),
    outType: optionalType(DYN_TYPE),
    out: `a~optional_type(dyn)^a.dynamic~optional_type(dyn)`,
  },
  {
    in: `has(a.dynamic)`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('a', {
          type: optionalType(DYN_TYPE),
        }),
      ],
    }),
    outType: BOOL_TYPE,
    out: `a~optional_type(dyn)^a.dynamic~test-only~~bool`,
  },
  {
    in: `has(a.?b.c)`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('a', {
          type: optionalType(
            mapType({
              keyType: STRING_TYPE,
              valueType: DYN_TYPE,
            })
          ),
        }),
      ],
    }),
    parserOptions: { enableOptionalSyntax: true },
    outType: BOOL_TYPE,
    out: `_?._(
      a~optional_type(map(string, dyn))^a,
      "b"
    )~optional_type(dyn)^select_optional_field.c~test-only~~bool`,
  },
  {
    in: `{?'key': {'a': 'b'}.?value}`,
    parserOptions: { enableOptionalSyntax: true },
    outType: mapType({
      keyType: STRING_TYPE,
      // TODO: the go test has this as just a string type, but it seems like it should be optional. And the test passes with this change
      valueType: optionalType(STRING_TYPE),
    }),
    out: `{
      ?"key"~string:_?._(
        {
          "a"~string:"b"~string
        }~map(string, string),
        "value"
      )~optional_type(string)^select_optional_field
    }~map(string, string)`,
  },
  {
    in: `{?'key': {'a': 'b'}.?value}.key`,
    parserOptions: { enableOptionalSyntax: true },
    // TODO: the go test has this as just a string type, but it seems like it should be optional. And the test passes with this change
    outType: optionalType(STRING_TYPE),
    out: `{
      ?"key"~string:_?._(
        {
          "a"~string:"b"~string
        }~map(string, string),
        "value"
      )~optional_type(string)^select_optional_field
    }~map(string, string).key~string`,
  },
  {
    in: `{?'nested': a.b}`,
    parserOptions: { enableOptionalSyntax: true },
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('a', {
          type: optionalType(
            mapType({
              keyType: STRING_TYPE,
              valueType: STRING_TYPE,
            })
          ),
        }),
      ],
    }),
    outType: mapType({
      keyType: STRING_TYPE,
      // TODO: the go test has this as just a string type, but it seems like it should be optional. And the test passes with this change
      valueType: optionalType(STRING_TYPE),
    }),
    out: `{
      ?"nested"~string:a~optional_type(map(string, string))^a.b~optional_type(string)
    }~map(string, string)`,
  },
  // TODO: does this test make sense?
  //   {
  //     in: `{?'key': 'hi'}`,
  //     parserOptions: { enableOptionalSyntax: true },
  //     err: `ERROR: <input>:1:10: expected type 'optional_type(string)' but found 'string'
  //   | {?'key': 'hi'}
  //   | .........^`,
  //   },
  // TODO: this outputs a DYN list
  //   {
  //     in: `[?a, ?b, 'world']`,
  //     parserOptions: { enableOptionalSyntax: true },
  //     env: extendEnv(getDefaultEnv(), {
  //       idents: [
  //         identDecl('a', {
  //           type: optionalType(STRING_TYPE),
  //         }),
  //         identDecl('b', {
  //           type: optionalType(STRING_TYPE),
  //         }),
  //       ],
  //     }),
  //     outType: listType({ elemType: STRING_TYPE }),
  //     out: `[
  //       a~optional_type(string)^a,
  //       b~optional_type(string)^b,
  //       "world"~string
  //     ]~list(string)`,
  //   },
  // {
  //     in:  `[?'value']`,
  //     env: testEnv{optionalSyntax: true},
  //     err: `ERROR: <input>:1:3: expected type 'optional_type(string)' but found 'string'
  // | [?'value']
  // | ..^`,
  // },
  // TODO: this outputs an error
  //   {
  //     in: `TestAllTypes{?single_int32: {}.?i}`,
  //     container: 'google.api.expr.test.v1.proto2',
  //     parserOptions: { enableOptionalSyntax: true },
  //     out: `google.api.expr.test.v1.proto2.TestAllTypes{
  //       ?single_int32:_?._(
  //         {}~map(dyn, int),
  //         "i"
  //       )~optional_type(int)^select_optional_field
  //     }~google.api.expr.test.v1.proto2.TestAllTypes^google.api.expr.test.v1.proto2.TestAllTypes`,
  //     outType: messageType('google.api.expr.test.v1.proto2.TestAllTypes'),
  //   },
  // TODO: this does not put out an error
  //   {
  //     in: `TestAllTypes{?single_int32: 1}`,
  //     container: 'google.api.expr.test.v1.proto2',
  //     parserOptions: { enableOptionalSyntax: true },
  //     err: `ERROR: <input>:1:29: expected type 'optional_type(int)' but found 'int'
  //   | TestAllTypes{?single_int32: 1}
  //   | ............................^`,
  //   },
  {
    in: `undef`,
    err: `ERROR: <input>:1:1: undeclared reference to 'undef' (in container '')
      | undef
      | ^`,
  },
  {
    in: `undef()`,
    err: `ERROR: <input>:1:6: undeclared reference to 'undef' (in container '')
      | undef()
      | .....^`,
  },
  {
    in: `null_int == null || null == null_int || null_msg == null || null == null_msg`,
    env: extendEnv(getDefaultEnv(), {
      idents: [
        identDecl('null_int', { type: nullableType(INT64_TYPE) }),
        identDecl('null_msg', {
          type: nullableType(
            messageType('google.api.expr.test.v1.proto2.TestAllTypes')
          ),
        }),
      ],
    }),
    outType: BOOL_TYPE,
  },
  // TODO: nullables
  //   {
  //     in: `NotAMessage{}`,
  //     env: extendEnv(getDefaultEnv(), {
  //       idents: [identDecl('NotAMessage', { type: nullableType(INT64_TYPE) })],
  //     }),
  //     err: `ERROR: <input>:1:12: 'wrapper(int)' is not a type
  //       | NotAMessage{}
  //       | ...........^`,
  //   },
  {
    in: `{}.map(c,[c,type(c)])`,
    out: `__comprehension__(
          // Variable
          c,
          // Target
          {}~map(dyn, dyn),
          // Accumulator
          __result__,
          // Init
          []~list(list(dyn)),
          // LoopCondition
          true~bool,
          // LoopStep
          _+_(
            __result__~list(list(dyn))^__result__,
            [
              [
                c~dyn^c,
                type(
                  c~dyn^c
                )~type(dyn)^type
              ]~list(dyn)
            ]~list(list(dyn))
          )~list(list(dyn))^add_list,
          // Result
          __result__~list(list(dyn))^__result__)~list(list(dyn))`,
    outType: listType({ elemType: listType({ elemType: DYN_TYPE }) }),
  },
];

// TODO: The package name for TestAllTypes is different in cel-go because we have to import from a different package.
// TODO: test the "out" key strings
describe('CELChecker', () => {
  for (const testCase of testCases) {
    it(`should check ${testCase.in}`, () => {
      const container = new CELContainer(testCase.container ?? '');
      const env = testCase.env ?? extendEnv(getDefaultEnv(), { container });
      const parser = new CELParser(testCase.in, testCase.parserOptions);
      const parsed = parser.parse();
      if (isNil(parsed.expr)) {
        throw new Error('parsed.expr is nil');
      }
      const checker = new CELChecker(parsed, testCase.in, env);
      const result = checker.check();
      if (testCase.outType) {
        const got = result.typeMap[parsed.expr.id.toString()];
        const expected = testCase.outType;
        try {
          expect(got).toEqual(expected);
          if (
            testCase.outType !== ERROR_TYPE &&
            !testCase.err &&
            checker.errors.length > 0
          ) {
            throw new Error(
              'Unexpected errors: ' + checker.errorsToDisplayString()
            );
          }
        } catch (e) {
          console.log(checker.errorsToDisplayString());
          console.dir({ expected, got }, { depth: null });
          throw e;
        }
      }
      if (testCase.err) {
        expect(checker.errorsToDisplayString()).toEqual(
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
