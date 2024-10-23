import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import { doubleConstant, doubleExpr, doubleValue } from './double';

describe('double', () => {
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

  // TODO: validations
});
