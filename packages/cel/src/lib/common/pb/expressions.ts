import { isString } from '@bearclaw/is';
import {
  Constant,
  Expr,
  Expr_CreateStruct_Entry,
  Expr_CreateStruct_EntrySchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import {
  isBoolProtoConstant,
  isBytesProtoConstant,
  newBoolProtoConstant,
  newBytesProtoConstant,
  NullProtoConstant,
} from './constants';

/**
 * NewBoolProtoExpr creates a new protobuf boolean CEL expression.
 */
export function newBoolProtoExpr(id: bigint, value: boolean) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: newBoolProtoConstant(value),
    },
  });
}

/**
 * IsBoolProtoExpr returns true if the expression is a protobuf boolean CEL expression.
 */
export function isBoolProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'constExpr';
    value: {
      constantKind: {
        case: 'boolValue';
      };
    };
  };
} {
  return (
    val.exprKind.case === 'constExpr' && isBoolProtoConstant(val.exprKind.value)
  );
}

/**
 * UnwrapBoolProtoExpr returns the boolean value of the protobuf boolean CEL
 * expression.
 */
export function unwrapBoolProtoExpr(val: Expr) {
  if (isBoolProtoExpr(val)) {
    return val.exprKind.value.constantKind.value;
  }
  return null;
}

/**
 * NewBytesProtoExpr creates a new protobuf bytes CEL expression.
 */
export function newBytesProtoExpr(id: bigint, value: Uint8Array) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: newBytesProtoConstant(value),
    },
  });
}

/**
 * IsBytesProtoExpr returns true if the expression is a protobuf bytes CEL expression.
 */
export function isBytesProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'constExpr';
    value: {
      constantKind: {
        case: 'bytesValue';
      };
    };
  };
} {
  return (
    val.exprKind.case === 'constExpr' &&
    isBytesProtoConstant(val.exprKind.value)
  );
}

/**
 * UnwrapBytesProtoExpr returns the bytes value of the protobuf bytes CEL
 * expression.
 */
export function unwrapBytesProtoExpr(val: Expr) {
  if (isBytesProtoExpr(val)) {
    return val.exprKind.value.constantKind.value;
  }
  return null;
}

/**
 * NewDoubleProtoExpr creates a new protobuf double CEL expression.
 */
export function newDoubleProtoExpr(id: bigint, value: number) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: {
        constantKind: {
          case: 'doubleValue',
          value,
        },
      },
    },
  });
}

/**
 * IsDoubleProtoExpr returns true if the expression is a protobuf double CEL expression.
 */
export function isDoubleProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'constExpr';
    value: {
      constantKind: {
        case: 'doubleValue';
      };
    };
  };
} {
  return (
    val.exprKind.case === 'constExpr' &&
    val.exprKind.value.constantKind.case === 'doubleValue'
  );
}

/**
 * UnwrapDoubleProtoExpr returns the double value of the protobuf double CEL
 * expression.
 */
export function unwrapDoubleProtoExpr(val: Expr) {
  if (isDoubleProtoExpr(val)) {
    return val.exprKind.value.constantKind.value;
  }
  return null;
}

/**
 * NewIntProtoExpr creates a new protobuf int64 CEL expression.
 */
export function newIntProtoExpr(id: bigint, value: bigint) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: {
        constantKind: {
          case: 'int64Value',
          value,
        },
      },
    },
  });
}

/**
 * IsIntProtoExpr returns true if the expression is a protobuf int64 CEL expression.
 */
export function isIntProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'constExpr';
    value: {
      constantKind: {
        case: 'int64Value';
      };
    };
  };
} {
  return (
    val.exprKind.case === 'constExpr' &&
    val.exprKind.value.constantKind.case === 'int64Value'
  );
}

/**
 * UnwrapIntProtoExpr returns the int64 value of the protobuf int64 CEL
 * expression.
 */
export function unwrapIntProtoExpr(val: Expr) {
  if (isIntProtoExpr(val)) {
    return val.exprKind.value.constantKind.value;
  }
  return null;
}

/**
 * NewStringProtoExpr creates a new protobuf string CEL expression.
 */
export function newStringProtoExpr(id: bigint, value: string) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: {
        constantKind: {
          case: 'stringValue',
          value,
        },
      },
    },
  });
}

/**
 * IsStringProtoExpr returns true if the expression is a protobuf string CEL expression.
 */
export function isStringProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'constExpr';
    value: {
      constantKind: {
        case: 'stringValue';
      };
    };
  };
} {
  return (
    val.exprKind.case === 'constExpr' &&
    val.exprKind.value.constantKind.case === 'stringValue'
  );
}

/**
 * UnwrapStringProtoExpr returns the string value of the protobuf string CEL
 * expression.
 */
export function unwrapStringProtoExpr(val: Expr) {
  if (isStringProtoExpr(val)) {
    return val.exprKind.value.constantKind.value;
  }
  return null;
}

/**
 * NewUintProtoExpr creates a new protobuf uint64 CEL expression.
 */
export function newUintProtoExpr(id: bigint, value: bigint) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: {
        constantKind: {
          case: 'uint64Value',
          value,
        },
      },
    },
  });
}

/**
 * IsUintProtoExpr returns true if the expression is a protobuf uint64 CEL expression.
 */
export function isUintProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'constExpr';
    value: {
      constantKind: {
        case: 'uint64Value';
      };
    };
  };
} {
  return (
    val.exprKind.case === 'constExpr' &&
    val.exprKind.value.constantKind.case === 'uint64Value'
  );
}

/**
 * UnwrapUintProtoExpr returns the uint64 value of the protobuf uint64 CEL
 * expression.
 */
export function unwrapUintProtoExpr(val: Expr) {
  if (isUintProtoExpr(val)) {
    return val.exprKind.value.constantKind.value;
  }
  return null;
}

/**
 * NewIdentProtoExpr creates a new protobuf identifier CEL expression.
 */
export function newIdentProtoExpr(id: bigint, name: string) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'identExpr',
      value: {
        name,
      },
    },
  });
}

/**
 * IsIdentProtoExpr returns true if the expression is a protobuf identifier CEL expression.
 */
export function isIdentProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'identExpr';
  };
} {
  return val.exprKind.case === 'identExpr';
}

/**
 * UnwrapIdentProtoExpr returns the name of the protobuf identifier CEL expression.
 */
export function unwrapIdentProtoExpr(val: Expr) {
  if (isIdentProtoExpr(val)) {
    return val.exprKind.value;
  }
  return null;
}

/**
 * NewReceiverCallProtoExpr creates a new protobuf call CEL expression.
 */
export function newReceiverCallProtoExpr(
  id: bigint,
  fn: string,
  target: Expr,
  args: Expr[]
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'callExpr',
      value: {
        function: fn,
        args,
        target: target ?? undefined,
      },
    },
  });
}

/**
 * IsReceiverCallProtoExpr returns true if the expression is a protobuf call CEL expression.
 */
export function isReceiverCallProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'callExpr';
    value: {
      function: string;
      args: Expr[];
      target: Expr;
    };
  };
} {
  return (
    val.exprKind.case === 'callExpr' && val.exprKind.value.target !== undefined
  );
}

/**
 * NewGlobalCallProtoExpr creates a new protobuf call CEL expression.
 */
export function newGlobalCallProtoExpr(id: bigint, fn: string, args: Expr[]) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'callExpr',
      value: {
        function: fn,
        args,
      },
    },
  });
}

/**
 * IsGlobalCallProtoExpr returns true if the expression is a protobuf call CEL expression.
 */
export function isGlobalCallProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'callExpr';
    value: {
      function: string;
      args: Expr[];
    };
  };
} {
  return (
    val.exprKind.case === 'callExpr' && val.exprKind.value.target === undefined
  );
}

/**
 * NewSelectProtoExpr creates a new protobuf select CEL expression.
 */
export function newSelectProtoExpr(id: bigint, operand: Expr, field: string) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'selectExpr',
      value: {
        operand,
        field,
        testOnly: false,
      },
    },
  });
}

/**
 * IsSelectProtoExpr returns true if the expression is a protobuf select CEL expression.
 */
export function isSelectProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'selectExpr';
    value: {
      operand: Expr;
      field: string;
      testOnly: false;
    };
  };
} {
  return val.exprKind.case === 'selectExpr' && !val.exprKind.value.testOnly;
}

/**
 * NewTestOnlySelectProtoExpr creates a new protobuf select CEL expression.
 */
export function newTestOnlySelectProtoExpr(
  id: bigint,
  operand: Expr,
  field: string
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'selectExpr',
      value: {
        operand,
        field,
        testOnly: true,
      },
    },
  });
}

/**
 * IsTestOnlySelectProtoExpr returns true if the expression is a protobuf select CEL expression.
 */
export function isTestOnlySelectProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'selectExpr';
    value: {
      operand: Expr;
      field: string;
      testOnly: true;
    };
  };
} {
  return val.exprKind.case === 'selectExpr' && val.exprKind.value.testOnly;
}

/**
 * NewComprehensionProtoExpr creates a new protobuf comprehension CEL expression.
 */
export function newComprehensionProtoExpr(
  id: bigint,
  comprehension: {
    iterVar?: string;
    iterVar2?: string;
    iterRange?: Expr;
    accuInit?: Expr;
    accuVar?: string;
    loopCondition?: Expr;
    loopStep?: Expr;
    result?: Expr;
  }
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'comprehensionExpr',
      value: {
        iterVar: comprehension.iterVar,
        iterVar2: comprehension.iterVar2,
        iterRange: comprehension.iterRange,
        accuInit: comprehension.accuInit,
        accuVar: comprehension.accuVar,
        loopCondition: comprehension.loopCondition,
        loopStep: comprehension.loopStep,
        result: comprehension.result,
      },
    },
  });
}

/**
 * IsComprehensionProtoExpr returns true if the expression is a protobuf comprehension CEL expression.
 */
export function isComprehensionProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'comprehensionExpr';
    value: {
      iterVar?: string;
      iterVar2?: string;
      iterRange?: Expr;
      accuInit?: Expr;
      accuVar?: string;
      loopCondition?: Expr;
      loopStep?: Expr;
      result?: Expr;
    };
  };
} {
  return val.exprKind.case === 'comprehensionExpr';
}

/**
 * NewListProtoExpr creates a new protobuf list CEL expression.
 */
export function newListProtoExpr(
  id: bigint,
  elements: Expr[],
  optionalIndices: number[] = []
) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'listExpr',
      value: {
        elements,
        optionalIndices,
      },
    },
  });
}

/**
 * IsListProtoExpr returns true if the expression is a protobuf list CEL expression.
 */
export function isListProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'listExpr';
    value: {
      elements: Expr[];
      optionalIndices: number[];
    };
  };
} {
  return val.exprKind.case === 'listExpr';
}

/**
 * NewMapEntryProtoExpr creates a new protobuf map entry CEL expression.
 */
export function newMapEntryProtoExpr(
  id: bigint,
  key: Expr,
  value: Expr | null,
  optionalEntry = false
) {
  return create(Expr_CreateStruct_EntrySchema, {
    id,
    keyKind: {
      case: 'mapKey',
      value: key,
    },
    value: value ?? undefined,
    optionalEntry,
  });
}

/**
 * IsMapEntryProtoExpr returns true if the expression is a protobuf map entry CEL expression.
 */
export function isMapEntryProtoExpr(
  val: Expr_CreateStruct_Entry
): val is Expr_CreateStruct_Entry & {
  keyKind: {
    case: 'mapKey';
  };
} {
  return val.keyKind.case === 'mapKey';
}

/**
 * NewMapProtoExpr creates a new protobuf struct CEL expression.
 */
export function newMapProtoExpr(
  id: bigint,
  entries: Expr_CreateStruct_Entry[]
) {
  if (!entries.every(isMapEntryProtoExpr)) {
    throw new Error('invalid map initializer entries');
  }
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'structExpr',
      value: {
        entries: entries.map((entry) =>
          newMapEntryProtoExpr(
            entry.id,
            entry.keyKind.value,
            entry.value ?? null,
            entry.optionalEntry
          )
        ),
      },
    },
  });
}

/**
 * IsMapProtoExpr returns true if the expression is a protobuf struct CEL expression.
 */
export function isMapProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'structExpr';
    value: {
      messageName: undefined;
      entries: (Expr_CreateStruct_Entry & {
        keyKind: {
          case: 'mapKey';
        };
      })[];
    };
  };
} {
  return (
    val.exprKind.case === 'structExpr' &&
    val.exprKind.value.messageName === undefined
  );
}

/**
 * NewFieldProtoExpr creates a new protobuf field CEL expression.
 */
export function newMessageFieldProtoExpr(
  id: bigint,
  key: string,
  value: Expr | null,
  optionalEntry = false
) {
  return create(Expr_CreateStruct_EntrySchema, {
    id,
    keyKind: {
      case: 'fieldKey',
      value: key,
    },
    value: value ?? undefined,
    optionalEntry,
  });
}

/**
 * IsFieldProtoExpr returns true if the expression is a protobuf field CEL expression.
 */
export function isMessageFieldProtoExpr(
  val: Expr_CreateStruct_Entry
): val is Expr_CreateStruct_Entry & {
  keyKind: {
    case: 'fieldKey';
  };
} {
  return val.keyKind.case === 'fieldKey';
}

/**
 * NewMessageProtoExpr creates a new protobuf message CEL expression.
 */
export function newMessageProtoExpr(
  id: bigint,
  messageName: string,
  entries: Expr_CreateStruct_Entry[]
) {
  if (!entries.every(isMessageFieldProtoExpr)) {
    throw new Error('invalid field initialier entries');
  }
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'structExpr',
      value: {
        messageName,
        entries: entries.map((entry) =>
          newMessageFieldProtoExpr(
            entry.id,
            entry.keyKind.value,
            entry.value ?? null,
            entry.optionalEntry
          )
        ),
      },
    },
  });
}

/**
 * IsMessageProtoExpr returns true if the expression is a protobuf message CEL expression.
 */
export function isMessageProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'structExpr';
    value: {
      messageName: string;
      entries: (Expr_CreateStruct_Entry & {
        keyKind: {
          case: 'fieldKey';
        };
      })[];
    };
  };
} {
  return (
    val.exprKind.case === 'structExpr' &&
    isString(val.exprKind.value.messageName)
  );
}

/**
 * NewConstantProtoExpr creates a new protobuf constant CEL expression.
 */
export function newConstantProtoExpr(id: bigint, value: Constant) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value,
    },
  });
}

/**
 * IsConstantProtoExpr returns true if the expression is a protobuf constant CEL expression.
 */
export function isConstantProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'constExpr';
  };
} {
  return val.exprKind.case === 'constExpr';
}

/**
 * NewNullProtoExpr creates a new protobuf null CEL expression.
 */
export function newNullProtoExpr(id: bigint) {
  return create(ExprSchema, {
    id,
    exprKind: {
      case: 'constExpr',
      value: NullProtoConstant,
    },
  });
}

/**
 * IsNullProtoExpr returns true if the expression is a protobuf null CEL expression.
 */
export function isNullProtoExpr(val: Expr): val is Expr & {
  exprKind: {
    case: 'constExpr';
    value: typeof NullProtoConstant;
  };
} {
  return (
    val.exprKind.case === 'constExpr' &&
    val.exprKind.value === NullProtoConstant
  );
}

export function newUnspecifiedExpr(id: bigint) {
  return create(ExprSchema, {
    id,
  });
}

/**
 * UnwrapConstantExpr returns the value of the protobuf constant CEL expression.
 */
export function unwrapConstantExpr(expr: Expr) {
  if (isConstantProtoExpr(expr)) {
    return expr.exprKind.value;
  }
  return null;
}
