import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';
import { NULL_CONSTANT, NULL_VALUE, nullExpr } from './null';

describe('null', () => {
  it('NULL_CONSTANT', () => {
    expect(NULL_CONSTANT).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'nullValue',
          value: NullValue.NULL_VALUE,
        },
      })
    );
  });

  it('nullExpr', () => {
    expect(nullExpr(BigInt(1))).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: NULL_CONSTANT,
        },
      })
    );
  });

  it('NULL_VALUE', () => {
    expect(NULL_VALUE).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'nullValue',
          value: NullValue.NULL_VALUE,
        },
      })
    );
  });

  // TODO: validations
});
