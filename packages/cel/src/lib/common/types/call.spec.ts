import {
  ConstantSchema,
  ExprSchema,
  Expr_CallSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { boolExpr } from './bool';
import { callExpr, unwrapCallExpr } from './call';
import { identExpr } from './ident';

describe('call', () => {
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

  it('unwrapCallExpr', () => {
    const expr = callExpr(BigInt(1), {
      function: 'a',
      target: identExpr(BigInt(2), { name: 'b' }),
      args: [boolExpr(BigInt(3), true)],
    });
    expect(unwrapCallExpr(expr)).toEqual(
      create(Expr_CallSchema, {
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
      })
    );
  });
});
