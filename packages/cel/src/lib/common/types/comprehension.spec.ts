import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { boolExpr } from './bool';
import { callExpr } from './call';
import { comprehensionExpr } from './comprehension';
import { identExpr } from './ident';
import { int64Expr } from './int';
import { listExpr } from './list';

describe('comprehansion', () => {
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
});
