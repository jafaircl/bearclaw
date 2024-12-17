import {
  Decl,
  Decl_FunctionDecl_Overload,
  Decl_FunctionDecl_OverloadSchema,
  DeclSchema,
  Type,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { Constant } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';

/**
 * NewFunction creates a named function declaration with one or more overloads.
 */
export function newFunctionProto(
  name: string,
  ...overloads: Decl_FunctionDecl_Overload[]
) {
  return create(DeclSchema, {
    name,
    declKind: {
      case: 'function',
      value: {
        overloads,
      },
    },
  });
}

/**
 * NewConst creates a constant identifier with a CEL constant literal value.
 */
export function newConstIdentDeclProto(
  name: string,
  type: Type,
  value: Constant
) {
  return create(DeclSchema, {
    name,
    declKind: {
      case: 'ident',
      value: {
        type,
        value,
      },
    },
  });
}

/**
 * IsConstIdentDeclProto determines if the declaration is a constant identifier.
 */
export function isConstIdentDeclProto(val: Decl): val is Decl & {
  declKind: {
    case: 'ident';
    value: {
      type: Type;
      value: Constant;
    };
  };
} {
  return (
    val.declKind.case === 'ident' &&
    val.declKind.value.value?.constantKind !== undefined
  );
}

/**
 * NewVar creates a variable identifier.
 */
export function newVarIdentDeclProto(name: string, type: Type) {
  return create(DeclSchema, {
    name,
    declKind: {
      case: 'ident',
      value: {
        type,
      },
    },
  });
}
/**
 * IsVarIdentDeclProto determines if the declaration is a variable identifier.
 */
export function isVarIdentDeclProto(val: Decl): val is Decl & {
  declKind: {
    case: 'ident';
    value: {
      type: Type;
    };
  };
} {
  return (
    val.declKind.case === 'ident' && val.declKind.value.value === undefined
  );
}

/**
 * NewInstanceOverload creates a instance function overload contract.
 * First element of argTypes is instance.
 */
export function newInstanceOverloadProto(
  id: string,
  argTypes: Type[],
  resultType: Type
) {
  return create(Decl_FunctionDecl_OverloadSchema, {
    overloadId: id,
    params: argTypes,
    resultType,
    isInstanceFunction: true,
  });
}

/**
 * NewOverload creates a function overload declaration which contains a unique
 * overload id as well as the expected argument and result types. Overloads
 * must be aggregated within a Function declaration.
 */
export function newOverloadProto(
  id: string,
  argTypes: Type[],
  resultType: Type
) {
  return create(Decl_FunctionDecl_OverloadSchema, {
    overloadId: id,
    params: argTypes,
    resultType,
    isInstanceFunction: false,
  });
}

/**
 * NewParameterizedInstanceOverload creates a parametric function instance
 * overload type.
 */
export function newParameterizedInstanceOverloadProto(
  id: string,
  argTypes: Type[],
  resultType: Type,
  typeParams: string[]
) {
  return create(Decl_FunctionDecl_OverloadSchema, {
    overloadId: id,
    params: argTypes,
    resultType,
    isInstanceFunction: true,
    typeParams,
  });
}

/**
 * NewParameterizedOverload creates a parametric function overload type.
 */
export function newParameterizedOverloadProto(
  id: string,
  argTypes: Type[],
  resultType: Type,
  typeParams: string[]
) {
  return create(Decl_FunctionDecl_OverloadSchema, {
    overloadId: id,
    params: argTypes,
    resultType,
    isInstanceFunction: false,
    typeParams,
  });
}
