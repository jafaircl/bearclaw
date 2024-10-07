import {
  DescEnum,
  DescExtension,
  DescFile,
  DescMessage,
  DescService,
  Registry,
} from '@bufbuild/protobuf';
import {
  AnySchema,
  BoolValueSchema,
  BytesValueSchema,
  DoubleValueSchema,
  FloatValueSchema,
  Int32ValueSchema,
  Int64ValueSchema,
  ListValueSchema,
  ValueSchema as ProtobufValueSchema,
  StringValueSchema,
  StructSchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
} from '@bufbuild/protobuf/wkt';
import {
  ADD_OPERATOR,
  CONDITIONAL_OPERATOR,
  DIVIDE_OPERATOR,
  EQUALS_OPERATOR,
  GREATER_EQUALS_OPERATOR,
  GREATER_OPERATOR,
  INDEX_OPERATOR,
  IN_OPERATOR,
  LESS_EQUALS_OPERATOR,
  LESS_OPERATOR,
  LOGICAL_AND_OPERATOR,
  LOGICAL_NOT_OPERATOR,
  LOGICAL_OR_OPERATOR,
  MODULO_OPERATOR,
  MULTIPLY_OPERATOR,
  NEGATE_OPERATOR,
  NOT_EQUALS_OPERATOR,
  NOT_STRICTLY_FALSE_OPERATOR,
  SUBTRACT_OPERATOR,
} from './operators';
import {
  ADD_BYTES_OVERLOAD,
  ADD_DOUBLE_OVERLOAD,
  ADD_INT64_OVERLOAD,
  ADD_LIST_OVERLOAD,
  ADD_STRING_OVERLOAD,
  ADD_UINT64_OVERLOAD,
  BOOL_TO_BOOL_OVERLOAD,
  BOOL_TO_STRING_OVERLOAD,
  BYTES_TO_BYTES_OVERLOAD,
  BYTES_TO_STRING_OVERLOAD,
  CONDITIONAL_OVERLOAD,
  DIVIDE_DOUBLE_OVERLOAD,
  DIVIDE_INT64_OVERLOAD,
  DIVIDE_UINT64_OVERLOAD,
  DOUBLE_TO_DOUBLE_OVERLOAD,
  DOUBLE_TO_INT_OVERLOAD,
  DOUBLE_TO_STRING_OVERLOAD,
  DOUBLE_TO_UINT_OVERLOAD,
  EQUALS_OVERLOAD,
  GREATER_BOOL_OVERLOAD,
  GREATER_BYTES_OVERLOAD,
  GREATER_DOUBLE_INT64_OVERLOAD,
  GREATER_DOUBLE_OVERLOAD,
  GREATER_DOUBLE_UINT64_OVERLOAD,
  GREATER_EQUALS_BOOL_OVERLOAD,
  GREATER_EQUALS_BYTES_OVERLOAD,
  GREATER_EQUALS_DOUBLE_INT64_OVERLOAD,
  GREATER_EQUALS_DOUBLE_OVERLOAD,
  GREATER_EQUALS_DOUBLE_UINT64_OVERLOAD,
  GREATER_EQUALS_INT64_DOUBLE_OVERLOAD,
  GREATER_EQUALS_INT64_OVERLOAD,
  GREATER_EQUALS_INT64_UINT64_OVERLOAD,
  GREATER_EQUALS_STRING_OVERLOAD,
  GREATER_EQUALS_UINT64_DOUBLE_OVERLOAD,
  GREATER_EQUALS_UINT64_INT64_OVERLOAD,
  GREATER_EQUALS_UINT64_OVERLOAD,
  GREATER_INT64_DOUBLE_OVERLOAD,
  GREATER_INT64_OVERLOAD,
  GREATER_INT64_UINT64_OVERLOAD,
  GREATER_STRING_OVERLOAD,
  GREATER_UINT64_DOUBLE_OVERLOAD,
  GREATER_UINT64_INT64_OVERLOAD,
  GREATER_UINT64_OVERLOAD,
  INDEX_LIST_OVERLOAD,
  INDEX_MAP_OVERLOAD,
  INT_TO_DOUBLE_OVERLOAD,
  INT_TO_INT_OVERLOAD,
  INT_TO_STRING_OVERLOAD,
  INT_TO_UINT_OVERLOAD,
  IN_LIST_OVERLOAD,
  IN_MAP_OVERLOAD,
  LESS_BOOL_OVERLOAD,
  LESS_BYTES_OVERLOAD,
  LESS_DOUBLE_INT64_OVERLOAD,
  LESS_DOUBLE_OVERLOAD,
  LESS_DOUBLE_UINT64_OVERLOAD,
  LESS_EQUALS_BYTES_OVERLOAD,
  LESS_EQUALS_DOUBLE_INT64_OVERLOAD,
  LESS_EQUALS_DOUBLE_OVERLOAD,
  LESS_EQUALS_DOUBLE_UINT64_OVERLOAD,
  LESS_EQUALS_INT64_DOUBLE_OVERLOAD,
  LESS_EQUALS_INT64_OVERLOAD,
  LESS_EQUALS_INT64_UINT64_OVERLOAD,
  LESS_EQUALS_STRING_OVERLOAD,
  LESS_EQUALS_UINT64_DOUBLE_OVERLOAD,
  LESS_EQUALS_UINT64_INT64_OVERLOAD,
  LESS_EQUALS_UINT64_OVERLOAD,
  LESS_INT64_DOUBLE_OVERLOAD,
  LESS_INT64_OVERLOAD,
  LESS_INT64_UINT64_OVERLOAD,
  LESS_STRING_OVERLOAD,
  LESS_UINT64_DOUBLE_OVERLOAD,
  LESS_UINT64_INT64_OVERLOAD,
  LESS_UINT64_OVERLOAD,
  LOGICAL_AND_OVERLOAD,
  LOGICAL_NOT_OVERLOAD,
  LOGICAL_OR_OVERLOAD,
  MODULO_INT64_OVERLOAD,
  MODULO_UINT64_OVERLOAD,
  MULTIPLY_DOUBLE_OVERLOAD,
  MULTIPLY_INT64_OVERLOAD,
  MULTIPLY_UINT64_OVERLOAD,
  NEGATE_DOUBLE_OVERLOAD,
  NEGATE_INT64_OVERLOAD,
  NOT_EQUALS_OVERLOAD,
  NOT_STRICTLY_FALSE_OVERLOAD,
  SIZE_BYTES_INST_OVERLOAD,
  SIZE_BYTES_OVERLOAD,
  SIZE_LIST_INST_OVERLOAD,
  SIZE_LIST_OVERLOAD,
  SIZE_MAP_INST_OVERLOAD,
  SIZE_MAP_OVERLOAD,
  SIZE_OVERLOAD,
  SIZE_STRING_INST_OVERLOAD,
  SIZE_STRING_OVERLOAD,
  STRING_TO_BOOL_OVERLOAD,
  STRING_TO_BYTES_OVERLOAD,
  STRING_TO_DOUBLE_OVERLOAD,
  STRING_TO_INT_OVERLOAD,
  STRING_TO_STRING_OVERLOAD,
  STRING_TO_UINT_OVERLOAD,
  SUBTRACT_DOUBLE_OVERLOAD,
  SUBTRACT_INT64_OVERLOAD,
  SUBTRACT_UINT64_OVERLOAD,
  TYPE_CONVERT_BOOL_OVERLOAD,
  TYPE_CONVERT_BYTES_OVERLOAD,
  TYPE_CONVERT_DOUBLE_OVERLOAD,
  TYPE_CONVERT_DYN_OVERLOAD,
  TYPE_CONVERT_INT_OVERLOAD,
  TYPE_CONVERT_STRING_OVERLOAD,
  TYPE_CONVERT_TYPE_OVERLOAD,
  TYPE_CONVERT_UINT_OVERLOAD,
  UINT_TO_DOUBLE_OVERLOAD,
  UINT_TO_INT_OVERLOAD,
  UINT_TO_STRING_OVERLOAD,
  UINT_TO_UINT_OVERLOAD,
} from './overloads';
import {
  BOOL_TYPE,
  BYTES_TYPE,
  DOUBLE_TYPE,
  DYN_TYPE,
  INT64_TYPE,
  STRING_TYPE,
  UINT64_TYPE,
  listType,
  mapType,
  typeParamType,
  typeType,
} from './types';
import { functionDecl } from './utils';

export const standardTypes: (
  | DescMessage
  | DescEnum
  | Registry
  | DescFile
  | DescExtension
  | DescService
)[] = [
  AnySchema,
  ListValueSchema,
  StructSchema,
  ProtobufValueSchema,
  BoolValueSchema,
  BytesValueSchema,
  DoubleValueSchema,
  FloatValueSchema,
  Int32ValueSchema,
  Int64ValueSchema,
  StringValueSchema,
  UInt32ValueSchema,
  UInt64ValueSchema,
];

const paramA = typeParamType('A');
const paramB = typeParamType('B');
const listOfA = listType({ elemType: paramA });
const mapOfAB = mapType({ keyType: paramA, valueType: paramB });

// Logical operators. Special-cased within the interpreter.
// Note, the singleton binding prevents extensions from overriding the operator
// behavior.
export const CONDITIONAL_FUNCTION_DECL = functionDecl(CONDITIONAL_OPERATOR, {
  overloads: [
    {
      overloadId: CONDITIONAL_OVERLOAD,
      params: [BOOL_TYPE, paramA, paramA],
      resultType: paramA,
    },
  ],
});
export const LOGICAL_AND_FUNCTION_DECL = functionDecl(LOGICAL_AND_OPERATOR, {
  overloads: [
    {
      overloadId: LOGICAL_AND_OVERLOAD,
      params: [BOOL_TYPE, BOOL_TYPE],
      resultType: BOOL_TYPE,
    },
  ],
});
export const LOGICAL_OR_FUNCTION_DECL = functionDecl(LOGICAL_OR_OPERATOR, {
  overloads: [
    {
      overloadId: LOGICAL_OR_OVERLOAD,
      params: [BOOL_TYPE, BOOL_TYPE],
      resultType: BOOL_TYPE,
    },
  ],
});
export const LOGICAL_NOT_FUNCTION_DECL = functionDecl(LOGICAL_NOT_OPERATOR, {
  overloads: [
    {
      overloadId: LOGICAL_NOT_OVERLOAD,
      params: [BOOL_TYPE],
      resultType: BOOL_TYPE,
    },
  ],
});

// Comprehension short-circuiting related function
export const NOT_STRICTLY_FALSE_FUNCTION_DECL = functionDecl(
  NOT_STRICTLY_FALSE_OPERATOR,
  {
    overloads: [
      {
        overloadId: NOT_STRICTLY_FALSE_OVERLOAD,
        params: [BOOL_TYPE],
        resultType: BOOL_TYPE,
      },
    ],
  }
);

// Equality / inequality. Special-cased in the interpreter
export const EQUALS_FUNCTION_DECL = functionDecl(EQUALS_OPERATOR, {
  overloads: [
    {
      overloadId: EQUALS_OVERLOAD,
      params: [paramA, paramA],
      resultType: BOOL_TYPE,
    },
  ],
});
export const NOT_EQUALS_FUNCTION_DECL = functionDecl(NOT_EQUALS_OPERATOR, {
  overloads: [
    {
      overloadId: NOT_EQUALS_OVERLOAD,
      params: [paramA, paramA],
      resultType: BOOL_TYPE,
    },
  ],
});

// Mathematical operators
export const ADD_FUNCTION_DECL = functionDecl(ADD_OPERATOR, {
  overloads: [
    {
      overloadId: ADD_BYTES_OVERLOAD,
      params: [BYTES_TYPE, BYTES_TYPE],
      resultType: BYTES_TYPE,
    },
    {
      overloadId: ADD_DOUBLE_OVERLOAD,
      params: [DOUBLE_TYPE, DOUBLE_TYPE],
      resultType: DOUBLE_TYPE,
    },
    // TODO: duration and timestamp overloads
    {
      overloadId: ADD_INT64_OVERLOAD,
      params: [INT64_TYPE, INT64_TYPE],
      resultType: INT64_TYPE,
    },
    {
      overloadId: ADD_LIST_OVERLOAD,
      params: [listOfA, listOfA],
      resultType: listOfA,
    },
    {
      overloadId: ADD_STRING_OVERLOAD,
      params: [STRING_TYPE, STRING_TYPE],
      resultType: STRING_TYPE,
    },
    {
      overloadId: ADD_UINT64_OVERLOAD,
      params: [UINT64_TYPE, UINT64_TYPE],
      resultType: UINT64_TYPE,
    },
  ],
});
export const DIVIDE_FUNCTION_DECL = functionDecl(DIVIDE_OPERATOR, {
  overloads: [
    {
      overloadId: DIVIDE_DOUBLE_OVERLOAD,
      params: [DOUBLE_TYPE, DOUBLE_TYPE],
      resultType: DOUBLE_TYPE,
    },
    {
      overloadId: DIVIDE_INT64_OVERLOAD,
      params: [INT64_TYPE, INT64_TYPE],
      resultType: DOUBLE_TYPE,
    },
    {
      overloadId: DIVIDE_UINT64_OVERLOAD,
      params: [UINT64_TYPE, UINT64_TYPE],
      resultType: DOUBLE_TYPE,
    },
  ],
});
export const MODULO_FUNCTION_DECL = functionDecl(MODULO_OPERATOR, {
  overloads: [
    {
      overloadId: MODULO_INT64_OVERLOAD,
      params: [INT64_TYPE, INT64_TYPE],
      resultType: INT64_TYPE,
    },
    {
      overloadId: MODULO_UINT64_OVERLOAD,
      params: [UINT64_TYPE, UINT64_TYPE],
      resultType: UINT64_TYPE,
    },
  ],
});
export const MULTIPLY_FUNCTION_DECL = functionDecl(MULTIPLY_OPERATOR, {
  overloads: [
    {
      overloadId: MULTIPLY_DOUBLE_OVERLOAD,
      params: [DOUBLE_TYPE, DOUBLE_TYPE],
      resultType: DOUBLE_TYPE,
    },
    {
      overloadId: MULTIPLY_INT64_OVERLOAD,
      params: [INT64_TYPE, INT64_TYPE],
      resultType: INT64_TYPE,
    },
    {
      overloadId: MULTIPLY_UINT64_OVERLOAD,
      params: [UINT64_TYPE, UINT64_TYPE],
      resultType: UINT64_TYPE,
    },
  ],
});
export const NEGATE_FUNCTION_DECL = functionDecl(NEGATE_OPERATOR, {
  overloads: [
    {
      overloadId: NEGATE_DOUBLE_OVERLOAD,
      params: [DOUBLE_TYPE],
      resultType: DOUBLE_TYPE,
    },
    {
      overloadId: NEGATE_INT64_OVERLOAD,
      params: [INT64_TYPE],
      resultType: INT64_TYPE,
    },
  ],
});
export const SUBTRACT_FUNCTION_DECL = functionDecl(SUBTRACT_OPERATOR, {
  overloads: [
    {
      overloadId: SUBTRACT_DOUBLE_OVERLOAD,
      params: [DOUBLE_TYPE, DOUBLE_TYPE],
      resultType: DOUBLE_TYPE,
    },
    {
      overloadId: SUBTRACT_INT64_OVERLOAD,
      params: [INT64_TYPE, INT64_TYPE],
      resultType: INT64_TYPE,
    },
    {
      overloadId: SUBTRACT_UINT64_OVERLOAD,
      params: [UINT64_TYPE, UINT64_TYPE],
      resultType: UINT64_TYPE,
    },
    // TODO: duration & timestamp overloads
  ],
});

// Relations operators
export const LESS_FUNCTION_DECL = functionDecl(LESS_OPERATOR, {
  overloads: [
    {
      overloadId: LESS_BOOL_OVERLOAD,
      params: [BOOL_TYPE, BOOL_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_INT64_OVERLOAD,
      params: [INT64_TYPE, INT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_INT64_DOUBLE_OVERLOAD,
      params: [INT64_TYPE, DOUBLE_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_INT64_UINT64_OVERLOAD,
      params: [INT64_TYPE, UINT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_UINT64_OVERLOAD,
      params: [UINT64_TYPE, UINT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_UINT64_DOUBLE_OVERLOAD,
      params: [UINT64_TYPE, DOUBLE_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_UINT64_INT64_OVERLOAD,
      params: [UINT64_TYPE, INT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_DOUBLE_OVERLOAD,
      params: [DOUBLE_TYPE, DOUBLE_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_DOUBLE_INT64_OVERLOAD,
      params: [DOUBLE_TYPE, INT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_DOUBLE_UINT64_OVERLOAD,
      params: [DOUBLE_TYPE, UINT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_STRING_OVERLOAD,
      params: [STRING_TYPE, STRING_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_BYTES_OVERLOAD,
      params: [BYTES_TYPE, BYTES_TYPE],
      resultType: BOOL_TYPE,
    },
    // TODO: duration & timestamp overloads
  ],
});
export const LESS_EQUALS_FUNCTION_DECL = functionDecl(LESS_EQUALS_OPERATOR, {
  overloads: [
    {
      overloadId: LESS_EQUALS_INT64_OVERLOAD,
      params: [INT64_TYPE, INT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_EQUALS_INT64_DOUBLE_OVERLOAD,
      params: [INT64_TYPE, DOUBLE_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_EQUALS_INT64_UINT64_OVERLOAD,
      params: [INT64_TYPE, UINT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_EQUALS_UINT64_OVERLOAD,
      params: [UINT64_TYPE, UINT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_EQUALS_UINT64_DOUBLE_OVERLOAD,
      params: [UINT64_TYPE, DOUBLE_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_EQUALS_UINT64_INT64_OVERLOAD,
      params: [UINT64_TYPE, INT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_EQUALS_DOUBLE_OVERLOAD,
      params: [DOUBLE_TYPE, DOUBLE_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_EQUALS_DOUBLE_INT64_OVERLOAD,
      params: [DOUBLE_TYPE, INT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_EQUALS_DOUBLE_UINT64_OVERLOAD,
      params: [DOUBLE_TYPE, UINT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_EQUALS_STRING_OVERLOAD,
      params: [STRING_TYPE, STRING_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_EQUALS_BYTES_OVERLOAD,
      params: [BYTES_TYPE, BYTES_TYPE],
      resultType: BOOL_TYPE,
    },
    // TODO: duration & timestamp overloads
  ],
});
export const GREATER_FUNCTION_DECL = functionDecl(GREATER_OPERATOR, {
  overloads: [
    {
      overloadId: GREATER_BOOL_OVERLOAD,
      params: [BOOL_TYPE, BOOL_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: GREATER_INT64_OVERLOAD,
      params: [INT64_TYPE, INT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: GREATER_INT64_DOUBLE_OVERLOAD,
      params: [INT64_TYPE, DOUBLE_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: GREATER_INT64_UINT64_OVERLOAD,
      params: [INT64_TYPE, UINT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: GREATER_UINT64_OVERLOAD,
      params: [UINT64_TYPE, UINT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: GREATER_UINT64_DOUBLE_OVERLOAD,
      params: [UINT64_TYPE, DOUBLE_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: GREATER_UINT64_INT64_OVERLOAD,
      params: [UINT64_TYPE, INT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: GREATER_DOUBLE_OVERLOAD,
      params: [DOUBLE_TYPE, DOUBLE_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: GREATER_DOUBLE_INT64_OVERLOAD,
      params: [DOUBLE_TYPE, INT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: GREATER_DOUBLE_UINT64_OVERLOAD,
      params: [DOUBLE_TYPE, UINT64_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: GREATER_STRING_OVERLOAD,
      params: [STRING_TYPE, STRING_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: GREATER_BYTES_OVERLOAD,
      params: [BYTES_TYPE, BYTES_TYPE],
      resultType: BOOL_TYPE,
    },
    // TODO: duration & timestamp overloads
  ],
});
export const GREATER_EQUALS_FUNCTION_DECL = functionDecl(
  GREATER_EQUALS_OPERATOR,
  {
    overloads: [
      {
        overloadId: GREATER_EQUALS_BOOL_OVERLOAD,
        params: [BOOL_TYPE, BOOL_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: GREATER_EQUALS_INT64_OVERLOAD,
        params: [INT64_TYPE, INT64_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: GREATER_EQUALS_INT64_DOUBLE_OVERLOAD,
        params: [INT64_TYPE, DOUBLE_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: GREATER_EQUALS_INT64_UINT64_OVERLOAD,
        params: [INT64_TYPE, UINT64_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: GREATER_EQUALS_UINT64_OVERLOAD,
        params: [UINT64_TYPE, UINT64_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: GREATER_EQUALS_UINT64_DOUBLE_OVERLOAD,
        params: [UINT64_TYPE, DOUBLE_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: GREATER_EQUALS_UINT64_INT64_OVERLOAD,
        params: [UINT64_TYPE, INT64_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: GREATER_EQUALS_DOUBLE_OVERLOAD,
        params: [DOUBLE_TYPE, DOUBLE_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: GREATER_EQUALS_DOUBLE_INT64_OVERLOAD,
        params: [DOUBLE_TYPE, INT64_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: GREATER_EQUALS_DOUBLE_UINT64_OVERLOAD,
        params: [DOUBLE_TYPE, UINT64_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: GREATER_EQUALS_STRING_OVERLOAD,
        params: [STRING_TYPE, STRING_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: GREATER_EQUALS_BYTES_OVERLOAD,
        params: [BYTES_TYPE, BYTES_TYPE],
        resultType: BOOL_TYPE,
      },
      // TODO: duration & timestamp overloads
    ],
  }
);

// Indexing
export const INDEX_FUNCTION_DECL = functionDecl(INDEX_OPERATOR, {
  overloads: [
    {
      overloadId: INDEX_MAP_OVERLOAD,
      params: [mapOfAB, paramA],
      resultType: paramB,
    },
    {
      overloadId: INDEX_LIST_OVERLOAD,
      params: [listOfA, INT64_TYPE],
      resultType: paramA,
    },
  ],
});

// Collections operators
export const IN_FUNCTION_DECL = functionDecl(IN_OPERATOR, {
  overloads: [
    {
      overloadId: IN_LIST_OVERLOAD,
      params: [paramA, listOfA],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: IN_MAP_OVERLOAD,
      params: [paramA, mapOfAB],
      resultType: BOOL_TYPE,
    },
  ],
});
export const SIZE_FUNCTION_DECL = functionDecl(SIZE_OVERLOAD, {
  overloads: [
    {
      overloadId: SIZE_BYTES_OVERLOAD,
      params: [BYTES_TYPE],
      resultType: INT64_TYPE,
    },
    {
      overloadId: SIZE_BYTES_INST_OVERLOAD,
      params: [BYTES_TYPE],
      resultType: INT64_TYPE,
    },
    {
      overloadId: SIZE_LIST_OVERLOAD,
      params: [listOfA],
      resultType: INT64_TYPE,
    },
    {
      overloadId: SIZE_LIST_INST_OVERLOAD,
      params: [listOfA],
      resultType: INT64_TYPE,
    },
    {
      overloadId: SIZE_MAP_OVERLOAD,
      params: [mapOfAB],
      resultType: INT64_TYPE,
    },
    {
      overloadId: SIZE_MAP_INST_OVERLOAD,
      params: [mapOfAB],
      resultType: INT64_TYPE,
    },
    {
      overloadId: SIZE_STRING_OVERLOAD,
      params: [STRING_TYPE],
      resultType: INT64_TYPE,
    },
    {
      overloadId: SIZE_STRING_INST_OVERLOAD,
      params: [STRING_TYPE],
      resultType: INT64_TYPE,
    },
  ],
});

// Type conversions
export const TYPE_CONVERT_TYPE_FUNCTION_DECL = functionDecl(
  TYPE_CONVERT_TYPE_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TYPE_CONVERT_TYPE_OVERLOAD,
        params: [paramA],
        resultType: typeType(paramA),
      },
    ],
  }
);

// Bool conversions
export const TYPE_CONVERT_BOOL_FUNCTION_DECL = functionDecl(
  TYPE_CONVERT_BOOL_OVERLOAD,
  {
    overloads: [
      {
        overloadId: BOOL_TO_BOOL_OVERLOAD,
        params: [BOOL_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: STRING_TO_BOOL_OVERLOAD,
        params: [STRING_TYPE],
        resultType: BOOL_TYPE,
      },
    ],
  }
);

// Bytes conversions
export const TYPE_CONVERT_BYTES_FUNCTION_DECL = functionDecl(
  TYPE_CONVERT_BYTES_OVERLOAD,
  {
    overloads: [
      {
        overloadId: BYTES_TO_BYTES_OVERLOAD,
        params: [BYTES_TYPE],
        resultType: BYTES_TYPE,
      },
      {
        overloadId: STRING_TO_BYTES_OVERLOAD,
        params: [STRING_TYPE],
        resultType: BYTES_TYPE,
      },
    ],
  }
);

// Double conversions
export const TYPE_CONVERT_DOUBLE_FUNCTION_DECL = functionDecl(
  TYPE_CONVERT_DOUBLE_OVERLOAD,
  {
    overloads: [
      {
        overloadId: DOUBLE_TO_DOUBLE_OVERLOAD,
        params: [DOUBLE_TYPE],
        resultType: DOUBLE_TYPE,
      },
      {
        overloadId: INT_TO_DOUBLE_OVERLOAD,
        params: [INT64_TYPE],
        resultType: DOUBLE_TYPE,
      },
      {
        overloadId: STRING_TO_DOUBLE_OVERLOAD,
        params: [STRING_TYPE],
        resultType: DOUBLE_TYPE,
      },
      {
        overloadId: UINT_TO_DOUBLE_OVERLOAD,
        params: [UINT64_TYPE],
        resultType: DOUBLE_TYPE,
      },
    ],
  }
);

// TODO: // Duration conversions

// Dyn conversions
export const TYPE_CONVERT_DYN_FUNCTION_DECL = functionDecl(
  TYPE_CONVERT_DYN_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TYPE_CONVERT_TYPE_OVERLOAD,
        params: [paramA],
        resultType: DYN_TYPE,
      },
    ],
  }
);

// Int conversions
export const TYPE_CONVERT_INT_FUNCTION_DECL = functionDecl(
  TYPE_CONVERT_INT_OVERLOAD,
  {
    overloads: [
      {
        overloadId: INT_TO_INT_OVERLOAD,
        params: [INT64_TYPE],
        resultType: INT64_TYPE,
      },
      {
        overloadId: DOUBLE_TO_INT_OVERLOAD,
        params: [DOUBLE_TYPE],
        resultType: INT64_TYPE,
      },
      // TODO: duration & timestamp
      {
        overloadId: STRING_TO_INT_OVERLOAD,
        params: [STRING_TYPE],
        resultType: INT64_TYPE,
      },
      {
        overloadId: UINT_TO_INT_OVERLOAD,
        params: [UINT64_TYPE],
        resultType: INT64_TYPE,
      },
    ],
  }
);

// String conversions
export const TYPE_CONVERT_STRING_FUNCTION_DECL = functionDecl(
  TYPE_CONVERT_STRING_OVERLOAD,
  {
    overloads: [
      {
        overloadId: STRING_TO_STRING_OVERLOAD,
        params: [STRING_TYPE],
        resultType: STRING_TYPE,
      },
      {
        overloadId: BOOL_TO_STRING_OVERLOAD,
        params: [BOOL_TYPE],
        resultType: STRING_TYPE,
      },
      {
        overloadId: BYTES_TO_STRING_OVERLOAD,
        params: [BYTES_TYPE],
        resultType: STRING_TYPE,
      },
      {
        overloadId: DOUBLE_TO_STRING_OVERLOAD,
        params: [DOUBLE_TYPE],
        resultType: STRING_TYPE,
      },
      {
        overloadId: INT_TO_STRING_OVERLOAD,
        params: [INT64_TYPE],
        resultType: STRING_TYPE,
      },
      {
        overloadId: UINT_TO_STRING_OVERLOAD,
        params: [UINT64_TYPE],
        resultType: STRING_TYPE,
      },
      // TODO: duration & timestamp
    ],
  }
);

// TODO: // Timestamp conversions

// Uint conversions
export const TYPE_CONVERT_UINT_FUNCTION_DECL = functionDecl(
  TYPE_CONVERT_UINT_OVERLOAD,
  {
    overloads: [
      {
        overloadId: UINT_TO_UINT_OVERLOAD,
        params: [UINT64_TYPE],
        resultType: UINT64_TYPE,
      },
      {
        overloadId: DOUBLE_TO_UINT_OVERLOAD,
        params: [DOUBLE_TYPE],
        resultType: UINT64_TYPE,
      },
      {
        overloadId: INT_TO_UINT_OVERLOAD,
        params: [INT64_TYPE],
        resultType: UINT64_TYPE,
      },
      {
        overloadId: STRING_TO_UINT_OVERLOAD,
        params: [STRING_TYPE],
        resultType: UINT64_TYPE,
      },
    ],
  }
);

// TODO: // String functions

// TODO: // Timestamp / duration functions

export const STANDARD_FUNCTION_DECLARATIONS = [
  CONDITIONAL_FUNCTION_DECL,
  LOGICAL_AND_FUNCTION_DECL,
  LOGICAL_OR_FUNCTION_DECL,
  LOGICAL_NOT_FUNCTION_DECL,
  NOT_STRICTLY_FALSE_FUNCTION_DECL,
  EQUALS_FUNCTION_DECL,
  NOT_EQUALS_FUNCTION_DECL,
  ADD_FUNCTION_DECL,
  DIVIDE_FUNCTION_DECL,
  MODULO_FUNCTION_DECL,
  MULTIPLY_FUNCTION_DECL,
  NEGATE_FUNCTION_DECL,
  SUBTRACT_FUNCTION_DECL,
  LESS_FUNCTION_DECL,
  LESS_EQUALS_FUNCTION_DECL,
  GREATER_FUNCTION_DECL,
  GREATER_EQUALS_FUNCTION_DECL,
  INDEX_FUNCTION_DECL,
  IN_FUNCTION_DECL,
  SIZE_FUNCTION_DECL,
  TYPE_CONVERT_TYPE_FUNCTION_DECL,
  TYPE_CONVERT_BOOL_FUNCTION_DECL,
  TYPE_CONVERT_BYTES_FUNCTION_DECL,
  TYPE_CONVERT_DOUBLE_FUNCTION_DECL,
  TYPE_CONVERT_DYN_FUNCTION_DECL,
  TYPE_CONVERT_INT_FUNCTION_DECL,
  TYPE_CONVERT_STRING_FUNCTION_DECL,
  TYPE_CONVERT_UINT_FUNCTION_DECL,
];

// TODO: SingletonUnaryBinding, traits
