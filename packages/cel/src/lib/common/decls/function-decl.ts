import {
  Decl,
  DeclSchema,
  Decl_FunctionDecl,
  Decl_FunctionDeclSchema,
  Decl_FunctionDecl_OverloadSchema,
  ReferenceSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { MessageInitShape, create } from '@bufbuild/protobuf';

export function functionDecl(
  name: string,
  init: MessageInitShape<typeof Decl_FunctionDeclSchema>
) {
  return create(DeclSchema, {
    name,
    declKind: {
      case: 'function',
      value: init,
    },
  });
}

export function isFunctionDecl(val: Decl): val is Decl & {
  declKind: { case: 'function'; value: Decl_FunctionDecl };
} {
  return val.declKind.case === 'function';
}

export function unwrapFunctionDecl(val: Decl) {
  if (isFunctionDecl(val)) {
    return val.declKind.value;
  }
  return null;
}

export function overloadDecl(
  init: MessageInitShape<typeof Decl_FunctionDecl_OverloadSchema>
) {
  return create(Decl_FunctionDecl_OverloadSchema, init);
}

export function functionReference(overloadId: string[]) {
  return create(ReferenceSchema, {
    overloadId,
  });
}
