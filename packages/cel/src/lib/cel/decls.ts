/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from '@bearclaw/is';
import {
  Decl,
  DeclSchema,
  Type as ProtoType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { isMessage } from '@bufbuild/protobuf';
import {
  DeclarationState,
  FunctionDecl,
  newConstantDecl,
  newVariableDecl,
  OverloadDecl,
  VariableDecl,
} from '../common/decls';
import { BinaryOp, FunctionOp, UnaryOp } from '../common/functions';
import { protoConstantToRefVal } from '../common/pb/constants';
import { isRefVal } from '../common/ref/reference';
import { defaultTypeAdapter } from '../common/types/provider';
import { Trait } from '../common/types/traits/trait';
import {
  newListType,
  newMapType,
  newNullableType,
  newObjectType,
  newOpaqueType,
  newOptionalType,
  newTypeParamType,
  Type,
  AnyType as œAnyType,
  BoolType as œBoolType,
  BytesType as œBytesType,
  DoubleType as œDoubleType,
  DurationType as œDurationType,
  DynType as œDynType,
  exprTypeToType as œexprTypeToType,
  IntType as œIntType,
  Kind as œKind,
  NullType as œNullType,
  StringType as œStringType,
  TimestampType as œTimestampType,
  typeToExprType as œtypeToExprType,
  TypeType as œTypeType,
  UintType as œUintType,
} from '../common/types/types';
import { Overload } from './../common/functions';

/**
 * Kind indicates a CEL type's kind which is used to differentiate quickly
 * between simple and complex œ
 */
export enum Kind {
  /**
   * DynKind represents a dynamic type. This kind only exists at type-check
   * time.
   */
  DynKind = œKind.DYN,

  /**
   * AnyKind represents a google.protobuf.Any type. This kind only exists at
   * type-check time.
   */
  AnyKind = œKind.ANY,

  /**
   * BoolKind represents a boolean type.
   */
  BoolKind = œKind.BOOL,

  /**
   * BytesKind represents a bytes type.
   */
  BytesKind = œKind.BYTES,

  /**
   * DoubleKind represents a double type.
   */
  DoubleKind = œKind.DOUBLE,

  /**
   * DurationKind represents a CEL duration type.
   */
  DurationKind = œKind.DURATION,

  /**
   * IntKind represents an integer type.
   */
  IntKind = œKind.INT,

  /**
   * ListKind represents a list type.
   */
  ListKind = œKind.LIST,

  /**
   * MapKind represents a map type.
   */
  MapKind = œKind.MAP,

  /**
   * NullTypeKind represents a null type.
   */
  NullTypeKind = œKind.NULL,

  /**
   * OpaqueKind represents an abstract type which has no accessible fields.
   */
  OpaqueKind = œKind.OPAQUE,

  /**
   * StringKind represents a string type.
   */
  StringKind = œKind.STRING,

  /**
   * StructKind represents a structured object with typed fields.
   */
  StructKind = œKind.STRUCT,

  /**
   * TimestampKind represents a a CEL time type.
   */
  TimestampKind = œKind.TIMESTAMP,

  /**
   * TypeKind represents the CEL type.
   */
  TypeKind = œKind.TYPE,

  /**
   * TypeParamKind represents a parameterized type whose type name will be
   * resolved at type-check time, if possible.
   */
  TypeParamKind = œKind.TYPEPARAM,

  /**
   * UintKind represents a uint type.
   */
  UintKind = œKind.UINT,
}

/**
 * AnyType represents the google.protobuf.Any type.
 */
export const AnyType = œAnyType;

/**
 * BoolType represents the bool type.
 */
export const BoolType = œBoolType;

/**
 * BytesType represents the bytes type.
 */
export const BytesType = œBytesType;

/**
 * DoubleType represents the double type.
 */
export const DoubleType = œDoubleType;

/**
 * DurationType represents the CEL duration type.
 */
export const DurationType = œDurationType;

/**
 * DynType represents a dynamic CEL type whose type will be determined at
 * runtime from context.
 */
export const DynType = œDynType;

/**
 * IntType represents the int type.
 */
export const IntType = œIntType;

/**
 * NullType represents the type of a null value.
 */
export const NullType = œNullType;

/**
 * StringType represents the string type.
 */
export const StringType = œStringType;

/**
 * TimestampType represents the time type.
 */
export const TimestampType = œTimestampType;

/**
 * TypeType represents a CEL type
 */
export const TypeType = œTypeType;

/**
 * UintType represents a uint type.
 */
export const UintType = œUintType;

// function references for instantiating new types.

/**
 * ListType creates an instances of a list type value with the provided element
 * type.
 */
export function listType(elemType: Type) {
  return newListType(elemType);
}

/**
 * MapType creates an instance of a map type value with the provided key and
 * value types.
 */
export function mapType(keyType: Type, valType: Type) {
  return newMapType(keyType, valType);
}

/**
 * NullableType creates an instance of a nullable type with the provided
 * wrapped type.
 *
 * Note: only primitive types are supported as wrapped types.
 */
export function nullableType(wrappedType: Type) {
  return newNullableType(wrappedType);
}

/**
 * OptionalType creates an abstract parameterized type instance corresponding
 * to CEL's notion of optional.
 */
export function optionalType(param: Type) {
  return newOptionalType(param);
}

/**
 * OpaqueType creates an abstract parameterized type with a given name.
 */
export function opaqueType(name: string) {
  return newOpaqueType(name);
}

/**
 * ObjectType creates a type references to an externally defined type, e.g. a
 * protobuf message type.
 */
export function objectType(typeName: string) {
  return newObjectType(typeName);
}

/**
 * TypeParamType creates a parameterized type instance.
 */
export function typeParamType(paramName: string) {
  return newTypeParamType(paramName);
}

export { Type };

/**
 * Constant creates an instances of an identifier declaration with a variable
 * name, type, and value.
 */
export function constant(name: string, type: Type, value: any) {
  if (!isRefVal(value)) {
    value = defaultTypeAdapter.nativeToValue(value);
  }
  return newConstantDecl(name, type, value);
}

/**
 * Variable creates an instance of a variable declaration with a variable name
 * and type.
 */
export function variable(name: string, type: Type) {
  return newVariableDecl(name, type);
}

interface FuncOptionsBase {
  /**
   * DisableTypeGuards disables automatically generated function invocation
   * guards on direct overload calls.
   *
   * Type guards remain on during dynamic dispatch for parsed-only expressions.
   */
  disableTypeGuards?: boolean;
  /**
   * DisableDeclaration indicates that the function declaration should be
   * disabled, but the runtime function binding should be provided. Marking a
   * function as runtime-only is a safe way to manage deprecations of function
   * declarations while still preserving the runtime behavior for previously
   * compiled expressions.
   */
  disableDeclaration?: boolean;
}

interface SingletonUnaryBinding {
  /**
   * SingletonUnaryBinding creates a singleton function definition to be used
   * for all function overloads.
   *
   * Note, this approach works well if operand is expected to have a specific
   * trait which it implements, e.g. traits.ContainerType. Otherwise, prefer
   * per-overload function bindings.
   */
  singletonUnaryBinding?: {
    function: UnaryOp;
    traits?: Trait[];
    nonStrict?: boolean;
  };
  singletonBinaryBinding?: undefined;
  singletonFunctionBinding?: undefined;
}

interface SingletonBinaryBinding {
  singletonUnaryBinding?: undefined;
  /**
   * SingletonBinaryBinding creates a singleton function definition to be used
   * with all function overloads.
   *
   * Note, this approach works well if operand is expected to have a specific
   * trait which it implements, e.g. traits.ContainerType. Otherwise, prefer
   * per-overload function bindings.
   */
  singletonBinaryBinding?: {
    function: BinaryOp;
    traits?: Trait[];
    nonStrict?: boolean;
  };
  singletonFunctionBinding?: undefined;
}

interface SingletonFunctionBinding {
  singletonUnaryBinding?: undefined;
  singletonBinaryBinding?: undefined;
  /**
   * SingletonFunctionBinding creates a singleton function definition to be
   * used with all function overloads.
   *
   * Note, this approach works well if operand is expected to have a specific
   * trait which it implements, e.g. traits.ContainerType. Otherwise, prefer
   * per-overload function bindings.
   */
  singletonFunctionBinding?: {
    function: FunctionOp;
    traits?: Trait[];
    nonStrict?: boolean;
  };
}

export type FuncOptions = FuncOptionsBase &
  (SingletonUnaryBinding | SingletonBinaryBinding | SingletonFunctionBinding);

/**
 * Func defines a function and overloads with optional singleton or
 * per-overload bindings.
 *
 * Specifying the same function name more than once will result in the
 * aggregation of the function overloads. If any signatures conflict between
 * the existing and new function definition an error will be raised.
 *
 * However, if the signatures are identical and the overload ids are the same,
 * the redefinition will be considered a no-op.
 *
 * One key difference with using Function() is that each FunctionDecl provided
 * will handle dynamic dispatch based on the type-signatures of the overloads
 * provided which means overload resolution at runtime is handled out of the
 * box rather than via a custom binding for overload resolution via Functions():
 * - Overloads are searched in the order they are declared
 * - Dynamic dispatch for lists and maps is limited by inspection of the list
 * and map contents at runtime. Empty lists and maps will result in a 'default
 * dispatch'
 * - In the event that a default dispatch occurs, the first overload provided
 * is the one invoked
 *
 * If you intend to use overloads which differentiate based on the key or
 * element type of a list or map, consider using a generic function instead:
 * e.g. func(list(T)) or func(map(K, V)) as this will allow your implementation
 * to determine how best to handle dispatch and the default behavior for empty
 * lists and maps whose contents cannot be inspected. For functions which use
 * parameterized opaque types (abstract types), consider using a singleton
 * function which is capable of inspecting the contents of the type and
 * resolving the appropriate overload as CEL can only make inferences by
 * type-name regarding such types.
 */
export function func(
  name: string,
  overloads: OverloadDecl[],
  options?: FuncOptions
) {
  // A user should not be able to declare multiple singleton bindings.
  const bindings = [
    options?.singletonUnaryBinding,
    options?.singletonBinaryBinding,
    options?.singletonFunctionBinding,
  ];
  if (bindings.filter((b) => !isNil(b)).length > 1) {
    throw new Error('multiple singleton bindings are not allowed');
  }
  let singleton: Overload | undefined = undefined;
  if (!isNil(options?.singletonUnaryBinding)) {
    singleton = new Overload({
      operator: name,
      unary: options.singletonUnaryBinding.function,
      operandTraits: options.singletonUnaryBinding.traits,
      nonStrict: options.singletonUnaryBinding.nonStrict,
    });
  }
  if (!isNil(options?.singletonBinaryBinding)) {
    singleton = new Overload({
      operator: name,
      binary: options.singletonBinaryBinding.function,
      operandTraits: options.singletonBinaryBinding.traits,
      nonStrict: options.singletonBinaryBinding.nonStrict,
    });
  }
  if (!isNil(options?.singletonFunctionBinding)) {
    singleton = new Overload({
      operator: name,
      function: options.singletonFunctionBinding.function,
      operandTraits: options.singletonFunctionBinding.traits,
      nonStrict: options.singletonFunctionBinding.nonStrict,
    });
  }
  return new FunctionDecl({
    name,
    overloads,
    disableTypeGuards: options?.disableTypeGuards,
    state: options?.disableDeclaration
      ? DeclarationState.DISABLED
      : DeclarationState.ENABLED,
    singleton,
  });
}

interface OverloadOptionsBase {
  /**
   * OverloadIsNonStrict enables the function to be called with error and
   * unknown argument values.
   *
   * Note: do not use this option unless absoluately necessary as it should be
   * an uncommon feature.
   */
  isNonStrict?: boolean;
  /**
   * OverloadOperandTrait configures a set of traits which the first argument
   * to the overload must implement in order to be successfully invoked.
   */
  operandTraits?: Trait[];
}

interface OverloadUnaryBinding {
  /**
   * UnaryBinding provides the implementation of a unary overload. The provided
   * function is protected by a runtime type-guard which ensures runtime type
   * agreement between the overload signature and runtime argument types.
   */
  unaryBinding?: UnaryOp;
  binaryBinding?: undefined;
  functionBinding?: undefined;
}

interface OverloadBinaryBinding {
  unaryBinding?: undefined;
  /**
   * BinaryBinding provides the implementation of a binary overload. The
   * provided function is protected by a runtime type-guard which ensures
   * runtime type agreement between the overload signature and runtime argument
   * types.
   */
  binaryBinding?: BinaryOp;
  functionBinding?: undefined;
}

interface OverloadFunctionBinding {
  unaryBinding?: undefined;
  binaryBinding?: undefined;
  /**
   * FunctionBinding provides the implementation of a variadic overload. The
   * provided function is protected by a runtime type-guard which ensures
   * runtime type agreement between the overload signature and runtime argument
   * types.
   */
  functionBinding?: FunctionOp;
}

export type OverloadOptions = OverloadOptionsBase &
  (OverloadUnaryBinding | OverloadBinaryBinding | OverloadFunctionBinding);

/**
 * Overload defines a new global overload with an overload id, argument types, and result type. Through the use of OverloadOpt options, the overload may also be configured with a binding, an operand trait, and to be non-strict.
 *
 * Note: function bindings should be commonly configured with Overload instances whereas operand traits and strict-ness should be rare occurrences.
 */
export function overload(
  overloadID: string,
  args: Type[],
  resultType: Type,
  options?: OverloadOptions
) {
  return new OverloadDecl({
    id: overloadID,
    argTypes: args,
    resultType,
    isMemberFunction: false,
    nonStrict: options?.isNonStrict,
    operandTraits: options?.operandTraits,
    unaryOp: options?.unaryBinding,
    binaryOp: options?.binaryBinding,
    functionOp: options?.functionBinding,
  });
}

/**
 * MemberOverload defines a new receiver-style overload (or member function)
 * with an overload id, argument types, and result type. Through the use of
 * OverloadOpt options, the overload may also be configured with a binding, an
 * operand trait, and to be non-strict.'
 *
 * Note: function bindings should be commonly configured with Overload
 * instances whereas operand traits and strict-ness should be rare occurrences.
 */
export function memberOverload(
  overloadID: string,
  args: Type[],
  resultType: Type,
  options?: OverloadOptions
) {
  return new OverloadDecl({
    id: overloadID,
    argTypes: args,
    resultType,
    isMemberFunction: true,
    nonStrict: options?.isNonStrict,
    operandTraits: options?.operandTraits,
    unaryOp: options?.unaryBinding,
    binaryOp: options?.binaryBinding,
    functionOp: options?.functionBinding,
  });
}

/**
 * TypeToExprType converts a CEL-native type representation to a protobuf CEL
 * Type representation.
 */
export function typeToExprType(type: Type) {
  return œtypeToExprType(type);
}

/**
 * ExprTypeToType converts a protobuf CEL type representation to a CEL-native
 * type representation.
 */
export function exprTypeToType(exprType: ProtoType) {
  return œexprTypeToType(exprType);
}

/**
 * ExprDeclToDeclaration converts a protobuf CEL declaration to a CEL-native
 * declaration, either a Variable or Function.
 */
export function exprDeclToDeclaration(decl: Decl) {
  switch (decl.declKind.case) {
    case 'function':
      const overloads: OverloadDecl[] = [];
      for (const o of decl.declKind.value.overloads) {
        const args: Type[] = [];
        for (const arg of o.params) {
          const a = exprTypeToType(arg);
          if (a instanceof Error) {
            return a;
          }
          args.push(a);
        }
        let resultType: Type | Error = DynType;
        if (!isNil(o.resultType)) {
          resultType = exprTypeToType(o.resultType);
        }
        if (resultType instanceof Error) {
          return resultType;
        }
        if (o.isInstanceFunction === true) {
          overloads.push(memberOverload(o.overloadId, args, resultType));
        } else {
          overloads.push(overload(o.overloadId, args, resultType));
        }
      }
      return func(decl.name, overloads);
    case 'ident':
      if (isNil(decl.declKind.value.type)) {
        return variable(decl.name, DynType);
      }
      const t = exprTypeToType(decl.declKind.value.type);
      if (t instanceof Error) {
        return t;
      }
      if (isNil(decl.declKind.value.value)) {
        return variable(decl.name, t);
      }
      return constant(
        decl.name,
        t,
        protoConstantToRefVal(decl.declKind.value.value)
      );
    default:
      return new Error(`unsupported decl: ${decl.declKind.case}`);
  }
}

/**
 * Declaration represents a union of all possible declaration types. This type
 * is used to extend the set of declarations available in the environment. A
 * Declaration can be a proto-based declaration, a CEL-native VariableDecl, or a
 * CEL-native FunctionDecl.
 */
export type Declaration = Decl | VariableDecl | FunctionDecl;

export function unwrapDeclaration(
  decl: Declaration
): VariableDecl | FunctionDecl {
  if (decl instanceof VariableDecl) {
    return decl;
  }
  if (decl instanceof FunctionDecl) {
    return decl;
  }
  if (isMessage(decl, DeclSchema)) {
    const parsed = exprDeclToDeclaration(decl);
    if (parsed instanceof Error) {
      throw parsed;
    }
    return parsed;
  }
  throw new Error(`unsupported declaration type: ${decl}`);
}
