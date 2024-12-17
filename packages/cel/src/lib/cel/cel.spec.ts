import { StringType, variable } from './decls';
import { Ast, Env, Issues } from './env';
import { Program } from './program';

describe('cel', () => {
  it('Test_ExampleWithBuiltins', () => {
    // Variables used within this expression environment.
    const env = new Env(variable('i', StringType), variable('you', StringType));

    // Compile the expression.
    const ast = env.compile(`"Hello " + you + "! I'm " + i + "."`) as Ast;
    console.log((ast as unknown as Issues).toString());
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
});
