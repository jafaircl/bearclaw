import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import { int64Constant, int64Expr, int64Value } from './int';

describe('int', () => {
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

  // TODO: validations
});
