// export const STANDARD_DESCRIPTORS: (
//   | DescMessage
//   | DescEnum
//   | Registry
//   | DescFile
//   | DescExtension
//   | DescService
// )[] = [
//   AnySchema,
//   ListValueSchema,
//   StructSchema,
//   ProtobufValueSchema,
//   BoolValueSchema,
//   BytesValueSchema,
//   DoubleValueSchema,
//   FloatValueSchema,
//   Int32ValueSchema,
//   Int64ValueSchema,
//   StringValueSchema,
//   UInt32ValueSchema,
//   UInt64ValueSchema,
//   TimestampSchema,
//   DurationSchema,
// ];

// export const STANDARD_IDENT_DECLARATIONS: Decl[] = [
//   newVarIdentDeclProto('bool', BoolProtoType),
//   identDecl('bytes', { type: typeType(BYTES_PROTO_TYPE) }),
//   identDecl('double', { type: typeType(DOUBLE_PROTO_TYPE) }),
//   identDecl('duration', { type: typeType(DURATION_WKT_PROTO_TYPE) }),
//   identDecl('dyn', { type: typeType(DYN_PROTO_TYPE) }),
//   identDecl('int', { type: typeType(INT_PROTO_TYPE) }),
//   identDecl('string', { type: typeType(STRING_PROTO_TYPE) }),
//   identDecl('timestamp', { type: typeType(TIMESTAMP_WKT_PROTO_TYPE) }),
//   identDecl('uint', { type: typeType(UINT_PROTO_TYPE) }),
//   identDecl('list', { type: typeType(listType({ elemType: DYN_PROTO_TYPE })) }),
//   identDecl('map', {
//     type: typeType(
//       mapType({ keyType: DYN_PROTO_TYPE, valueType: DYN_PROTO_TYPE })
//     ),
//   }),
//   identDecl('type', { type: typeType(ABSTRACT_TYPE_TYPE) }),
//   identDecl('null_type', { type: typeType(NULL_PROTO_TYPE) }),
//   identDecl('null', { type: NULL_PROTO_TYPE }),
// ];

// const paramA = typeParamType('A');
// const typeParamAList = ['A'];
// const paramB = typeParamType('B');
// const listOfA = listType({ elemType: paramA });
// const mapOfAB = mapType({ keyType: paramA, valueType: paramB });
// const typeParamABList = ['A', 'B'];

// // Logical operators. Special-cased within the interpreter.
// // Note, the singleton binding prevents extensions from overriding the operator
// // behavior.
// export const CONDITIONAL_FUNCTION_DECL = functionDecl(CONDITIONAL_OPERATOR, {
//   overloads: [
//     {
//       overloadId: CONDITIONAL_OVERLOAD,
//       params: [BOOL_PROTO_TYPE, paramA, paramA],
//       resultType: paramA,
//       typeParams: typeParamAList,
//     },
//   ],
// });
// export const LOGICAL_AND_FUNCTION_DECL = functionDecl(LOGICAL_AND_OPERATOR, {
//   overloads: [
//     {
//       overloadId: LOGICAL_AND_OVERLOAD,
//       params: [BOOL_PROTO_TYPE, BOOL_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//   ],
// });
// export const LOGICAL_OR_FUNCTION_DECL = functionDecl(LOGICAL_OR_OPERATOR, {
//   overloads: [
//     {
//       overloadId: LOGICAL_OR_OVERLOAD,
//       params: [BOOL_PROTO_TYPE, BOOL_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//   ],
// });
// export const LOGICAL_NOT_FUNCTION_DECL = functionDecl(LOGICAL_NOT_OPERATOR, {
//   overloads: [
//     {
//       overloadId: LOGICAL_NOT_OVERLOAD,
//       params: [BOOL_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//   ],
// });

// // Comprehension short-circuiting related function
// export const NOT_STRICTLY_FALSE_FUNCTION_DECL = functionDecl(
//   NOT_STRICTLY_FALSE_OPERATOR,
//   {
//     overloads: [
//       {
//         overloadId: NOT_STRICTLY_FALSE_OVERLOAD,
//         params: [BOOL_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//     ],
//   }
// );

// // Equality / inequality. Special-cased in the interpreter
// export const EQUALS_FUNCTION_DECL = functionDecl(EQUALS_OPERATOR, {
//   overloads: [
//     {
//       overloadId: EQUALS_OVERLOAD,
//       params: [paramA, paramB],
//       resultType: BOOL_PROTO_TYPE,
//       typeParams: typeParamABList,
//     },
//   ],
// });
// export const NOT_EQUALS_FUNCTION_DECL = functionDecl(NOT_EQUALS_OPERATOR, {
//   overloads: [
//     {
//       overloadId: NOT_EQUALS_OVERLOAD,
//       params: [paramA, paramA],
//       resultType: BOOL_PROTO_TYPE,
//       typeParams: typeParamABList,
//     },
//   ],
// });

// // Mathematical operators
// export const ADD_FUNCTION_DECL = functionDecl(ADD_OPERATOR, {
//   overloads: [
//     {
//       overloadId: ADD_BYTES_OVERLOAD,
//       params: [BYTES_PROTO_TYPE, BYTES_PROTO_TYPE],
//       resultType: BYTES_PROTO_TYPE,
//     },
//     {
//       overloadId: ADD_DOUBLE_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: DOUBLE_PROTO_TYPE,
//     },
//     {
//       overloadId: ADD_DURATION_DURATION_OVERLOAD,
//       params: [DURATION_WKT_PROTO_TYPE, DURATION_WKT_PROTO_TYPE],
//       resultType: DURATION_WKT_PROTO_TYPE,
//     },
//     {
//       overloadId: ADD_DURATION_TIMESTAMP_OVERLOAD,
//       params: [DURATION_WKT_PROTO_TYPE, TIMESTAMP_WKT_PROTO_TYPE],
//       resultType: TIMESTAMP_WKT_PROTO_TYPE,
//     },
//     {
//       overloadId: ADD_TIMESTAMP_DURATION_OVERLOAD,
//       params: [TIMESTAMP_WKT_PROTO_TYPE, DURATION_WKT_PROTO_TYPE],
//       resultType: TIMESTAMP_WKT_PROTO_TYPE,
//     },
//     {
//       overloadId: ADD_INT64_OVERLOAD,
//       params: [INT_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: INT_PROTO_TYPE,
//     },
//     {
//       overloadId: ADD_LIST_OVERLOAD,
//       params: [listOfA, listOfA],
//       resultType: listOfA,
//       typeParams: typeParamAList,
//     },
//     {
//       overloadId: ADD_STRING_OVERLOAD,
//       params: [STRING_PROTO_TYPE, STRING_PROTO_TYPE],
//       resultType: STRING_PROTO_TYPE,
//     },
//     {
//       overloadId: ADD_UINT64_OVERLOAD,
//       params: [UINT_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: UINT_PROTO_TYPE,
//     },
//   ],
// });
// export const DIVIDE_FUNCTION_DECL = functionDecl(DIVIDE_OPERATOR, {
//   overloads: [
//     {
//       overloadId: DIVIDE_DOUBLE_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: DOUBLE_PROTO_TYPE,
//     },
//     {
//       overloadId: DIVIDE_INT64_OVERLOAD,
//       params: [INT_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: INT_PROTO_TYPE,
//     },
//     {
//       overloadId: DIVIDE_UINT64_OVERLOAD,
//       params: [UINT_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: UINT_PROTO_TYPE,
//     },
//   ],
// });
// export const MODULO_FUNCTION_DECL = functionDecl(MODULO_OPERATOR, {
//   overloads: [
//     {
//       overloadId: MODULO_INT64_OVERLOAD,
//       params: [INT_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: INT_PROTO_TYPE,
//     },
//     {
//       overloadId: MODULO_UINT64_OVERLOAD,
//       params: [UINT_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: UINT_PROTO_TYPE,
//     },
//   ],
// });
// export const MULTIPLY_FUNCTION_DECL = functionDecl(MULTIPLY_OPERATOR, {
//   overloads: [
//     {
//       overloadId: MULTIPLY_DOUBLE_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: DOUBLE_PROTO_TYPE,
//     },
//     {
//       overloadId: MULTIPLY_INT64_OVERLOAD,
//       params: [INT_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: INT_PROTO_TYPE,
//     },
//     {
//       overloadId: MULTIPLY_UINT64_OVERLOAD,
//       params: [UINT_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: UINT_PROTO_TYPE,
//     },
//   ],
// });
// export const NEGATE_FUNCTION_DECL = functionDecl(NEGATE_OPERATOR, {
//   overloads: [
//     {
//       overloadId: NEGATE_DOUBLE_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE],
//       resultType: DOUBLE_PROTO_TYPE,
//     },
//     {
//       overloadId: NEGATE_INT64_OVERLOAD,
//       params: [INT_PROTO_TYPE],
//       resultType: INT_PROTO_TYPE,
//     },
//   ],
// });
// export const SUBTRACT_FUNCTION_DECL = functionDecl(SUBTRACT_OPERATOR, {
//   overloads: [
//     {
//       overloadId: SUBTRACT_DOUBLE_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: DOUBLE_PROTO_TYPE,
//     },
//     {
//       overloadId: SUBTRACT_INT64_OVERLOAD,
//       params: [INT_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: INT_PROTO_TYPE,
//     },
//     {
//       overloadId: SUBTRACT_UINT64_OVERLOAD,
//       params: [UINT_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: UINT_PROTO_TYPE,
//     },
//     {
//       overloadId: SUBTRACT_DURATION_DURATION_OVERLOAD,
//       params: [DURATION_WKT_PROTO_TYPE, DURATION_WKT_PROTO_TYPE],
//       resultType: DURATION_WKT_PROTO_TYPE,
//     },
//     {
//       overloadId: SUBTRACT_TIMESTAMP_DURATION_OVERLOAD,
//       params: [TIMESTAMP_WKT_PROTO_TYPE, DURATION_WKT_PROTO_TYPE],
//       resultType: TIMESTAMP_WKT_PROTO_TYPE,
//     },
//     {
//       overloadId: SUBTRACT_TIMESTAMP_TIMESTAMP_OVERLOAD,
//       params: [TIMESTAMP_WKT_PROTO_TYPE, TIMESTAMP_WKT_PROTO_TYPE],
//       resultType: DURATION_WKT_PROTO_TYPE,
//     },
//   ],
// });

// // Relations operators
// export const LESS_FUNCTION_DECL = functionDecl(LESS_OPERATOR, {
//   overloads: [
//     {
//       overloadId: LESS_BOOL_OVERLOAD,
//       params: [BOOL_PROTO_TYPE, BOOL_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_INT64_OVERLOAD,
//       params: [INT_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_INT64_DOUBLE_OVERLOAD,
//       params: [INT_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_INT64_UINT64_OVERLOAD,
//       params: [INT_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_UINT64_OVERLOAD,
//       params: [UINT_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_UINT64_DOUBLE_OVERLOAD,
//       params: [UINT_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_UINT64_INT64_OVERLOAD,
//       params: [UINT_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_DOUBLE_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_DOUBLE_INT64_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_DOUBLE_UINT64_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_STRING_OVERLOAD,
//       params: [STRING_PROTO_TYPE, STRING_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_BYTES_OVERLOAD,
//       params: [BYTES_PROTO_TYPE, BYTES_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_TIMESTAMP_OVERLOAD,
//       params: [TIMESTAMP_WKT_PROTO_TYPE, TIMESTAMP_WKT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_DURATION_OVERLOAD,
//       params: [DURATION_WKT_PROTO_TYPE, DURATION_WKT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//   ],
// });
// export const LESS_EQUALS_FUNCTION_DECL = functionDecl(LESS_EQUALS_OPERATOR, {
//   overloads: [
//     {
//       overloadId: LESS_EQUALS_INT64_OVERLOAD,
//       params: [INT_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_EQUALS_INT64_DOUBLE_OVERLOAD,
//       params: [INT_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_EQUALS_INT64_UINT64_OVERLOAD,
//       params: [INT_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_EQUALS_UINT64_OVERLOAD,
//       params: [UINT_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_EQUALS_UINT64_DOUBLE_OVERLOAD,
//       params: [UINT_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_EQUALS_UINT64_INT64_OVERLOAD,
//       params: [UINT_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_EQUALS_DOUBLE_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_EQUALS_DOUBLE_INT64_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_EQUALS_DOUBLE_UINT64_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_EQUALS_STRING_OVERLOAD,
//       params: [STRING_PROTO_TYPE, STRING_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_EQUALS_BYTES_OVERLOAD,
//       params: [BYTES_PROTO_TYPE, BYTES_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_EQUALS_DURATION_OVERLOAD,
//       params: [DURATION_WKT_PROTO_TYPE, DURATION_WKT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: LESS_EQUALS_TIMESTAMP_OVERLOAD,
//       params: [TIMESTAMP_WKT_PROTO_TYPE, TIMESTAMP_WKT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//   ],
// });
// export const GREATER_FUNCTION_DECL = functionDecl(GREATER_OPERATOR, {
//   overloads: [
//     {
//       overloadId: GREATER_BOOL_OVERLOAD,
//       params: [BOOL_PROTO_TYPE, BOOL_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_INT64_OVERLOAD,
//       params: [INT_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_INT64_DOUBLE_OVERLOAD,
//       params: [INT_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_INT64_UINT64_OVERLOAD,
//       params: [INT_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_UINT64_OVERLOAD,
//       params: [UINT_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_UINT64_DOUBLE_OVERLOAD,
//       params: [UINT_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_UINT64_INT64_OVERLOAD,
//       params: [UINT_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_DOUBLE_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_DOUBLE_INT64_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, INT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_DOUBLE_UINT64_OVERLOAD,
//       params: [DOUBLE_PROTO_TYPE, UINT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_STRING_OVERLOAD,
//       params: [STRING_PROTO_TYPE, STRING_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_BYTES_OVERLOAD,
//       params: [BYTES_PROTO_TYPE, BYTES_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_TIMESTAMP_OVERLOAD,
//       params: [TIMESTAMP_WKT_PROTO_TYPE, TIMESTAMP_WKT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: GREATER_DURATION_OVERLOAD,
//       params: [DURATION_WKT_PROTO_TYPE, DURATION_WKT_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//   ],
// });
// export const GREATER_EQUALS_FUNCTION_DECL = functionDecl(
//   GREATER_EQUALS_OPERATOR,
//   {
//     overloads: [
//       {
//         overloadId: GREATER_EQUALS_BOOL_OVERLOAD,
//         params: [BOOL_PROTO_TYPE, BOOL_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_INT64_OVERLOAD,
//         params: [INT_PROTO_TYPE, INT_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_INT64_DOUBLE_OVERLOAD,
//         params: [INT_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_INT64_UINT64_OVERLOAD,
//         params: [INT_PROTO_TYPE, UINT_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_UINT64_OVERLOAD,
//         params: [UINT_PROTO_TYPE, UINT_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_UINT64_DOUBLE_OVERLOAD,
//         params: [UINT_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_UINT64_INT64_OVERLOAD,
//         params: [UINT_PROTO_TYPE, INT_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_DOUBLE_OVERLOAD,
//         params: [DOUBLE_PROTO_TYPE, DOUBLE_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_DOUBLE_INT64_OVERLOAD,
//         params: [DOUBLE_PROTO_TYPE, INT_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_DOUBLE_UINT64_OVERLOAD,
//         params: [DOUBLE_PROTO_TYPE, UINT_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_STRING_OVERLOAD,
//         params: [STRING_PROTO_TYPE, STRING_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_BYTES_OVERLOAD,
//         params: [BYTES_PROTO_TYPE, BYTES_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_DURATION_OVERLOAD,
//         params: [DURATION_WKT_PROTO_TYPE, DURATION_WKT_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: GREATER_EQUALS_TIMESTAMP_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE, TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//     ],
//   }
// );

// // Indexing
// export const INDEX_FUNCTION_DECL = functionDecl(INDEX_OPERATOR, {
//   overloads: [
//     {
//       overloadId: INDEX_MAP_OVERLOAD,
//       params: [mapOfAB, paramA],
//       resultType: paramB,
//       typeParams: typeParamABList,
//     },
//     {
//       overloadId: INDEX_LIST_OVERLOAD,
//       params: [listOfA, INT_PROTO_TYPE],
//       resultType: paramA,
//       typeParams: typeParamAList,
//     },
//   ],
// });

// // Collections operators
// export const IN_FUNCTION_DECL = functionDecl(IN_OPERATOR, {
//   overloads: [
//     {
//       overloadId: IN_LIST_OVERLOAD,
//       params: [paramA, listOfA],
//       resultType: BOOL_PROTO_TYPE,
//       typeParams: typeParamAList,
//     },
//     {
//       overloadId: IN_MAP_OVERLOAD,
//       params: [paramA, mapOfAB],
//       resultType: BOOL_PROTO_TYPE,
//       typeParams: typeParamABList,
//     },
//   ],
// });
// export const SIZE_FUNCTION_DECL = functionDecl(SIZE_OVERLOAD, {
//   overloads: [
//     {
//       overloadId: SIZE_BYTES_OVERLOAD,
//       params: [BYTES_PROTO_TYPE],
//       resultType: INT_PROTO_TYPE,
//     },
//     {
//       overloadId: SIZE_BYTES_INST_OVERLOAD,
//       params: [BYTES_PROTO_TYPE],
//       resultType: INT_PROTO_TYPE,
//       isInstanceFunction: true,
//     },
//     {
//       overloadId: SIZE_LIST_OVERLOAD,
//       params: [listOfA],
//       resultType: INT_PROTO_TYPE,
//       typeParams: typeParamAList,
//     },
//     {
//       overloadId: SIZE_LIST_INST_OVERLOAD,
//       params: [listOfA],
//       resultType: INT_PROTO_TYPE,
//       typeParams: typeParamAList,
//       isInstanceFunction: true,
//     },
//     {
//       overloadId: SIZE_MAP_OVERLOAD,
//       params: [mapOfAB],
//       resultType: INT_PROTO_TYPE,
//       typeParams: typeParamABList,
//     },
//     {
//       overloadId: SIZE_MAP_INST_OVERLOAD,
//       params: [mapOfAB],
//       resultType: INT_PROTO_TYPE,
//       typeParams: typeParamABList,
//       isInstanceFunction: true,
//     },
//     {
//       overloadId: SIZE_STRING_OVERLOAD,
//       params: [STRING_PROTO_TYPE],
//       resultType: INT_PROTO_TYPE,
//     },
//     {
//       overloadId: SIZE_STRING_INST_OVERLOAD,
//       params: [STRING_PROTO_TYPE],
//       resultType: INT_PROTO_TYPE,
//       isInstanceFunction: true,
//     },
//   ],
// });

// // Type conversions
// export const TYPE_CONVERT_TYPE_FUNCTION_DECL = functionDecl(
//   TYPE_CONVERT_TYPE_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TYPE_CONVERT_TYPE_OVERLOAD,
//         params: [paramA],
//         resultType: typeType(paramA),
//         typeParams: typeParamAList,
//       },
//     ],
//   }
// );

// // Bool conversions
// export const TYPE_CONVERT_BOOL_FUNCTION_DECL = functionDecl(
//   TYPE_CONVERT_BOOL_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: BOOL_TO_BOOL_OVERLOAD,
//         params: [BOOL_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//       {
//         overloadId: STRING_TO_BOOL_OVERLOAD,
//         params: [STRING_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//     ],
//   }
// );

// // Bytes conversions
// export const TYPE_CONVERT_BYTES_FUNCTION_DECL = functionDecl(
//   TYPE_CONVERT_BYTES_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: BYTES_TO_BYTES_OVERLOAD,
//         params: [BYTES_PROTO_TYPE],
//         resultType: BYTES_PROTO_TYPE,
//       },
//       {
//         overloadId: STRING_TO_BYTES_OVERLOAD,
//         params: [STRING_PROTO_TYPE],
//         resultType: BYTES_PROTO_TYPE,
//       },
//     ],
//   }
// );

// // Double conversions
// export const TYPE_CONVERT_DOUBLE_FUNCTION_DECL = functionDecl(
//   TYPE_CONVERT_DOUBLE_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: DOUBLE_TO_DOUBLE_OVERLOAD,
//         params: [DOUBLE_PROTO_TYPE],
//         resultType: DOUBLE_PROTO_TYPE,
//       },
//       {
//         overloadId: INT_TO_DOUBLE_OVERLOAD,
//         params: [INT_PROTO_TYPE],
//         resultType: DOUBLE_PROTO_TYPE,
//       },
//       {
//         overloadId: STRING_TO_DOUBLE_OVERLOAD,
//         params: [STRING_PROTO_TYPE],
//         resultType: DOUBLE_PROTO_TYPE,
//       },
//       {
//         overloadId: UINT_TO_DOUBLE_OVERLOAD,
//         params: [UINT_PROTO_TYPE],
//         resultType: DOUBLE_PROTO_TYPE,
//       },
//     ],
//   }
// );

// // Duration conversions
// export const TYPE_CONVERT_DURATION_FUNCTION_DECL = functionDecl(
//   TYPE_CONVERT_DURATION_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: DURATION_TO_DURATION_OVERLOAD,
//         params: [DURATION_WKT_PROTO_TYPE],
//         resultType: DURATION_WKT_PROTO_TYPE,
//       },
//       {
//         overloadId: INT_TO_DURATION_OVERLOAD,
//         params: [INT_PROTO_TYPE],
//         resultType: DURATION_WKT_PROTO_TYPE,
//       },
//       {
//         overloadId: STRING_TO_DURATION_OVERLOAD,
//         params: [STRING_PROTO_TYPE],
//         resultType: DURATION_WKT_PROTO_TYPE,
//       },
//     ],
//   }
// );

// // Dyn conversions
// export const TYPE_CONVERT_DYN_FUNCTION_DECL = functionDecl(
//   TYPE_CONVERT_DYN_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TYPE_CONVERT_TYPE_OVERLOAD,
//         params: [paramA],
//         resultType: DYN_PROTO_TYPE,
//         typeParams: typeParamAList,
//       },
//     ],
//   }
// );

// // Int conversions
// export const TYPE_CONVERT_INT_FUNCTION_DECL = functionDecl(
//   TYPE_CONVERT_INT_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: INT_TO_INT_OVERLOAD,
//         params: [INT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//       },
//       {
//         overloadId: DOUBLE_TO_INT_OVERLOAD,
//         params: [DOUBLE_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//       },
//       {
//         overloadId: DURATION_TO_INT_OVERLOAD,
//         params: [DURATION_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//       },
//       {
//         overloadId: STRING_TO_INT_OVERLOAD,
//         params: [STRING_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//       },
//       {
//         overloadId: TIMESTAMP_TO_INT_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//       },
//       {
//         overloadId: UINT_TO_INT_OVERLOAD,
//         params: [UINT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//       },
//     ],
//   }
// );

// // String conversions
// export const TYPE_CONVERT_STRING_FUNCTION_DECL = functionDecl(
//   TYPE_CONVERT_STRING_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: STRING_TO_STRING_OVERLOAD,
//         params: [STRING_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//       },
//       {
//         overloadId: BOOL_TO_STRING_OVERLOAD,
//         params: [BOOL_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//       },
//       {
//         overloadId: BYTES_TO_STRING_OVERLOAD,
//         params: [BYTES_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//       },
//       {
//         overloadId: DOUBLE_TO_STRING_OVERLOAD,
//         params: [DOUBLE_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//       },
//       {
//         overloadId: INT_TO_STRING_OVERLOAD,
//         params: [INT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//       },
//       {
//         overloadId: UINT_TO_STRING_OVERLOAD,
//         params: [UINT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//       },
//       {
//         overloadId: DURATION_TO_STRING_OVERLOAD,
//         params: [DURATION_WKT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//       },
//       {
//         overloadId: TIMESTAMP_TO_STRING_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//       },
//     ],
//   }
// );

// // Timestamp conversions
// export const TYPE_CONVERT_TIMESTAMP_FUNCTION_DECL = functionDecl(
//   TYPE_CONVERT_TIMESTAMP_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TIMESTAMP_TO_TIMESTAMP_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: TIMESTAMP_WKT_PROTO_TYPE,
//       },
//       {
//         overloadId: INT_TO_TIMESTAMP_OVERLOAD,
//         params: [INT_PROTO_TYPE],
//         resultType: TIMESTAMP_WKT_PROTO_TYPE,
//       },
//       {
//         overloadId: STRING_TO_TIMESTAMP_OVERLOAD,
//         params: [STRING_PROTO_TYPE],
//         resultType: TIMESTAMP_WKT_PROTO_TYPE,
//       },
//     ],
//   }
// );

// // Uint conversions
// export const TYPE_CONVERT_UINT_FUNCTION_DECL = functionDecl(
//   TYPE_CONVERT_UINT_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: UINT_TO_UINT_OVERLOAD,
//         params: [UINT_PROTO_TYPE],
//         resultType: UINT_PROTO_TYPE,
//       },
//       {
//         overloadId: DOUBLE_TO_UINT_OVERLOAD,
//         params: [DOUBLE_PROTO_TYPE],
//         resultType: UINT_PROTO_TYPE,
//       },
//       {
//         overloadId: INT_TO_UINT_OVERLOAD,
//         params: [INT_PROTO_TYPE],
//         resultType: UINT_PROTO_TYPE,
//       },
//       {
//         overloadId: STRING_TO_UINT_OVERLOAD,
//         params: [STRING_PROTO_TYPE],
//         resultType: UINT_PROTO_TYPE,
//       },
//     ],
//   }
// );

// // String functions
// export const STRING_CONTAINS_FUNCTION_DECL = functionDecl(CONTAINS_OVERLOAD, {
//   overloads: [
//     {
//       overloadId: CONTAINS_STRING_OVERLOAD,
//       params: [STRING_PROTO_TYPE, STRING_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//   ],
// });
// export const STRING_ENDSWITH_FUNCTION_DECL = functionDecl(ENDS_WITH_OVERLOAD, {
//   overloads: [
//     {
//       overloadId: ENDS_WITH_STRING_OVERLOAD,
//       params: [STRING_PROTO_TYPE, STRING_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//   ],
// });
// export const STRING_STARTSWITH_FUNCTION_DECL = functionDecl(
//   STARTS_WITH_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: STARTS_WITH_STRING_OVERLOAD,
//         params: [STRING_PROTO_TYPE, STRING_PROTO_TYPE],
//         resultType: BOOL_PROTO_TYPE,
//       },
//     ],
//   }
// );
// export const STRING_MATCHES_FUNCTION_DECL = functionDecl(MATCHES_OVERLOAD, {
//   overloads: [
//     {
//       overloadId: MATCHES_OVERLOAD,
//       params: [STRING_PROTO_TYPE, STRING_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//     {
//       overloadId: MATCHES_STRING_OVERLOAD,
//       params: [STRING_PROTO_TYPE, STRING_PROTO_TYPE],
//       resultType: BOOL_PROTO_TYPE,
//     },
//   ],
// });

// // Timestamp / duration functions
// export const TIME_GET_FULL_YEAR_FUNCTION_DECL = functionDecl(
//   TIME_GET_FULL_YEAR_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TIMESTAMP_TO_YEAR_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: TIMESTAMP_TO_YEAR_WITH_TZ_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//     ],
//   }
// );
// export const TIME_GET_MONTH_FUNCTION_DECL = functionDecl(
//   TIME_GET_MONTH_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TIMESTAMP_TO_MONTH_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: TIMESTAMP_TO_MONTH_WITH_TZ_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//     ],
//   }
// );
// export const TIME_GET_DAY_OF_YEAR_FUNCTION_DECL = functionDecl(
//   TIME_GET_DAY_OF_YEAR_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TIMESTAMP_TO_DAY_OF_YEAR_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: TIMESTAMP_TO_DAY_OF_YEAR_WITH_TZ_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//     ],
//   }
// );
// export const TIME_GET_DAY_OF_MONTH_FUNCTION_DECL = functionDecl(
//   TIME_GET_DAY_OF_MONTH_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: TIMESTAMP_TO_DAY_OF_MONTH_ZERO_BASED_WITH_TZ_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//     ],
//   }
// );
// export const TIME_GET_DATE_FUNCTION_DECL = functionDecl(
//   TIME_GET_DATE_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: TIMESTAMP_TO_DAY_OF_MONTH_ONE_BASED_WITH_TZ_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//     ],
//   }
// );
// export const TIME_GET_DAY_OF_WEEK_FUNCTION_DECL = functionDecl(
//   TIME_GET_DAY_OF_WEEK_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TIMESTAMP_TO_DAY_OF_WEEK_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: TIMESTAMP_TO_DAY_OF_WEEK_WITH_TZ_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//     ],
//   }
// );
// export const TIME_GET_HOURS_FUNCTION_DECL = functionDecl(
//   TIME_GET_HOURS_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TIMESTAMP_TO_HOURS_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: TIMESTAMP_TO_HOURS_WITH_TZ_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: DURATION_TO_HOURS_OVERLOAD,
//         params: [DURATION_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//     ],
//   }
// );
// export const TIME_GET_MINUTES_FUNCTION_DECL = functionDecl(
//   TIME_GET_MINUTES_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TIMESTAMP_TO_MINUTES_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: TIMESTAMP_TO_MINUTES_WITH_TZ_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: DURATION_TO_MINUTES_OVERLOAD,
//         params: [DURATION_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//     ],
//   }
// );
// export const TIME_GET_SECONDS_FUNCTION_DECL = functionDecl(
//   TIME_GET_SECONDS_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TIMESTAMP_TO_SECONDS_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: TIMESTAMP_TO_SECONDS_WITH_TZ_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: DURATION_TO_SECONDS_OVERLOAD,
//         params: [DURATION_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//     ],
//   }
// );
// export const TIME_GET_MILLISECONDS_FUNCTION_DECL = functionDecl(
//   TIME_GET_MILLISECONDS_OVERLOAD,
//   {
//     overloads: [
//       {
//         overloadId: TIMESTAMP_TO_MILLISECONDS_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: TIMESTAMP_TO_MILLISECONDS_WITH_TZ_OVERLOAD,
//         params: [TIMESTAMP_WKT_PROTO_TYPE],
//         resultType: STRING_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//       {
//         overloadId: DURATION_TO_MILLISECONDS_OVERLOAD,
//         params: [DURATION_WKT_PROTO_TYPE],
//         resultType: INT_PROTO_TYPE,
//         isInstanceFunction: true,
//       },
//     ],
//   }
// );

// export const STANDARD_FUNCTION_DECLARATIONS: Decl[] = [
//   CONDITIONAL_FUNCTION_DECL,
//   LOGICAL_AND_FUNCTION_DECL,
//   LOGICAL_OR_FUNCTION_DECL,
//   LOGICAL_NOT_FUNCTION_DECL,
//   NOT_STRICTLY_FALSE_FUNCTION_DECL,
//   EQUALS_FUNCTION_DECL,
//   NOT_EQUALS_FUNCTION_DECL,
//   ADD_FUNCTION_DECL,
//   DIVIDE_FUNCTION_DECL,
//   MODULO_FUNCTION_DECL,
//   MULTIPLY_FUNCTION_DECL,
//   NEGATE_FUNCTION_DECL,
//   SUBTRACT_FUNCTION_DECL,
//   LESS_FUNCTION_DECL,
//   LESS_EQUALS_FUNCTION_DECL,
//   GREATER_FUNCTION_DECL,
//   GREATER_EQUALS_FUNCTION_DECL,
//   INDEX_FUNCTION_DECL,
//   IN_FUNCTION_DECL,
//   SIZE_FUNCTION_DECL,
//   TYPE_CONVERT_TYPE_FUNCTION_DECL,
//   TYPE_CONVERT_BOOL_FUNCTION_DECL,
//   TYPE_CONVERT_BYTES_FUNCTION_DECL,
//   TYPE_CONVERT_DOUBLE_FUNCTION_DECL,
//   TYPE_CONVERT_DURATION_FUNCTION_DECL,
//   TYPE_CONVERT_DYN_FUNCTION_DECL,
//   TYPE_CONVERT_INT_FUNCTION_DECL,
//   TYPE_CONVERT_STRING_FUNCTION_DECL,
//   TYPE_CONVERT_TIMESTAMP_FUNCTION_DECL,
//   TYPE_CONVERT_UINT_FUNCTION_DECL,
//   STRING_CONTAINS_FUNCTION_DECL,
//   STRING_ENDSWITH_FUNCTION_DECL,
//   STRING_MATCHES_FUNCTION_DECL,
//   STRING_STARTSWITH_FUNCTION_DECL,
//   TIME_GET_FULL_YEAR_FUNCTION_DECL,
//   TIME_GET_MONTH_FUNCTION_DECL,
//   TIME_GET_DAY_OF_YEAR_FUNCTION_DECL,
//   TIME_GET_DAY_OF_MONTH_FUNCTION_DECL,
//   TIME_GET_DATE_FUNCTION_DECL,
//   TIME_GET_DAY_OF_WEEK_FUNCTION_DECL,
//   TIME_GET_HOURS_FUNCTION_DECL,
//   TIME_GET_MINUTES_FUNCTION_DECL,
//   TIME_GET_SECONDS_FUNCTION_DECL,
//   TIME_GET_MILLISECONDS_FUNCTION_DECL,
// ];

// // TODO: SingletonUnaryBinding, traits
