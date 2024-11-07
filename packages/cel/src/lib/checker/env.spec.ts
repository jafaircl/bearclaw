import { CELContainer } from '../cel';
import { functionDecl, overloadDecl } from '../common/decls/function-decl';
import { identDecl } from '../common/decls/ident-decl';
import { ProtoTypeRegistry } from '../common/pb/proto-type-registry';
import {
  STANDARD_FUNCTION_DECLARATIONS,
  STANDARD_IDENT_DECLARATIONS,
} from '../common/standard';
import { BOOL_CEL_TYPE } from '../common/types/bool';
import { DYN_TYPE } from '../common/types/dyn';
import { TYPE_TYPE } from '../common/types/type';
import { CheckerEnv } from './env';

describe('CheckerEnv', () => {
  it('overlapping identifier', () => {
    const env = standardEnv();
    const errs = env.addIdents(identDecl('int', { type: TYPE_TYPE }));
    expect(errs).not.toBeNull();
    expect(errs?.message).toContain('overlapping identifier');
  });

  it('overlapping function', () => {
    const env = standardEnv();
    const errs = env.addFunctions(
      functionDecl('has', {
        overloads: [
          overloadDecl({
            isInstanceFunction: false,
            params: [DYN_TYPE],
            resultType: BOOL_CEL_TYPE,
          }),
        ],
      })
    );
    expect(errs).not.toBeNull();
    expect(errs?.message).toEqual(
      `overlapping macro for name 'has' with 1 args`
    );
  });
});

function standardEnv() {
  const container = new CELContainer();
  const provider = new ProtoTypeRegistry();
  const env = new CheckerEnv(container, provider);
  env.addIdents(...STANDARD_IDENT_DECLARATIONS);
  env.addFunctions(...STANDARD_FUNCTION_DECLARATIONS);
  return env;
}
