import { DefaultDispatcher, Dispatcher } from './dispatcher';
import { ExprInterpreter } from './interpreter';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from '@bearclaw/is';
import { DescMessage } from '@bufbuild/protobuf';
import { Checker } from '../checker/checker';
import { Env } from '../checker/env';
import { Container } from '../common/container';
import {
  FunctionDecl,
  newVariableDecl,
  OverloadDecl,
  VariableDecl,
} from '../common/decls';
import { Overload } from '../common/functions';
import { RefVal } from '../common/ref/reference';
import { TextSource } from '../common/source';
import { stdFunctions, stdTypes } from '../common/stdlib';
import { BoolRefVal } from '../common/types/bool';
import { ErrorRefVal, isErrorRefVal } from '../common/types/error';
import { IntRefVal } from '../common/types/int';
import { NullRefVal } from '../common/types/null';
import { Registry } from '../common/types/provider';
import { StringRefVal } from '../common/types/string';
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
  StringType,
} from '../common/types/types';
import { objectToMap } from '../common/utils';
import { AllMacros } from '../parser/macro';
import { Parser } from '../parser/parser';
import { Activation, EmptyActivation, newActivation } from './activation';
import { AttrFactory, AttributeFactory } from './attributes';
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
              operandTrait: Trait.NEGATER_TYPE,
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
              operandTrait: Trait.ADDER_TYPE,
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
              operandTrait: Trait.ADDER_TYPE,
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
    // TODO: these throw errors
    // {
    //   name: 'index_list_int_double_type_index',
    //   expr: `[7, 8, 9][dyn(0.0)] == 7`,
    //   out: true,
    // },
    // {
    //   name: 'index_list_int_uint_type_index',
    //   expr: `[7, 8, 9][dyn(0u)] == 7`,
    //   out: true,
    // },
    // {
    //   name: 'index_list_int_bad_double_type_index',
    //   expr: `[7, 8, 9][dyn(0.1)] == 7`,
    //   err: `unsupported index value`,
    // },
    // {
    //   name: 'index_relative',
    //   expr: `([[[1]], [[2]], [[3]]][0][0] + [2, 3, {'four': {'five': 'six'}}])[3].four.five == 'six'`,
    //   out: true,
    // },
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
  ];
  for (const tc of testCases) {
    it(`ExprInterpreter - ${tc.name}`, () => {
      const [prg, act, err] = program(tc);
      const got = prg?.eval(act ?? new EmptyActivation());
      if (!isNil(tc.out)) {
        if (isErrorRefVal(got)) {
          console.log({ err });
          throw got.value();
        }
        try {
          expect(got?.equal(tc.out).value()).toEqual(true);
        } catch (e) {
          console.log({ got, want: tc.out });
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
  const cont = new Container(tst.container);
  // var err error
  // if tst.abbrevs != nil {
  // 	cont, err = containers.NewContainer(
  // 		containers.Name(cont.Name()),
  // 		containers.Abbrevs(tst.abbrevs...))
  // 	if err != nil {
  // 		return nil, nil, err
  // 	}
  // }
  const reg = new Registry();
  if (!isNil(tst.types)) {
    for (const type of tst.types) {
      reg.registerDescriptor(type);
    }
  }
  const env = new Env(cont, reg);
  env.addFunctions(...stdFunctions);
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
  const p = new Parser(s, {
    macros: [...AllMacros],
    enableOptionalSyntax: true,
    enableVariadicOperatorASTs: true,
  });
  const parsed = p.parse();
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
  const checker = new Checker(parsed, env);
  const checked = checker.check();
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
