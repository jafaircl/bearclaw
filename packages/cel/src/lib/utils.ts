/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { isNil } from '@bearclaw/is';
import {
  DeclSchema,
  Decl_FunctionDeclSchema,
  Decl_FunctionDecl_OverloadSchema,
  Decl_IdentDeclSchema,
  ReferenceSchema,
  Type_PrimitiveType,
  Type_WellKnownType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  Constant,
  ConstantSchema,
  Expr,
  ExprSchema,
  Expr_CallSchema,
  Expr_ComprehensionSchema,
  Expr_CreateListSchema,
  Expr_CreateStructSchema,
  Expr_CreateStruct_EntrySchema,
  Expr_IdentSchema,
  Expr_SelectSchema,
  SourceInfo,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import {
  DescField,
  MessageInitShape,
  ScalarType,
  create,
} from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';
import {
  DYN_TYPE,
  Location,
  getCheckedWellKnownType,
  listType,
  mapType,
  messageType,
  primitiveType,
} from './types';

export function parseString(str: string) {
  const decoded = decodeURIComponent(str);
  return decoded.replace(/\\([abfnrtv'"\\])/g, '$1');
}

export function parseBytes(str: string) {
  // Remove double escapes from the string
  str = parseString(str);
  // Match octal or hexadecimal numbers
  const octalOrHexadecimalNumbers = str.match(
    /\\[0-7]{1,3}|\\x[0-9a-fA-F]{2}/g
  );
  if (octalOrHexadecimalNumbers) {
    const uint8Array = new Uint8Array(octalOrHexadecimalNumbers.length);
    for (let i = 0; i < octalOrHexadecimalNumbers.length; i++) {
      const octalOrHexadecimalNumber = octalOrHexadecimalNumbers[i];
      if (octalOrHexadecimalNumber.startsWith('\\x')) {
        uint8Array[i] = parseInt(octalOrHexadecimalNumber.slice(2), 16);
      } else {
        uint8Array[i] = parseInt(octalOrHexadecimalNumber.slice(1), 8);
      }
    }
    return uint8Array;
  }
  return new TextEncoder().encode(str);
}

export function parseInt64(str: string) {
  const decoded = decodeURIComponent(str);
  if (decoded.startsWith('-')) {
    return -BigInt(decoded.slice(1));
  }
  return BigInt(decoded);
}

export function constExpr(
  id: bigint,
  init: MessageInitShape<typeof ConstantSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: create(ConstantSchema, init),
    },
  });
}

export function boolConstant(value: boolean) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'boolValue',
      value,
    },
  });
}

export function boolExpr(id: bigint, value: boolean) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: boolConstant(value),
    },
  });
}

export function boolValue(value: boolean) {
  return create(ValueSchema, {
    kind: {
      case: 'boolValue',
      value,
    },
  });
}

export function int64Constant(value: bigint) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'int64Value',
      value,
    },
  });
}

export function int64Expr(id: bigint, value: bigint) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: int64Constant(value),
    },
  });
}

export function int64Value(value: bigint) {
  return create(ValueSchema, {
    kind: {
      case: 'int64Value',
      value,
    },
  });
}

export function uint64Constant(value: bigint) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'uint64Value',
      value,
    },
  });
}

export function uint64Expr(id: bigint, value: bigint) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: uint64Constant(value),
    },
  });
}

export function uint64Value(value: bigint) {
  return create(ValueSchema, {
    kind: {
      case: 'uint64Value',
      value,
    },
  });
}

export function doubleConstant(value: number) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'doubleValue',
      value,
    },
  });
}

export function doubleExpr(id: bigint, value: number) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: doubleConstant(value),
    },
  });
}

export function doubleValue(value: number) {
  return create(ValueSchema, {
    kind: {
      case: 'doubleValue',
      value,
    },
  });
}

export function stringConstant(value: string) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'stringValue',
      value,
    },
  });
}

export function stringExpr(id: bigint, value: string) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: stringConstant(value),
    },
  });
}

export function stringValue(value: string) {
  return create(ValueSchema, {
    kind: {
      case: 'stringValue',
      value,
    },
  });
}

export function bytesConstant(value: Uint8Array) {
  return create(ConstantSchema, {
    constantKind: {
      case: 'bytesValue',
      value,
    },
  });
}

export function bytesExpr(id: bigint, value: Uint8Array) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: bytesConstant(value),
    },
  });
}

export function bytesValue(value: Uint8Array) {
  return create(ValueSchema, {
    kind: {
      case: 'bytesValue',
      value,
    },
  });
}

export const NULL_CONSTANT = create(ConstantSchema, {
  constantKind: {
    case: 'nullValue',
    value: NullValue.NULL_VALUE,
  },
});

export function nullExpr(id: bigint) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: NULL_CONSTANT,
    },
  });
}

export const NULL_VALUE = create(ValueSchema, {
  kind: {
    case: 'nullValue',
    value: NullValue.NULL_VALUE,
  },
});

export function identExpr(
  id: bigint,
  init: MessageInitShape<typeof Expr_IdentSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'identExpr',
      value: init,
    },
  });
}

export function callExpr(
  id: bigint,
  init: MessageInitShape<typeof Expr_CallSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'callExpr',
      value: init,
    },
  });
}

export function listExpr(
  id: bigint,
  init: MessageInitShape<typeof Expr_CreateListSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'listExpr',
      value: init,
    },
  });
}

export function selectExpr(
  id: bigint,
  init: MessageInitShape<typeof Expr_SelectSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'selectExpr',
      value: init,
    },
  });
}

export function structExpr(
  id: bigint,
  init: MessageInitShape<typeof Expr_CreateStructSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'structExpr',
      value: init,
    },
  });
}

export function createStructEntry(
  id: bigint,
  init: MessageInitShape<typeof Expr_CreateStruct_EntrySchema>
) {
  return create(Expr_CreateStruct_EntrySchema, {
    id,
    ...init,
  });
}

export function createStructFieldEntry(
  id: bigint,
  init: {
    key: string;
    value: Expr;
    optionalEntry?: boolean;
  }
) {
  return createStructEntry(id, {
    keyKind: {
      case: 'fieldKey',
      value: init.key,
    },
    value: init.value,
    optionalEntry: init.optionalEntry ?? false,
  });
}

export function createStructMapEntry(
  id: bigint,
  init: {
    key: Expr;
    value: Expr;
    optionalEntry?: boolean;
  }
) {
  return createStructEntry(id, {
    keyKind: {
      case: 'mapKey',
      value: init.key,
    },
    value: init.value,
    optionalEntry: init.optionalEntry ?? false,
  });
}

export function isMapExpr(expr: Expr) {
  if (expr.exprKind.case !== 'structExpr') {
    return false;
  }
  return expr.exprKind.value.entries.some(
    (entry) => entry.keyKind.case === 'mapKey'
  );
}

export function comprehensionExpr(
  id: bigint,
  init: MessageInitShape<typeof Expr_ComprehensionSchema>
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'comprehensionExpr',
      value: init,
    },
  });
}

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

export function overloadDecl(
  init: MessageInitShape<typeof Decl_FunctionDecl_OverloadSchema>
) {
  return create(Decl_FunctionDecl_OverloadSchema, init);
}

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

export function identReference(name: string, value: Constant) {
  return create(ReferenceSchema, {
    name,
    value,
  });
}

export function functionReference(overloadId: string[]) {
  return create(ReferenceSchema, {
    overloadId,
  });
}

export function unquote(str: string) {
  const reg = /['"`]/;
  if (!str) {
    return '';
  }
  if (reg.test(str.charAt(0))) {
    str = str.substr(1);
  }
  if (reg.test(str.charAt(str.length - 1))) {
    str = str.substr(0, str.length - 1);
  }
  return str;
}

export function extractIdent(expr: Expr): string | null {
  if (expr.exprKind.case !== 'identExpr') {
    return null;
  }
  return expr.exprKind.value.name;
}

/**
 * Returns the line and column information for a given character offset.
 *
 * @param offset the 0-based character offset
 * @returns the line and column information
 */
export function getLocationByOffset(
  sourceInfo: SourceInfo,
  offset: number
): Location {
  let line = 1;
  let column = offset;
  for (let i = 0; i < sourceInfo.lineOffsets.length; i++) {
    const lineOffset = sourceInfo.lineOffsets[i];
    if (lineOffset > offset) {
      break;
    }
    line++;
    column = offset - lineOffset;
  }
  return { line, column };
}

/**
 * calculates the 0-based character offset from a 1-based line and 0-based
 * column.
 * @param line a 1-based line number
 * @param column a 0-based column number
 */
export function computeOffset(
  baseLine: number,
  baseColumn: number,
  sourceInfo: SourceInfo,
  line: number,
  column: number
) {
  line = baseLine + line;
  column = baseColumn + column;
  if (line === 1) {
    return column;
  }
  if (line < 1 || line > sourceInfo.lineOffsets.length) {
    return -1;
  }
  const offset = sourceInfo.lineOffsets[line - 2];
  return offset + column;
}

export function mapToObject<K extends string | number | symbol, V>(
  map: Map<K, V>
) {
  const obj = {} as Record<K, V>;
  for (const [key, value] of map.entries()) {
    obj[key] = value;
  }
  return obj;
}

/**
 * Converts an expression AST into a qualified name if possible, or an empty
 * string otherwise.
 *
 * @param expr the expression AST
 * @returns a qualified name or an empty string
 */
export function toQualifiedName(expr: Expr): string | null {
  switch (expr.exprKind.case) {
    case 'identExpr':
      return expr.exprKind.value.name;
    case 'selectExpr':
      const sel = expr.exprKind.value;
      // Test only expressions are not valid as qualified names.
      if (sel.testOnly) {
        return null;
      }
      const qual = toQualifiedName(sel.operand!);
      if (!isNil(qual)) {
        return `${qual}.${sel.field}`;
      }
      break;
    default:
      break;
  }
  return null;
}

/**
 * Get the CEL type for a field descriptor.
 *
 * @param field the field descriptor
 * @returns the CEL type for the field
 */
export function getFieldDescriptorType(field: DescField) {
  switch (field.fieldKind) {
    case 'message':
      const checkedType = getCheckedWellKnownType(field.message.typeName);
      if (!isNil(checkedType)) {
        return checkedType;
      }
      return messageType(field.message.typeName);
    case 'enum':
      return messageType(field.enum.typeName);
    case 'list':
      switch (field.listKind) {
        case 'message':
          return listType({
            elemType: messageType(field.message.typeName),
          });
        case 'enum':
          return listType({
            elemType: messageType(field.enum.typeName),
          });
        case 'scalar':
          return listType({
            elemType: scalarTypeToPrimitiveType(field.scalar),
          });
        default:
          return DYN_TYPE;
      }
    case 'scalar':
      return scalarTypeToPrimitiveType(field.scalar);
    case 'map':
      const keyType = scalarTypeToPrimitiveType(field.mapKey);
      switch (field.mapKind) {
        case 'enum':
          return mapType({
            keyType,
            valueType: messageType(field.enum.typeName),
          });
        case 'message':
          return mapType({
            keyType,
            valueType: messageType(field.message.typeName),
          });
        case 'scalar':
          return mapType({
            keyType,
            valueType: scalarTypeToPrimitiveType(field.scalar),
          });
        default:
          return DYN_TYPE;
      }
    default:
      return DYN_TYPE;
  }
}

/**
 * Converts a protobuf scalar type to a CEL primitive type.
 *
 * @param scalar the scalar type
 * @returns the CEL primitive type
 */
export function scalarTypeToPrimitiveType(scalar: ScalarType) {
  switch (scalar) {
    case ScalarType.BOOL:
      return primitiveType(Type_PrimitiveType.BOOL);
    case ScalarType.BYTES:
      return primitiveType(Type_PrimitiveType.BYTES);
    case ScalarType.SFIXED32:
    case ScalarType.SFIXED64:
    case ScalarType.FIXED32:
    case ScalarType.FIXED64:
    case ScalarType.FLOAT:
    case ScalarType.DOUBLE:
      return primitiveType(Type_PrimitiveType.DOUBLE);
    case ScalarType.INT32:
    case ScalarType.INT64:
    case ScalarType.SINT32:
    case ScalarType.SINT64:
      return primitiveType(Type_PrimitiveType.INT64);
    case ScalarType.STRING:
      return primitiveType(Type_PrimitiveType.STRING);
    case ScalarType.UINT32:
    case ScalarType.UINT64:
      return primitiveType(Type_PrimitiveType.UINT64);
    default:
      return DYN_TYPE;
  }
}

/**
 * Converts a CEL WellKnwonType to a string.
 *
 * @param type the WellKnownType
 * @returns a string representation of the WellKnownType (or null if not found)
 */
export function getWellKNownTypeName(type: Type_WellKnownType): string | null {
  switch (type) {
    case Type_WellKnownType.ANY:
      return 'google.protobuf.Any';
    case Type_WellKnownType.DURATION:
      return 'google.protobuf.Duration';
    case Type_WellKnownType.TIMESTAMP:
      return 'google.protobuf.Timestamp';
    default:
      return null;
  }
}
