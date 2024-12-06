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
import { Registry } from '../common/types/provider';
import { StringRefVal } from '../common/types/string';
import { Adder } from '../common/types/traits/math';
import { Trait } from '../common/types/traits/trait';
import {
  BytesType,
  IntType,
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
        headers: objectToMap({
          ip: '10.0.1.2',
          path: '/admin/edit',
          token: 'admin',
        }),
      }),
      out: true,
    },
  ];
  it('ExprInterpreter', () => {
    for (const tc of testCases) {
      const [prg, act, err] = program(tc);
      const out = prg?.eval(act ?? new EmptyActivation());
      if (!isNil(tc.out)) {
        if (isErrorRefVal(out)) {
          console.log({ err });
        }
        expect(out).toStrictEqual(tc.out);
      }
      if (!isNil(tc.err)) {
        expect(out).toBeInstanceOf(ErrorRefVal);
        expect(out?.value().message).toContain(tc.err);
      }
    }
  });
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
