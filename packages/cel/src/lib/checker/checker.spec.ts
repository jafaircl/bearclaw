/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  TestAllTypes_NestedEnumSchema as TestAllTypes_NestedEnumSchemaProto2,
  TestAllTypes_NestedMessageSchema as TestAllTypes_NestedMessageSchemaProto2,
  TestAllTypesSchema as TestAllTypesSchemaProto2,
} from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto2/test_all_types_pb.js';
import {
  TestAllTypes_NestedEnumSchema as TestAllTypes_NestedEnumSchemaProto3,
  TestAllTypes_NestedMessageSchema as TestAllTypes_NestedMessageSchemaProto3,
  TestAllTypesSchema as TestAllTypesSchemaProto3,
} from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto3/test_all_types_pb.js';
import { createRegistry } from '@bufbuild/protobuf';
import { Container } from '../common/container';
import {
  FunctionDecl,
  newVariableDecl,
  OverloadDecl,
  VariableDecl,
} from '../common/decls';
import { TextSource } from '../common/source';
import {
  StandardProtoDescriptors,
  stdFunctions,
  stdTypes,
} from '../common/stdlib';
import { Registry } from '../common/types/provider';
import {
  BoolType,
  BytesType,
  DoubleType,
  DynType,
  ErrorType,
  IntType,
  newListType,
  newMapType,
  newNullableType,
  newObjectType,
  newTypeTypeWithParam,
  NullType,
  StringType,
  Type,
  UintType,
} from '../common/types/types';
import { Parser, ParserOptions } from '../parser/parser';
import { Checker } from './checker';
import { Env } from './env';

interface TestCase {
  in: string;
  out?: string;
  outType?: Type;
  env?: () => Env;
  err?: string;
  parserOpts?: ParserOptions;
  container?: string;
}

describe('Checker', () => {
  it('TODO', () => {
    expect(true).toBeTruthy();
  });
  const testCases: TestCase[] = [
    // Const types
    {
      in: `"A"`,
      out: `"A"~string`,
      outType: StringType,
    },
    {
      in: `12`,
      out: `12~int`,
      outType: IntType,
    },
    {
      in: `12u`,
      out: `12u~uint`,
      outType: UintType,
    },
    {
      in: `true`,
      out: `true~bool`,
      outType: BoolType,
    },
    {
      in: `false`,
      out: `false~bool`,
      outType: BoolType,
    },
    {
      in: `12.23`,
      out: `12.23~double`,
      outType: DoubleType,
    },
    {
      in: `null`,
      out: `null~null`,
      outType: NullType,
    },
    {
      in: `b"ABC"`,
      out: `b"ABC"~bytes`,
      outType: BytesType,
    },
    // Ident types
    {
      in: `is`,
      out: `is~string^is`,
      outType: StringType,
      env: getDefaultEnvironment,
    },
    {
      in: `ii`,
      out: `ii~int^ii`,
      outType: IntType,
      env: getDefaultEnvironment,
    },
    {
      in: `iu`,
      out: `iu~uint^iu`,
      outType: UintType,
      env: getDefaultEnvironment,
    },
    {
      in: `iz`,
      out: `iz~bool^iz`,
      outType: BoolType,
      env: getDefaultEnvironment,
    },
    {
      in: `id`,
      out: `id~double^id`,
      outType: DoubleType,
      env: getDefaultEnvironment,
    },
    {
      in: `ix`,
      out: `ix~null^ix`,
      outType: NullType,
      env: getDefaultEnvironment,
    },
    {
      in: `ib`,
      out: `ib~bytes^ib`,
      outType: BytesType,
      env: getDefaultEnvironment,
    },
    {
      in: `id`,
      out: `id~double^id`,
      outType: DoubleType,
      env: getDefaultEnvironment,
    },
    {
      in: `[]`,
      out: `[]~list(dyn)`,
      outType: newListType(DynType),
    },
    {
      in: `[1]`,
      out: `[1~int]~list(int)`,
      outType: newListType(IntType),
    },
    {
      in: `[1, "A"]`,
      out: `[1~int, "A"~string]~list(dyn)`,
      outType: newListType(DynType),
    },
    {
      in: `foo`,
      out: `foo~!error!`,
      outType: ErrorType,
      err: `
ERROR: <input>:1:1: undeclared reference to 'foo' (in container '')
| foo
| ^`,
    },
    // Call resolution
    {
      in: `fg_s()`,
      out: `fg_s()~string^fg_s_0`,
      outType: StringType,
      env: getDefaultEnvironment,
    },
    {
      in: `is.fi_s_s()`,
      out: `is~string^is.fi_s_s()~string^fi_s_s_0`,
      outType: StringType,
      env: getDefaultEnvironment,
    },
    {
      in: `1 + 2`,
      out: `_+_(1~int, 2~int)~int^add_int64`,
      outType: IntType,
      env: getDefaultEnvironment,
    },
    {
      in: `1 + ii`,
      out: `_+_(1~int, ii~int^ii)~int^add_int64`,
      outType: IntType,
      env: getDefaultEnvironment,
    },
    {
      in: `[1] + [2]`,
      out: `_+_([1~int]~list(int), [2~int]~list(int))~list(int)^add_list`,
      outType: newListType(IntType),
      env: getDefaultEnvironment,
    },
    {
      in: `[] + [1,2,3,] + [4]`,
      outType: newListType(IntType),
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
      outType: newListType(DynType),
    },
    {
      in: `{1:2u, 2:3u}`,
      outType: newMapType(IntType, UintType),
      out: `{1~int : 2u~uint, 2~int : 3u~uint}~map(int, uint)`,
    },
    {
      in: `{"a":1, "b":2}.a`,
      outType: IntType,
      out: `{"a"~string : 1~int, "b"~string : 2~int}~map(string, int).a~int`,
    },
    {
      in: `{1:2u, 2u:3}`,
      outType: newMapType(DynType, DynType),
      out: `{1~int : 2u~uint, 2u~uint : 3~int}~map(dyn, dyn)`,
    },
    {
      in: `TestAllTypes{single_int32: 1, single_int64: 2}`,
      container: 'google.api.expr.test.v1.proto3',
      out: `
    google.api.expr.test.v1.proto3.TestAllTypes{
        single_int32 : 1~int,
        single_int64 : 2~int
    }~google.api.expr.test.v1.proto3.TestAllTypes^google.api.expr.test.v1.proto3.TestAllTypes`,
      outType: newObjectType('google.api.expr.test.v1.proto3.TestAllTypes'),
    },
    {
      in: `TestAllTypes{single_int32: 1u}`,
      container: 'google.api.expr.test.v1.proto3',
      err: `
ERROR: <input>:1:26: expected type of field 'single_int32' is 'int' but provided type is 'uint'
  | TestAllTypes{single_int32: 1u}
  | .........................^`,
    },
    {
      in: `TestAllTypes{single_int32: 1, undefined: 2}`,
      container: 'google.api.expr.test.v1.proto3',
      err: `
ERROR: <input>:1:40: undefined field 'undefined'
  | TestAllTypes{single_int32: 1, undefined: 2}
  | .......................................^`,
    },
    {
      in: `size(x) == x.size()`,
      out: `
_==_(size(x~list(int)^x)~int^size_list, x~list(int)^x.size()~int^list_size)
~bool^equals`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(new VariableDecl('x', newListType(IntType)));
        return env;
      },
      outType: BoolType,
    },
    {
      in: `int(1u) + int(uint("1"))`,
      out: `
_+_(int(1u~uint)~int^uint64_to_int64,
  int(uint("1"~string)~uint^string_to_uint64)~int^uint64_to_int64)
~int^add_int64`,
      outType: IntType,
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
      outType: IntType,
    },
    {
      in: `b"abc" + b"def"`,
      out: `_+_(b"abc"~bytes, b"def"~bytes)~bytes^add_bytes`,
      outType: BytesType,
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
      outType: BoolType,
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
      outType: BoolType,
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
      outType: BoolType,
    },
    {
      in: `1 + 2 * 3 - 1 / 2 == 6 % 1`,
      out: ` _==_(_-_(_+_(1~int, _*_(2~int, 3~int)~int^multiply_int64)~int^add_int64, _/_(1~int, 2~int)~int^divide_int64)~int^subtract_int64, _%_(6~int, 1~int)~int^modulo_int64)~bool^equals`,
      outType: BoolType,
    },
    {
      in: `"abc" + "def"`,
      out: `_+_("abc"~string, "def"~string)~string^add_string`,
      outType: StringType,
    },
    {
      in: `1u + 2u * 3u - 1u / 2u == 6u % 1u`,
      out: `_==_(_-_(_+_(1u~uint, _*_(2u~uint, 3u~uint)~uint^multiply_uint64)
         ~uint^add_uint64,
         _/_(1u~uint, 2u~uint)~uint^divide_uint64)
     ~uint^subtract_uint64,
    _%_(6u~uint, 1u~uint)~uint^modulo_uint64)
~bool^equals`,
      outType: BoolType,
    },
    {
      in: `x.single_int32 != null`,
      env: () => {
        const env = getDefaultEnvironment('google.api.expr.test.v1.proto3');
        env.addIdent(
          new VariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.Proto2Message')
          )
        );
        return env;
      },
      err: `
ERROR: <input>:1:2: unexpected failed resolution of 'google.api.expr.test.v1.proto3.Proto2Message'
  | x.single_int32 != null
  | .^
`,
    },
    {
      in: `x.single_value + 1 / x.single_struct.y == 23`,
      env: () => {
        const env = getDefaultEnvironment('google.api.expr.test.v1.proto3');
        env.addIdent(
          new VariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
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
      outType: BoolType,
    },
    {
      in: `x.single_value[23] + x.single_struct['y']`,
      env: () => {
        const env = getDefaultEnvironment('google.api.expr.test.v1.proto3');
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
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
      outType: DynType,
    },
    {
      in: `TestAllTypes.NestedEnum.BAR != 99`,
      container: 'google.api.expr.test.v1.proto3',
      out: `_!=_(google.api.expr.test.v1.proto3.TestAllTypes.NestedEnum.BAR
     ~int^google.api.expr.test.v1.proto3.TestAllTypes.NestedEnum.BAR,
    99~int)
~bool^not_equals`,
      outType: BoolType,
    },
    {
      in: `size([] + [1])`,
      out: `size(_+_([]~list(int), [1~int]~list(int))~list(int)^add_list)~int^size_list`,
      outType: IntType,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdents(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
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
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdents(
          newVariableDecl('x', newObjectType('google.protobuf.Struct')),
          newVariableDecl('y', newObjectType('google.protobuf.ListValue')),
          newVariableDecl('z', newObjectType('google.protobuf.Value'))
        );
        return env;
      },
      outType: BoolType,
    },
    {
      in: `x + y`,
      out: ``,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdents(
          newVariableDecl(
            'x',
            newListType(
              newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
            )
          ),
          newVariableDecl('y', newListType(IntType))
        );
        return env;
      },
      err: `
ERROR: <input>:1:3: found no matching overload for '_+_' applied to '(list(google.api.expr.test.v1.proto3.TestAllTypes), list(int))'
| x + y
| ..^
    `,
    },
    {
      in: `x[1u]`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdents(
          newVariableDecl(
            'x',
            newListType(
              newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
            )
          )
        );
        return env;
      },
      err: `
ERROR: <input>:1:2: found no matching overload for '_[_]' applied to '(list(google.api.expr.test.v1.proto3.TestAllTypes), uint)'
| x[1u]
| .^
`,
    },
    {
      in: `(x + x)[1].single_int32 == size(x)`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newListType(
              newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
            )
          )
        );
        return env;
      },
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
      outType: BoolType,
    },
    {
      in: `x.repeated_int64[x.single_int32] == 23`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
      out: `
_==_(_[_](x~google.api.expr.test.v1.proto3.TestAllTypes^x.repeated_int64~list(int),
       x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_int32~int)
   ~int^index_list,
  23~int)
~bool^equals`,
      outType: BoolType,
    },
    {
      in: `size(x.map_int64_nested_type) == 0`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
      out: `
_==_(size(x~google.api.expr.test.v1.proto3.TestAllTypes^x.map_int64_nested_type
        ~map(int, google.api.expr.test.v1.proto3.NestedTestAllTypes))
   ~int^size_map,
  0~int)
~bool^equals
    `,
      outType: BoolType,
    },
    {
      in: `x.all(y, y == true)`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(newVariableDecl('x', BoolType));
        return env;
      },
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
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
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
      outType: newListType(DoubleType),
    },
    {
      in: `x.repeated_int64.map(x, x > 0, double(x))`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
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
          _?_:_(
            _>_(
              x~int^x,
              0~int
            )~bool^greater_int64,
            _+_(
              __result__~list(double)^__result__,
              [
                double(
                  x~int^x
                )~double^int64_to_double
              ]~list(double)
            )~list(double)^add_list,
            __result__~list(double)^__result__
          )~list(double)^conditional,
          // Result
          __result__~list(double)^__result__)~list(double)
    `,
      outType: newListType(DoubleType),
    },
    {
      in: `x[2].single_int32 == 23`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newMapType(
              StringType,
              newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
            )
          )
        );
        return env;
      },
      err: `
ERROR: <input>:1:2: found no matching overload for '_[_]' applied to '(map(string, google.api.expr.test.v1.proto3.TestAllTypes), int)'
| x[2].single_int32 == 23
| .^
    `,
    },
    {
      in: `x["a"].single_int32 == 23`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newMapType(
              StringType,
              newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
            )
          )
        );
        return env;
      },
      out: `
    _==_(_[_](x~map(string, google.api.expr.test.v1.proto3.TestAllTypes)^x, "a"~string)
    ~google.api.expr.test.v1.proto3.TestAllTypes^index_map
    .
    single_int32
    ~int,
    23~int)
    ~bool^equals`,
      outType: BoolType,
    },
    {
      in: `x.single_nested_message.bb == 43 && has(x.single_nested_message)`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
      // Our implementation code is expanding the macro
      out: `_&&_(
          _==_(
            x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_nested_message~google.api.expr.test.v1.proto3.TestAllTypes.NestedMessage.bb~int,
            43~int
          )~bool^equals,
          x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_nested_message~test-only~~bool
        )~bool^logical_and`,
      outType: BoolType,
    },
    {
      in: `x.single_nested_message.undefined == x.undefined && has(x.single_int32) && has(x.repeated_int32)`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
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
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
      out: `
    _!=_(x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_nested_message
    ~google.api.expr.test.v1.proto3.TestAllTypes.NestedMessage,
    null~null)
    ~bool^not_equals
    `,
      outType: BoolType,
    },
    {
      in: `x.single_int64 != null`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
      err: `
ERROR: <input>:1:16: found no matching overload for '_!=_' applied to '(int, null)'
| x.single_int64 != null
| ...............^
    `,
    },
    {
      in: `x.single_int64_wrapper == null`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
      out: `
    _==_(x~google.api.expr.test.v1.proto3.TestAllTypes^x.single_int64_wrapper
    ~wrapper(int),
    null~null)
    ~bool^equals
    `,
      outType: BoolType,
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
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
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
      outType: BoolType,
    },
    {
      in: `x.single_timestamp == google.protobuf.Timestamp{seconds: 20} &&
         x.single_duration < google.protobuf.Duration{seconds: 10}`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
      outType: BoolType,
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
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
      outType: BoolType,
    },

    {
      in: `x.repeated_int64.exists(y, y > 10) && y < 5`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
      err: `ERROR: <input>:1:39: undeclared reference to 'y' (in container '')
		| x.repeated_int64.exists(y, y > 10) && y < 5
		| ......................................^`,
    },
    {
      in: `x.repeated_int64.all(e, e > 0) && x.repeated_int64.exists(e, e < 0) && x.repeated_int64.exists_one(e, e == 0)`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
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
      outType: BoolType,
    },
    {
      in: `x.all(e, 0)`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
      err: `
ERROR: <input>:1:1: expression of type 'google.api.expr.test.v1.proto3.TestAllTypes' cannot be range of a comprehension (must be list, map, or dynamic)
| x.all(e, 0)
| ^
ERROR: <input>:1:10: expected type 'bool' but found 'int'
| x.all(e, 0)
| .........^
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
      outType: newListType(DynType),
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdent(newVariableDecl('lists', newListType(DynType)));
        return env;
      },
    },
    // TODO: undeclared reference to '.google' in container
    //     {
    //       in: `.google.api.expr.test.v1.proto3.TestAllTypes`,
    //       out: `google.api.expr.test.v1.proto3.TestAllTypes
    // ~type(google.api.expr.test.v1.proto3.TestAllTypes)
    // ^google.api.expr.test.v1.proto3.TestAllTypes`,
    //       outType: newTypeTypeWithParam(
    //         newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
    //       ),
    //     },
    {
      in: `proto3.TestAllTypes`,
      container: 'google.api.expr.test.v1',
      out: `
google.api.expr.test.v1.proto3.TestAllTypes
~type(google.api.expr.test.v1.proto3.TestAllTypes)
^google.api.expr.test.v1.proto3.TestAllTypes
    `,
      outType: newTypeTypeWithParam(
        newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
      ),
    },
    {
      in: `1 + x`,
      err: `
ERROR: <input>:1:5: undeclared reference to 'x' (in container '')
| 1 + x
| ....^`,
    },
    {
      in: `x == google.protobuf.Any{
            type_url:'types.googleapis.com/google.api.expr.test.v1.proto3.TestAllTypes'
        } && x.single_nested_message.bb == 43
        || x == google.api.expr.test.v1.proto3.TestAllTypes{}
        || y < x
        || x >= x`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdents(
          newVariableDecl('x', newObjectType('google.protobuf.Any')),
          newVariableDecl('y', newNullableType(IntType))
        );
        return env;
      },
      out: `
    _||_(
        _||_(
            _&&_(
                _==_(
                    x~any^x,
                    google.protobuf.Any{
                        type_url:"types.googleapis.com/google.api.expr.test.v1.proto3.TestAllTypes"~string
                    }~any^google.protobuf.Any
                )~bool^equals,
                _==_(
                    x~any^x.single_nested_message~dyn.bb~dyn,
                    43~int
                )~bool^equals
            )~bool^logical_and,
            _==_(
                x~any^x,
                google.api.expr.test.v1.proto3.TestAllTypes{}~google.api.expr.test.v1.proto3.TestAllTypes^google.api.expr.test.v1.proto3.TestAllTypes
            )~bool^equals
        )~bool^logical_or,
        _||_(
            _<_(
                y~wrapper(int)^y,
                x~any^x
            )~bool^less_int64|less_int64_double|less_int64_uint64,
            _>=_(
                x~any^x,
                x~any^x
            )~bool^greater_equals_bool|greater_equals_bytes|greater_equals_double|greater_equals_double_int64|greater_equals_double_uint64|greater_equals_duration|greater_equals_int64|greater_equals_int64_double|greater_equals_int64_uint64|greater_equals_string|greater_equals_timestamp|greater_equals_uint64|greater_equals_uint64_double|greater_equals_uint64_int64
        )~bool^logical_or
    )~bool^logical_or
    `,
      outType: BoolType,
    },
    {
      in: `x == google.protobuf.Any{
            type_url:'types.googleapis.com/google.api.expr.test.v1.proto3.TestAllTypes'
        } && x.single_nested_message.bb == 43
        || x == google.api.expr.test.v1.proto3.TestAllTypes{}
        || y < x
        || x >= x`,
      env: () => {
        const env = getDefaultEnvironment();
        env.addIdents(
          newVariableDecl('x', newObjectType('google.protobuf.Any')),
          newVariableDecl('y', newNullableType(IntType))
        );
        return env;
      },
      out: `
    _||_(
        _&&_(
          _==_(
            x~any^x,
            google.protobuf.Any{
              type_url:"types.googleapis.com/google.api.expr.test.v1.proto3.TestAllTypes"~string
            }~any^google.protobuf.Any
          )~bool^equals,
          _==_(
            x~any^x.single_nested_message~dyn.bb~dyn,
            43~int
          )~bool^equals
        )~bool^logical_and,
        _==_(
          x~any^x,
          google.api.expr.test.v1.proto3.TestAllTypes{}~google.api.expr.test.v1.proto3.TestAllTypes^google.api.expr.test.v1.proto3.TestAllTypes
        )~bool^equals,
        _<_(
          y~wrapper(int)^y,
          x~any^x
        )~bool^less_int64|less_int64_double|less_int64_uint64,
        _>=_(
          x~any^x,
          x~any^x
        )~bool^greater_equals_bool|greater_equals_bytes|greater_equals_double|greater_equals_double_int64|greater_equals_double_uint64|greater_equals_duration|greater_equals_int64|greater_equals_int64_double|greater_equals_int64_uint64|greater_equals_string|greater_equals_timestamp|greater_equals_uint64|greater_equals_uint64_double|greater_equals_uint64_int64
      )~bool^logical_or
    `,
      outType: BoolType,
    },
    {
      in: `x`,
      container: 'container',
      env: () => {
        const env = getDefaultEnvironment('container');
        env.addIdent(
          newVariableDecl(
            'x',
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
          )
        );
        return env;
      },
      out: `container.x~google.api.expr.test.v1.proto3.TestAllTypes^container.x`,
      outType: newObjectType('google.api.expr.test.v1.proto3.TestAllTypes'),
    },
  ];

  for (const testCase of testCases) {
    it(`should check ${testCase.in}`, () => {
      const source = new TextSource(testCase.in);
      const parser = new Parser(
        source,
        testCase.parserOpts ?? { maxRecursionDepth: 32 }
      );
      const parsed = parser.parse();
      const env = testCase.env
        ? testCase.env()
        : getDefaultEnvironment(testCase.container);
      const checker = new Checker(parsed, env);
      checker.check();
      if (!testCase.err && checker.errors.errors.length > 0) {
        throw new Error(
          `Unexpected error for case "${
            testCase.in
          }": ${checker.errors.toDisplayString()}`
        );
      }
      if (testCase.outType) {
        try {
          expect(checker.getResultType()).toStrictEqual(testCase.outType);
        } catch (e) {
          console.error(
            `Unexpected error for case "${
              testCase.in
            }": ${checker.errors.toDisplayString()}`
          );
          throw e;
        }
      }
      if (testCase.err) {
        expect(checker.errors.toDisplayString()).toContain(
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

function getDefaultEnvironment(containerName?: string) {
  const container = new Container(containerName);
  const registry = new Registry(
    undefined,
    createRegistry(
      ...StandardProtoDescriptors,
      TestAllTypesSchemaProto3,
      TestAllTypes_NestedEnumSchemaProto3,
      TestAllTypes_NestedMessageSchemaProto3,
      TestAllTypesSchemaProto2,
      TestAllTypes_NestedEnumSchemaProto2,
      TestAllTypes_NestedMessageSchemaProto2
    )
  );
  const env = new Env(container, registry);
  env.addFunctions(
    ...stdFunctions,
    new FunctionDecl({
      name: 'fg_s',
      overloads: [
        new OverloadDecl({
          id: 'fg_s_0',
          argTypes: [],
          resultType: StringType,
        }),
      ],
    }),
    new FunctionDecl({
      name: 'fi_s_s',
      overloads: [
        new OverloadDecl({
          id: 'fi_s_s_0',
          argTypes: [StringType],
          resultType: StringType,
          isMemberFunction: true,
        }),
      ],
    })
  );
  env.addIdents(
    ...stdTypes,
    newVariableDecl('is', StringType),
    newVariableDecl('ii', IntType),
    newVariableDecl('iu', UintType),
    newVariableDecl('iz', BoolType),
    newVariableDecl('ib', BytesType),
    newVariableDecl('id', DoubleType),
    newVariableDecl('ix', NullType)
  );
  return env;
}
