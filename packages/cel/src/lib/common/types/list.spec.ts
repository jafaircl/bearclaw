import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { create } from '@bufbuild/protobuf';
import { int64Expr, int64Value } from './int';
import { listExpr, listValue } from './list';

describe('list', () => {
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

  it('listValue', () => {
    expect(listValue({ values: [int64Value(BigInt(2))] })).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'listValue',
          value: {
            values: [
              create(ValueSchema, {
                kind: {
                  case: 'int64Value',
                  value: BigInt(2),
                },
              }),
            ],
          },
        },
      })
    );
  });

  // TODO: validations
});
