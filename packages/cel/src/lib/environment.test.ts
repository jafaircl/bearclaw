import { CELEnvironment } from './environment';

describe('CELEnvironment', () => {
  it('should create an environment', () => {
    const env = new CELEnvironment();
    expect(env).toBeDefined();
  });

  //   it('should throw an error when adding an overlapping identifier', () => {
  //     const decl = identDecl('is', {
  //       type: primitiveType(Type_PrimitiveType.STRING),
  //     });
  //     const env = new CELEnvironment({ idents: [decl] });
  //     expect(() => env.addIdent(decl)).toThrowError(
  //       `overlapping identifier for name 'is'`
  //     );
  //   });
});
