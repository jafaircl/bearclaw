/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExprSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { create } from '@bufbuild/protobuf';
import { RefVal } from '../common/ref/reference';
import { BoolRefVal } from '../common/types/bool';
import { Activation } from '../interpreter/activation';
import { BoolType, StringType, variable } from './decls';
import { Ast, CustomEnv, Env, Issues } from './env';
import { StdLib } from './library';
import {
  abbrevs,
  container,
  crossTypeNumericComparisons,
  EnvOption,
  types,
} from './options';
import { Program } from './program';

describe('cel', () => {
  it('Test_ExampleWithBuiltins', () => {
    // Variables used within this expression environment.
    const env = new Env(variable('i', StringType), variable('you', StringType));

    // Compile the expression.
    const ast = env.compile(`"Hello " + you + "! I'm " + i + "."`) as Ast;
    expect(ast).toBeInstanceOf(Ast);
    expect(ast).not.toBeInstanceOf(Issues);

    // Create the program, and evaluate it against some input.
    const prg = env.program(ast) as Program;
    expect(prg).not.toBeInstanceOf(Error);

    // If the Eval() call were provided with cel.EvalOptions(OptTrackState) the details response (2nd return) would be non-nil.
    const [out, _, err] = prg.eval({
      i: 'CEL',
      you: 'world',
    });
    expect(err).toBeNull();

    // Hello world! I'm CEL.
    expect(out?.value()).toEqual("Hello world! I'm CEL.");
  });

  it('TestAbbrevsCompiled', () => {
    // Test whether abbreviations successfully resolve at type-check time (compile time).
    const env = new Env(
      abbrevs('qualified.identifier.name'),
      variable('qualified.identifier.name.first', StringType)
    );
    const ast = env.compile(`"hello "+ name.first`) as Ast; // abbreviation resolved here.
    const prg = env.program(ast) as Program;
    const [out, _, err] = prg.eval({
      'qualified.identifier.name.first': 'Jim',
    });
    expect(err).toBeNull();
    expect(out?.value()).toEqual('hello Jim');
  });

  it('TestAbbrevsParsed', () => {
    // Test whether abbreviations are resolved properly at evaluation time.
    const env = new Env(abbrevs('qualified.identifier.name'));
    const ast = env.parse(`"hello " + name.first`) as Ast;
    const prg = env.program(ast) as Program; // abbreviation resolved here.
    const [out, _, err] = prg.eval({
      'qualified.identifier.name': { first: 'Jim' },
    });
    expect(err).toBeNull();
    expect(out?.value()).toEqual('hello Jim');
  });

  it('TestAbbrevsDisambiguation', () => {
    const env = new Env(
      abbrevs('external.Expr'),
      container('cel.expr'),
      types(ExprSchema),

      variable('test', BoolType),
      variable('external.Expr', StringType)
    );
    // This expression will return either a string or a protobuf Expr value
    // depending on the value of the 'test' argument. The fully qualified type
    // name is used indicate that the protobuf  typed 'Expr' should be used
    // rather than the abbreviatation for 'external.Expr'.
    const [out, __, err] = interpret(
      env,
      `test ? dyn(Expr) : cel.expr.Expr{id: 1}`,
      {
        test: true,
        'external.Expr': 'string expr',
      }
    );
    expect(err).toBeNull();
    expect(out?.value()).toEqual('string expr');
    const [out2, _, err2] = interpret(
      env,
      `test ? dyn(Expr) : cel.expr.Expr{id: 1}`,
      {
        test: false,
        'external.Expr': 'wrong expr',
      }
    );
    expect(err2).toBeNull();
    expect(out2?.convertToNative(ExprSchema)).toStrictEqual(
      create(ExprSchema, { id: BigInt(1) })
    );
  });

  it('TestCustomEnvError', () => {
    const env = new CustomEnv(StdLib(), StdLib());
    const iss = env.compile('a.b.c == true');
    expect(iss).toBeInstanceOf(Issues);
  });

  it('TestCustomEnv', () => {
    const env = new CustomEnv(variable('a.b.c', BoolType));
    const iss = env.compile('a.b.c == true');
    expect(iss).toBeInstanceOf(Issues);
    expect(iss.toString()).toContain(
      `undeclared reference to '_==_' (in container '')`
    );
    const [out] = interpret(env, 'a.b.c', { 'a.b.c': true });
    expect(out?.value()).toEqual(true);
  });

  describe('TestCrossTypeNumericComparisons', () => {
    interface TestCase {
      name: string;
      expr: string;
      iss?: string;
      opt?: EnvOption[];
      out?: RefVal;
    }
    const testCases: TestCase[] = [
      // TODO: crossTypeNumericComparisons is currently always enabled
      // Statically typed expressions need to opt in to cross-type numeric comparisons
      // {
      //   name: 'double_less_than_int_err',
      //   expr: `1.0 < 2`,
      //   opt: [crossTypeNumericComparisons(false)],
      //   iss: `
      // ERROR: <input>:1:5: found no matching overload for '_<_' applied to '(double, int)'
      //        | 1.0 < 2
      //        | ....^`,
      // },
      // {
      //   name: 'double_less_than_int_success',
      //   expr: `1.0 < 2`,
      //   opt: [crossTypeNumericComparisons(true)],
      //   out: BoolRefVal.True,
      // },
      // Dynamic data already benefits from cross-type numeric comparisons
      {
        name: 'dyn_less_than_int_success',
        expr: `dyn(1.0) < 2`,
        opt: [crossTypeNumericComparisons(false)],
        out: BoolRefVal.True,
      },
      {
        name: 'dyn_less_than_int_success',
        expr: `dyn(1.0) < 2`,
        opt: [crossTypeNumericComparisons(true)],
        out: BoolRefVal.True,
      },
    ];
    for (const tc of testCases) {
      it(tc.name, () => {
        const env = new Env(...(tc.opt || []));
        const iss = env.compile(tc.expr);
        if (tc.iss) {
          expect(iss).toBeInstanceOf(Issues);
          expect(iss.toString()).toContain(
            tc.iss
              .trim()
              .split('\n')
              .map((line) => line.trim())
              .join('\n ')
          );
        } else {
          expect(iss).not.toBeInstanceOf(Issues);
          const [out] = interpret(env, tc.expr || '', {});
          expect(out?.value()).toEqual(tc.out?.value());
        }
      });
    }
  });

  // TODO: more tests
});

function interpret(
  env: Env,
  expr: string,
  values: Activation | Record<string, any> | Map<string, any>
) {
  const ast = env.compile(expr);
  if (ast instanceof Issues) {
    throw new Error(ast.toString());
  }
  const prg = env.program(ast);
  if (prg instanceof Error) {
    throw prg;
  }
  return prg.eval(values);
}
