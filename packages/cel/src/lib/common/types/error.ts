/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from '@bearclaw/is';
import {
  Type,
  TypeSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { ErrorSetSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb';
import {
  Value,
  ValueSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { create } from '@bufbuild/protobuf';
import { Empty, EmptySchema, anyPack } from '@bufbuild/protobuf/wkt';
import { RefType, RefTypeEnum, RefVal } from '../ref/reference';
import { NativeType } from './native';
import { Trait } from './traits/trait';

export const ERROR_TYPE = create(TypeSchema, {
  typeKind: {
    case: 'error',
    value: create(EmptySchema),
  },
});

export function isErrorType(val: Type): val is Type & {
  typeKind: { case: 'error'; value: Empty };
} {
  return val.typeKind.case === 'error';
}

export function unwrapErrorType(val: Type) {
  if (isErrorType(val)) {
    return val.typeKind.value;
  }
  return null;
}

export class ErrorRefType implements RefType {
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _traits = new Set<Trait>();

  celType(): Type {
    return create(TypeSchema, {
      typeKind: {
        case: 'error',
        value: create(EmptySchema),
      },
    });
  }

  hasTrait(trait: Trait): boolean {
    return this._traits.has(trait);
  }

  typeName(): string {
    return RefTypeEnum.ERR;
  }
}

export const ERROR_REF_TYPE = new ErrorRefType();

export class ErrorRefVal implements RefVal {
  // This has to be a TS private field instead of a # private field because
  // otherwise the tests will not be able to access it to check for equality.
  // TODO: do we want to alter the tests to use the getter instead?
  private readonly _value: Error;

  constructor(message: string) {
    this._value = new Error(message);
  }

  static errDivideByZero = new ErrorRefVal('divide by zero');

  static errModulusByZero = new ErrorRefVal('modulus by zero');

  static errIntOverflow = new ErrorRefVal('integer overflow');

  static errUintOverflow = new ErrorRefVal('unsigned integer overflow');

  static errDurationOverflow = new ErrorRefVal('duration overflow');

  static errDurationOutOfRange = new ErrorRefVal('duration out of range');

  static errTimestampOverflow = new ErrorRefVal('timestamp overflow');

  static errTimestampOutOfRange = new ErrorRefVal('timestamp out of range');

  static errNoMoreElements = new ErrorRefVal('no more elements');

  static errNoSuchOverload = new ErrorRefVal('no such overload');

  static nativeTypeConversionError(from: RefVal, to: NativeType) {
    return new ErrorRefVal(
      `native type conversion error from '${from.type().typeName()}' to '${
        to.name
      }'`
    );
  }

  static typeConversionError(from: RefVal, to: RefType) {
    return new ErrorRefVal(
      `type conversion error from '${from
        .type()
        .typeName()}' to '${to.typeName()}'`
    );
  }

  static noSuchMethodOverload(val: RefVal | null, fn: string, args: RefVal[]) {
    let formattedArgs = args.map((arg) => arg.type().typeName()).join(', ');
    if (formattedArgs.indexOf(',') > -1) {
      formattedArgs = `${formattedArgs},...`;
    }
    if (isNil(val)) {
      return new ErrorRefVal(`no such overload: *.${fn}(${formattedArgs})`);
    }
    return new ErrorRefVal(
      `no such overload: ${val.type().typeName()}.${fn}(${formattedArgs})`
    );
  }

  static noSuchIndexMethodOverload(
    val: RefVal,
    fn: string,
    overload: string,
    args: RefType[]
  ) {
    const formattedArgs = args.map((arg) => arg.typeName()).join(', ');
    return new ErrorRefVal(
      `no such overload: ${val
        .type()
        .typeName()}.${fn}[${overload}](${formattedArgs})`
    );
  }

  static maybeNoSuchOverload(val: RefVal) {
    return ErrorRefVal.valOrErr(val, 'no such overload');
  }

  /**
   * ValOrErr either returns the existing error or create a new one.
   */
  static valOrErr(val: RefVal, err: string) {
    if (isNil(val)) {
      return new ErrorRefVal(err);
    }
    // TODO: or Unknown
    if (val.type().typeName() === RefTypeEnum.ERR) {
      return val;
    }
    return new ErrorRefVal(err);
  }

  /**
   * UnsupportedRefValConversionErr returns a types.NewErr instance with a no
   * such conversion message that indicates that the native value could not be
   * converted to a CEL ref.Val.
   */
  static unsupportedRefValConversionErr(val: any) {
    return new ErrorRefVal(
      `unsupported conversion to ref.Val: (${val.name})${val}`
    );
  }

  static noSuchField(field: any) {
    return new ErrorRefVal(`no such field '${field}'`);
  }

  static unknownType(field: any) {
    return new ErrorRefVal(`unknown type '${field}'`);
  }

  static rangeError(from: any, to: any) {
    return new ErrorRefVal(`range error converting ${from} to ${to}`);
  }

  static noSuchAttribute(attr: string) {
    return new ErrorRefVal(`no such attribute '${attr}' (in container '')`);
  }

  celValue(): Value {
    return create(ValueSchema, {
      kind: {
        case: 'objectValue',
        value: anyPack(
          ErrorSetSchema,
          create(ErrorSetSchema, { errors: [{ message: this._value.message }] })
        ),
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  convertToNative(typeDesc: NativeType) {
    throw new Error('Unsupported operation');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  convertToType(typeValue: RefType): RefVal {
    // Errors are not convertible to other representations.
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  equal(other: RefVal): RefVal {
    // An error cannot be equal to any other value, so it returns itself.
    return this;
  }

  type(): RefType {
    return ERROR_REF_TYPE;
  }

  value(): Error {
    return this._value;
  }
}
