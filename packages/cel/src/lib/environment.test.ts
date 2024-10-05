import { Type_PrimitiveType } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import { CELEnvironment } from './environment';
import { primitiveType } from './types';
import { identDecl } from './utils';

describe('CELEnvironment', () => {
  it('should create an environment', () => {
    const env = new CELEnvironment();
    expect(env).toBeDefined();
  });

  it('should throw an error when adding an overlapping identifier', () => {
    const decl = identDecl('is', {
      type: primitiveType(Type_PrimitiveType.STRING),
    });
    const env = new CELEnvironment({ declarations: [decl] });
    expect(() => env.addIdent(decl)).toThrowError(
      `overlapping identifier for name 'is'`
    );
  });
});
