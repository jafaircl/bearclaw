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
  CONDITIONAL_OVERLOAD,
  DIVIDE_DOUBLE_OVERLOAD,
  DIVIDE_INT64_OVERLOAD,
  DIVIDE_UINT64_OVERLOAD,
  EQUALS_OVERLOAD,
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
  SUBTRACT_DOUBLE_OVERLOAD,
  SUBTRACT_INT64_OVERLOAD,
  SUBTRACT_UINT64_OVERLOAD,
} from './overloads';
import {
  BOOL_TYPE,
  BYTES_TYPE,
  DOUBLE_TYPE,
  INT64_TYPE,
  STRING_TYPE,
  UINT64_TYPE,
  listType,
  mapType,
  typeParamType,
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
];

// TODO: SingletonUnaryBinding, traits
