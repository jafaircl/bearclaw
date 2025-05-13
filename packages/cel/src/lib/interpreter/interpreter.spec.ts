import { UintRefVal } from './../common/types/uint';
import { DefaultDispatcher, Dispatcher } from './dispatcher';
import { ExprInterpreter } from './interpreter';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from '@bearclaw/is';
import {
  NestedTestAllTypesSchema,
  TestAllTypesSchema as TestAllTypesSchemaProto2,
} from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto2/test_all_types_pb.js';
import {
  TestAllTypes_NestedEnum,
  TestAllTypes_NestedMessageSchema,
  TestAllTypesSchema,
} from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto3/test_all_types_pb.js';
import { ExprSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create, DescMessage } from '@bufbuild/protobuf';
import { Checker } from '../checker/checker';
import { Env } from '../checker/env';
import { abbrevs, Container, name as containerName } from '../common/container';
import {
  FunctionDecl,
  newVariableDecl,
  OverloadDecl,
  VariableDecl,
} from '../common/decls';
import { Overload } from '../common/functions';
import { newStringProtoExpr } from '../common/pb/expressions';
import { RefVal } from '../common/ref/reference';
import { TextSource } from '../common/source';
import { stdFunctions, stdTypes } from '../common/stdlib';
import { BoolRefVal } from '../common/types/bool';
import { ErrorRefVal, isErrorRefVal } from '../common/types/error';
import { IntRefVal } from '../common/types/int';
import { DynamicList } from '../common/types/list';
import { NullRefVal } from '../common/types/null';
import { OptionalNone, OptionalRefVal } from '../common/types/optional';
import { defaultTypeAdapter, Registry } from '../common/types/provider';
import { isStringRefVal, StringRefVal } from '../common/types/string';
import { timestampFromSeconds } from '../common/types/timestamp';
import { Adder } from '../common/types/traits/math';
import { Trait } from '../common/types/traits/trait';
import {
  BoolType,
  BytesType,
  DoubleType,
  DynType,
  IntType,
  newListType,
  newMapType,
  newObjectType,
  StringType,
} from '../common/types/types';
import { objectToMap } from '../common/utils';
import { AllMacros } from '../parser/macro';
import {
  enableOptionalSyntax,
  enableVariadicOperatorASTs,
  macros,
  Parser,
} from '../parser/parser';
import { Activation, EmptyActivation, newActivation } from './activation';
import {
  AttrFactory,
  AttributeFactory,
  enableErrorOnBadPresenceTest,
} from './attributes';
import { InterpretableDecorator } from './decorators';
import { Interpretable } from './interpretable';

interface TestCase {
  name: string;
  expr: string;
  container?: string;
  abbrevs?: string[];
  types?: DescMessage[];
  vars?: VariableDecl[];
  funcs?: FunctionDecl[];
  attrs?: AttributeFactory;
  unchecked?: boolean;
  extraOpts?: InterpretableDecorator[];

  in?: any;
  out?: any;
  err?: string;
  progErr?: string;
}

describe('interpreter', () => {
  const testCases: TestCase[] = [
    {
      name: 'double_ne_nan',
      expr: `0.0/0.0 == 0.0/0.0`,
      out: BoolRefVal.False,
    },
    {
      name: 'and_false_1st',
      expr: `false && true`,
      out: BoolRefVal.False,
    },
    {
      name: 'and_false_2nd',
      expr: `true && false`,
      out: BoolRefVal.False,
    },
    {
      name: 'and_error_1st_false',
      expr: `1/0 != 0 && false`,
      out: BoolRefVal.False,
    },
    {
      name: 'and_error_2nd_false',
      expr: `false && 1/0 != 0`,
      out: BoolRefVal.False,
    },
    {
      name: 'and_error_1st_error',
      expr: `1/0 != 0 && true`,
      err: 'division by zero',
    },
    {
      name: 'and_error_2nd_error',
      expr: `true && 1/0 != 0`,
      err: 'division by zero',
    },
    {
      name: 'call_no_args',
      expr: `zero()`,
      unchecked: true,
      funcs: [
        new FunctionDecl({
          name: 'zero',
          overloads: [
            new OverloadDecl({
              id: 'zero',
              argTypes: [],
              resultType: IntType,
            }),
          ],
          singleton: new Overload({
            operator: 'zero',
            function: () => IntRefVal.IntZero,
          }),
        }),
      ],
      out: IntRefVal.IntZero,
    },
    {
      name: 'call_one_arg',
      expr: `neg(1)`,
      unchecked: true,
      funcs: [
        new FunctionDecl({
          name: 'neg',
          overloads: [
            new OverloadDecl({
              id: 'neg_int',
              argTypes: [IntType],
              resultType: IntType,
              operandTraits: [Trait.NEGATER_TYPE],
            }),
          ],
          singleton: new Overload({
            operator: 'neg_int',
            unary: (arg) => (arg as IntRefVal).negate(),
          }),
        }),
      ],
      out: IntRefVal.IntNegOne,
    },
    {
      name: 'call_two_arg',
      expr: `b'abc'.concat(b'def')`,
      unchecked: true,
      funcs: [
        new FunctionDecl({
          name: 'concat',
          overloads: [
            new OverloadDecl({
              id: 'bytes_concat_bytes',
              argTypes: [BytesType, BytesType],
              resultType: BytesType,
              operandTraits: [Trait.ADDER_TYPE],
            }),
          ],
          singleton: new Overload({
            operator: 'bytes_concat_bytes',
            binary: (lhs, rhs) => (lhs as RefVal & Adder).add(rhs),
          }),
        }),
      ],
      out: new TextEncoder().encode('abcdef'),
    },
    {
      name: 'call_four_args',
      expr: `addall(a, b, c, d) == 10`,
      unchecked: true,
      funcs: [
        new FunctionDecl({
          name: 'addall',
          overloads: [
            new OverloadDecl({
              id: 'addall_four',
              argTypes: [IntType, IntType, IntType, IntType],
              resultType: IntType,
              operandTraits: [Trait.ADDER_TYPE],
            }),
          ],
          singleton: new Overload({
            operator: 'addall_four',
            function: (a, b, c, d) => (a as any).add(b).add(c).add(d),
          }),
        }),
      ],
      in: objectToMap({
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      }),
      out: BoolRefVal.True,
    },
    {
      name: `call_ns_func`,
      expr: `base64.encode('hello')`,
      funcs: [
        new FunctionDecl({
          name: 'base64.encode',
          overloads: [
            new OverloadDecl({
              id: 'base64_encode_string',
              argTypes: [StringType],
              resultType: StringType,
            }),
          ],
          singleton: new Overload({
            operator: 'base64_encode_string',
            function: (s) => new StringRefVal(btoa(s.value())),
          }),
        }),
      ],
      out: 'aGVsbG8=',
    },
    {
      name: `call_ns_func_unchecked`,
      expr: `base64.encode('hello')`,
      unchecked: true,
      funcs: [
        new FunctionDecl({
          name: 'base64.encode',
          overloads: [
            new OverloadDecl({
              id: 'base64_encode_string',
              argTypes: [StringType],
              resultType: StringType,
            }),
          ],
          singleton: new Overload({
            operator: 'base64_encode_string',
            function: (s) => new StringRefVal(btoa(s.value())),
          }),
        }),
      ],
      out: 'aGVsbG8=',
    },
    {
      name: `call_ns_func_in_pkg`,
      container: `base64`,
      expr: `encode('hello')`,
      funcs: [
        new FunctionDecl({
          name: 'base64.encode',
          overloads: [
            new OverloadDecl({
              id: 'base64_encode_string',
              argTypes: [StringType],
              resultType: StringType,
            }),
          ],
          singleton: new Overload({
            operator: 'base64_encode_string',
            function: (s) => new StringRefVal(btoa(s.value())),
          }),
        }),
      ],
      out: 'aGVsbG8=',
    },
    {
      name: `call_ns_func_unchecked_in_pkg`,
      container: `base64`,
      expr: `encode('hello')`,
      unchecked: true,
      funcs: [
        new FunctionDecl({
          name: 'base64.encode',
          overloads: [
            new OverloadDecl({
              id: 'base64_encode_string',
              argTypes: [StringType],
              resultType: StringType,
            }),
          ],
          singleton: new Overload({
            operator: 'base64_encode_string',
            function: (s) => new StringRefVal(btoa(s.value())),
          }),
        }),
      ],
      out: 'aGVsbG8=',
    },
    {
      name: 'complex',
      expr: `
			!(headers.ip in ["10.0.1.4", "10.0.1.5"]) &&
				((headers.path.startsWith("v1") && headers.token in ["v1", "v2", "admin"]) ||
				(headers.path.startsWith("v2") && headers.token in ["v2", "admin"]) ||
				(headers.path.startsWith("/admin") && headers.token == "admin" && headers.ip in ["10.0.1.2", "10.0.1.2", "10.0.1.2"]))
			`,
      vars: [newVariableDecl('headers', newMapType(StringType, StringType))],
      in: objectToMap({
        headers: {
          ip: '10.0.1.2',
          path: '/admin/edit',
          token: 'admin',
        },
      }),
      out: true,
    },
    {
      name: 'complex_qual_vars',
      expr: `
			!(headers.ip in ["10.0.1.4", "10.0.1.5"]) &&
				((headers.path.startsWith("v1") && headers.token in ["v1", "v2", "admin"]) ||
				(headers.path.startsWith("v2") && headers.token in ["v2", "admin"]) ||
				(headers.path.startsWith("/admin") && headers.token == "admin" && headers.ip in ["10.0.1.2", "10.0.1.2", "10.0.1.2"]))
			`,
      vars: [
        newVariableDecl('headers.ip', StringType),
        newVariableDecl('headers.path', StringType),
        newVariableDecl('headers.token', StringType),
      ],
      in: objectToMap({
        'headers.ip': '10.0.1.2',
        'headers.path': '/admin/edit',
        'headers.token': 'admin',
      }),
      out: true,
    },
    {
      name: 'cond',
      expr: `a ? b < 1.2 : c == ['hello']`,
      vars: [
        newVariableDecl('a', BoolType),
        newVariableDecl('b', DoubleType),
        newVariableDecl('c', newListType(StringType)),
      ],
      in: objectToMap({
        a: true,
        b: 2.0,
        c: ['hello'],
      }),
      out: false,
    },
    {
      name: 'cond_attr_out_of_bounds_error',
      expr: `m[(x ? 0 : 1)] >= 0`,
      vars: [
        newVariableDecl('m', newListType(IntType)),
        newVariableDecl('x', BoolType),
      ],
      in: objectToMap({
        m: [BigInt(-1)],
        x: false,
      }),
      err: 'index out of bounds: 1',
    },
    {
      name: 'cond_attr_qualify_bad_type_error',
      expr: `m[(x ? a : b)] >= 0`,
      vars: [
        newVariableDecl('m', newListType(DynType)),
        newVariableDecl('a', DynType),
        newVariableDecl('b', DynType),
        newVariableDecl('x', BoolType),
      ],
      in: objectToMap({
        m: [BigInt(-1)],
        x: false,
        a: timestampFromSeconds(0.1),
        b: timestampFromSeconds(0.1),
      }),
      err: 'invalid qualifier type',
    },
    {
      name: 'cond_attr_qualify_bad_field_error',
      expr: `m[(x ? a : b).c] >= 0`,
      vars: [
        newVariableDecl('m', newListType(DynType)),
        newVariableDecl('a', DynType),
        newVariableDecl('b', DynType),
        newVariableDecl('x', BoolType),
      ],
      in: objectToMap({
        m: [BigInt(1)],
        x: false,
        a: 1,
        b: 2,
      }),
      err: 'no such key: c',
    },
    {
      name: 'in_empty_list',
      expr: `6 in []`,
      out: false,
    },
    {
      name: 'in_constant_list',
      expr: `6 in [2, 12, 6]`,
      out: true,
    },
    {
      name: 'bytes_in_constant_list',
      expr: "b'hello' in [b'world', b'universe', b'hello']",
      out: true,
    },
    {
      name: 'list_in_constant_list',
      expr: `[6] in [2, 12, [6]]`,
      out: true,
    },
    {
      name: 'in_constant_list_cross_type_uint_int',
      expr: `dyn(12u) in [2, 12, 6]`,
      out: true,
    },
    {
      name: 'in_constant_list_cross_type_double_int',
      expr: `dyn(6.0) in [2, 12, 6]`,
      out: true,
    },
    {
      name: 'in_constant_list_cross_type_int_double',
      expr: `dyn(6) in [2.1, 12.0, 6.0]`,
      out: true,
    },
    {
      name: 'not_in_constant_list_cross_type_int_double',
      expr: `dyn(2) in [2.1, 12.0, 6.0]`,
      out: false,
    },
    {
      name: 'in_constant_list_cross_type_int_uint',
      expr: `dyn(6) in [2u, 12u, 6u]`,
      out: true,
    },
    {
      name: 'in_constant_list_cross_type_negative_int_uint',
      expr: `dyn(-6) in [2u, 12u, 6u]`,
      out: false,
    },
    {
      name: 'in_constant_list_cross_type_negative_double_uint',
      expr: `dyn(-6.1) in [2u, 12u, 6u]`,
      out: false,
    },
    {
      name: 'in_var_list_int',
      expr: `6 in [2, 12, x]`,
      vars: [newVariableDecl('x', DynType)],
      in: objectToMap({ x: BigInt(6) }),
    },
    {
      // TODO: since js has no uint type, this test case is identical to the previous one
      name: 'in_var_list_uint',
      expr: `6 in [2, 12, x]`,
      vars: [newVariableDecl('x', DynType)],
      in: objectToMap({ x: BigInt(6) }),
    },
    {
      name: 'in_var_list_double',
      expr: `6 in [2, 12, x]`,
      vars: [newVariableDecl('x', DynType)],
      in: objectToMap({ x: 6.0 }),
    },
    {
      name: 'in_var_list_double_double',
      expr: `dyn(6.0) in [2, 12, x]`,
      vars: [newVariableDecl('x', DynType)],
      in: objectToMap({ x: BigInt(6) }),
    },
    {
      name: 'in_constant_map',
      expr: `'other-key' in {'key': null, 'other-key': 42}`,
      out: true,
    },
    {
      name: 'in_constant_map_cross_type_string_number',
      expr: `'other-key' in {1: null, 2u: 42}`,
      out: false,
    },
    {
      name: 'in_constant_map_cross_type_double_int',
      expr: `2.0 in {1: null, 2u: 42}`,
      out: true,
    },
    {
      name: 'not_in_constant_map_cross_type_double_int',
      expr: `2.1 in {1: null, 2u: 42}`,
      out: false,
    },
    {
      name: 'in_constant_heterogeneous_map',
      expr: `'hello' in {1: 'one', false: true, 'hello': 'world'}`,
      out: true,
    },
    {
      name: 'not_in_constant_heterogeneous_map',
      expr: `!('hello' in {1: 'one', false: true})`,
      out: true,
    },
    {
      name: 'not_in_constant_heterogeneous_map_with_same_key_type',
      expr: `!('hello' in {1: 'one', 'world': true})`,
      out: true,
    },
    {
      name: 'in_var_key_map',
      expr: `'other-key' in {x: null, y: 42}`,
      out: true,
      vars: [newVariableDecl('x', StringType), newVariableDecl('y', IntType)],
      in: objectToMap({ x: 'other-key', y: BigInt(2) }),
    },
    {
      name: 'in_var_value_map',
      expr: `'other-key' in {1: x, 2u: y}`,
      out: false,
      vars: [newVariableDecl('x', StringType), newVariableDecl('y', IntType)],
      in: objectToMap({ x: 'other-key', y: BigInt(2) }),
    },
    {
      name: 'index',
      expr: `m['key'][1] == 42u && m['null'] == null && m[string(0)] == 10`,
      vars: [newVariableDecl('m', newMapType(StringType, DynType))],
      in: objectToMap({
        m: {
          key: [BigInt(21), BigInt(42)],
          null: null,
          '0': BigInt(10),
        },
      }),
      out: true,
    },
    {
      name: 'index_cross_type_float_uint',
      expr: `{1: 'hello'}[x] == 'hello' && {2: 'world'}[y] == 'world'`,
      vars: [newVariableDecl('x', DynType), newVariableDecl('y', DynType)],
      in: objectToMap({ x: 1.0, y: BigInt(2) }),
      out: true,
    },
    {
      name: 'no_index_cross_type_float_uint',
      expr: `{1: 'hello'}[x] == 'hello' && ['world'][y] == 'world'`,
      vars: [newVariableDecl('x', DynType), newVariableDecl('y', DynType)],
      in: objectToMap({ x: 2.0, y: BigInt(3) }),
      err: 'no such key: 2',
    },
    {
      name: 'index_cross_type_double',
      expr: `{1: 'hello', 2: 'world'}[x] == 'hello'`,
      vars: [newVariableDecl('x', DynType)],
      in: objectToMap({ x: 1.0 }),
      out: true,
    },
    {
      name: 'index_cross_type_double_const',
      expr: `{1: 'hello', 2: 'world'}[dyn(2.0)] == 'world'`,
      out: true,
    },
    {
      name: 'index_cross_type_uint',
      expr: `{1: 'hello', 2: 'world'}[dyn(2u)] == 'world'`,
      out: true,
    },
    {
      name: 'index_cross_type_bad_qualifier',
      expr: `{1: 'hello', 2: 'world'}[x] == 'world'`,
      vars: [newVariableDecl('x', DynType)],
      in: objectToMap({ x: timestampFromSeconds(0.1) }),
      err: 'invalid qualifier type',
    },
    {
      name: 'index_list_int_double_type_index',
      expr: `[7, 8, 9][dyn(0.0)] == 7`,
      out: true,
    },
    {
      name: 'index_list_int_uint_type_index',
      expr: `[7, 8, 9][dyn(0u)] == 7`,
      out: true,
    },
    {
      name: 'index_list_int_bad_double_type_index',
      expr: `[7, 8, 9][dyn(0.1)] == 7`,
      err: `unsupported index value`,
    },
    {
      name: 'index_relative',
      expr: `([[[1]], [[2]], [[3]]][0][0] + [2, 3, {'four': {'five': 'six'}}])[3].four.five == 'six'`,
      out: true,
    },
    {
      name: 'list_eq_false_with_error',
      expr: `['string', 1] == [2, 3]`,
      out: false,
    },
    {
      name: 'list_eq_error',
      expr: `['string', true] == [2, 3]`,
      out: false,
    },
    {
      name: 'literal_bool_false',
      expr: `false`,
      out: false,
    },
    {
      name: 'literal_bool_true',
      expr: `true`,
    },
    {
      name: 'literal_null',
      expr: `null`,
      out: new NullRefVal(),
    },
    {
      name: 'literal_list',
      expr: `[1, 2, 3]`,
      out: [BigInt(1), BigInt(2), BigInt(3)],
    },
    {
      name: 'literal_map',
      expr: `{'hi': 21, 'world': 42u}`,
      out: objectToMap({
        hi: BigInt(21),
        world: BigInt(42),
      }),
    },
    // TODO: javascript throws an error for "octal escape sequences are not allowed." The 3 test cases below these are what js will allow
    // {
    //   name: 'literal_equiv_string_bytes',
    //   expr: `string(bytes("\303\277")) == '''\303\277'''`,
    // },
    // {
    //   name: 'literal_not_equiv_string_bytes',
    //   expr: `string(b"\303\277") != '''\303\277'''`,
    // },
    // {
    //   name: 'literal_equiv_bytes_string',
    //   expr: `string(b"\303\277") == 'ÿ'`,
    // },
    {
      name: 'literal_equiv_string_bytes',
      expr: `string(bytes("\xc3\xbf")) == '''\xc3\xbf'''`,
    },
    {
      name: 'literal_not_equiv_string_bytes',
      expr: `string(b"\xc3\xbf") != '''\xc3\xbf'''`,
    },
    {
      name: 'literal_equiv_bytes_string',
      expr: `string(b"\xc3\xbf") == 'ÿ'`,
    },
    {
      name: 'literal_bytes_string',
      expr: `string(b'aaa"bbb')`,
      out: `aaa"bbb`,
    },
    {
      name: 'literal_bytes_string2',
      expr: `string(b"""Kim\t""")`,
      out: `Kim	`,
    },
    {
      name: 'literal_pb3_msg',
      container: 'cel',
      types: [ExprSchema],
      expr: `expr.Expr{
				id: 1,
				const_expr: expr.Constant{
					string_value: "oneof_test"
				}
			}`,
      out: newStringProtoExpr(BigInt(1), 'oneof_test'),
    },
    {
      name: 'literal_pb_enum',
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypesSchema],
      expr: `TestAllTypes{
				repeated_nested_enum: [
					0,
					TestAllTypes.NestedEnum.BAZ,
					TestAllTypes.NestedEnum.BAR],
				repeated_int32: [
					TestAllTypes.NestedEnum.FOO,
					TestAllTypes.NestedEnum.BAZ]}`,
      out: create(TestAllTypesSchema, {
        repeatedNestedEnum: [
          TestAllTypes_NestedEnum.FOO,
          TestAllTypes_NestedEnum.BAZ,
          TestAllTypes_NestedEnum.BAR,
        ],
        repeatedInt32: [
          TestAllTypes_NestedEnum.FOO,
          TestAllTypes_NestedEnum.BAZ,
        ],
      }),
    },
    {
      name: 'literal_pb_wrapper_assign',
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypesSchema],
      expr: `TestAllTypes{
				single_int64_wrapper: 10,
				single_int32_wrapper: TestAllTypes{}.single_int32_wrapper,
			}`,
      out: create(TestAllTypesSchema, {
        singleInt64Wrapper: BigInt(10),
      }),
    },
    {
      name: 'literal_pb_wrapper_assign_roundtrip',
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypesSchema],
      expr: `TestAllTypes{
    		single_int32_wrapper: TestAllTypes{}.single_int32_wrapper,
    	}.single_int32_wrapper == null`,
      out: true,
    },
    {
      name: 'literal_pb_list_assign_null_wrapper',
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypesSchema],
      expr: `TestAllTypes{
    		repeated_int32: [123, 456, TestAllTypes{}.single_int32_wrapper],
    	}`,
      err: 'field type conversion error',
    },
    {
      name: 'literal_pb_map_assign_null_entry_value',
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypesSchema],
      expr: `TestAllTypes{
    		map_string_string: {
    			'hello': 'world',
    			'goodbye': TestAllTypes{}.single_string_wrapper,
    		},
    	}`,
      err: 'field type conversion error',
    },
    {
      name: 'unset_wrapper_access',
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypesSchema],
      expr: `TestAllTypes{}.single_string_wrapper`,
      out: new NullRefVal(),
    },
    {
      name: 'timestamp_eq_timestamp',
      expr: `timestamp(0) == timestamp(0)`,
      out: true,
    },
    {
      name: 'timestamp_ne_timestamp',
      expr: `timestamp(1) != timestamp(2)`,
      out: true,
    },
    {
      name: 'timestamp_lt_timestamp',
      expr: `timestamp(0) < timestamp(1)`,
      out: true,
    },
    {
      name: 'timestamp_le_timestamp',
      expr: `timestamp(2) <= timestamp(2)`,
      out: true,
    },
    {
      name: 'timestamp_gt_timestamp',
      expr: `timestamp(1) > timestamp(0)`,
      out: true,
    },
    {
      name: 'timestamp_ge_timestamp',
      expr: `timestamp(2) >= timestamp(2)`,
      out: true,
    },
    {
      name: 'string_to_timestamp',
      expr: `timestamp('1986-04-26T01:23:40Z')`,
      out: timestampFromSeconds(514862620),
    },
    {
      name: 'macro_all_non_strict',
      expr: `![0, 2, 4].all(x, 4/x != 2 && 4/(4-x) != 2)`,
      out: true,
    },
    {
      name: 'macro_all_non_strict_var',
      expr: `code == "111" && ["a", "b"].all(x, x in tags)
				|| code == "222" && ["a", "b"].all(x, x in tags)`,
      vars: [
        newVariableDecl('code', StringType),
        newVariableDecl('tags', newListType(StringType)),
      ],
      in: objectToMap({
        code: '222',
        tags: ['a', 'b'],
      }),
      out: true,
    },
    {
      name: 'macro_exists_lit',
      expr: `[1, 2, 3, 4, 5u, 1.0].exists(e, type(e) == uint)`,
      out: true,
    },
    {
      name: 'macro_exists_nonstrict',
      expr: `[0, 2, 4].exists(x, 4/x == 2 && 4/(4-x) == 2)`,
      out: true,
    },
    {
      name: 'macro_exists_var',
      expr: `elems.exists(e, type(e) == uint)`,
      vars: [newVariableDecl('elems', newListType(DynType))],
      in: objectToMap({
        elems: [0, 1, 2, 3, 4, new UintRefVal(BigInt(5)), 6],
      }),
      out: true,
    },
    {
      name: 'macro_exists_one',
      expr: `[1, 2, 3].exists_one(x, (x % 2) == 0)`,
      out: true,
    },
    {
      name: 'macro_filter',
      expr: `[-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3].filter(x, x > 0)`,
      out: [BigInt(1), BigInt(2), BigInt(3)],
    },
    {
      name: 'macro_has_map_key',
      expr: `has({'a':1}.a) && !has({}.a)`,
      out: true,
    },
    {
      name: 'macro_has_pb2_field_undefined',
      container: 'google.api.expr.test.v1.proto2',
      types: [TestAllTypesSchemaProto2],
      unchecked: true,
      expr: `has(TestAllTypes{}.invalid_field)`,
      err: "no such field 'invalid_field'",
    },
    // TODO: this one seems to fail because the expression expects fields with default values to return true for "has." This is probably due to a difference in the way proto2 default fields are handled by protobuf-es. The test immediately below this is very similar but for proto3, and it passes.
    // {
    //   name: 'macro_has_pb2_field',
    //   container: 'google.api.expr.test.v1.proto2',
    //   types: [TestAllTypesSchemaProto2, NestedTestAllTypesSchemaProto2],
    //   vars: [
    //     newVariableDecl(
    //       'pb2',
    //       newObjectType('google.api.expr.test.v1.proto2.TestAllTypes')
    //     ),
    //   ],
    //   in: objectToMap({
    //     pb2: create(TestAllTypesSchemaProto2, {
    //       repeatedBool: [false],
    //       mapInt64NestedType: { '1': {} },
    //       mapStringString: {},
    //     }),
    //   }),
    //   expr: `has(TestAllTypes{standalone_enum: TestAllTypes.NestedEnum.BAR}.standalone_enum)
    // 	&& has(TestAllTypes{standalone_enum: TestAllTypes.NestedEnum.FOO}.standalone_enum)
    // 	&& !has(TestAllTypes{single_nested_enum: TestAllTypes.NestedEnum.FOO}.single_nested_message)
    // 	&& has(TestAllTypes{single_nested_enum: TestAllTypes.NestedEnum.FOO}.single_nested_enum)
    // 	&& !has(TestAllTypes{}.standalone_enum)
    // 	&& !has(pb2.single_int64)
    // 	&& has(pb2.repeated_bool)
    // 	&& !has(pb2.repeated_int32)
    // 	&& has(pb2.map_int64_nested_type)
    // 	&& !has(pb2.map_string_string)`,
    //   out: true,
    // },
    {
      name: 'macro_has_pb3_field',
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypesSchema, NestedTestAllTypesSchema],
      vars: [
        newVariableDecl(
          'pb3',
          newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
        ),
      ],
      in: objectToMap({
        pb3: create(TestAllTypesSchema, {
          repeatedBool: [false],
          mapInt64NestedType: { '1': {} },
          mapStringString: {},
        }),
      }),
      expr: `has(TestAllTypes{standalone_enum: TestAllTypes.NestedEnum.BAR}.standalone_enum)
			&& !has(TestAllTypes{standalone_enum: TestAllTypes.NestedEnum.FOO}.standalone_enum)
			&& !has(TestAllTypes{single_nested_enum: TestAllTypes.NestedEnum.FOO}.single_nested_message)
			&& has(TestAllTypes{single_nested_enum: TestAllTypes.NestedEnum.FOO}.single_nested_enum)
			&& !has(TestAllTypes{}.single_nested_message)
			&& has(TestAllTypes{single_nested_message: TestAllTypes.NestedMessage{}}.single_nested_message)
			&& !has(TestAllTypes{}.standalone_enum)
			&& !has(pb3.single_int64)
			&& has(pb3.repeated_bool)
			&& !has(pb3.repeated_int32)
			&& has(pb3.map_int64_nested_type)
			&& !has(pb3.map_string_string)`,
    },
    {
      name: 'macro_map',
      expr: `[1, 2, 3].map(x, x * 2) == [2, 4, 6]`,
      out: true,
    },
    {
      name: 'matches_global',
      expr: `matches(input, 'k.*')`,
      vars: [newVariableDecl('input', StringType)],
      in: objectToMap({
        input: 'kathmandu',
      }),
      out: true,
    },
    {
      name: 'matches_member',
      expr: `input.matches('k.*')
				&& !'foo'.matches('k.*')
				&& !'bar'.matches('k.*')
				&& 'kilimanjaro'.matches('.*ro')`,
      vars: [newVariableDecl('input', StringType)],
      in: objectToMap({
        input: 'kathmandu',
      }),
      out: true,
    },
    // TODO: regex optimization
    // {
    // 	name: "matches_error",
    // 	expr: `input.matches(')k.*')`,
    // 	vars: []*decls.VariableDecl{
    // 		decls.NewVariable("input", types.StringType),
    // 	},
    // 	in: map[string]any{
    // 		"input": "kathmandu",
    // 	},
    // 	extraOpts: []InterpretableDecorator{CompileRegexConstants(MatchesRegexOptimization)},
    // 	// unoptimized program should report a regex compile error at runtime
    // 	err: "unexpected ): `)k.*`",
    // 	// optimized program should report a regex compile at program creation time
    // 	progErr: "unexpected ): `)k.*`",
    // },
    {
      name: 'nested_proto_field',
      expr: `pb3.single_nested_message.bb`,
      types: [TestAllTypesSchema],
      vars: [
        newVariableDecl(
          'pb3',
          newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
        ),
      ],
      in: objectToMap({
        pb3: create(TestAllTypesSchema, {
          nestedType: {
            case: 'singleNestedMessage',
            value: {
              bb: 1234,
            },
          },
        }),
      }),
      out: 1234,
    },
    {
      name: 'nested_proto_field_with_index',
      expr: `pb3.map_int64_nested_type[0].child.payload.single_int32 == 1`,
      types: [TestAllTypesSchema, NestedTestAllTypesSchema],
      vars: [
        newVariableDecl(
          'pb3',
          newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
        ),
      ],
      in: objectToMap({
        pb3: create(TestAllTypesSchema, {
          mapInt64NestedType: {
            '0': {
              child: {
                payload: {
                  singleInt32: 1,
                },
              },
            },
          },
        }),
      }),
    },
    {
      name: 'or_true_1st',
      expr: `ai == 20 || ar["foo"] == "bar"`,
      vars: [
        newVariableDecl('ai', IntType),
        newVariableDecl('ar', newMapType(StringType, StringType)),
      ],
      in: objectToMap({
        ai: BigInt(20),
        ar: {
          foo: 'bar',
        },
      }),
      out: true,
    },
    {
      name: 'or_true_2nd',
      expr: `ai == 20 || ar["foo"] == "bar"`,
      vars: [
        newVariableDecl('ai', IntType),
        newVariableDecl('ar', newMapType(StringType, StringType)),
      ],
      in: objectToMap({
        ai: BigInt(2),
        ar: {
          foo: 'bar',
        },
      }),
      out: true,
    },
    {
      name: 'or_false',
      expr: `ai == 20 || ar["foo"] == "bar"`,
      vars: [
        newVariableDecl('ai', IntType),
        newVariableDecl('ar', newMapType(StringType, StringType)),
      ],
      in: objectToMap({
        ai: BigInt(2),
        ar: {
          foo: 'baz',
        },
      }),
      out: false,
    },
    {
      name: 'or_error_1st_error',
      expr: `1/0 != 0 || false`,
      err: 'division by zero',
    },
    {
      name: 'or_error_2nd_error',
      expr: `false || 1/0 != 0`,
      err: 'division by zero',
    },
    {
      name: 'or_error_1st_true',
      expr: `1/0 != 0 || true`,
      out: true,
    },
    {
      name: 'or_error_2nd_true',
      expr: `true || 1/0 != 0`,
      out: true,
    },
    {
      name: 'pkg_qualified_id',
      expr: `b.c.d != 10`,
      container: 'a.b',
      vars: [newVariableDecl('a.b.c.d', IntType)],
      in: objectToMap({
        'a.b.c.d': BigInt(9),
      }),
      out: true,
    },
    {
      name: 'pkg_qualified_id_unchecked',
      expr: `c.d != 10`,
      unchecked: true,
      container: 'a.b',
      in: objectToMap({
        'a.b.c.d': BigInt(9),
      }),
      out: true,
    },
    {
      name: 'pkg_qualified_index_unchecked',
      expr: `b.c['d'] == 10`,
      unchecked: true,
      container: 'a.b',
      in: objectToMap({
        'a.b.c': objectToMap({
          d: BigInt(10),
        }),
      }),
      out: true,
    },
    {
      name: 'select_key',
      expr: `m.strMap['val'] == 'string'
				&& m.floatMap['val'] == 1.5
				&& m.doubleMap['val'] == -2.0
				&& m.intMap['val'] == -3
				&& m.int32Map['val'] == 4
				&& m.int64Map['val'] == -5
				&& m.uintMap['val'] == 6u
				&& m.uint32Map['val'] == 7u
				&& m.uint64Map['val'] == 8u
				&& m.boolMap['val'] == true
				&& m.boolMap['val'] != false`,
      vars: [newVariableDecl('m', newMapType(StringType, DynType))],
      in: objectToMap({
        m: {
          strMap: { val: 'string' },
          floatMap: { val: 1.5 },
          doubleMap: { val: -2.0 },
          intMap: { val: BigInt(-3) },
          int32Map: { val: 4 },
          int64Map: { val: BigInt(-5) },
          uintMap: { val: BigInt(6) },
          uint32Map: { val: 7 },
          uint64Map: { val: BigInt(8) },
          boolMap: { val: true },
        },
      }),
      out: true,
    },
    {
      name: 'select_bool_key',
      expr: `m.boolStr[true] == 'string'
				&& m.boolFloat32[true] == 1.5
				&& m.boolFloat64[false] == -2.1
				&& m.boolInt[false] == -3
				&& m.boolInt32[false] == 0
				&& m.boolInt64[true] == 4
				&& m.boolUint[true] == 5u
				&& m.boolUint32[true] == 6u
				&& m.boolUint64[false] == 7u
				&& m.boolBool[true]
				&& m.boolIface[false] == true`,
      vars: [newVariableDecl('m', newMapType(StringType, DynType))],
      in: objectToMap({
        m: {
          boolStr: new Map([[true, 'string']]),
          boolFloat32: new Map([[true, 1.5]]),
          boolFloat64: new Map([[false, -2.1]]),
          boolInt: new Map([[false, BigInt(-3)]]),
          boolInt32: new Map([[false, 0]]),
          boolInt64: new Map([[true, BigInt(4)]]),
          boolUint: new Map([[true, BigInt(5)]]),
          boolUint32: new Map([[true, 6]]),
          boolUint64: new Map([[false, BigInt(7)]]),
          boolBool: new Map([[true, true]]),
          boolIface: new Map([[false, true]]),
        },
      }),
      out: true,
    },
    {
      name: 'select_uint_key',
      expr: `m.uintIface[1u] == 'string'
				&& m.uint32Iface[2u] == 1.5
				&& m.uint64Iface[3u] == -2.1
				&& m.uint64String[4u] == 'three'`,
      vars: [newVariableDecl('m', newMapType(StringType, DynType))],
      in: objectToMap({
        m: {
          uintIface: new Map([[BigInt(1), 'string']]),
          uint32Iface: new Map([[BigInt(2), 1.5]]),
          uint64Iface: new Map([[BigInt(3), -2.1]]),
          uint64String: new Map([[BigInt(4), 'three']]),
        },
      }),
      out: true,
    },
    {
      name: 'select_index',
      expr: `m.strList[0] == 'string'
				&& m.floatList[0] == 1.5
				&& m.doubleList[0] == -2.0
				&& m.intList[0] == -3
				&& m.int32List[0] == 4
				&& m.int64List[0] == -5
				&& m.uintList[0] == 6u
				&& m.uint32List[0] == 7u
				&& m.uint64List[0] == 8u
				&& m.boolList[0] == true
				&& m.boolList[1] != true
				&& m.ifaceList[0] == {}`,
      vars: [newVariableDecl('m', newMapType(StringType, DynType))],
      in: objectToMap({
        m: {
          strList: ['string'],
          floatList: [1.5],
          doubleList: [-2.0],
          intList: [-3],
          int32List: [4],
          int64List: [-5],
          uintList: [6],
          uint32List: [7],
          uint64List: [8],
          boolList: [true, false],
          ifaceList: [{}],
        },
      }),
      out: true,
    },
    {
      name: 'select_field',
      expr: `a.b.c
				&& pb3.repeated_nested_enum[0] == proto3.TestAllTypes.NestedEnum.BAR
				&& json.list[0] == 'world'`,
      container: 'google.api.expr.test.v1',
      types: [TestAllTypesSchema],
      vars: [
        newVariableDecl('a.b', newMapType(StringType, BoolType)),
        newVariableDecl(
          'pb3',
          newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
        ),
        newVariableDecl('json', newMapType(StringType, DynType)),
      ],
      in: objectToMap({
        'a.b': { c: true },
        pb3: create(TestAllTypesSchema, {
          repeatedNestedEnum: [TestAllTypes_NestedEnum.BAR],
        }),
        json: {
          list: ['world'],
        },
      }),
      out: true,
    },
    // TODO: think this is the same issue as above where protobuf-es handles default values differently for proto2
    // // pb2 primitive fields may have default values set.
    // {
    //   name: 'select_pb2_primitive_fields',
    //   expr: `!has(a.single_int32)
    // 	&& a.single_int32 == -32
    // 	&& a.single_int64 == -64
    // 	&& a.single_uint32 == 32u
    // 	&& a.single_uint64 == 64u
    // 	&& a.single_float == 3.0
    // 	&& a.single_double == 6.4
    // 	&& a.single_bool
    // 	&& "empty" == a.single_string`,
    //   types: [TestAllTypesSchemaProto2],
    //   in: objectToMap({
    //     a: create(TestAllTypesSchemaProto2),
    //   }),
    //   vars: [
    //     newVariableDecl(
    //       'a',
    //       newObjectType('google.api.expr.test.v1.proto2.TestAllTypes')
    //     ),
    //   ],
    //   out: true,
    // },
    // Wrapper type nil or value test.
    {
      name: 'select_pb3_wrapper_fields',
      expr: `!has(a.single_int32_wrapper) && a.single_int32_wrapper == null
				&& has(a.single_int64_wrapper) && a.single_int64_wrapper == 0
				&& has(a.single_string_wrapper) && a.single_string_wrapper == "hello"
				&& a.single_int64_wrapper == Int32Value{value: 0}`,
      types: [TestAllTypesSchema],
      abbrevs: ['google.protobuf.Int32Value'],
      vars: [
        newVariableDecl(
          'a',
          newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
        ),
      ],
      in: objectToMap({
        a: create(TestAllTypesSchema, {
          singleInt64Wrapper: BigInt(0),
          singleStringWrapper: 'hello',
        }),
      }),
      out: true,
    },
    {
      name: 'select_pb3_compare',
      expr: `a.single_uint64 > 3u`,
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypesSchema],
      vars: [
        newVariableDecl(
          'a',
          newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
        ),
      ],
      in: objectToMap({
        a: create(TestAllTypesSchema, {
          singleUint64: BigInt(10),
        }),
      }),
      out: true,
    },
    {
      name: 'select_custom_pb3_compare',
      expr: `a.bb > 100`,
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypes_NestedMessageSchema],
      vars: [
        newVariableDecl(
          'a',
          newObjectType(
            'google.api.expr.test.v1.proto3.TestAllTypes.NestedMessage'
          )
        ),
      ],
      // TODO: not sure how relevant this is to the test
      // attrs: &custAttrFactory{
      // 	AttributeFactory: NewAttributeFactory(
      // 		testContainer("google.expr.proto3.test"),
      // 		newTestRegistry(t, &proto3pb.TestAllTypes_NestedMessage{}),
      // 		newTestRegistry(t, &proto3pb.TestAllTypes_NestedMessage{}),
      // 	),
      // },
      in: objectToMap({
        a: create(TestAllTypes_NestedMessageSchema, {
          bb: 101,
        }),
      }),
      out: true,
    },
    {
      name: 'select_custom_pb3_optional_field',
      expr: `a.?bb`,
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypes_NestedMessageSchema],
      vars: [
        newVariableDecl(
          'a',
          newObjectType(
            'google.api.expr.test.v1.proto3.TestAllTypes.NestedMessage'
          )
        ),
      ],
      // TODO: not sure how relevant this is to the test
      // attrs: &custAttrFactory{
      // 	AttributeFactory: NewAttributeFactory(
      // 		testContainer("google.expr.proto3.test"),
      // 		newTestRegistry(t, &proto3pb.TestAllTypes_NestedMessage{}),
      // 		newTestRegistry(t, &proto3pb.TestAllTypes_NestedMessage{}),
      // 	),
      // },
      in: objectToMap({
        a: create(TestAllTypes_NestedMessageSchema, {
          bb: 101,
        }),
      }),
      out: new OptionalRefVal(new IntRefVal(BigInt(101))),
    },
    {
      name: 'select_relative',
      expr: `json('{"hi":"world"}').hi == 'world'`,
      funcs: [
        new FunctionDecl({
          name: 'json',
          overloads: [
            new OverloadDecl({
              id: 'json_string',
              argTypes: [StringType],
              resultType: DynType,
              unaryOp: (val) => {
                if (!isStringRefVal(val)) {
                  return ErrorRefVal.maybeNoSuchOverload(val);
                }
                const m = JSON.parse(val.value());
                return defaultTypeAdapter.nativeToValue(m);
              },
            }),
          ],
        }),
      ],
      out: true,
    },
    {
      name: 'select_subsumed_field',
      expr: `a.b.c`,
      vars: [
        newVariableDecl('a.b.c', IntType),
        newVariableDecl('a.b', newMapType(StringType, StringType)),
      ],
      in: objectToMap({
        'a.b.c': BigInt(10),
        'a.b': {
          c: 'ten',
        },
      }),
      out: BigInt(10),
    },
    {
      name: 'select_empty_repeated_nested',
      expr: `TestAllTypes{}.repeated_nested_message.size() == 0`,
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypesSchema],
      out: true,
    },
    {
      name: 'select_empty_map_nested',
      expr: `TestAllTypes{}.map_string_string.size() == 0`,
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypesSchema],
      out: true,
    },
    {
      name: 'call_with_error_unary',
      expr: `try(0/0)`,
      unchecked: true,
      funcs: [
        new FunctionDecl({
          name: 'try',
          overloads: [
            new OverloadDecl({
              id: 'try_dyn',
              argTypes: [DynType],
              resultType: DynType,
              nonStrict: true,
              unaryOp: (arg) => {
                if (isErrorRefVal(arg)) {
                  return new StringRefVal(`error: ${arg.value().message}`);
                }
                return arg;
              },
            }),
          ],
        }),
      ],
      out: 'error: division by zero',
    },
    {
      name: 'call_with_error_binary',
      expr: `try(0/0, 0)`,
      unchecked: true,
      funcs: [
        new FunctionDecl({
          name: 'try',
          overloads: [
            new OverloadDecl({
              id: 'try_dyn',
              argTypes: [DynType, DynType],
              resultType: newListType(DynType),
              nonStrict: true,
              binaryOp: (arg0, arg1) => {
                if (isErrorRefVal(arg0)) {
                  return new StringRefVal(`error: ${arg0.value().message}`);
                }
                return new DynamicList(defaultTypeAdapter, [arg0, arg1]);
              },
            }),
          ],
        }),
      ],
      out: 'error: division by zero',
    },
    {
      name: 'call_with_error_function',
      expr: `try(0/0, 0, 0)`,
      unchecked: true,
      funcs: [
        new FunctionDecl({
          name: 'try',
          overloads: [
            new OverloadDecl({
              id: 'try_dyn',
              argTypes: [DynType, DynType, DynType],
              resultType: newListType(DynType),
              nonStrict: true,
              functionOp: (arg0, arg1, arg2) => {
                if (isErrorRefVal(arg0)) {
                  return new StringRefVal(`error: ${arg0.value().message}`);
                }
                return new DynamicList(defaultTypeAdapter, [arg0, arg1, arg2]);
              },
            }),
          ],
        }),
      ],
      out: 'error: division by zero',
    },
    {
      name: 'literal_map_optional_field',
      expr: `{?'hi': {}.?missing,
			        ?'world': {'present': 42u}.?present}`,
      out: objectToMap({
        world: BigInt(42),
      }),
    },
    {
      name: 'literal_map_optional_field_bad_init',
      expr: `{?'hi': 'world'}`,
      unchecked: true,
      err: `cannot initialize optional entry 'hi' from non-optional`,
    },
    {
      name: 'literal_pb_optional_field',
      expr: `TestAllTypes{?single_int32: {'value': 1}.?value, ?single_string: {}.?missing}`,
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypesSchema],
      out: create(TestAllTypesSchema, {
        singleInt32: 1,
      }),
    },
    {
      name: 'literal_pb_optional_field_bad_init',
      expr: `TestAllTypes{?single_int32: 1}`,
      container: 'google.api.expr.test.v1.proto3',
      types: [TestAllTypesSchema],
      unchecked: true,
      err: `cannot initialize optional entry 'single_int32' from non-optional`,
    },
    {
      name: 'literal_list_optional_element',
      expr: `[?{}.?missing, ?{'present': 42u}.?present]`,
      out: [BigInt(42)],
    },
    {
      name: 'literal_list_optional_bad_element',
      expr: `[?123]`,
      unchecked: true,
      err: `cannot initialize optional list element from non-optional value 123`,
    },
    {
      name: 'bad_argument_in_optimized_list',
      expr: `1/0 in [1, 2, 3]`,
      err: `division by zero`,
    },
    {
      name: 'list_index_error',
      expr: `mylistundef[0]`,
      unchecked: true,
      err: `no such attribute(s): mylistundef`,
    },
    {
      name: 'pkg_list_index_error',
      container: 'goog',
      expr: `pkg.mylistundef[0]`,
      unchecked: true,
      // TODO; the original go test omits the ".0"
      err: `no such attribute(s): goog.pkg.mylistundef.0, pkg.mylistundef.0`,
    },
    // TODO: partial activations
    // {
    // 	name: "unknown_attribute",
    // 	expr: `a[0]`,
    //   vars: [
    //     newVariableDecl('a', newMapType(IntType, BoolType)),
    //   ],
    // 	attrs: NewPartialAttributeFactory(testContainer(""), types.DefaultTypeAdapter, types.NewEmptyRegistry()),
    // 	in: newTestPartialActivation(t, map[string]any{
    // 		"a": map[int64]any{
    // 			1: true,
    // 		},
    // 	}, NewAttributePattern("a").QualInt(0)),
    // 	out: types.NewUnknown(2, types.QualifyAttribute[int64](types.NewAttributeTrail("a"), 0)),
    // },
    // {
    // 	name: "unknown_attribute_mixed_qualifier",
    // 	expr: `a[dyn(0u)]`,
    // 	vars: []*decls.VariableDecl{
    // 		decls.NewVariable("a",
    // 			types.NewMapType(types.IntType, types.BoolType)),
    // 	},
    // 	attrs: NewPartialAttributeFactory(testContainer(""), types.DefaultTypeAdapter, types.NewEmptyRegistry()),
    // 	in: newTestPartialActivation(t, map[string]any{
    // 		"a": map[int64]any{
    // 			1: true,
    // 		},
    // 	}, NewAttributePattern("a").QualInt(0)),
    // 	out: types.NewUnknown(2, types.QualifyAttribute[uint64](types.NewAttributeTrail("a"), 0)),
    // },
    {
      name: 'invalid_presence_test_on_int_literal',
      expr: `has(dyn(1).invalid)`,
      err: 'no such key: invalid',
      attrs: new AttrFactory(
        new Container(),
        new Registry(),
        new Registry(),
        enableErrorOnBadPresenceTest(true)
      ),
    },
    {
      name: 'invalid_presence_test_on_list_literal',
      expr: `has(dyn([]).invalid)`,
      err: "unsupported index type 'string' in list",
      attrs: new AttrFactory(
        new Container(),
        new Registry(),
        new Registry(),
        enableErrorOnBadPresenceTest(true)
      ),
    },
    {
      name: 'optional_select_on_undefined',
      expr: `{}.?invalid`,
      out: OptionalNone,
    },
    {
      name: 'optional_select_on_null_literal',
      expr: `{"invalid": dyn(null)}.?invalid.?nested`,
      out: OptionalNone,
    },
  ];
  for (const tc of testCases) {
    it(`ExprInterpreter - ${tc.name}`, () => {
      const [prg, act, err] = program(tc);
      const got = prg?.eval(act ?? new EmptyActivation());
      if (!isNil(tc.out)) {
        if (isErrorRefVal(got)) {
          console.log({ err, got });
          throw got.value();
        }
        try {
          expect(got?.equal(tc.out).value()).toEqual(true);
        } catch (e) {
          console.log({ got, want: tc.out, err });
          throw e;
        }
      }
      if (!isNil(tc.err)) {
        expect(got).toBeInstanceOf(ErrorRefVal);
        expect(got?.value().message).toContain(tc.err);
      }
    });
  }
});

function program(
  tst: TestCase,
  ...opts: InterpretableDecorator[]
): [Interpretable | null, Activation | null, Error | null] {
  // Configure the package.
  let cont = new Container(containerName(tst.container ?? ''));
  if (!isNil(tst.abbrevs)) {
    cont = cont.extend(abbrevs(...tst.abbrevs));
  }
  const reg = new Registry();
  if (!isNil(tst.types)) {
    for (const type of tst.types) {
      reg.registerDescriptor(type);
    }
  }
  const env = new Env(cont, reg);
  env.addFunctions(...stdFunctions);
  if (!isNil(tst.funcs)) {
    env.addFunctions(...tst.funcs);
  }
  env.addIdents(...stdTypes);
  if (!isNil(tst.vars)) {
    env.addIdents(...tst.vars);
  }
  const attrs = tst.attrs ?? new AttrFactory(cont, reg, reg);
  // Configure the program input.
  const vars = isNil(tst.in) ? new EmptyActivation() : newActivation(tst.in);
  // Adapt the test output, if needed.
  if (!isNil(tst.out)) {
    tst.out = reg.nativeToValue(tst.out);
  }

  const disp = new DefaultDispatcher();
  addFunctionBindings(disp);
  if (!isNil(tst.funcs)) {
    env.addFunctions(...tst.funcs);
    disp.add(...tst.funcs.flatMap((fn) => fn.bindings()));
  }
  const interp = new ExprInterpreter(disp, cont, reg, reg, attrs);

  // Parse the expression.
  const s = new TextSource(tst.expr);
  const p = new Parser(
    macros(...AllMacros),
    enableOptionalSyntax(true),
    enableVariadicOperatorASTs(true)
  );
  const parsed = p.parse(s);
  if (p.errors.length() > 0) {
    return [null, null, new Error(p.errors.toDisplayString())];
  }
  if (tst.unchecked) {
    // Build the program plan.
    const prg = interp.newInterpretable(parsed, ...opts);
    if (prg instanceof Error) {
      return [null, null, prg];
    }
    return [prg, vars, null];
  }
  // Check the expression.
  const checker = new Checker(env);
  const checked = checker.check(parsed);
  if (checker.errors.length() > 0) {
    return [null, null, new Error(checker.errors.toDisplayString())];
  }
  // Build the program plan.
  const prg = interp.newInterpretable(checked, ...opts);
  if (prg instanceof Error) {
    return [null, null, prg];
  }
  return [prg, vars, null];
}

function addFunctionBindings(dispatcher: Dispatcher) {
  for (const fn of stdFunctions) {
    const bindings = fn.bindings();
    dispatcher.add(...bindings);
  }
}
