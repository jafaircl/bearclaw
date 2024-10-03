import {
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
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { MessageInitShape, create } from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';

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
