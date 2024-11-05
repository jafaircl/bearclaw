import { CELContainer } from '../cel';
import { identDecl } from '../common/decls/ident-decl';
import { ProtoTypeRegistry } from '../common/pb/proto-type-registry';
import {
  STANDARD_FUNCTION_DECLARATIONS,
  STANDARD_IDENT_DECLARATIONS,
} from '../common/standard';
import { TYPE_TYPE } from '../common/types/type';
import { CheckerEnv } from './env';

describe('CheckerEnv', () => {
  it('overlapping identifier', () => {
    const env = standardEnv();
    const errs = env.addIdents(identDecl('int', { type: TYPE_TYPE }));
    expect(errs).not.toBeNull();
    expect(errs?.message).toContain('overlapping identifier');
  });

  // TODO: fix this test
  //   it('overlapping function', () => {
  //     const env = standardEnv();
  //     const errs = env.addFunctions(identDecl('int', { type: TYPE_TYPE }));
  //     console.log(errs);
  //     expect(errs).not.toBeNull();
  //     expect(errs?.message).toContain('overlapping identifier');
  //   });
});

function standardEnv() {
  const container = new CELContainer();
  const provider = new ProtoTypeRegistry();
  const env = new CheckerEnv(container, provider);
  env.addIdents(...STANDARD_IDENT_DECLARATIONS);
  env.addFunctions(...STANDARD_FUNCTION_DECLARATIONS);
  return env;
}
