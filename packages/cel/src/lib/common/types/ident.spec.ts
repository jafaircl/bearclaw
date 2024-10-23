import {
  ExprSchema,
  Expr_IdentSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { create } from '@bufbuild/protobuf';
import { identExpr, unwrapIdentExpr } from './ident';

describe('ident', () => {
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

  it('unwrapIdentExpr', () => {
    const expr = identExpr(BigInt(1), { name: 'a' });
    expect(unwrapIdentExpr(expr)).toEqual(
      create(Expr_IdentSchema, { name: 'a' })
    );
  });
});
