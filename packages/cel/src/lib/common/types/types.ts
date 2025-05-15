/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
import { isNil } from '@bearclaw/is';
import {
  Type as ProtoType,
  Type_PrimitiveType,
  Type_WellKnownType,
} from '../../protogen/cel/expr/checked_pb.js';
import {
  AnyProtoType,
  BoolProtoType,
  BytesProtoType,
  DoubleProtoType,
  DurationProtoType,
  DynProtoType,
  ErrorProtoType,
  IntProtoType,
  newAbstractProtoType,
  newListProtoType,
  newMapProtoType,
  newObjectProtoType,
  newPrimitiveProtoType,
  newTypeParamProtoType,
  newTypeProtoType,
  newWrapperProtoType,
  NullProtoType,
  StringProtoType,
  TimestampProtoType,
  UintProtoType,
} from '../pb/types';
import { RefType, RefVal } from '../ref/reference';
import { reverseMap } from '../utils';
import { BoolRefVal } from './bool';
import { ErrorRefVal } from './error';
import { IntRefVal } from './int';
import { NativeType } from './native';
import { StringRefVal } from './string';
import { Lister } from './traits/lister';
import { Mapper } from './traits/mapper';
import { AllTraits, Trait } from './traits/trait';
import { sanitizeProtoName } from './utils';

export enum Kind {
  /**
   * AnyKind represents a google.protobuf.Any type. This kind only exists at
   * type-check time. Prefer DynKind to AnyKind as AnyKind has a specific
   * meaning which is based on protobuf well-known types.
   */
  ANY,
  /**
   * BoolKind represents a boolean type.
   */
  BOOL,
  /**
   * BytesKind represents a bytes type.
   */
  BYTES,
  /**
   * DoubleKind represents a double type.
   */
  DOUBLE,
  /**
   * DurationKind represents a CEL duration type.
   */
  DURATION,
  /**
   * DynKind represents a dynamic type. This kind only exists at type-check
   * time.
   */
  DYN,
  /**
   * ErrorKind represents a CEL error type.
   */
  ERROR,
  /**
   * IntKind represents an integer type.
   */
  INT,
  /**
   * ListKind represents a list type.
   */
  LIST,
  /**
   * MapKind represents a map type.
   */
  MAP,
  /**
   * NullTypeKind represents a null type.
   */
  NULL,
  /**
   * OpaqueKind represents an abstract type which has no accessible fields.
   */
  OPAQUE,
  /**
   * StringKind represents a string type.
   */
  STRING,
  /**
   * StructKind represents a structured object with typed fields.
   */
  STRUCT,
  /**
   * TimestampKind represents a a CEL time type.
   */
  TIMESTAMP,
  /**
   * TypeKind represents the CEL type.
   */
  TYPE,
  /**
   * TypeParamKind represents a parameterized type whose type name will be
   * resolved at type-check time, if possible.
   */
  TYPEPARAM,
  /**
   * UintKind represents a uint type.
   */
  UINT,
  /**
   * UnknownKind represents an unknown value type.
   */
  UNKNOWN,
  /**
   * UnspecifiedKind is returned when the type is nil or its kind is not
   * specified.
   */
  UNSPECIFIED,
}

interface TypeOptions {
  /**
   * kind indicates general category of the type.
   */
  kind: Kind;

  /**
   * parameters holds the optional type-checked set of type Parameters that are
   * used during static analysis.
   */
  parameters?: Type[];

  /**
   * runtimeTypeName indicates the runtime type name of the type.
   */
  runtimeTypeName: string;

  /**
   * isAssignableType function determines whether one type is assignable to
   * this type.
   *
   * A nil value for the isAssignableType function falls back to equality of
   * kind, runtimeType, and parameters.
   */
  isAssignableType?: (other: Type) => boolean;

  /**
   * isAssignableRuntimeType function determines whether the runtime type (with
   * erasure) is assignable to this type.
   *
   * A nil value for the isAssignableRuntimeType function falls back to the
   * equality of the type or type name.
   */
  isAssignableRuntimeType?: (other: RefVal) => boolean;

  /**
   * traitMask is a mask of flags which indicate the capabilities of the type.
   */
  traitMask?: Set<Trait>;
}

/**
 * Type holds a reference to a runtime type with an optional
 * type-checked set of type parameters.
 */
export class Type implements RefType, RefVal {
  private readonly _kind: Kind;
  private readonly _parameters: Type[];
  private readonly _runtimeTypeName: string;
  private readonly _isAssignableType?: (other: Type) => boolean;
  private readonly _isAssignableRuntimeType?: (other: RefVal) => boolean;
  private readonly _traitMask: Set<Trait>;

  constructor(opts: TypeOptions) {
    this._kind = opts.kind;
    this._parameters = opts.parameters || [];
    this._runtimeTypeName = opts.runtimeTypeName;
    this._isAssignableType = opts.isAssignableType;
    this._isAssignableRuntimeType = opts.isAssignableRuntimeType;
    this._traitMask = opts.traitMask || new Set();
  }

  get traitMask() {
    return this._traitMask;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  convertToNative(type: NativeType) {
    return new ErrorRefVal(`type conversion not supported for 'type'`);
  }

  convertToType(type: RefType): RefVal {
    switch (type) {
      case TypeType:
        return TypeType;
      case StringType:
        return new StringRefVal(this.typeName());
      default:
        return ErrorRefVal.typeConversionError(this, type);
    }
  }

  kind(): Kind {
    return this._kind;
  }

  parameters() {
    return this._parameters;
  }

  hasTrait(trait: Trait): boolean {
    return this._traitMask.has(trait);
  }

  hasTraits(traits: Trait[]): boolean {
    for (const t of traits) {
      if (!this.hasTrait(t)) {
        return false;
      }
    }
    return true;
  }

  typeName(): string {
    return this._runtimeTypeName;
  }

  /**
   * DeclaredTypeName indicates the fully qualified and parameterized
   * type-check type name.
   */
  declaredTypeName(): string {
    // if the type itself is neither null, nor dyn, but is assignable to null, then it's a wrapper type.
    if (
      this.kind() != Kind.NULL &&
      !this.isDyn() &&
      this.isAssignableType(NullType)
    ) {
      return `wrapper(${this.typeName()})`;
    }
    return this.typeName();
  }

  equal(other: RefVal): RefVal {
    if (isType(other)) {
      return new BoolRefVal(this.isExactType(other));
    }
    return new BoolRefVal(this.typeName() === other.type().typeName());
  }

  type(): RefType {
    return TypeType;
  }

  value() {
    return this.typeName();
  }

  isAssignableType(other: Type): boolean {
    if (this._isAssignableType) {
      return this._isAssignableType(other);
    }
    return this._defaultIsAssignableType(other);
  }

  isAssignableRuntimeType(other: RefVal): boolean {
    if (this._isAssignableRuntimeType) {
      return this._isAssignableRuntimeType(other);
    }
    return this._defaultIsAssignableRuntimeType(other);
  }

  toString(): string {
    if (this.parameters().length == 0) {
      return this.typeName();
    }
    return `${this.typeName()}(${this.parameters()
      .map((p) => p.toString())
      .join(', ')})`;
  }

  /**
   * isDyn indicates whether the type is dynamic in any way.
   */
  isDyn(): boolean {
    return (
      this.kind() === Kind.DYN ||
      this.kind() === Kind.ANY ||
      this.kind() === Kind.TYPEPARAM
    );
  }

  /**
   * IsExactType indicates whether the two types are exactly the same. This
   * check also verifies type parameter type names.
   */
  isExactType(other: Type): boolean {
    return this._isTypeInternal(other, true);
  }

  /**
   * IsEquivalentType indicates whether two types are equivalent. This check
   * ignores type parameter type names.
   */
  isEquivalentType(other: Type): boolean {
    return this._isTypeInternal(other, false);
  }

  /**
   * defaultIsAssignableType provides the standard definition of what it means
   * for one type to be assignable to another where any of the following may
   * return a true result:
   * - The from types are the same instance
   * - The target type is dynamic
   * - The fromType has the same kind and type name as the target type, and all
   * parameters of the target type are IsAssignableType() from the parameters
   * of the fromType.
   */
  private _defaultIsAssignableType(fromType: Type): boolean {
    if (this === fromType || this.isDyn()) {
      return true;
    }
    if (
      this.kind() !== fromType.kind() ||
      this.typeName() !== fromType.typeName() ||
      this.parameters().length !== fromType.parameters().length
    ) {
      return false;
    }
    for (let i = 0; i < this.parameters().length; i++) {
      if (!this.parameters()[i].isAssignableType(fromType.parameters()[i])) {
        return false;
      }
    }
    return true;
  }

  /**
   * defaultIsAssignableRuntimeType inspects the type and in the case of list
   * and map elements, the key and element types to determine whether a ref.Val
   * is assignable to the declared type for a function signature.
   */
  private _defaultIsAssignableRuntimeType(val: RefVal): boolean {
    const valType = val.type();
    // If the current type and value type don't agree, then return
    if (!(this.isDyn() || this.typeName() == valType.typeName())) {
      return false;
    }
    switch (this.kind()) {
      case Kind.LIST:
        const elemType = this.parameters()[0];
        const l = val as Lister;
        if (l.size().value() === IntRefVal.IntZero.value()) {
          return true;
        }
        const it = l.iterator();
        const elemVal = it.next();
        if (isNil(elemVal)) {
          return false;
        }
        return elemType.isAssignableRuntimeType(elemVal);
      case Kind.MAP:
        const keyType = this.parameters()[0];
        const valType = this.parameters()[1];
        const m = val as Mapper;
        if (m.size().value() === IntRefVal.IntZero.value()) {
          return true;
        }
        const mit = m.iterator();
        const keyVal = mit.next();
        if (isNil(keyVal)) {
          return false;
        }
        const valVal = m.get(keyVal);
        return (
          keyType.isAssignableRuntimeType(keyVal) &&
          valType.isAssignableRuntimeType(valVal)
        );
      default:
        return true;
    }
  }

  /**
   * isTypeInternal checks whether the two types are equivalent or exactly the
   * same based on the checkTypeParamName flag.
   */
  protected _isTypeInternal(other: Type, checkTypeParamName: boolean): boolean {
    if (this === other) {
      return true;
    }
    if (
      this.kind() !== other.kind() ||
      this.parameters().length !== other.parameters().length
    ) {
      return false;
    }
    if (
      (checkTypeParamName || this.kind() != Kind.TYPEPARAM) &&
      this.typeName() != other.typeName()
    ) {
      return false;
    }
    for (let i = 0; i < this.parameters().length; i++) {
      if (
        !this.parameters()[i]._isTypeInternal(
          other.parameters()[i],
          checkTypeParamName
        )
      ) {
        return false;
      }
    }
    return true;
  }
}

export function isType(val: any): val is Type {
  return val instanceof Type;
}

/**
 * AnyType represents the google.protobuf.Any type.
 */
export const AnyType = new Type({
  kind: Kind.ANY,
  runtimeTypeName: 'google.protobuf.Any',
  traitMask: new Set([Trait.FIELD_TESTER_TYPE, Trait.INDEXER_TYPE]),
});

/**
 * BoolType represents the bool type.
 */
export const BoolType = new Type({
  kind: Kind.BOOL,
  runtimeTypeName: 'bool',
  traitMask: new Set([Trait.COMPARER_TYPE, Trait.NEGATER_TYPE]),
});

/**
 * BytesType represents the bytes type.
 */
export const BytesType = new Type({
  kind: Kind.BYTES,
  runtimeTypeName: 'bytes',
  traitMask: new Set([Trait.ADDER_TYPE, Trait.COMPARER_TYPE, Trait.SIZER_TYPE]),
});

/**
 * DoubleType represents the double type.
 */
export const DoubleType = new Type({
  kind: Kind.DOUBLE,
  runtimeTypeName: 'double',
  traitMask: new Set([
    Trait.ADDER_TYPE,
    Trait.COMPARER_TYPE,
    Trait.DIVIDER_TYPE,
    Trait.MULTIPLIER_TYPE,
    Trait.NEGATER_TYPE,
    Trait.SUBTRACTOR_TYPE,
  ]),
});

/**
 * DurationType represents the CEL duration type.
 */
export const DurationType = new Type({
  kind: Kind.DURATION,
  runtimeTypeName: 'google.protobuf.Duration',
  traitMask: new Set([
    Trait.ADDER_TYPE,
    Trait.COMPARER_TYPE,
    Trait.NEGATER_TYPE,
    Trait.RECEIVER_TYPE,
    Trait.SUBTRACTOR_TYPE,
  ]),
});

/**
 * DynType represents a dynamic CEL type whose type will be determined at
 * runtime from context.
 */
export const DynType = new Type({
  kind: Kind.DYN,
  runtimeTypeName: 'dyn',
});

/**
 * ErrorType represents the CEL error value
 */
export const ErrorType = new Type({
  kind: Kind.ERROR,
  runtimeTypeName: 'error',
});

/**
 * IntType represents the int type.
 */
export const IntType = new Type({
  kind: Kind.INT,
  runtimeTypeName: 'int',
  traitMask: new Set([
    Trait.ADDER_TYPE,
    Trait.COMPARER_TYPE,
    Trait.DIVIDER_TYPE,
    Trait.MODDER_TYPE,
    Trait.MULTIPLIER_TYPE,
    Trait.NEGATER_TYPE,
    Trait.SUBTRACTOR_TYPE,
  ]),
});

/**
 * ListType represents the runtime list type.
 */
export const ListType = newListType();

/**
 * MapType represents the runtime map type.
 */
export const MapType = newMapType();

/**
 * NullType represents the type of a null value.
 */
export const NullType = new Type({
  kind: Kind.NULL,
  runtimeTypeName: 'null_type',
});

/**
 * StringType represents the string type.
 */
export const StringType = new Type({
  kind: Kind.STRING,
  runtimeTypeName: 'string',
  traitMask: new Set([
    Trait.ADDER_TYPE,
    Trait.COMPARER_TYPE,
    Trait.MATCHER_TYPE,
    Trait.RECEIVER_TYPE,
    Trait.SIZER_TYPE,
  ]),
});

/**
 * Timestamp represnets the time type
 */
export const TimestampType = new Type({
  kind: Kind.TIMESTAMP,
  runtimeTypeName: 'google.protobuf.Timestamp',
  traitMask: new Set([
    Trait.ADDER_TYPE,
    Trait.COMPARER_TYPE,
    Trait.RECEIVER_TYPE,
    Trait.SUBTRACTOR_TYPE,
  ]),
});

/**
 * TypeType represents a CEL type.
 */
export const TypeType = new Type({
  kind: Kind.TYPE,
  runtimeTypeName: 'type',
});

/**
 * UintType represents the uint type.
 */
export const UintType = new Type({
  kind: Kind.UINT,
  runtimeTypeName: 'uint',
  traitMask: new Set([
    Trait.ADDER_TYPE,
    Trait.COMPARER_TYPE,
    Trait.DIVIDER_TYPE,
    Trait.MODDER_TYPE,
    Trait.MULTIPLIER_TYPE,
    Trait.SUBTRACTOR_TYPE,
  ]),
});

/**
 * UnknownType represents an unknown type.
 */
export const UnknownType = new Type({
  kind: Kind.UNKNOWN,
  runtimeTypeName: 'unknown',
});

/**
 * Determine if a Type is a well-known type.
 */
export function isWellKnownType(type: Type) {
  switch (type.kind()) {
    case Kind.ANY:
    case Kind.TIMESTAMP:
    case Kind.DURATION:
    case Kind.DYN:
    case Kind.NULL:
      return true;
    case Kind.BOOL:
    case Kind.BYTES:
    case Kind.DOUBLE:
    case Kind.INT:
    case Kind.STRING:
    case Kind.UINT:
      return type.isAssignableType(NullType);
    case Kind.LIST:
      return type.parameters()[0] === DynType;
    case Kind.MAP:
      return (
        type.parameters()[0] === StringType && type.parameters()[1] === DynType
      );
    default:
      return false;
  }
}

export const checkedWellKnowns = new Map<string, Type>([
  // Wrapper types
  ['google.protobuf.BoolValue', newNullableType(BoolType)],
  ['google.protobuf.BytesValue', newNullableType(BytesType)],
  ['google.protobuf.DoubleValue', newNullableType(DoubleType)],
  ['google.protobuf.FloatValue', newNullableType(DoubleType)],
  ['google.protobuf.Int32Value', newNullableType(IntType)],
  ['google.protobuf.Int64Value', newNullableType(IntType)],
  ['google.protobuf.UInt32Value', newNullableType(UintType)],
  ['google.protobuf.UInt64Value', newNullableType(UintType)],
  ['google.protobuf.StringValue', newNullableType(StringType)],

  // Well-known types
  ['google.protobuf.Any', AnyType],
  ['google.protobuf.Duration', DurationType],
  ['google.protobuf.Timestamp', TimestampType],

  // Json types
  ['google.protobuf.ListValue', newListType(DynType)],
  ['google.protobuf.NullValue', NullType],
  ['google.protobuf.Struct', newMapType(StringType, DynType)],
  ['google.protobuf.Value', DynType],
]);

/**
 * GetCheckedWellKnown returns a well-known type by name.
 */
export function getCheckedWellKnown(typeName: string) {
  typeName = sanitizeProtoName(typeName);
  return checkedWellKnowns.get(typeName);
}

export const wellKnownTypeNameKindMap = reverseMap(checkedWellKnowns);

/**
 * GetWellKnownTypeName returns the well-known type name for a given type.
 */
export function getWellKnownTypeName(type: Type) {
  return wellKnownTypeNameKindMap.get(type);
}

/**
 * NewListType creates an instances of a list type value with the provided
 * element type.
 */
export function newListType(elemType?: Type) {
  const parameters = elemType ? [elemType] : [];
  return new Type({
    kind: Kind.LIST,
    runtimeTypeName: `list`,
    parameters,
    traitMask: new Set([
      Trait.ADDER_TYPE,
      Trait.CONTAINER_TYPE,
      Trait.INDEXER_TYPE,
      Trait.ITERABLE_TYPE,
      Trait.SIZER_TYPE,
    ]),
  });
}

/**
 * NewMapType creates an instance of a map type value with the provided key and
 * value types.
 */
export function newMapType(keyType?: Type, valueType?: Type) {
  const parameters = [];
  if (!isNil(keyType)) {
    parameters.push(keyType);
  }
  if (!isNil(valueType)) {
    parameters.push(valueType);
  }
  return new Type({
    kind: Kind.MAP,
    runtimeTypeName: `map`,
    parameters,
    traitMask: new Set([
      Trait.CONTAINER_TYPE,
      Trait.INDEXER_TYPE,
      Trait.ITERABLE_TYPE,
      Trait.SIZER_TYPE,
    ]),
  });
}

/**
 * NewNullableType creates an instance of a nullable type with the provided
 * wrapped type.
 *
 * Note: only primitive types are supported as wrapped types.
 */
export function newNullableType(wrapped: Type) {
  return new Type({
    kind: wrapped.kind(),
    parameters: wrapped.parameters(),
    runtimeTypeName: wrapped.typeName(),
    traitMask: wrapped.traitMask,
    isAssignableType: (other) =>
      NullType.isAssignableType(other) || wrapped.isAssignableType(other),
    isAssignableRuntimeType: (other) =>
      NullType.isAssignableRuntimeType(other) ||
      wrapped.isAssignableRuntimeType(other),
  });
}

/**
 * NewOpaqueType creates an abstract parameterized type with a given name.
 */
export function newOpaqueType(name: string, ...parameters: Type[]) {
  return new Type({
    kind: Kind.OPAQUE,
    parameters,
    runtimeTypeName: name,
  });
}

/**
 * NewOptionalType creates an abstract parameterized type instance
 * corresponding to CEL's notion of optional.
 */
export function newOptionalType(param: Type) {
  return newOpaqueType('optional_type', param);
}

/**
 * NewObjectType creates a type reference to an externally defined type, e.g. a
 * protobuf message type.
 *
 * An object type is assumed to support field presence testing and field
 * indexing. Additionally, the type may also indicate additional traits through
 * the use of the optional traits vararg argument.
 */
export function newObjectType(typeName: string, ...traits: Trait[]) {
  // Function sanitizes object types on the fly
  typeName = sanitizeProtoName(typeName);
  if (checkedWellKnowns.has(typeName)) {
    return getCheckedWellKnown(typeName)!;
  }
  const traitMask = new Set(traits);
  return new Type({
    kind: Kind.STRUCT,
    runtimeTypeName: typeName,
    traitMask,
  });
}

/**
 * NewTypeParamType creates a parameterized type instance.
 */
export function newTypeParamType(paramName: string) {
  return new Type({
    kind: Kind.TYPEPARAM,
    runtimeTypeName: paramName,
  });
}

/**
 * NewTypeTypeWithParam creates a type with a type parameter.
 * Used for type-checking purposes, but equivalent to TypeType otherwise.
 */
export function newTypeTypeWithParam(param: Type) {
  return new Type({
    kind: Kind.TYPE,
    runtimeTypeName: 'type',
    parameters: [param],
  });
}

/**
 * TypeToExprType converts a CEL-native type representation to a protobuf CEL
 * Type representation.
 */
export function typeToExprType(t: Type): ProtoType | Error {
  switch (t.kind()) {
    case Kind.ANY:
      return AnyProtoType;
    case Kind.BOOL:
      return maybeWrapper(t, BoolProtoType);
    case Kind.BYTES:
      return maybeWrapper(t, BytesProtoType);
    case Kind.DOUBLE:
      return maybeWrapper(t, DoubleProtoType);
    case Kind.DURATION:
      return DurationProtoType;
    case Kind.DYN:
      return DynProtoType;
    case Kind.ERROR:
      return ErrorProtoType;
    case Kind.INT:
      return maybeWrapper(t, IntProtoType);
    case Kind.LIST:
      if (t.parameters().length !== 1) {
        return new Error(
          `invalid list, got ${t.parameters().length} parameters, wanted one`
        );
      }
      const et = typeToExprType(t.parameters()[0]);
      if (et instanceof Error) {
        return et;
      }
      return newListProtoType(et);
    case Kind.MAP:
      if (t.parameters().length !== 2) {
        return new Error(
          `invalid map, got ${t.parameters().length} parameters, wanted two`
        );
      }
      const kt = typeToExprType(t.parameters()[0]);
      if (kt instanceof Error) {
        return kt;
      }
      const vt = typeToExprType(t.parameters()[1]);
      if (vt instanceof Error) {
        return vt;
      }
      return newMapProtoType(kt, vt);
    case Kind.NULL:
      return NullProtoType;
    case Kind.OPAQUE:
      const params = [];
      for (const p of t.parameters()) {
        const pt = typeToExprType(p);
        if (pt instanceof Error) {
          return pt;
        }
        params.push(pt);
      }
      return newAbstractProtoType(t.typeName(), ...params);
    case Kind.STRING:
      return maybeWrapper(t, StringProtoType);
    case Kind.STRUCT:
      return newObjectProtoType(t.typeName());
    case Kind.TIMESTAMP:
      return TimestampProtoType;
    case Kind.TYPE:
      if (t.parameters().length === 1) {
        const pt = typeToExprType(t.parameters()[0]);
        if (pt instanceof Error) {
          return pt;
        }
        return newTypeProtoType(pt);
      }
      return newTypeProtoType();
    case Kind.TYPEPARAM:
      return newTypeParamProtoType(t.typeName());
    case Kind.UINT:
      return maybeWrapper(t, UintProtoType);
    default:
      return new Error(`missing type conversion to proto: ${t}`);
  }
}

function maybeWrapper(t: Type, pbType: ProtoType) {
  if (t.isAssignableType(NullType)) {
    return newWrapperProtoType(pbType);
  }
  return pbType;
}

/**
 * ExprTypeToType converts a protobuf CEL type representation to a CEL-native
 * type representation.
 */
export function exprTypeToType(t: ProtoType): Type | Error {
  switch (t.typeKind.case) {
    case 'dyn':
      return DynType;
    case 'abstractType':
      const params = [];
      for (const pt of t.typeKind.value.parameterTypes) {
        const p = exprTypeToType(pt);
        if (p instanceof Error) {
          return p;
        }
        params.push(p);
      }
      return newOpaqueType(t.typeKind.value.name, ...params);
    case 'listType':
      if (isNil(t.typeKind.value.elemType)) {
        return new Error('list type missing element type');
      }
      const et = exprTypeToType(t.typeKind.value.elemType);
      if (et instanceof Error) {
        return et;
      }
      return newListType(et);
    case 'mapType':
      if (isNil(t.typeKind.value.keyType)) {
        return new Error('map type missing key type');
      }
      if (isNil(t.typeKind.value.valueType)) {
        return new Error('map type missing value type');
      }
      const kt = exprTypeToType(t.typeKind.value.keyType);
      if (kt instanceof Error) {
        return kt;
      }
      const vt = exprTypeToType(t.typeKind.value.valueType);
      if (vt instanceof Error) {
        return vt;
      }
      return newMapType(kt, vt);
    case 'messageType':
      return newObjectType(t.typeKind.value);
    case 'null':
      return NullType;
    case 'primitive':
      switch (t.typeKind.value) {
        case Type_PrimitiveType.BOOL:
          return BoolType;
        case Type_PrimitiveType.BYTES:
          return BytesType;
        case Type_PrimitiveType.DOUBLE:
          return DoubleType;
        case Type_PrimitiveType.INT64:
          return IntType;
        case Type_PrimitiveType.STRING:
          return StringType;
        case Type_PrimitiveType.UINT64:
          return UintType;
        default:
          return new Error(`unsupported primitive type: ${t.typeKind.value}`);
      }
    case 'typeParam':
      return newTypeParamType(t.typeKind.value);
    case 'type':
      if (!isNil(t.typeKind.value)) {
        const pt = exprTypeToType(t.typeKind.value);
        if (pt instanceof Error) {
          return pt;
        }
        return newTypeTypeWithParam(pt);
      }
      return TypeType;
    case 'wellKnown':
      switch (t.typeKind.value) {
        case Type_WellKnownType.ANY:
          return AnyType;
        case Type_WellKnownType.DURATION:
          return DurationType;
        case Type_WellKnownType.TIMESTAMP:
          return TimestampType;
        default:
          return new Error(`unsupported well-known type: ${t.typeKind.value}`);
      }
    case 'wrapper':
      const pt = exprTypeToType(newPrimitiveProtoType(t.typeKind.value));
      if (pt instanceof Error) {
        return pt;
      }
      return newNullableType(pt);
    case 'error':
      return ErrorType;
    default:
      return new Error(`unsupported type: ${t.typeKind.case}`);
  }
}

export function maybeForeignType(t: RefType) {
  if (isType(t)) {
    return t;
  }
  // Inspect the incoming type to determine its traits. The assumption will be
  // that the incoming type does not have any field values; however, if the
  // trait mask indicates that field testing and indexing are supported, the
  // foreign type is marked as a struct.
  const traitMask: Trait[] = [];
  for (const trait of AllTraits) {
    if (t.hasTrait(trait)) {
      traitMask.push(trait);
    }
  }
  // Treat the value like a struct. If it has no fields, this is harmless to
  // denote the type as such since it basically becomes an opaque type by
  // convention.
  return newObjectType(t.typeName(), ...traitMask);
}

/**
 * TypeMapToProto converts a map of type IDs to types to protobuf
 * representation.
 */
export function typeMapToProto(
  typeMap: Map<bigint, Type>
): Record<string, ProtoType> {
  const result: Record<string, ProtoType> = {};
  for (const [id, type] of typeMap) {
    const t = typeToExprType(type);
    if (t instanceof Error) {
      throw t;
    }
    result[id.toString()] = t;
  }
  return result;
}
