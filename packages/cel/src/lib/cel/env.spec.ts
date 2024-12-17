import { Errors } from '../common/errors';
import { func, overload, StringType } from './decls';
import { Env, Issues } from './env';
describe('env', () => {
  it('TestIssuesEmpty', () => {
    const iss = new Issues(new Errors());
    expect(iss.err()).toBeNull();
    expect(iss.errors().length).toEqual(0);
    expect(iss.toString()).toEqual('');
  });

  it('TestIssuesAppendSelf', () => {
    const e = new Env();
    let iss = e.compile('a') as Issues;
    expect(iss.errors().length).toEqual(1);
    iss = iss.append(iss);
    expect(iss.errors().length).toEqual(1);
  });

  it('TestIssues', () => {
    const e = new Env();
    let iss = e.compile('-') as Issues;
    const iss2 = e.compile('b') as Issues;
    iss = iss.append(iss2);
    expect(iss.errors().length).toEqual(3);
    expect(iss.toString()).toEqual(
      `ERROR: <input>:1:2: Syntax error: no viable alternative at input '-'
 | -
 | .^
 ERROR: <input>:1:2: Syntax error: mismatched input '<EOF>' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
 | -
 | .^
 ERROR: <input>:1:1: undeclared reference to 'b' (in container '')
 | -
 | ^
`.trim()
    );
  });

  it('TestLibraries', () => {
    // TODO: optional library
    const e = new Env();
    expect(e.hasLibrary('cel.lib.std')).toEqual(true);
    expect(e.libraries.size).toEqual(1);
  });

  it('TestFunctions', () => {
    const e = new Env(func('a', overload('a_b', [StringType], StringType)));
    expect(e.hasFunction('a')).toEqual(true);
  });

  // TODO: add missing tests for formatting, extend race conditions, partial vars, functions and benchmarking
});
