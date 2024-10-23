import {
  ConstantSchema,
  ExprSchema,
  Expr_CreateStruct_EntrySchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { create } from '@bufbuild/protobuf';
import { int64Expr } from './int';
import { stringExpr } from './string';
import {
  structEntry,
  structExpr,
  structFieldEntry,
  structMapEntry,
} from './struct';

describe('struct', () => {
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
      structEntry({
        id: BigInt(1),
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
      structFieldEntry(BigInt(1), 'a', int64Expr(BigInt(2), BigInt(1)))
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
      structMapEntry(
        BigInt(1),
        stringExpr(BigInt(2), 'a'),
        int64Expr(BigInt(3), BigInt(1))
      )
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
});
