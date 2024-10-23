import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import { stringConstant, stringExpr, stringValue } from './string';

describe('string', () => {
  it('stringConstant', () => {
    expect(stringConstant('hello')).toEqual(
      create(ConstantSchema, {
        constantKind: {
          case: 'stringValue',
          value: 'hello',
        },
      })
    );
  });

  it('stringExpr', () => {
    expect(stringExpr(BigInt(1), 'hello')).toEqual(
      create(ExprSchema, {
        id: BigInt(1),
        exprKind: {
          case: 'constExpr',
          value: create(ConstantSchema, {
            constantKind: {
              case: 'stringValue',
              value: 'hello',
            },
          }),
        },
      })
    );
  });

  it('stringValue', () => {
    expect(stringValue('hello')).toEqual(
      create(ValueSchema, {
        kind: {
          case: 'stringValue',
          value: 'hello',
        },
      })
    );
  });

  // TODO: validations
});
