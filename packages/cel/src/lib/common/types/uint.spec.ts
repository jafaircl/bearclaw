import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import { uint64Constant, uint64Expr, uint64Value } from './uint';

describe('uint', () => {
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
});
