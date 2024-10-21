import {
  TypeSchema,
  Type_PrimitiveType,
  Type_WellKnownType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import { create } from '@bufbuild/protobuf';
import { EmptySchema, NullValue } from '@bufbuild/protobuf/wkt';
import {
  DYN_TYPE,
  ERROR_TYPE,
  NULL_TYPE,
  abstractType,
  formatCELType,
  functionType,
  isAssignableType,
  isExactType,
  listType,
  mapType,
  messageType,
  nullableType,
  optionalType,
  primitiveType,
  typeParamType,
  typeType,
  wellKnownType,
  wrappedType,
  wrapperType,
} from './types';

describe('types', () => {
  it('DYN_TYPE', () => {
    expect(DYN_TYPE).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'dyn',
          value: create(EmptySchema),
        },
      })
    );
  });

  it('NULL_TYPE', () => {
    expect(NULL_TYPE).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'null',
          value: NullValue.NULL_VALUE,
        },
      })
    );
  });

  it('primitiveType', () => {
    expect(primitiveType(Type_PrimitiveType.BOOL)).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'primitive',
          value: 1,
        },
      })
    );
  });

  it('wrapperType', () => {
    expect(wrapperType(Type_PrimitiveType.BYTES)).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'wrapper',
          value: 6,
        },
      })
    );
  });

  it('wellKnownType', () => {
    expect(wellKnownType(Type_WellKnownType.ANY)).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'wellKnown',
          value: 1,
        },
      })
    );
  });

  it('listType', () => {
    expect(
      listType({ elemType: primitiveType(Type_PrimitiveType.INT64) })
    ).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'listType',
          value: {
            elemType: {
              typeKind: {
                case: 'primitive',
                value: 2,
              },
            },
          },
        },
      })
    );
  });

  it('mapType', () => {
    expect(
      mapType({
        keyType: primitiveType(Type_PrimitiveType.STRING),
        valueType: primitiveType(Type_PrimitiveType.INT64),
      })
    ).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'mapType',
          value: {
            keyType: {
              typeKind: {
                case: 'primitive',
                value: 5,
              },
            },
            valueType: {
              typeKind: {
                case: 'primitive',
                value: 2,
              },
            },
          },
        },
      })
    );
  });

  it('functionType', () => {
    expect(
      functionType({
        resultType: primitiveType(Type_PrimitiveType.BOOL),
        argTypes: [primitiveType(Type_PrimitiveType.STRING)],
      })
    ).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'function',
          value: {
            resultType: {
              typeKind: {
                case: 'primitive',
                value: 1,
              },
            },
            argTypes: [
              {
                typeKind: {
                  case: 'primitive',
                  value: 5,
                },
              },
            ],
          },
        },
      })
    );
  });

  it('messageType', () => {
    expect(messageType('google.protobuf.Empty')).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'messageType',
          value: 'google.protobuf.Empty',
        },
      })
    );
  });

  it('typeParamType', () => {
    expect(typeParamType('T')).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'typeParam',
          value: 'T',
        },
      })
    );
  });

  it('typeType', () => {
    expect(typeType(primitiveType(Type_PrimitiveType.DOUBLE))).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'type',
          value: {
            typeKind: {
              case: 'primitive',
              value: 4,
            },
          },
        },
      })
    );
  });

  it('ERROR_TYPE', () => {
    expect(ERROR_TYPE).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'error',
          value: create(EmptySchema),
        },
      })
    );
  });

  it('abstractType', () => {
    expect(
      abstractType({
        name: 'google.protobuf.Any',
        parameterTypes: [primitiveType(Type_PrimitiveType.STRING)],
      })
    ).toEqual(
      create(TypeSchema, {
        typeKind: {
          case: 'abstractType',
          value: {
            name: 'google.protobuf.Any',
            parameterTypes: [
              {
                typeKind: {
                  case: 'primitive',
                  value: 5,
                },
              },
            ],
          },
        },
      })
    );
  });

  it('isExactType', () => {
    const testCases = [
      {
        t1: primitiveType(Type_PrimitiveType.STRING),
        t2: primitiveType(Type_PrimitiveType.STRING),
        isExact: true,
      },
      {
        t1: primitiveType(Type_PrimitiveType.STRING),
        t2: primitiveType(Type_PrimitiveType.INT64),
        isExact: false,
      },
      {
        t1: optionalType(primitiveType(Type_PrimitiveType.STRING)),
        t2: optionalType(primitiveType(Type_PrimitiveType.INT64)),
        isExact: false,
      },
      {
        t1: optionalType(primitiveType(Type_PrimitiveType.UINT64)),
        t2: optionalType(primitiveType(Type_PrimitiveType.UINT64)),
        isExact: true,
      },
      {
        t1: optionalType(typeParamType('T')),
        t2: optionalType(typeParamType('T')),
        isExact: true,
      },
      {
        t1: optionalType(typeParamType('S')),
        t2: optionalType(typeParamType('T')),
        isExact: false,
      },
      {
        t1: mapType({
          keyType: primitiveType(Type_PrimitiveType.STRING),
          valueType: primitiveType(Type_PrimitiveType.INT64),
        }),
        t2: mapType({
          keyType: primitiveType(Type_PrimitiveType.STRING),
          valueType: primitiveType(Type_PrimitiveType.INT64),
        }),
        isExact: true,
      },
      {
        t1: mapType({
          keyType: primitiveType(Type_PrimitiveType.STRING),
          valueType: primitiveType(Type_PrimitiveType.INT64),
        }),
        t2: mapType({
          keyType: primitiveType(Type_PrimitiveType.STRING),
          valueType: primitiveType(Type_PrimitiveType.BOOL),
        }),
        isExact: false,
      },
      {
        t1: listType({
          elemType: primitiveType(Type_PrimitiveType.STRING),
        }),
        t2: listType({
          elemType: primitiveType(Type_PrimitiveType.STRING),
        }),
        isExact: true,
      },
      {
        t1: listType({
          elemType: primitiveType(Type_PrimitiveType.STRING),
        }),
        t2: listType({
          elemType: primitiveType(Type_PrimitiveType.INT64),
        }),
        isExact: false,
      },
      {
        t1: wrappedType(Type_PrimitiveType.STRING),
        t2: wrappedType(Type_PrimitiveType.STRING),
        isExact: true,
      },
      {
        t1: wrappedType(Type_PrimitiveType.STRING),
        t2: wrappedType(Type_PrimitiveType.INT64),
        isExact: false,
      },
    ];
    for (const testCase of testCases) {
      expect(isExactType(testCase.t1, testCase.t2)).toEqual(testCase.isExact);
    }
  });

  describe('isAssignable', () => {
    const testCases = [
      {
        t1: nullableType(primitiveType(Type_PrimitiveType.STRING)),
        t2: NULL_TYPE,
        isAssignable: true,
      },
      {
        t1: nullableType(primitiveType(Type_PrimitiveType.STRING)),
        t2: primitiveType(Type_PrimitiveType.STRING),
        isAssignable: true,
      },
      {
        t1: abstractType({
          name: 'vector',
          parameterTypes: [primitiveType(Type_PrimitiveType.DOUBLE)],
        }),
        t2: abstractType({
          name: 'vector',
          parameterTypes: [primitiveType(Type_PrimitiveType.DOUBLE)],
        }),
        isAssignable: true,
      },
      {
        t1: abstractType({
          name: 'vector',
          parameterTypes: [primitiveType(Type_PrimitiveType.DOUBLE)],
        }),
        t2: abstractType({
          name: 'vector',
          parameterTypes: [primitiveType(Type_PrimitiveType.UINT64)],
        }),
        isAssignable: false,
      },
      {
        t1: abstractType({
          name: 'vector',
          parameterTypes: [
            nullableType(primitiveType(Type_PrimitiveType.DOUBLE)),
          ],
        }),
        t2: abstractType({
          name: 'vector',
          parameterTypes: [NULL_TYPE],
        }),
        isAssignable: true,
      },
      {
        t1: abstractType({
          name: 'vector',
          parameterTypes: [
            nullableType(primitiveType(Type_PrimitiveType.DOUBLE)),
          ],
        }),
        t2: abstractType({
          name: 'vector',
          parameterTypes: [primitiveType(Type_PrimitiveType.DOUBLE)],
        }),
        isAssignable: true,
      },
      {
        t1: abstractType({
          name: 'vector',
          parameterTypes: [DYN_TYPE],
        }),
        t2: abstractType({
          name: 'vector',
          parameterTypes: [
            nullableType(primitiveType(Type_PrimitiveType.INT64)),
          ],
        }),
        isAssignable: true,
      },
      {
        t1: abstractType({
          name: 'vector',
          parameterTypes: [primitiveType(Type_PrimitiveType.DOUBLE)],
        }),
        t2: abstractType({
          name: 'vector',
          parameterTypes: [
            nullableType(primitiveType(Type_PrimitiveType.INT64)),
          ],
        }),
        isAssignable: false,
      },
      {
        t1: abstractType({
          name: 'vector',
          parameterTypes: [
            nullableType(primitiveType(Type_PrimitiveType.INT64)),
          ],
        }),
        t2: abstractType({
          name: 'vector',
          parameterTypes: [DYN_TYPE],
        }),
        isAssignable: false,
      },
      {
        t1: messageType('test.TestMessage'),
        t2: messageType('test.TestMessage'),
        isAssignable: true,
      },
      {
        t1: messageType('test.TestMessage'),
        t2: messageType('test.AnotherTestMessage'),
        isAssignable: false,
      },
      {
        t1: mapType({
          keyType: typeParamType('K'),
          valueType: primitiveType(Type_PrimitiveType.INT64),
        }),
        t2: mapType({
          keyType: primitiveType(Type_PrimitiveType.STRING),
          valueType: primitiveType(Type_PrimitiveType.INT64),
        }),
        isAssignable: true,
      },
      {
        t1: mapType({
          keyType: primitiveType(Type_PrimitiveType.STRING),
          valueType: primitiveType(Type_PrimitiveType.INT64),
        }),
        t2: mapType({
          keyType: typeParamType('K'),
          valueType: primitiveType(Type_PrimitiveType.INT64),
        }),
        isAssignable: false,
      },
      {
        t1: listType({
          elemType: typeParamType('T'),
        }),
        t2: listType({
          elemType: primitiveType(Type_PrimitiveType.INT64),
        }),
        isAssignable: true,
      },
      {
        t1: listType({
          elemType: primitiveType(Type_PrimitiveType.INT64),
        }),
        t2: listType({
          elemType: typeParamType('T'),
        }),
        isAssignable: false,
      },
      {
        t1: listType({
          elemType: primitiveType(Type_PrimitiveType.INT64),
        }),
        t2: listType({
          elemType: primitiveType(Type_PrimitiveType.STRING),
        }),
        isAssignable: false,
      },
      {
        t1: listType({
          elemType: primitiveType(Type_PrimitiveType.STRING),
        }),
        t2: listType({
          elemType: primitiveType(Type_PrimitiveType.INT64),
        }),
        isAssignable: false,
      },
      {
        t1: listType({
          elemType: messageType('test.TestMessage'),
        }),
        t2: listType({
          elemType: primitiveType(Type_PrimitiveType.INT64),
        }),
        isAssignable: false,
      },
    ];
    for (const testCase of testCases) {
      it(
        formatCELType(testCase.t2) +
          ' is assignable to ' +
          formatCELType(testCase.t1),
        () => {
          expect(isAssignableType(testCase.t1, testCase.t2)).toEqual(
            testCase.isAssignable
          );
        }
      );
    }
  });
});
