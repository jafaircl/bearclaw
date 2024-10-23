import {
  ExprSchema,
  Expr_SelectSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { identExpr } from './ident';
import { selectExpr, unwrapSelectExpr } from './select';

describe('select', () => {
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

  it('unwrapSelectExpr', () => {
    const expr = selectExpr(BigInt(1), {
      operand: identExpr(BigInt(2), { name: 'a' }),
      field: 'b',
      testOnly: true,
    });
    expect(unwrapSelectExpr(expr)).toEqual(
      create(Expr_SelectSchema, {
        field: 'b',
        operand: create(ExprSchema, {
          id: BigInt(2),
          exprKind: {
            case: 'identExpr',
            value: { name: 'a' },
          },
        }),
        testOnly: true,
      })
    );
  });
});
