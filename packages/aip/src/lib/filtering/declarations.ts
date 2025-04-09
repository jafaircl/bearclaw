import { isNil } from '@bearclaw/is';
import {
  Decl,
  Decl_FunctionDecl,
  Decl_FunctionDecl_Overload,
  Decl_FunctionDecl_OverloadSchema,
  DeclSchema,
  Type,
} from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/checked_pb.js';
import {
  Constant,
  ConstantSchema,
} from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/syntax_pb.js';
import {
  create,
  createMutableRegistry,
  DescEnum,
  DescField,
  DescMessage,
  equals,
  isMessage,
  MutableRegistry,
} from '@bufbuild/protobuf';
import { FunctionEquals, FunctionNotEquals } from './functions';
import { TypeBool, typeEnum } from './types';

/**
 * NewStringConstant creates a new string constant.
 */
export function newStringConstant(value: string) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'stringValue',
      value,
    },
  });
}

/**
 * NewFunctionDeclaration creates a new function declaration.
 */
export function newFunctionDeclaration(
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
 * NewFunctionOverload creates a new function overload.
 */
export function newFunctionOverload(
  id: string,
  result: Type,
  ...params: Type[]
) {
  return create(Decl_FunctionDecl_OverloadSchema, {
    overloadId: id,
    resultType: result,
    params,
  });
}

/**
 * NewIdentDeclaration creates a new ident declaration.
 */
export function newIdentDeclaration(name: string, type: Type) {
  return create(DeclSchema, {
    name,
    declKind: {
      case: 'ident',
      value: { type },
    },
  });
}

/**
 * NewConstantDeclaration creates a new constant ident declaration.
 */
export function newConstantDeclaration(
  name: string,
  type: Type,
  value: Constant
) {
  return create(DeclSchema, {
    name,
    declKind: {
      case: 'ident',
      value: { type, value },
    },
  });
}

/**
 * EnumDecl represents a declaration of an enum type.
 */
export interface EnumDecl {
  name: string;
  enum: DescEnum;
}

/**
 * NewEnumDeclaration creates a new enum declaration.
 */
export function newEnumDeclaration(name: string, _enum: DescEnum): EnumDecl {
  return {
    name,
    enum: _enum,
  };
}

export interface DeclarationsArgs {
  declarations: (Decl | EnumDecl)[];
  typeRegistry?: MutableRegistry;
}

/**
 * Declarations contain declarations for type-checking filter expressions.
 */
export class Declarations {
  private _idents: Map<string, Decl> = new Map();
  private _functions: Map<string, Decl> = new Map();
  private _enums: Map<string, DescEnum> = new Map();
  private _typeRegistry: MutableRegistry;

  constructor(args?: DeclarationsArgs) {
    for (const decl of args?.declarations ?? []) {
      this.declare(decl);
    }
    this._typeRegistry = args?.typeRegistry ?? createMutableRegistry();
  }

  lookupIdent(name: string): Decl | undefined {
    return this._idents.get(name);
  }

  lookupFunction(name: string): Decl | undefined {
    return this._functions.get(name);
  }

  lookupEnumIdent(name: string): DescEnum | undefined {
    return this._enums.get(name);
  }

  lookupMessage(name: string): DescMessage | undefined {
    return this._typeRegistry.getMessage(name);
  }

  lookupMessageField(name: string, fieldName: string): DescField | undefined {
    const message = this.lookupMessage(name);
    if (!message) {
      return undefined;
    }
    return message.fields.find((field) => field.name === fieldName);
  }

  declareIdent(decl: Decl) {
    if (decl.declKind?.case !== 'ident') {
      throw new Error(`Invalid ident decl: ${decl}`);
    }
    if (this._idents.has(decl.name)) {
      throw new Error(`redeclaration of ${decl.name}`);
    }
    this._idents.set(decl.name, decl);
  }

  declareConstant(decl: Decl) {
    if (decl.declKind?.case !== 'ident') {
      throw new Error(`Invalid constant decl: ${decl}`);
    }
    if (decl.declKind.value.value === null) {
      throw new Error(`Invalid constant decl: ${decl}`);
    }
    if (this._idents.has(decl.name)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const existingIdent = this._idents.get(decl.name)!;
      if (!equals(DeclSchema, decl, existingIdent)) {
        throw new Error(`redeclaration of ${decl.name}`);
      }
    }
    this._idents.set(decl.name, decl);
  }

  declareEnumIdent(name: string, _enum: DescEnum) {
    if (this._enums.has(name)) {
      throw new Error(`redeclaration of ${name}`);
    }
    this._enums.set(name, _enum);
    const enumIdentType = typeEnum(name);
    this.declareIdent(newIdentDeclaration(name, enumIdentType));
    for (const fn of [FunctionEquals, FunctionNotEquals]) {
      this.declareFunction(
        newFunctionDeclaration(
          fn,
          newFunctionOverload(
            `${fn}_${name}`,
            TypeBool,
            enumIdentType,
            enumIdentType
          )
        )
      );
    }
    const values = _enum.values;
    for (const value of values) {
      if (!this._idents.has(value.name)) {
        this.declareConstant(
          newConstantDeclaration(
            value.name,
            enumIdentType,
            newStringConstant(value.name)
          )
        );
      }
    }
  }

  declareFunction(decl: Decl) {
    if (decl.declKind?.case !== 'function') {
      throw new Error(`Invalid function decl: ${decl}`);
    }
    if (!this._functions.has(decl.name)) {
      this._functions.set(decl.name, decl);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fn = this._functions.get(decl.name)!;
    const newOverloads = decl.declKind.value.overloads ?? [];
    const existingOverloads =
      (fn.declKind.value as Decl_FunctionDecl).overloads ?? [];
    const combinedOverloads: Decl_FunctionDecl_Overload[] = [];
    for (const newOverload of newOverloads) {
      const existingOverload = existingOverloads.find(
        (o) => o.overloadId === newOverload.overloadId
      );
      if (!existingOverload) {
        combinedOverloads.push(newOverload);
        continue;
      }
      if (
        !equals(Decl_FunctionDecl_OverloadSchema, newOverload, existingOverload)
      ) {
        throw new Error(`redeclaration of overload ${newOverload.overloadId} `);
      }
      combinedOverloads.push(newOverload);
    }
    (fn.declKind.value as Decl_FunctionDecl).overloads = combinedOverloads;
    this._functions.set(fn.name, fn);
  }

  declare(decl: Decl | EnumDecl) {
    if (isMessage(decl, DeclSchema)) {
      switch (decl.declKind.case) {
        case 'function':
          return this.declareFunction(decl);
        case 'ident':
          if (!isNil(decl.declKind.value.value)) {
            return this.declareConstant(decl);
          }
          return this.declareIdent(decl);
        default:
          throw new Error(`Invalid decl: ${decl}`);
      }
    } else {
      this.declareEnumIdent(decl.name, decl.enum);
    }
  }
}
