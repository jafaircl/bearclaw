import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
import { create } from '@bufbuild/protobuf';
import { bytesConstant, bytesExpr, bytesValue } from './bytes';

describe('bytes', () => {
  it('bytesConstant', () => {
    expect(bytesConstant(new Uint8Array([1, 2, 3]))).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'bytesValue',
          value: new Uint8Array([1, 2, 3]),
        },
      })
    );
  });

  it('bytesExpr', () => {
    expect(bytesExpr(BigInt(1), new Uint8Array([1, 2, 3]))).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'bytesValue',
              value: new Uint8Array([1, 2, 3]),
            },
          }),
        },
      })
    );
  });

  it('bytesValue', () => {
    expect(bytesValue(new Uint8Array([1, 2, 3]))).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'bytesValue',
          value: new Uint8Array([1, 2, 3]),
        },
      })
    );
  });

  // TODO: validations
});
