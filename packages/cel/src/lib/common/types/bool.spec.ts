import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { create } from '@bufbuild/protobuf';
import { boolConstant, boolExpr, boolValue } from './bool';

describe('bool', () => {
  it('boolConstant', () => {
    expect(boolConstant(true)).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'boolValue',
          value: true,
        },
      })
    );
  });

  it('boolExpr', () => {
    expect(boolExpr(BigInt(1), true)).toEqual(
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

  it('boolValue', () => {
    expect(boolValue(true)).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'boolValue',
          value: true,
        },
      })
    );
  });

  // TODO: validations
});
