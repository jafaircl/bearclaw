import {
  Decl,
  DeclSchema,
  Decl_IdentDecl,
  Decl_IdentDeclSchema,
  ReferenceSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { Constant } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { MessageInitShape, create } from '@bufbuild/protobuf';

export function identDecl(
  name: string,
  init: MessageInitShape<typeof Decl_IdentDeclSchema>
) {
  return create(DeclSchema, {
    name,
    declKind: {
      case: 'ident',
      value: init,
    },
  });
}

export function isIdentDecl(val: Decl): val is Decl & {
  declKind: { case: 'ident'; value: Decl_IdentDecl };
} {
  return val.declKind.case === 'ident';
}

export function unwrapIdentDecl(val: Decl) {
  if (isIdentDecl(val)) {
    return val.declKind.value;
  }
  return null;
}

export function identReference(name: string, value: Constant) {
  return create(ReferenceSchema, {
    name,
    value,
  });
}
