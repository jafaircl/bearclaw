import {
  ConstantSchema,
  ExprSchema,
  Expr_CreateStruct_EntrySchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';
import {
  NULL_CONSTANT,
  NULL_VALUE,
  boolConstant,
  boolExpr,
  boolValue,
  bytesConstant,
  bytesExpr,
  bytesValue,
  callExpr,
  comprehensionExpr,
  constExpr,
  createStructEntry,
  createStructFieldEntry,
  createStructMapEntry,
  doubleConstant,
  doubleExpr,
  doubleValue,
  extractIdent,
  identExpr,
  int64Constant,
  int64Expr,
  int64Value,
  listExpr,
  nullExpr,
  selectExpr,
  stringConstant,
  stringExpr,
  stringValue,
  structExpr,
  uint64Constant,
  uint64Expr,
  uint64Value,
  unquote,
} from './utils';

describe('utils', () => {
  it('constExpr', () => {
    expect(
      constExpr(BigInt(1), {
        constantKind: {
          case: 'boolValue',
          value: true,
        },
      })
    ).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'boolValue',
              value: true,
            },
          }),
        },
      })
    );
  });

  it('boolConstant', () => {
    expect(boolConstant(true)).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'boolValue',
          value: true,
        },
      })
    );
  });

  it('boolExpr', () => {
    expect(boolExpr(BigInt(1), true)).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'boolValue',
              value: true,
            },
          }),
        },
      })
    );
  });

  it('boolValue', () => {
    expect(boolValue(true)).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'boolValue',
          value: true,
        },
      })
    );
  });

  it('int64Constant', () => {
    expect(int64Constant(BigInt(1))).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'int64Value',
          value: BigInt(1),
        },
      })
    );
  });

  it('int64Expr', () => {
    expect(int64Expr(BigInt(1), BigInt(1))).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'int64Value',
              value: BigInt(1),
            },
          }),
        },
      })
    );
  });

  it('int64Value', () => {
    expect(int64Value(BigInt(1))).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'int64Value',
          value: BigInt(1),
        },
      })
    );
  });

  it('uint64Constant', () => {
    expect(uint64Constant(BigInt(1))).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'uint64Value',
          value: BigInt(1),
        },
      })
    );
  });

  it('uint64Expr', () => {
    expect(uint64Expr(BigInt(1), BigInt(1))).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'uint64Value',
              value: BigInt(1),
            },
          }),
        },
      })
    );
  });

  it('uint64Value', () => {
    expect(uint64Value(BigInt(1))).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'uint64Value',
          value: BigInt(1),
        },
      })
    );
  });

  it('doubleConstant', () => {
    expect(doubleConstant(1.1)).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'doubleValue',
          value: 1.1,
        },
      })
    );
  });

  it('doubleExpr', () => {
    expect(doubleExpr(BigInt(1), 1.1)).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'doubleValue',
              value: 1.1,
            },
          }),
        },
      })
    );
  });

  it('doubleValue', () => {
    expect(doubleValue(1.1)).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'doubleValue',
          value: 1.1,
        },
      })
    );
  });

  it('stringConstant', () => {
    expect(stringConstant('hello')).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'stringValue',
          value: 'hello',
        },
      })
    );
  });

  it('stringExpr', () => {
    expect(stringExpr(BigInt(1), 'hello')).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'stringValue',
              value: 'hello',
            },
          }),
        },
      })
    );
  });

  it('stringValue', () => {
    expect(stringValue('hello')).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'stringValue',
          value: 'hello',
        },
      })
    );
  });

  it('bytesConstant', () => {
    expect(bytesConstant(new Uint8Array([1, 2, 3]))).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'bytesValue',
          value: new Uint8Array([1, 2, 3]),
        },
      })
    );
  });

  it('bytesExpr', () => {
    expect(bytesExpr(BigInt(1), new Uint8Array([1, 2, 3]))).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'bytesValue',
              value: new Uint8Array([1, 2, 3]),
            },
          }),
        },
      })
    );
  });

  it('bytesValue', () => {
    expect(bytesValue(new Uint8Array([1, 2, 3]))).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'bytesValue',
          value: new Uint8Array([1, 2, 3]),
        },
      })
    );
  });

  it('NULL_CONSTANT', () => {
    expect(NULL_CONSTANT).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'nullValue',
          value: NullValue.NULL_VALUE,
        },
      })
    );
  });

  it('nullExpr', () => {
    expect(nullExpr(BigInt(1))).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: NULL_CONSTANT,
        },
      })
    );
  });

  it('NULL_VALUE', () => {
    expect(NULL_VALUE).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'nullValue',
          value: NullValue.NULL_VALUE,
        },
      })
    );
  });

  it('identExpr', () => {
    expect(identExpr(BigInt(1), { name: 'a' })).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'identExpr',
          value: { name: 'a' },
        },
      })
    );
  });

  it('callExpr', () => {
    expect(
      callExpr(BigInt(1), {
        function: 'a',
        target: identExpr(BigInt(2), { name: 'b' }),
        args: [boolExpr(BigInt(3), true)],
      })
    ).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'callExpr',
          value: {
            function: 'a',
            target: create(ExprSchema, {
              id: BigInt(2),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            }),
            args: [
              create(ExprSchema, {
                id: BigInt(3),
                exprKind: {
                  case: 'constExpr',
                  value: create(ConstantSchema, {
                    constantKind: {
                      case: 'boolValue',
                      value: true,
                    },
                  }),
                },
              }),
            ],
          },
        },
      })
    );
  });

  it('listExpr', () => {
    expect(
      listExpr(BigInt(1), {
        elements: [int64Expr(BigInt(2), BigInt(1))],
      })
    ).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'listExpr',
          value: {
            elements: [
              create(ExprSchema, {
                id: BigInt(2),
                exprKind: {
                  case: 'constExpr',
                  value: create(ConstantSchema, {
                    constantKind: {
                      case: 'int64Value',
                      value: BigInt(1),
                    },
                  }),
                },
              }),
            ],
          },
        },
      })
    );
  });

  it('selectExpr', () => {
    expect(
      selectExpr(BigInt(1), {
        operand: identExpr(BigInt(2), { name: 'a' }),
        field: 'b',
        testOnly: true,
      })
    ).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'selectExpr',
          value: {
            operand: create(ExprSchema, {
              id: BigInt(2),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            }),
            field: 'b',
            testOnly: true,
          },
        },
      })
    );
  });

  it('structExpr', () => {
    expect(
      structExpr(BigInt(1), {
        entries: [
          {
            keyKind: {
              case: 'fieldKey',
              value: 'a',
            },
            value: int64Expr(BigInt(2), BigInt(1)),
          },
        ],
      })
    ).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'structExpr',
          value: {
            entries: [
              {
                keyKind: {
                  case: 'fieldKey',
                  value: 'a',
                },
                value: create(ExprSchema, {
                  id: BigInt(2),
                  exprKind: {
                    case: 'constExpr',
                    value: create(ConstantSchema, {
                      constantKind: {
                        case: 'int64Value',
                        value: BigInt(1),
                      },
                    }),
                  },
                }),
              },
            ],
          },
        },
      })
    );
  });

  it('createStructEntry', () => {
    expect(
      createStructEntry(BigInt(1), {
        keyKind: {
          case: 'fieldKey',
          value: 'a',
        },
        value: int64Expr(BigInt(2), BigInt(1)),
      })
    ).toEqual(
      create(Expr_CreateStruct_EntrySchema, {
        id: BigInt(1),
        keyKind: {
          case: 'fieldKey',
          value: 'a',
        },
        value: create(ExprSchema, {
          id: BigInt(2),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
              constantKind: {
                case: 'int64Value',
                value: BigInt(1),
              },
            }),
          },
        }),
      })
    );
  });

  it('createStructFieldEntry', () => {
    expect(
      createStructFieldEntry(BigInt(1), {
        key: 'a',
        value: int64Expr(BigInt(2), BigInt(1)),
      })
    ).toEqual(
      create(Expr_CreateStruct_EntrySchema, {
        id: BigInt(1),
        keyKind: {
          case: 'fieldKey',
          value: 'a',
        },
        value: create(ExprSchema, {
          id: BigInt(2),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
              constantKind: {
                case: 'int64Value',
                value: BigInt(1),
              },
            }),
          },
        }),
      })
    );
  });

  it('createStructMapEntry', () => {
    expect(
      createStructMapEntry(BigInt(1), {
        key: stringExpr(BigInt(2), 'a'),
        value: int64Expr(BigInt(3), BigInt(1)),
      })
    ).toEqual(
      create(Expr_CreateStruct_EntrySchema, {
        id: BigInt(1),
        keyKind: {
          case: 'mapKey',
          value: create(ExprSchema, {
            id: BigInt(2),
            exprKind: {
              case: 'constExpr',
              value: create(ConstantSchema, {
                constantKind: {
                  case: 'stringValue',
                  value: 'a',
                },
              }),
            },
          }),
        },
        value: create(ExprSchema, {
          id: BigInt(3),
          exprKind: {
            case: 'constExpr',
            value: create(ConstantSchema, {
              constantKind: {
                case: 'int64Value',
                value: BigInt(1),
              },
            }),
          },
        }),
      })
    );
  });

  it('compreshensionExpr', () => {
    const target = identExpr(BigInt(1), { name: 'a' });
    const accuInit = listExpr(BigInt(2), {});
    const condition = boolExpr(BigInt(3), true);
    const stepArg0 = identExpr(BigInt(4), { name: 'b' });
    const stepArg1 = listExpr(BigInt(5), {
      elements: [int64Expr(BigInt(6), BigInt(1))],
    });
    const step = callExpr(BigInt(7), {
      function: 'add',
      args: [stepArg0, stepArg1],
    });
    const resultArg0 = identExpr(BigInt(8), { name: 'b' });
    const resultArg1 = int64Expr(BigInt(9), BigInt(1));
    const result = callExpr(BigInt(10), {
      function: 'equals',
      args: [resultArg0, resultArg1],
    });
    expect(
      comprehensionExpr(BigInt(11), {
        iterRange: target,
        iterVar: 'a',
        accuVar: 'b',
        accuInit,
        loopCondition: condition,
        loopStep: step,
        result,
      })
    ).toEqual(
      create(ExprSchema, {
        id: BigInt(11),
        exprKind: {
          case: 'comprehensionExpr',
          value: {
            iterRange: create(ExprSchema, {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            }),
            iterVar: 'a',
            accuVar: 'b',
            accuInit: create(ExprSchema, {
              id: BigInt(2),
              exprKind: {
                case: 'listExpr',
                value: {},
              },
            }),
            loopCondition: create(ExprSchema, {
              id: BigInt(3),
              exprKind: {
                case: 'constExpr',
                value: create(ConstantSchema, {
                  constantKind: {
                    case: 'boolValue',
                    value: true,
                  },
                }),
              },
            }),
            loopStep: create(ExprSchema, {
              id: BigInt(7),
              exprKind: {
                case: 'callExpr',
                value: {
                  function: 'add',
                  args: [
                    create(ExprSchema, {
                      id: BigInt(4),
                      exprKind: {
                        case: 'identExpr',
                        value: { name: 'b' },
                      },
                    }),
                    create(ExprSchema, {
                      id: BigInt(5),
                      exprKind: {
                        case: 'listExpr',
                        value: {
                          elements: [
                            create(ExprSchema, {
                              id: BigInt(6),
                              exprKind: {
                                case: 'constExpr',
                                value: create(ConstantSchema, {
                                  constantKind: {
                                    case: 'int64Value',
                                    value: BigInt(1),
                                  },
                                }),
                              },
                            }),
                          ],
                        },
                      },
                    }),
                  ],
                },
              },
            }),
            result: create(ExprSchema, {
              id: BigInt(10),
              exprKind: {
                case: 'callExpr',
                value: {
                  function: 'equals',
                  args: [
                    create(ExprSchema, {
                      id: BigInt(8),
                      exprKind: {
                        case: 'identExpr',
                        value: { name: 'b' },
                      },
                    }),
                    create(ExprSchema, {
                      id: BigInt(9),
                      exprKind: {
                        case: 'constExpr',
                        value: create(ConstantSchema, {
                          constantKind: {
                            case: 'int64Value',
                            value: BigInt(1),
                          },
                        }),
                      },
                    }),
                  ],
                },
              },
            }),
          },
        },
      })
    );
  });

  it('unquote', () => {
    expect(unquote('a')).toEqual('a');
    expect(unquote('"a"')).toEqual('a');
    expect(unquote("'a'")).toEqual('a');
    expect(unquote('`a`')).toEqual('a');
  });

  it('extractIdent', () => {
    expect(extractIdent(identExpr(BigInt(1), { name: 'a' }))).toEqual('a');
    expect(extractIdent(int64Expr(BigInt(1), BigInt(1)))).toEqual(null);
  });
});
