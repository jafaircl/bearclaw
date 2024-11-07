import {
  Type,
  TypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { create } from '@bufbuild/protobuf';
import { formatCELType } from '../format';
import { RefType, RefTypeEnum, RefVal } from '../ref/reference';
import { BoolRefVal } from './bool';
import { ErrorRefVal } from './error';
import { NativeType } from './native';
import { Trait } from './traits/trait';

export function typeType(value: Type) {
  return create(TypeSchema, {
    typeKind: {
      case: 'type',
      value,
    },
  });
}

export const TYPE_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'type',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: null as any,
  },
});

export function isTypeType(value: Type): value is Type & {
  typeKind: { case: 'type'; value: Type };
} {
  return value.typeKind.case === 'type';
}

export function unwrapTypeType(value: Type) {
  if (isTypeType(value)) {
    return value.typeKind.value;
  }
  return null;
}

export function typeValue(value: Type) {
  return create(ValueSchema, {
    kind: {
      case: 'typeValue',
      value: formatCELType(value),
    },
  });
}

export function isTypeValue(value: Value): value is Value & {
  kind: { case: 'typeValue'; value: string };
} {
  return value.kind.case === 'typeValue';
}

export class TypeRefType implements RefType {
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  readonly _traits = new Set<Trait>();

  celType(): Type {
    return create(TypeSchema, {
      typeKind: {
        case: 'type',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: null as any,
      },
    });
  }

  hasTrait(trait: Trait): boolean {
    return this._traits.has(trait);
  }

  typeName(): string {
    return RefTypeEnum.TYPE;
  }
}

export const TYPE_REF_TYPE = new TypeRefType();

export class TypeRefVal implements RefVal {
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value: RefType;

  constructor(value: RefType) {
    this._value = value;
  }

  celValue(): Value {
    return create(ValueSchema, {
      kind: {
        case: 'typeValue',
        value: this._value.typeName(),
      },
    });
  }

  convertToNative(type: NativeType) {
    return ErrorRefVal.nativeTypeConversionError(this, type);
  }

  convertToType(type: RefType): RefVal {
    return ErrorRefVal.typeConversionError(this, type);
  }

  equal(other: RefVal): RefVal {
    return new BoolRefVal(this._value.typeName() === other.type().typeName());
  }

  type(): RefType {
    return TYPE_REF_TYPE;
  }

  value() {
    return this._value;
  }
}
