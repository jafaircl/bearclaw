import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { constExpr } from './constant';

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
});
