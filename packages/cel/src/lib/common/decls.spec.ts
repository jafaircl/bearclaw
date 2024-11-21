import { FunctionDecl, OverloadDecl } from './decls';
import { Sizer } from './types/traits/sizer';
import { IntType, newListType, newTypeParamType } from './types/types';
describe('decls', () => {
  it('should check', () => {
    expect(true).toBe(true);
  });

  it('function bindings', () => {
    const sizeFunc = new FunctionDecl({
      name: 'size',
      overloads: new Map([
        [
          'list_size',
          new OverloadDecl({
            id: 'list_size',
            argTypes: [newListType(newTypeParamType('T'))],
            resultType: IntType,
            isMemberFunction: true,
          }),
        ],
      ]),
    });
    let bindings = sizeFunc.bindings();
    expect(bindings.length).toEqual(0);

    const sizeFuncDef = new FunctionDecl({
      name: 'size',
      overloads: new Map([
        [
          'list_size',
          new OverloadDecl({
            id: 'list_size',
            argTypes: [newListType(newTypeParamType('T'))],
            resultType: IntType,
            isMemberFunction: true,
            unaryOp: (v) => (v as unknown as Sizer).size(),
          }),
        ],
      ]),
    });
    const sizeMerged = sizeFunc.merge(sizeFuncDef);
    bindings = sizeMerged.bindings();
    expect(bindings.length).toEqual(2);
  });

  // TODO: more decl tests
});
