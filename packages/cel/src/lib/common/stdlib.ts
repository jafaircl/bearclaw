import {
  BOOL_TO_STRING_OVERLOAD,
  BYTES_TO_STRING_OVERLOAD,
  CONTAINS_OVERLOAD,
  CONTAINS_STRING_OVERLOAD,
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
  INT_TO_DURATION_OVERLOAD,
  INT_TO_INT_OVERLOAD,
  INT_TO_STRING_OVERLOAD,
  INT_TO_TIMESTAMP_OVERLOAD,
  INT_TO_UINT_OVERLOAD,
  MATCHES_OVERLOAD,
  MATCHES_STRING_OVERLOAD,
  STARTS_WITH_OVERLOAD,
  STARTS_WITH_STRING_OVERLOAD,
  STRING_TO_DURATION_OVERLOAD,
  STRING_TO_INT_OVERLOAD,
  STRING_TO_STRING_OVERLOAD,
  STRING_TO_TIMESTAMP_OVERLOAD,
  STRING_TO_UINT_OVERLOAD,
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
  TO_DYN_OVERLOAD,
  TYPE_CONVERT_DYN_OVERLOAD,
  TYPE_CONVERT_INT_OVERLOAD,
  TYPE_CONVERT_STRING_OVERLOAD,
  TYPE_CONVERT_TIMESTAMP_OVERLOAD,
  TYPE_CONVERT_UINT_OVERLOAD,
  UINT_TO_INT_OVERLOAD,
  UINT_TO_STRING_OVERLOAD,
  UINT_TO_UINT_OVERLOAD,
} from './overloads';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DescMessage } from '@bufbuild/protobuf';
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
  FunctionDecl,
  newTypeVariable,
  OverloadDecl,
  VariableDecl,
} from './decls';
import { Overload } from './functions';
import {
  ADD_OPERATOR,
  CONDITIONAL_OPERATOR,
  DIVIDE_OPERATOR,
  EQUALS_OPERATOR,
  GREATER_EQUALS_OPERATOR,
  GREATER_OPERATOR,
  IN_OPERATOR,
  INDEX_OPERATOR,
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
  BYTES_TO_BYTES_OVERLOAD,
  CONDITIONAL_OVERLOAD,
  DIVIDE_DOUBLE_OVERLOAD,
  DIVIDE_INT64_OVERLOAD,
  DIVIDE_UINT64_OVERLOAD,
  DOUBLE_TO_DOUBLE_OVERLOAD,
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
  IN_LIST_OVERLOAD,
  IN_MAP_OVERLOAD,
  INDEX_LIST_OVERLOAD,
  INDEX_MAP_OVERLOAD,
  INT_TO_DOUBLE_OVERLOAD,
  LESS_BOOL_OVERLOAD,
  LESS_BYTES_OVERLOAD,
  LESS_DOUBLE_INT64_OVERLOAD,
  LESS_DOUBLE_OVERLOAD,
  LESS_DOUBLE_UINT64_OVERLOAD,
  LESS_DURATION_OVERLOAD,
  LESS_EQUALS_BOOL_OVERLOAD,
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
  SUBTRACT_DOUBLE_OVERLOAD,
  SUBTRACT_DURATION_DURATION_OVERLOAD,
  SUBTRACT_INT64_OVERLOAD,
  SUBTRACT_TIMESTAMP_DURATION_OVERLOAD,
  SUBTRACT_TIMESTAMP_TIMESTAMP_OVERLOAD,
  SUBTRACT_UINT64_OVERLOAD,
  TYPE_CONVERT_BOOL_OVERLOAD,
  TYPE_CONVERT_BYTES_OVERLOAD,
  TYPE_CONVERT_DOUBLE_OVERLOAD,
  TYPE_CONVERT_DURATION_OVERLOAD,
  TYPE_CONVERT_TYPE_OVERLOAD,
  UINT_TO_DOUBLE_OVERLOAD,
} from './overloads';
import { RefVal } from './ref/reference';
import { BoolRefVal, isBoolRefVal } from './types/bool';
import { ErrorRefVal } from './types/error';
import { IntRefVal } from './types/int';
import {
  stringContains,
  stringEndsWith,
  stringStartsWith,
} from './types/string';
import { Comparer } from './types/traits/comparer';
import { Container } from './types/traits/container';
import { Indexer } from './types/traits/indexer';
import { Matcher } from './types/traits/matcher';
import {
  Adder,
  Divider,
  Modder,
  Multiplier,
  Negater,
  Subtractor,
} from './types/traits/math';
import { Sizer } from './types/traits/sizer';
import { Trait } from './types/traits/trait';
import {
  BoolType,
  BytesType,
  DoubleType,
  DurationType,
  DynType,
  IntType,
  newListType,
  newMapType,
  newTypeParamType,
  newTypeTypeWithParam,
  NullType,
  StringType,
  TimestampType,
  TypeType,
  UintType,
} from './types/types';

export const StandardProtoDescriptors = new Set<DescMessage>([
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
]);

const paramA = newTypeParamType('A');
const paramB = newTypeParamType('B');
const listOfA = newListType(paramA);
const mapOfAB = newMapType(paramA, paramB);

export const stdTypes = [
  newTypeVariable(BoolType),
  newTypeVariable(BytesType),
  newTypeVariable(DoubleType),
  newTypeVariable(DurationType),
  newTypeVariable(IntType),
  newTypeVariable(listOfA),
  newTypeVariable(mapOfAB),
  newTypeVariable(NullType),
  newTypeVariable(StringType),
  newTypeVariable(TimestampType),
  newTypeVariable(TypeType),
  newTypeVariable(UintType),
];
export const stdTypeMaps = stdTypes.reduce((acc, t) => {
  acc.set(t.name(), t);
  return acc;
}, new Map<string, VariableDecl>());

export const stdFunctions = [
  // Logical operators. Special-cased within the interpreter.
  // Note, the singleton binding prevents extensions from overriding the
  // operator behavior.
  new FunctionDecl({
    name: CONDITIONAL_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: CONDITIONAL_OVERLOAD,
        argTypes: [BoolType, paramA, paramA],
        resultType: paramA,
        nonStrict: true,
      }),
    ],
    singleton: new Overload({
      operator: CONDITIONAL_OPERATOR,
      function: noFunctionOverrides,
    }),
  }),
  new FunctionDecl({
    name: LOGICAL_AND_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: LOGICAL_AND_OVERLOAD,
        argTypes: [BoolType, BoolType],
        resultType: BoolType,
        nonStrict: true,
      }),
    ],
    singleton: new Overload({
      operator: LOGICAL_AND_OPERATOR,
      binary: noFunctionOverrides,
    }),
  }),
  new FunctionDecl({
    name: LOGICAL_OR_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: LOGICAL_OR_OVERLOAD,
        argTypes: [BoolType, BoolType],
        resultType: BoolType,
        nonStrict: true,
      }),
    ],
    singleton: new Overload({
      operator: LOGICAL_OR_OPERATOR,
      binary: noFunctionOverrides,
    }),
  }),
  new FunctionDecl({
    name: LOGICAL_NOT_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: LOGICAL_NOT_OVERLOAD,
        argTypes: [BoolType],
        resultType: BoolType,
        nonStrict: true,
      }),
    ],
    singleton: new Overload({
      operator: LOGICAL_NOT_OPERATOR,
      unary: (v) => {
        if (!isBoolRefVal(v)) {
          return ErrorRefVal.maybeNoSuchOverload(v);
        }
        return (v as RefVal & Negater).negate();
      },
      operandTrait: Trait.NEGATER_TYPE,
    }),
  }),

  // Comprehension short-circuiting related function
  new FunctionDecl({
    name: NOT_STRICTLY_FALSE_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: NOT_STRICTLY_FALSE_OVERLOAD,
        argTypes: [BoolType],
        resultType: BoolType,
        nonStrict: true,
        unaryOp: (v) => {
          if (v.type().equal(BoolType)) {
            return v;
          }
          return BoolRefVal.True;
        },
      }),
    ],
  }),

  // Equality / inequality
  new FunctionDecl({
    name: EQUALS_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: EQUALS_OVERLOAD,
        argTypes: [paramA, paramA],
        resultType: BoolType,
      }),
    ],
    singleton: new Overload({
      operator: EQUALS_OPERATOR,
      binary: noFunctionOverrides,
    }),
  }),

  new FunctionDecl({
    name: NOT_EQUALS_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: NOT_EQUALS_OVERLOAD,
        argTypes: [paramA, paramA],
        resultType: BoolType,
      }),
    ],
    singleton: new Overload({
      operator: NOT_EQUALS_OPERATOR,
      binary: noFunctionOverrides,
    }),
  }),

  // Mathematical operators
  new FunctionDecl({
    name: ADD_OPERATOR,
    overloads: [
      // Bytes addition
      new OverloadDecl({
        id: ADD_BYTES_OVERLOAD,
        argTypes: [BytesType, BytesType],
        resultType: BytesType,
      }),
      // Double addition
      new OverloadDecl({
        id: ADD_DOUBLE_OVERLOAD,
        argTypes: [DoubleType, DoubleType],
        resultType: DoubleType,
      }),
      // Duration addition
      new OverloadDecl({
        id: ADD_DURATION_DURATION_OVERLOAD,
        argTypes: [DurationType, DurationType],
        resultType: DurationType,
      }),
      // Duration + Timestamp additions
      new OverloadDecl({
        id: ADD_DURATION_TIMESTAMP_OVERLOAD,
        argTypes: [DurationType, TimestampType],
        resultType: TimestampType,
      }),
      new OverloadDecl({
        id: ADD_TIMESTAMP_DURATION_OVERLOAD,
        argTypes: [TimestampType, DurationType],
        resultType: TimestampType,
      }),
      // Integer additions
      new OverloadDecl({
        id: ADD_INT64_OVERLOAD,
        argTypes: [IntType, IntType],
        resultType: IntType,
      }),
      // List addition
      new OverloadDecl({
        id: ADD_LIST_OVERLOAD,
        argTypes: [listOfA, listOfA],
        resultType: listOfA,
      }),
      // String addition
      new OverloadDecl({
        id: ADD_STRING_OVERLOAD,
        argTypes: [StringType, StringType],
        resultType: StringType,
      }),
      // Unsigned integer addition
      new OverloadDecl({
        id: ADD_UINT64_OVERLOAD,
        argTypes: [UintType, UintType],
        resultType: UintType,
      }),
    ],
    singleton: new Overload({
      operator: ADD_OPERATOR,
      binary: (lhs, rhs) => {
        return (lhs as RefVal & Adder).add(rhs);
      },
      operandTrait: Trait.ADDER_TYPE,
    }),
  }),
  new FunctionDecl({
    name: DIVIDE_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: DIVIDE_DOUBLE_OVERLOAD,
        argTypes: [DoubleType, DoubleType],
        resultType: DoubleType,
      }),
      new OverloadDecl({
        id: DIVIDE_INT64_OVERLOAD,
        argTypes: [IntType, IntType],
        resultType: IntType,
      }),
      new OverloadDecl({
        id: DIVIDE_UINT64_OVERLOAD,
        argTypes: [UintType, UintType],
        resultType: UintType,
      }),
    ],
    singleton: new Overload({
      operator: DIVIDE_OPERATOR,
      binary: (lhs, rhs) => {
        return (lhs as RefVal & Divider).divide(rhs);
      },
      operandTrait: Trait.DIVIDER_TYPE,
    }),
  }),

  new FunctionDecl({
    name: MODULO_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: MODULO_INT64_OVERLOAD,
        argTypes: [IntType, IntType],
        resultType: IntType,
      }),
      new OverloadDecl({
        id: MODULO_UINT64_OVERLOAD,
        argTypes: [UintType, UintType],
        resultType: UintType,
      }),
    ],
    singleton: new Overload({
      operator: MODULO_OPERATOR,
      binary: (lhs, rhs) => {
        return (lhs as RefVal & Modder).modulo(rhs);
      },
      operandTrait: Trait.MODDER_TYPE,
    }),
  }),

  new FunctionDecl({
    name: MULTIPLY_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: MULTIPLY_DOUBLE_OVERLOAD,
        argTypes: [DoubleType, DoubleType],
        resultType: DoubleType,
      }),
      new OverloadDecl({
        id: MULTIPLY_INT64_OVERLOAD,
        argTypes: [IntType, IntType],
        resultType: IntType,
      }),
      new OverloadDecl({
        id: MULTIPLY_UINT64_OVERLOAD,
        argTypes: [UintType, UintType],
        resultType: UintType,
      }),
    ],
    singleton: new Overload({
      operator: MULTIPLY_OPERATOR,
      binary: (lhs, rhs) => {
        return (lhs as RefVal & Multiplier).multiply(rhs);
      },
      operandTrait: Trait.MULTIPLIER_TYPE,
    }),
  }),

  new FunctionDecl({
    name: NEGATE_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: NEGATE_DOUBLE_OVERLOAD,
        argTypes: [DoubleType],
        resultType: DoubleType,
      }),
      new OverloadDecl({
        id: NEGATE_INT64_OVERLOAD,
        argTypes: [IntType],
        resultType: IntType,
      }),
    ],
    singleton: new Overload({
      operator: NEGATE_OPERATOR,
      unary: (v) => {
        return (v as RefVal & Negater).negate();
      },
      operandTrait: Trait.NEGATER_TYPE,
    }),
  }),

  new FunctionDecl({
    name: SUBTRACT_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: SUBTRACT_DOUBLE_OVERLOAD,
        argTypes: [DoubleType, DoubleType],
        resultType: DoubleType,
      }),
      new OverloadDecl({
        id: SUBTRACT_DURATION_DURATION_OVERLOAD,
        argTypes: [DurationType, DurationType],
        resultType: DurationType,
      }),
      new OverloadDecl({
        id: SUBTRACT_INT64_OVERLOAD,
        argTypes: [IntType, IntType],
        resultType: IntType,
      }),
      new OverloadDecl({
        id: SUBTRACT_TIMESTAMP_DURATION_OVERLOAD,
        argTypes: [TimestampType, DurationType],
        resultType: TimestampType,
      }),
      new OverloadDecl({
        id: SUBTRACT_TIMESTAMP_TIMESTAMP_OVERLOAD,
        argTypes: [TimestampType, TimestampType],
        resultType: DurationType,
      }),
      new OverloadDecl({
        id: SUBTRACT_UINT64_OVERLOAD,
        argTypes: [UintType, UintType],
        resultType: UintType,
      }),
    ],
    singleton: new Overload({
      operator: SUBTRACT_OPERATOR,
      binary: (lhs, rhs) => {
        return (lhs as RefVal & Subtractor).subtract(rhs);
      },
      operandTrait: Trait.SUBTRACTOR_TYPE,
    }),
  }),

  // Relational operators (Less, LessEquals, Greater, GreaterEquals)
  new FunctionDecl({
    name: LESS_OPERATOR,
    overloads: [
      // Comparisons for various type combinations (Bool, Int, Double, Uint, String, Bytes, Timestamp, Duration)
      new OverloadDecl({
        id: LESS_BOOL_OVERLOAD,
        argTypes: [BoolType, BoolType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_INT64_OVERLOAD,
        argTypes: [IntType, IntType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_INT64_DOUBLE_OVERLOAD,
        argTypes: [IntType, DoubleType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_INT64_UINT64_OVERLOAD,
        argTypes: [IntType, UintType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_UINT64_OVERLOAD,
        argTypes: [UintType, UintType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_UINT64_DOUBLE_OVERLOAD,
        argTypes: [UintType, DoubleType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_UINT64_INT64_OVERLOAD,
        argTypes: [UintType, IntType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_DOUBLE_OVERLOAD,
        argTypes: [DoubleType, DoubleType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_DOUBLE_INT64_OVERLOAD,
        argTypes: [DoubleType, IntType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_DOUBLE_UINT64_OVERLOAD,
        argTypes: [DoubleType, UintType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_STRING_OVERLOAD,
        argTypes: [StringType, StringType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_BYTES_OVERLOAD,
        argTypes: [BytesType, BytesType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_TIMESTAMP_OVERLOAD,
        argTypes: [TimestampType, TimestampType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_DURATION_OVERLOAD,
        argTypes: [DurationType, DurationType],
        resultType: BoolType,
      }),
    ],
    singleton: new Overload({
      operator: LESS_OPERATOR,
      binary: (lhs, rhs) => {
        const cmp = (lhs as RefVal & Comparer).compare(rhs);
        if (cmp.equal(IntRefVal.IntNegOne)) {
          return BoolRefVal.True;
        }
        if (cmp.equal(IntRefVal.IntOne) || cmp.equal(IntRefVal.IntZero)) {
          return BoolRefVal.False;
        }
        return cmp;
      },
      operandTrait: Trait.COMPARER_TYPE,
    }),
  }),

  new FunctionDecl({
    name: LESS_EQUALS_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: LESS_EQUALS_BOOL_OVERLOAD,
        argTypes: [BoolType, BoolType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_INT64_OVERLOAD,
        argTypes: [IntType, IntType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_INT64_DOUBLE_OVERLOAD,
        argTypes: [IntType, DoubleType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_INT64_UINT64_OVERLOAD,
        argTypes: [IntType, UintType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_UINT64_OVERLOAD,
        argTypes: [UintType, UintType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_UINT64_DOUBLE_OVERLOAD,
        argTypes: [UintType, DoubleType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_UINT64_INT64_OVERLOAD,
        argTypes: [UintType, IntType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_DOUBLE_OVERLOAD,
        argTypes: [DoubleType, DoubleType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_DOUBLE_INT64_OVERLOAD,
        argTypes: [DoubleType, IntType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_DOUBLE_UINT64_OVERLOAD,
        argTypes: [DoubleType, UintType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_STRING_OVERLOAD,
        argTypes: [StringType, StringType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_BYTES_OVERLOAD,
        argTypes: [BytesType, BytesType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_TIMESTAMP_OVERLOAD,
        argTypes: [TimestampType, TimestampType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: LESS_EQUALS_DURATION_OVERLOAD,
        argTypes: [DurationType, DurationType],
        resultType: BoolType,
      }),
    ],
    singleton: new Overload({
      operator: LESS_EQUALS_OPERATOR,
      binary: (lhs, rhs) => {
        const cmp = (lhs as RefVal & Comparer).compare(rhs);
        if (cmp.equal(IntRefVal.IntNegOne) || cmp.equal(IntRefVal.IntZero)) {
          return BoolRefVal.True;
        }
        if (cmp === IntRefVal.IntOne) {
          return BoolRefVal.False;
        }
        return cmp;
      },
      operandTrait: Trait.COMPARER_TYPE,
    }),
  }),

  new FunctionDecl({
    name: GREATER_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: GREATER_BOOL_OVERLOAD,
        argTypes: [BoolType, BoolType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_INT64_OVERLOAD,
        argTypes: [IntType, IntType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_INT64_DOUBLE_OVERLOAD,
        argTypes: [IntType, DoubleType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_INT64_UINT64_OVERLOAD,
        argTypes: [IntType, UintType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_UINT64_OVERLOAD,
        argTypes: [UintType, UintType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_UINT64_DOUBLE_OVERLOAD,
        argTypes: [UintType, DoubleType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_UINT64_INT64_OVERLOAD,
        argTypes: [UintType, IntType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_DOUBLE_OVERLOAD,
        argTypes: [DoubleType, DoubleType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_DOUBLE_INT64_OVERLOAD,
        argTypes: [DoubleType, IntType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_DOUBLE_UINT64_OVERLOAD,
        argTypes: [DoubleType, UintType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_STRING_OVERLOAD,
        argTypes: [StringType, StringType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_BYTES_OVERLOAD,
        argTypes: [BytesType, BytesType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_TIMESTAMP_OVERLOAD,
        argTypes: [TimestampType, TimestampType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_DURATION_OVERLOAD,
        argTypes: [DurationType, DurationType],
        resultType: BoolType,
      }),
    ],
    singleton: new Overload({
      operator: GREATER_OPERATOR,
      binary: (lhs, rhs) => {
        const cmp = (lhs as RefVal & Comparer).compare(rhs);
        if (cmp.equal(IntRefVal.IntOne)) {
          return BoolRefVal.True;
        }
        if (cmp.equal(IntRefVal.IntNegOne) || cmp.equal(IntRefVal.IntZero)) {
          return BoolRefVal.False;
        }
        return cmp;
      },
      operandTrait: Trait.COMPARER_TYPE,
    }),
  }),

  new FunctionDecl({
    name: GREATER_EQUALS_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: GREATER_EQUALS_BOOL_OVERLOAD,
        argTypes: [BoolType, BoolType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_INT64_OVERLOAD,
        argTypes: [IntType, IntType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_INT64_DOUBLE_OVERLOAD,
        argTypes: [IntType, DoubleType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_INT64_UINT64_OVERLOAD,
        argTypes: [IntType, UintType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_UINT64_OVERLOAD,
        argTypes: [UintType, UintType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_UINT64_DOUBLE_OVERLOAD,
        argTypes: [UintType, DoubleType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_UINT64_INT64_OVERLOAD,
        argTypes: [UintType, IntType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_DOUBLE_OVERLOAD,
        argTypes: [DoubleType, DoubleType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_DOUBLE_INT64_OVERLOAD,
        argTypes: [DoubleType, IntType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_DOUBLE_UINT64_OVERLOAD,
        argTypes: [DoubleType, UintType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_STRING_OVERLOAD,
        argTypes: [StringType, StringType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_BYTES_OVERLOAD,
        argTypes: [BytesType, BytesType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_TIMESTAMP_OVERLOAD,
        argTypes: [TimestampType, TimestampType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: GREATER_EQUALS_DURATION_OVERLOAD,
        argTypes: [DurationType, DurationType],
        resultType: BoolType,
      }),
    ],
    singleton: new Overload({
      operator: GREATER_EQUALS_OPERATOR,
      binary: (lhs, rhs) => {
        const cmp = (lhs as RefVal & Comparer).compare(rhs);
        if (cmp.equal(IntRefVal.IntOne) || cmp.equal(IntRefVal.IntZero)) {
          return BoolRefVal.True;
        }
        if (cmp.equal(IntRefVal.IntNegOne)) {
          return BoolRefVal.False;
        }
        return cmp;
      },
      operandTrait: Trait.COMPARER_TYPE,
    }),
  }),

  // Indexing
  new FunctionDecl({
    name: INDEX_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: INDEX_LIST_OVERLOAD,
        argTypes: [listOfA, IntType],
        resultType: paramA,
      }),
      new OverloadDecl({
        id: INDEX_MAP_OVERLOAD,
        argTypes: [mapOfAB, paramA],
        resultType: paramB,
      }),
    ],
    singleton: new Overload({
      operator: INDEX_OPERATOR,
      binary: (lhs, rhs) => (lhs as RefVal & Indexer).get(rhs),
      operandTrait: Trait.INDEXER_TYPE,
    }),
  }),

  // Collections operators
  new FunctionDecl({
    name: IN_OPERATOR,
    overloads: [
      new OverloadDecl({
        id: IN_LIST_OVERLOAD,
        argTypes: [paramA, listOfA],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: IN_MAP_OVERLOAD,
        argTypes: [paramA, mapOfAB],
        resultType: BoolType,
      }),
    ],
    singleton: new Overload({
      operator: IN_OPERATOR,
      binary: (lhs, rhs) => {
        if (rhs.type().hasTrait(Trait.CONTAINER_TYPE)) {
          return (rhs as RefVal & Container).contains(lhs);
        }
        return ErrorRefVal.maybeNoSuchOverload(rhs);
      },
      operandTrait: Trait.CONTAINER_TYPE,
    }),
  }),
  new FunctionDecl({
    name: SIZE_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: SIZE_BYTES_OVERLOAD,
        argTypes: [BytesType],
        resultType: IntType,
      }),
      new OverloadDecl({
        id: SIZE_BYTES_INST_OVERLOAD,
        argTypes: [BytesType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: SIZE_LIST_OVERLOAD,
        argTypes: [listOfA],
        resultType: IntType,
      }),
      new OverloadDecl({
        id: SIZE_LIST_INST_OVERLOAD,
        argTypes: [listOfA],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: SIZE_MAP_OVERLOAD,
        argTypes: [mapOfAB],
        resultType: IntType,
      }),
      new OverloadDecl({
        id: SIZE_MAP_INST_OVERLOAD,
        argTypes: [mapOfAB],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: SIZE_STRING_OVERLOAD,
        argTypes: [StringType],
        resultType: IntType,
      }),
      new OverloadDecl({
        id: SIZE_STRING_INST_OVERLOAD,
        argTypes: [StringType],
        resultType: IntType,
        isMemberFunction: true,
      }),
    ],
    singleton: new Overload({
      operator: SIZE_OVERLOAD,
      unary: (v) => (v as RefVal & Sizer).size(),
      operandTrait: Trait.SIZER_TYPE,
    }),
  }),

  // Type conversions
  new FunctionDecl({
    name: TYPE_CONVERT_TYPE_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TYPE_CONVERT_TYPE_OVERLOAD,
        argTypes: [paramA],
        resultType: newTypeTypeWithParam(paramA),
      }),
    ],
    singleton: new Overload({
      operator: TYPE_CONVERT_TYPE_OVERLOAD,
      unary: (v) => v.convertToType(TypeType),
    }),
  }),

  // Bool conversions
  new FunctionDecl({
    name: TYPE_CONVERT_BOOL_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: BOOL_TO_BOOL_OVERLOAD,
        argTypes: [BoolType],
        resultType: BoolType,
        unaryOp: (v) => v,
      }),
      new OverloadDecl({
        id: STRING_TO_BOOL_OVERLOAD,
        argTypes: [StringType],
        resultType: BoolType,
        unaryOp: (v) => v.convertToType(BoolType),
      }),
    ],
  }),

  // Bytes conversions
  new FunctionDecl({
    name: TYPE_CONVERT_BYTES_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: BYTES_TO_BYTES_OVERLOAD,
        argTypes: [BytesType],
        resultType: BytesType,
        unaryOp: (v) => v,
      }),
      new OverloadDecl({
        id: STRING_TO_BYTES_OVERLOAD,
        argTypes: [StringType],
        resultType: BytesType,
        unaryOp: (v) => v.convertToType(BytesType),
      }),
    ],
  }),

  // Double conversions
  new FunctionDecl({
    name: TYPE_CONVERT_DOUBLE_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: DOUBLE_TO_DOUBLE_OVERLOAD,
        argTypes: [DoubleType],
        resultType: DoubleType,
        unaryOp: (v) => v,
      }),
      new OverloadDecl({
        id: INT_TO_DOUBLE_OVERLOAD,
        argTypes: [IntType],
        resultType: DoubleType,
        unaryOp: (v) => v.convertToType(DoubleType),
      }),
      new OverloadDecl({
        id: STRING_TO_DOUBLE_OVERLOAD,
        argTypes: [StringType],
        resultType: DoubleType,
        unaryOp: (v) => v.convertToType(DoubleType),
      }),
      new OverloadDecl({
        id: UINT_TO_DOUBLE_OVERLOAD,
        argTypes: [UintType],
        resultType: DoubleType,
        unaryOp: (v) => v.convertToType(DoubleType),
      }),
    ],
  }),

  // Duration conversions
  new FunctionDecl({
    name: TYPE_CONVERT_DURATION_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: DURATION_TO_DURATION_OVERLOAD,
        argTypes: [DurationType],
        resultType: DurationType,
        unaryOp: (v) => v,
      }),
      new OverloadDecl({
        id: INT_TO_DURATION_OVERLOAD,
        argTypes: [IntType],
        resultType: DurationType,
        unaryOp: (v) => v.convertToType(DurationType),
      }),
      new OverloadDecl({
        id: STRING_TO_DURATION_OVERLOAD,
        argTypes: [StringType],
        resultType: DurationType,
        unaryOp: (v) => v.convertToType(DurationType),
      }),
    ],
  }),

  // Dyn conversions
  new FunctionDecl({
    name: TYPE_CONVERT_DYN_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TO_DYN_OVERLOAD,
        argTypes: [paramA],
        resultType: DynType,
      }),
    ],
    singleton: new Overload({
      operator: TYPE_CONVERT_DYN_OVERLOAD,
      unary: (v) => v,
    }),
  }),

  // Int conversions
  new FunctionDecl({
    name: TYPE_CONVERT_INT_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: INT_TO_INT_OVERLOAD,
        argTypes: [IntType],
        resultType: IntType,
        unaryOp: (v) => v,
      }),
      new OverloadDecl({
        id: DOUBLE_TO_INT_OVERLOAD,
        argTypes: [DoubleType],
        resultType: IntType,
        unaryOp: (v) => v.convertToType(IntType),
      }),
      new OverloadDecl({
        id: DURATION_TO_INT_OVERLOAD,
        argTypes: [DurationType],
        resultType: IntType,
        unaryOp: (v) => v.convertToType(IntType),
      }),
      new OverloadDecl({
        id: STRING_TO_INT_OVERLOAD,
        argTypes: [StringType],
        resultType: IntType,
        unaryOp: (v) => v.convertToType(IntType),
      }),
      new OverloadDecl({
        id: TIMESTAMP_TO_INT_OVERLOAD,
        argTypes: [TimestampType],
        resultType: IntType,
        unaryOp: (v) => v.convertToType(IntType),
      }),
      new OverloadDecl({
        id: UINT_TO_INT_OVERLOAD,
        argTypes: [UintType],
        resultType: IntType,
        unaryOp: (v) => v.convertToType(IntType),
      }),
    ],
  }),

  new FunctionDecl({
    name: TYPE_CONVERT_STRING_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: STRING_TO_STRING_OVERLOAD,
        argTypes: [StringType],
        resultType: StringType,
        unaryOp: (v) => v,
      }),
      new OverloadDecl({
        id: BOOL_TO_STRING_OVERLOAD,
        argTypes: [BoolType],
        resultType: StringType,
        unaryOp: (v) => v.convertToType(StringType),
      }),
      new OverloadDecl({
        id: BYTES_TO_STRING_OVERLOAD,
        argTypes: [BytesType],
        resultType: StringType,
        unaryOp: (v) => v.convertToType(StringType),
      }),
      new OverloadDecl({
        id: DOUBLE_TO_STRING_OVERLOAD,
        argTypes: [DoubleType],
        resultType: StringType,
        unaryOp: (v) => v.convertToType(StringType),
      }),
      new OverloadDecl({
        id: DURATION_TO_STRING_OVERLOAD,
        argTypes: [DurationType],
        resultType: StringType,
        unaryOp: (v) => v.convertToType(StringType),
      }),
      new OverloadDecl({
        id: INT_TO_STRING_OVERLOAD,
        argTypes: [IntType],
        resultType: StringType,
        unaryOp: (v) => v.convertToType(StringType),
      }),
      new OverloadDecl({
        id: TIMESTAMP_TO_STRING_OVERLOAD,
        argTypes: [TimestampType],
        resultType: StringType,
        unaryOp: (v) => v.convertToType(StringType),
      }),
      new OverloadDecl({
        id: UINT_TO_STRING_OVERLOAD,
        argTypes: [UintType],
        resultType: StringType,
        unaryOp: (v) => v.convertToType(StringType),
      }),
    ],
  }),

  // Timestamp conversions
  new FunctionDecl({
    name: TYPE_CONVERT_TIMESTAMP_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TIMESTAMP_TO_TIMESTAMP_OVERLOAD,
        argTypes: [TimestampType],
        resultType: TimestampType,
        unaryOp: (v) => v,
      }),
      new OverloadDecl({
        id: INT_TO_TIMESTAMP_OVERLOAD,
        argTypes: [IntType],
        resultType: TimestampType,
        unaryOp: (v) => v.convertToType(TimestampType),
      }),
      new OverloadDecl({
        id: STRING_TO_TIMESTAMP_OVERLOAD,
        argTypes: [StringType],
        resultType: TimestampType,
        unaryOp: (v) => v.convertToType(TimestampType),
      }),
    ],
  }),

  // Uint conversions
  new FunctionDecl({
    name: TYPE_CONVERT_UINT_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: UINT_TO_UINT_OVERLOAD,
        argTypes: [UintType],
        resultType: UintType,
        unaryOp: (v) => v,
      }),
      new OverloadDecl({
        id: DOUBLE_TO_UINT_OVERLOAD,
        argTypes: [DoubleType],
        resultType: UintType,
        unaryOp: (v) => v.convertToType(UintType),
      }),
      new OverloadDecl({
        id: INT_TO_UINT_OVERLOAD,
        argTypes: [IntType],
        resultType: UintType,
        unaryOp: (v) => v.convertToType(UintType),
      }),
      new OverloadDecl({
        id: STRING_TO_UINT_OVERLOAD,
        argTypes: [StringType],
        resultType: UintType,
        unaryOp: (v) => v.convertToType(UintType),
      }),
    ],
  }),

  // String functions
  new FunctionDecl({
    name: CONTAINS_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: CONTAINS_STRING_OVERLOAD,
        argTypes: [StringType, StringType],
        resultType: BoolType,
        isMemberFunction: true,
        binaryOp: stringContains,
      }),
    ],
    disableTypeGuards: true,
  }),
  new FunctionDecl({
    name: ENDS_WITH_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: ENDS_WITH_STRING_OVERLOAD,
        argTypes: [StringType, StringType],
        resultType: BoolType,
        isMemberFunction: true,
        binaryOp: stringEndsWith,
      }),
    ],
    disableTypeGuards: true,
  }),
  new FunctionDecl({
    name: STARTS_WITH_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: STARTS_WITH_STRING_OVERLOAD,
        argTypes: [StringType, StringType],
        resultType: BoolType,
        isMemberFunction: true,
        binaryOp: stringStartsWith,
      }),
    ],
    disableTypeGuards: true,
  }),
  new FunctionDecl({
    name: MATCHES_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: MATCHES_OVERLOAD,
        argTypes: [StringType, StringType],
        resultType: BoolType,
      }),
      new OverloadDecl({
        id: MATCHES_STRING_OVERLOAD,
        argTypes: [StringType, StringType],
        resultType: BoolType,
        isMemberFunction: true,
      }),
    ],
    singleton: new Overload({
      operator: MATCHES_OVERLOAD,
      binary: (str, pat) => (str as RefVal & Matcher).match(pat),
      operandTrait: Trait.MATCHER_TYPE,
    }),
  }),

  // Timestamp / duration functions
  new FunctionDecl({
    name: TIME_GET_FULL_YEAR_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TIMESTAMP_TO_YEAR_OVERLOAD,
        argTypes: [TimestampType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: TIMESTAMP_TO_YEAR_WITH_TZ_OVERLOAD,
        argTypes: [TimestampType, StringType],
        resultType: IntType,
        isMemberFunction: true,
      }),
    ],
  }),
  new FunctionDecl({
    name: TIME_GET_MONTH_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TIMESTAMP_TO_MONTH_OVERLOAD,
        argTypes: [TimestampType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: TIMESTAMP_TO_MONTH_WITH_TZ_OVERLOAD,
        argTypes: [TimestampType, StringType],
        resultType: IntType,
        isMemberFunction: true,
      }),
    ],
  }),
  new FunctionDecl({
    name: TIME_GET_DAY_OF_YEAR_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TIMESTAMP_TO_DAY_OF_YEAR_OVERLOAD,
        argTypes: [TimestampType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: TIMESTAMP_TO_DAY_OF_YEAR_WITH_TZ_OVERLOAD,
        argTypes: [TimestampType, StringType],
        resultType: IntType,
        isMemberFunction: true,
      }),
    ],
  }),
  new FunctionDecl({
    name: TIME_GET_DAY_OF_MONTH_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_OVERLOAD,
        argTypes: [TimestampType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_WITH_TZ_OVERLOAD,
        argTypes: [TimestampType, StringType],
        resultType: IntType,
        isMemberFunction: true,
      }),
    ],
  }),
  new FunctionDecl({
    name: TIME_GET_DATE_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_OVERLOAD,
        argTypes: [TimestampType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_WITH_TZ_OVERLOAD,
        argTypes: [TimestampType, StringType],
        resultType: IntType,
        isMemberFunction: true,
      }),
    ],
  }),
  new FunctionDecl({
    name: TIME_GET_DAY_OF_WEEK_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TIMESTAMP_TO_DAY_OF_WEEK_OVERLOAD,
        argTypes: [TimestampType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: TIMESTAMP_TO_DAY_OF_WEEK_WITH_TZ_OVERLOAD,
        argTypes: [TimestampType, StringType],
        resultType: IntType,
        isMemberFunction: true,
      }),
    ],
  }),
  new FunctionDecl({
    name: TIME_GET_HOURS_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TIMESTAMP_TO_HOURS_OVERLOAD,
        argTypes: [TimestampType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: TIMESTAMP_TO_HOURS_WITH_TZ_OVERLOAD,
        argTypes: [TimestampType, StringType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: DURATION_TO_HOURS_OVERLOAD,
        argTypes: [DurationType],
        resultType: IntType,
        isMemberFunction: true,
      }),
    ],
  }),
  new FunctionDecl({
    name: TIME_GET_MINUTES_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TIMESTAMP_TO_MINUTES_OVERLOAD,
        argTypes: [TimestampType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: TIMESTAMP_TO_MINUTES_WITH_TZ_OVERLOAD,
        argTypes: [TimestampType, StringType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: DURATION_TO_MINUTES_OVERLOAD,
        argTypes: [DurationType],
        resultType: IntType,
        isMemberFunction: true,
      }),
    ],
  }),
  new FunctionDecl({
    name: TIME_GET_SECONDS_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TIMESTAMP_TO_SECONDS_OVERLOAD,
        argTypes: [TimestampType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: TIMESTAMP_TO_SECONDS_WITH_TZ_OVERLOAD,
        argTypes: [TimestampType, StringType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: DURATION_TO_SECONDS_OVERLOAD,
        argTypes: [DurationType],
        resultType: IntType,
        isMemberFunction: true,
      }),
    ],
  }),
  new FunctionDecl({
    name: TIME_GET_MILLISECONDS_OVERLOAD,
    overloads: [
      new OverloadDecl({
        id: TIMESTAMP_TO_MILLISECONDS_OVERLOAD,
        argTypes: [TimestampType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: TIMESTAMP_TO_MILLISECONDS_WITH_TZ_OVERLOAD,
        argTypes: [TimestampType, StringType],
        resultType: IntType,
        isMemberFunction: true,
      }),
      new OverloadDecl({
        id: DURATION_TO_MILLISECONDS_OVERLOAD,
        argTypes: [DurationType],
        resultType: IntType,
        isMemberFunction: true,
      }),
    ],
  }),
];

export const stdFunctionsMap = stdFunctions.reduce((acc, f) => {
  acc.set(f.name(), f);
  return acc;
}, new Map<string, FunctionDecl>());

function noFunctionOverrides(...args: RefVal[]): RefVal {
  return ErrorRefVal.errNoSuchOverload;
}
