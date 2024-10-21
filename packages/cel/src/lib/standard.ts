import { Decl } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
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
  DurationSchema,
  FloatValueSchema,
  Int32ValueSchema,
  Int64ValueSchema,
  ListValueSchema,
  ValueSchema as ProtobufValueSchema,
  StringValueSchema,
  StructSchema,
  TimestampSchema,
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
  ADD_DURATION_DURATION_OVERLOAD,
  ADD_DURATION_TIMESTAMP_OVERLOAD,
  ADD_INT64_OVERLOAD,
  ADD_LIST_OVERLOAD,
  ADD_STRING_OVERLOAD,
  ADD_TIMESTAMP_DURATION_OVERLOAD,
  ADD_UINT64_OVERLOAD,
  BOOL_TO_BOOL_OVERLOAD,
  BOOL_TO_STRING_OVERLOAD,
  BYTES_TO_BYTES_OVERLOAD,
  BYTES_TO_STRING_OVERLOAD,
  CONDITIONAL_OVERLOAD,
  CONTAINS_OVERLOAD,
  CONTAINS_STRING_OVERLOAD,
  DIVIDE_DOUBLE_OVERLOAD,
  DIVIDE_INT64_OVERLOAD,
  DIVIDE_UINT64_OVERLOAD,
  DOUBLE_TO_DOUBLE_OVERLOAD,
  DOUBLE_TO_INT_OVERLOAD,
  DOUBLE_TO_STRING_OVERLOAD,
  DOUBLE_TO_UINT_OVERLOAD,
  DURATION_TO_DURATION_OVERLOAD,
  DURATION_TO_HOURS_OVERLOAD,
  DURATION_TO_INT_OVERLOAD,
  DURATION_TO_MILLISECONDS_OVERLOAD,
  DURATION_TO_MINUTES_OVERLOAD,
  DURATION_TO_SECONDS_OVERLOAD,
  DURATION_TO_STRING_OVERLOAD,
  ENDS_WITH_OVERLOAD,
  ENDS_WITH_STRING_OVERLOAD,
  EQUALS_OVERLOAD,
  GREATER_BOOL_OVERLOAD,
  GREATER_BYTES_OVERLOAD,
  GREATER_DOUBLE_INT64_OVERLOAD,
  GREATER_DOUBLE_OVERLOAD,
  GREATER_DOUBLE_UINT64_OVERLOAD,
  GREATER_DURATION_OVERLOAD,
  GREATER_EQUALS_BOOL_OVERLOAD,
  GREATER_EQUALS_BYTES_OVERLOAD,
  GREATER_EQUALS_DOUBLE_INT64_OVERLOAD,
  GREATER_EQUALS_DOUBLE_OVERLOAD,
  GREATER_EQUALS_DOUBLE_UINT64_OVERLOAD,
  GREATER_EQUALS_DURATION_OVERLOAD,
  GREATER_EQUALS_INT64_DOUBLE_OVERLOAD,
  GREATER_EQUALS_INT64_OVERLOAD,
  GREATER_EQUALS_INT64_UINT64_OVERLOAD,
  GREATER_EQUALS_STRING_OVERLOAD,
  GREATER_EQUALS_TIMESTAMP_OVERLOAD,
  GREATER_EQUALS_UINT64_DOUBLE_OVERLOAD,
  GREATER_EQUALS_UINT64_INT64_OVERLOAD,
  GREATER_EQUALS_UINT64_OVERLOAD,
  GREATER_INT64_DOUBLE_OVERLOAD,
  GREATER_INT64_OVERLOAD,
  GREATER_INT64_UINT64_OVERLOAD,
  GREATER_STRING_OVERLOAD,
  GREATER_TIMESTAMP_OVERLOAD,
  GREATER_UINT64_DOUBLE_OVERLOAD,
  GREATER_UINT64_INT64_OVERLOAD,
  GREATER_UINT64_OVERLOAD,
  INDEX_LIST_OVERLOAD,
  INDEX_MAP_OVERLOAD,
  INT_TO_DOUBLE_OVERLOAD,
  INT_TO_DURATION_OVERLOAD,
  INT_TO_INT_OVERLOAD,
  INT_TO_STRING_OVERLOAD,
  INT_TO_TIMESTAMP_OVERLOAD,
  INT_TO_UINT_OVERLOAD,
  IN_LIST_OVERLOAD,
  IN_MAP_OVERLOAD,
  LESS_BOOL_OVERLOAD,
  LESS_BYTES_OVERLOAD,
  LESS_DOUBLE_INT64_OVERLOAD,
  LESS_DOUBLE_OVERLOAD,
  LESS_DOUBLE_UINT64_OVERLOAD,
  LESS_DURATION_OVERLOAD,
  LESS_EQUALS_BYTES_OVERLOAD,
  LESS_EQUALS_DOUBLE_INT64_OVERLOAD,
  LESS_EQUALS_DOUBLE_OVERLOAD,
  LESS_EQUALS_DOUBLE_UINT64_OVERLOAD,
  LESS_EQUALS_DURATION_OVERLOAD,
  LESS_EQUALS_INT64_DOUBLE_OVERLOAD,
  LESS_EQUALS_INT64_OVERLOAD,
  LESS_EQUALS_INT64_UINT64_OVERLOAD,
  LESS_EQUALS_STRING_OVERLOAD,
  LESS_EQUALS_TIMESTAMP_OVERLOAD,
  LESS_EQUALS_UINT64_DOUBLE_OVERLOAD,
  LESS_EQUALS_UINT64_INT64_OVERLOAD,
  LESS_EQUALS_UINT64_OVERLOAD,
  LESS_INT64_DOUBLE_OVERLOAD,
  LESS_INT64_OVERLOAD,
  LESS_INT64_UINT64_OVERLOAD,
  LESS_STRING_OVERLOAD,
  LESS_TIMESTAMP_OVERLOAD,
  LESS_UINT64_DOUBLE_OVERLOAD,
  LESS_UINT64_INT64_OVERLOAD,
  LESS_UINT64_OVERLOAD,
  LOGICAL_AND_OVERLOAD,
  LOGICAL_NOT_OVERLOAD,
  LOGICAL_OR_OVERLOAD,
  MATCHES_OVERLOAD,
  MATCHES_STRING_OVERLOAD,
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
  STARTS_WITH_OVERLOAD,
  STARTS_WITH_STRING_OVERLOAD,
  STRING_TO_BOOL_OVERLOAD,
  STRING_TO_BYTES_OVERLOAD,
  STRING_TO_DOUBLE_OVERLOAD,
  STRING_TO_DURATION_OVERLOAD,
  STRING_TO_INT_OVERLOAD,
  STRING_TO_STRING_OVERLOAD,
  STRING_TO_TIMESTAMP_OVERLOAD,
  STRING_TO_UINT_OVERLOAD,
  SUBTRACT_DOUBLE_OVERLOAD,
  SUBTRACT_DURATION_DURATION_OVERLOAD,
  SUBTRACT_INT64_OVERLOAD,
  SUBTRACT_TIMESTAMP_DURATION_OVERLOAD,
  SUBTRACT_TIMESTAMP_TIMESTAMP_OVERLOAD,
  SUBTRACT_UINT64_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_WEEK_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_WEEK_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_YEAR_OVERLOAD,
  TIMESTAMP_TO_DAY_OF_YEAR_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_HOURS_OVERLOAD,
  TIMESTAMP_TO_HOURS_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_INT_OVERLOAD,
  TIMESTAMP_TO_MILLISECONDS_OVERLOAD,
  TIMESTAMP_TO_MILLISECONDS_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_MINUTES_OVERLOAD,
  TIMESTAMP_TO_MINUTES_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_MONTH_OVERLOAD,
  TIMESTAMP_TO_MONTH_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_SECONDS_OVERLOAD,
  TIMESTAMP_TO_SECONDS_WITH_TZ_OVERLOAD,
  TIMESTAMP_TO_STRING_OVERLOAD,
  TIMESTAMP_TO_TIMESTAMP_OVERLOAD,
  TIMESTAMP_TO_YEAR_OVERLOAD,
  TIMESTAMP_TO_YEAR_WITH_TZ_OVERLOAD,
  TIME_GET_DATE_OVERLOAD,
  TIME_GET_DAY_OF_MONTH_OVERLOAD,
  TIME_GET_DAY_OF_WEEK_OVERLOAD,
  TIME_GET_DAY_OF_YEAR_OVERLOAD,
  TIME_GET_FULL_YEAR_OVERLOAD,
  TIME_GET_HOURS_OVERLOAD,
  TIME_GET_MILLISECONDS_OVERLOAD,
  TIME_GET_MINUTES_OVERLOAD,
  TIME_GET_MONTH_OVERLOAD,
  TIME_GET_SECONDS_OVERLOAD,
  TYPE_CONVERT_BOOL_OVERLOAD,
  TYPE_CONVERT_BYTES_OVERLOAD,
  TYPE_CONVERT_DOUBLE_OVERLOAD,
  TYPE_CONVERT_DURATION_OVERLOAD,
  TYPE_CONVERT_DYN_OVERLOAD,
  TYPE_CONVERT_INT_OVERLOAD,
  TYPE_CONVERT_STRING_OVERLOAD,
  TYPE_CONVERT_TIMESTAMP_OVERLOAD,
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
  DURATION_TYPE,
  DYN_TYPE,
  INT64_TYPE,
  NULL_TYPE,
  STRING_TYPE,
  TIMESTAMP_TYPE,
  TYPE_TYPE,
  UINT64_TYPE,
  listType,
  mapType,
  typeParamType,
  typeType,
} from './types';
import { functionDecl, identDecl } from './utils';

export const STANDARD_DESCRIPTORS: (
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
  TimestampSchema,
  DurationSchema,
];

export const STANDARD_IDENTS: Decl[] = [
  identDecl('bool', { type: typeType(BOOL_TYPE) }),
  identDecl('bytes', { type: typeType(BYTES_TYPE) }),
  identDecl('double', { type: typeType(DOUBLE_TYPE) }),
  identDecl('duration', { type: typeType(DURATION_TYPE) }),
  identDecl('dyn', { type: typeType(DYN_TYPE) }),
  identDecl('int', { type: typeType(INT64_TYPE) }),
  identDecl('string', { type: typeType(STRING_TYPE) }),
  identDecl('timestamp', { type: typeType(TIMESTAMP_TYPE) }),
  identDecl('uint', { type: typeType(UINT64_TYPE) }),
  identDecl('list', { type: typeType(listType({ elemType: DYN_TYPE })) }),
  identDecl('map', {
    type: typeType(mapType({ keyType: DYN_TYPE, valueType: DYN_TYPE })),
  }),
  identDecl('type', { type: typeType(TYPE_TYPE) }),
  identDecl('null_type', { type: typeType(NULL_TYPE) }),
  identDecl('null', { type: NULL_TYPE }),
];

const paramA = typeParamType('A');
const typeParamAList = ['A'];
const paramB = typeParamType('B');
const listOfA = listType({ elemType: paramA });
const mapOfAB = mapType({ keyType: paramA, valueType: paramB });
const typeParamABList = ['A', 'B'];

// Logical operators. Special-cased within the interpreter.
// Note, the singleton binding prevents extensions from overriding the operator
// behavior.
export const CONDITIONAL_FUNCTION_DECL = functionDecl(CONDITIONAL_OPERATOR, {
  overloads: [
    {
      overloadId: CONDITIONAL_OVERLOAD,
      params: [BOOL_TYPE, paramA, paramA],
      resultType: paramA,
      typeParams: typeParamAList,
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
      params: [paramA, paramB],
      resultType: BOOL_TYPE,
      typeParams: typeParamABList,
    },
  ],
});
export const NOT_EQUALS_FUNCTION_DECL = functionDecl(NOT_EQUALS_OPERATOR, {
  overloads: [
    {
      overloadId: NOT_EQUALS_OVERLOAD,
      params: [paramA, paramA],
      resultType: BOOL_TYPE,
      typeParams: typeParamABList,
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
    {
      overloadId: ADD_DURATION_DURATION_OVERLOAD,
      params: [DURATION_TYPE, DURATION_TYPE],
      resultType: DURATION_TYPE,
    },
    {
      overloadId: ADD_DURATION_TIMESTAMP_OVERLOAD,
      params: [DURATION_TYPE, TIMESTAMP_TYPE],
      resultType: TIMESTAMP_TYPE,
    },
    {
      overloadId: ADD_TIMESTAMP_DURATION_OVERLOAD,
      params: [TIMESTAMP_TYPE, DURATION_TYPE],
      resultType: TIMESTAMP_TYPE,
    },
    {
      overloadId: ADD_INT64_OVERLOAD,
      params: [INT64_TYPE, INT64_TYPE],
      resultType: INT64_TYPE,
    },
    {
      overloadId: ADD_LIST_OVERLOAD,
      params: [listOfA, listOfA],
      resultType: listOfA,
      typeParams: typeParamAList,
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
      resultType: INT64_TYPE,
    },
    {
      overloadId: DIVIDE_UINT64_OVERLOAD,
      params: [UINT64_TYPE, UINT64_TYPE],
      resultType: UINT64_TYPE,
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
    {
      overloadId: SUBTRACT_DURATION_DURATION_OVERLOAD,
      params: [DURATION_TYPE, DURATION_TYPE],
      resultType: DURATION_TYPE,
    },
    {
      overloadId: SUBTRACT_TIMESTAMP_DURATION_OVERLOAD,
      params: [TIMESTAMP_TYPE, DURATION_TYPE],
      resultType: TIMESTAMP_TYPE,
    },
    {
      overloadId: SUBTRACT_TIMESTAMP_TIMESTAMP_OVERLOAD,
      params: [TIMESTAMP_TYPE, TIMESTAMP_TYPE],
      resultType: DURATION_TYPE,
    },
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
    {
      overloadId: LESS_TIMESTAMP_OVERLOAD,
      params: [TIMESTAMP_TYPE, TIMESTAMP_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_DURATION_OVERLOAD,
      params: [DURATION_TYPE, DURATION_TYPE],
      resultType: BOOL_TYPE,
    },
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
    {
      overloadId: LESS_EQUALS_DURATION_OVERLOAD,
      params: [DURATION_TYPE, DURATION_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: LESS_EQUALS_TIMESTAMP_OVERLOAD,
      params: [TIMESTAMP_TYPE, TIMESTAMP_TYPE],
      resultType: BOOL_TYPE,
    },
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
    {
      overloadId: GREATER_TIMESTAMP_OVERLOAD,
      params: [TIMESTAMP_TYPE, TIMESTAMP_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: GREATER_DURATION_OVERLOAD,
      params: [DURATION_TYPE, DURATION_TYPE],
      resultType: BOOL_TYPE,
    },
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
      {
        overloadId: GREATER_EQUALS_DURATION_OVERLOAD,
        params: [DURATION_TYPE, DURATION_TYPE],
        resultType: BOOL_TYPE,
      },
      {
        overloadId: GREATER_EQUALS_TIMESTAMP_OVERLOAD,
        params: [TIMESTAMP_TYPE, TIMESTAMP_TYPE],
        resultType: BOOL_TYPE,
      },
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
      typeParams: typeParamABList,
    },
    {
      overloadId: INDEX_LIST_OVERLOAD,
      params: [listOfA, INT64_TYPE],
      resultType: paramA,
      typeParams: typeParamAList,
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
      typeParams: typeParamAList,
    },
    {
      overloadId: IN_MAP_OVERLOAD,
      params: [paramA, mapOfAB],
      resultType: BOOL_TYPE,
      typeParams: typeParamABList,
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
      isInstanceFunction: true,
    },
    {
      overloadId: SIZE_LIST_OVERLOAD,
      params: [listOfA],
      resultType: INT64_TYPE,
      typeParams: typeParamAList,
    },
    {
      overloadId: SIZE_LIST_INST_OVERLOAD,
      params: [listOfA],
      resultType: INT64_TYPE,
      typeParams: typeParamAList,
      isInstanceFunction: true,
    },
    {
      overloadId: SIZE_MAP_OVERLOAD,
      params: [mapOfAB],
      resultType: INT64_TYPE,
      typeParams: typeParamABList,
    },
    {
      overloadId: SIZE_MAP_INST_OVERLOAD,
      params: [mapOfAB],
      resultType: INT64_TYPE,
      typeParams: typeParamABList,
      isInstanceFunction: true,
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
      isInstanceFunction: true,
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
        typeParams: typeParamAList,
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

// Duration conversions
export const TYPE_CONVERT_DURATION_FUNCTION_DECL = functionDecl(
  TYPE_CONVERT_DURATION_OVERLOAD,
  {
    overloads: [
      {
        overloadId: DURATION_TO_DURATION_OVERLOAD,
        params: [DURATION_TYPE],
        resultType: DURATION_TYPE,
      },
      {
        overloadId: INT_TO_DURATION_OVERLOAD,
        params: [INT64_TYPE],
        resultType: DURATION_TYPE,
      },
      {
        overloadId: STRING_TO_DURATION_OVERLOAD,
        params: [STRING_TYPE],
        resultType: DURATION_TYPE,
      },
    ],
  }
);

// Dyn conversions
export const TYPE_CONVERT_DYN_FUNCTION_DECL = functionDecl(
  TYPE_CONVERT_DYN_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TYPE_CONVERT_TYPE_OVERLOAD,
        params: [paramA],
        resultType: DYN_TYPE,
        typeParams: typeParamAList,
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
      {
        overloadId: DURATION_TO_INT_OVERLOAD,
        params: [DURATION_TYPE],
        resultType: INT64_TYPE,
      },
      {
        overloadId: STRING_TO_INT_OVERLOAD,
        params: [STRING_TYPE],
        resultType: INT64_TYPE,
      },
      {
        overloadId: TIMESTAMP_TO_INT_OVERLOAD,
        params: [TIMESTAMP_TYPE],
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
      {
        overloadId: DURATION_TO_STRING_OVERLOAD,
        params: [DURATION_TYPE],
        resultType: STRING_TYPE,
      },
      {
        overloadId: TIMESTAMP_TO_STRING_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: STRING_TYPE,
      },
    ],
  }
);

// Timestamp conversions
export const TYPE_CONVERT_TIMESTAMP_FUNCTION_DECL = functionDecl(
  TYPE_CONVERT_TIMESTAMP_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TIMESTAMP_TO_TIMESTAMP_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: TIMESTAMP_TYPE,
      },
      {
        overloadId: INT_TO_TIMESTAMP_OVERLOAD,
        params: [INT64_TYPE],
        resultType: TIMESTAMP_TYPE,
      },
      {
        overloadId: STRING_TO_TIMESTAMP_OVERLOAD,
        params: [STRING_TYPE],
        resultType: TIMESTAMP_TYPE,
      },
    ],
  }
);

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

// String functions
export const STRING_CONTAINS_FUNCTION_DECL = functionDecl(CONTAINS_OVERLOAD, {
  overloads: [
    {
      overloadId: CONTAINS_STRING_OVERLOAD,
      params: [STRING_TYPE, STRING_TYPE],
      resultType: BOOL_TYPE,
    },
  ],
});
export const STRING_ENDSWITH_FUNCTION_DECL = functionDecl(ENDS_WITH_OVERLOAD, {
  overloads: [
    {
      overloadId: ENDS_WITH_STRING_OVERLOAD,
      params: [STRING_TYPE, STRING_TYPE],
      resultType: BOOL_TYPE,
    },
  ],
});
export const STRING_STARTSWITH_FUNCTION_DECL = functionDecl(
  STARTS_WITH_OVERLOAD,
  {
    overloads: [
      {
        overloadId: STARTS_WITH_STRING_OVERLOAD,
        params: [STRING_TYPE, STRING_TYPE],
        resultType: BOOL_TYPE,
      },
    ],
  }
);
export const STRING_MATCHES_FUNCTION_DECL = functionDecl(MATCHES_OVERLOAD, {
  overloads: [
    {
      overloadId: MATCHES_OVERLOAD,
      params: [STRING_TYPE, STRING_TYPE],
      resultType: BOOL_TYPE,
    },
    {
      overloadId: MATCHES_STRING_OVERLOAD,
      params: [STRING_TYPE, STRING_TYPE],
      resultType: BOOL_TYPE,
    },
  ],
});

// Timestamp / duration functions
export const TIME_GET_FULL_YEAR_FUNCTION_DECL = functionDecl(
  TIME_GET_FULL_YEAR_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TIMESTAMP_TO_YEAR_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: TIMESTAMP_TO_YEAR_WITH_TZ_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: STRING_TYPE,
        isInstanceFunction: true,
      },
    ],
  }
);
export const TIME_GET_MONTH_FUNCTION_DECL = functionDecl(
  TIME_GET_MONTH_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TIMESTAMP_TO_MONTH_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: TIMESTAMP_TO_MONTH_WITH_TZ_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: STRING_TYPE,
        isInstanceFunction: true,
      },
    ],
  }
);
export const TIME_GET_DAY_OF_YEAR_FUNCTION_DECL = functionDecl(
  TIME_GET_DAY_OF_YEAR_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TIMESTAMP_TO_DAY_OF_YEAR_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: TIMESTAMP_TO_DAY_OF_YEAR_WITH_TZ_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: STRING_TYPE,
        isInstanceFunction: true,
      },
    ],
  }
);
export const TIME_GET_DAY_OF_MONTH_FUNCTION_DECL = functionDecl(
  TIME_GET_DAY_OF_MONTH_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_WITH_TZ_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: STRING_TYPE,
        isInstanceFunction: true,
      },
    ],
  }
);
export const TIME_GET_DATE_FUNCTION_DECL = functionDecl(
  TIME_GET_DATE_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_WITH_TZ_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: STRING_TYPE,
        isInstanceFunction: true,
      },
    ],
  }
);
export const TIME_GET_DAY_OF_WEEK_FUNCTION_DECL = functionDecl(
  TIME_GET_DAY_OF_WEEK_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TIMESTAMP_TO_DAY_OF_WEEK_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: TIMESTAMP_TO_DAY_OF_WEEK_WITH_TZ_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: STRING_TYPE,
        isInstanceFunction: true,
      },
    ],
  }
);
export const TIME_GET_HOURS_FUNCTION_DECL = functionDecl(
  TIME_GET_HOURS_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TIMESTAMP_TO_HOURS_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: TIMESTAMP_TO_HOURS_WITH_TZ_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: STRING_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: DURATION_TO_HOURS_OVERLOAD,
        params: [DURATION_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
    ],
  }
);
export const TIME_GET_MINUTES_FUNCTION_DECL = functionDecl(
  TIME_GET_MINUTES_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TIMESTAMP_TO_MINUTES_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: TIMESTAMP_TO_MINUTES_WITH_TZ_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: STRING_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: DURATION_TO_MINUTES_OVERLOAD,
        params: [DURATION_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
    ],
  }
);
export const TIME_GET_SECONDS_FUNCTION_DECL = functionDecl(
  TIME_GET_SECONDS_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TIMESTAMP_TO_SECONDS_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: TIMESTAMP_TO_SECONDS_WITH_TZ_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: STRING_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: DURATION_TO_SECONDS_OVERLOAD,
        params: [DURATION_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
    ],
  }
);
export const TIME_GET_MILLISECONDS_FUNCTION_DECL = functionDecl(
  TIME_GET_MILLISECONDS_OVERLOAD,
  {
    overloads: [
      {
        overloadId: TIMESTAMP_TO_MILLISECONDS_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: TIMESTAMP_TO_MILLISECONDS_WITH_TZ_OVERLOAD,
        params: [TIMESTAMP_TYPE],
        resultType: STRING_TYPE,
        isInstanceFunction: true,
      },
      {
        overloadId: DURATION_TO_MILLISECONDS_OVERLOAD,
        params: [DURATION_TYPE],
        resultType: INT64_TYPE,
        isInstanceFunction: true,
      },
    ],
  }
);

export const STANDARD_FUNCTION_DECLARATIONS: Decl[] = [
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
  TYPE_CONVERT_DURATION_FUNCTION_DECL,
  TYPE_CONVERT_DYN_FUNCTION_DECL,
  TYPE_CONVERT_INT_FUNCTION_DECL,
  TYPE_CONVERT_STRING_FUNCTION_DECL,
  TYPE_CONVERT_TIMESTAMP_FUNCTION_DECL,
  TYPE_CONVERT_UINT_FUNCTION_DECL,
  STRING_CONTAINS_FUNCTION_DECL,
  STRING_ENDSWITH_FUNCTION_DECL,
  STRING_MATCHES_FUNCTION_DECL,
  STRING_STARTSWITH_FUNCTION_DECL,
  TIME_GET_FULL_YEAR_FUNCTION_DECL,
  TIME_GET_MONTH_FUNCTION_DECL,
  TIME_GET_DAY_OF_YEAR_FUNCTION_DECL,
  TIME_GET_DAY_OF_MONTH_FUNCTION_DECL,
  TIME_GET_DATE_FUNCTION_DECL,
  TIME_GET_DAY_OF_WEEK_FUNCTION_DECL,
  TIME_GET_HOURS_FUNCTION_DECL,
  TIME_GET_MINUTES_FUNCTION_DECL,
  TIME_GET_SECONDS_FUNCTION_DECL,
  TIME_GET_MILLISECONDS_FUNCTION_DECL,
];

// TODO: SingletonUnaryBinding, traits
