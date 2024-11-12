import {
  ConstantSchema,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ValueSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb.js';
import { create } from '@bufbuild/protobuf';
import { NullValue, NullValueSchema } from '@bufbuild/protobuf/wkt';
import { BoolRefVal } from './bool';
import { ErrorRefVal } from './error';
import {
  NULL_CONSTANT,
  NULL_REF_TYPE,
  NULL_VALUE,
  nullExpr,
  NullRefVal,
} from './null';
import { STRING_REF_TYPE, StringRefVal } from './string';
import { TIMESTAMP_REF_TYPE } from './timestamp';
import { TYPE_REF_TYPE } from './type';

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

  it('nullConvertToNative', () => {
    const tests = [
      {
        input: new NullRefVal(),
        type: Object,
        want: null,
      },
      {
        input: new NullRefVal(),
        type: BigInt,
        want: BigInt(0),
      },
      // {
      //   input: new NullRefVal(),
      //   type: AnySchema,
      //   want: anyPack(NullValueSchema as unknown as DescMessage, NULL_VALUE),
      // },
      {
        input: new NullRefVal(),
        type: NullValueSchema,
        want: NULL_VALUE,
      },
      {
        input: new NullRefVal(),
        type: String,
        want: ErrorRefVal.nativeTypeConversionError(new NullRefVal(), String),
      },
    ];
    for (const test of tests) {
      expect(test.input.convertToNative(test.type)).toEqual(test.want);
    }
  });

  it('nullConvertToType', () => {
    const tests = [
      {
        input: new NullRefVal(),
        type: NULL_REF_TYPE,
        want: new NullRefVal(),
      },
      {
        input: new NullRefVal(),
        type: STRING_REF_TYPE,
        want: new StringRefVal('null'),
      },
      {
        input: new NullRefVal(),
        type: TYPE_REF_TYPE,
        want: NULL_REF_TYPE,
      },
      {
        input: new NullRefVal(),
        type: TIMESTAMP_REF_TYPE,
        want: ErrorRefVal.typeConversionError(
          new NullRefVal(),
          TIMESTAMP_REF_TYPE
        ),
      },
    ];
    for (const test of tests) {
      expect(test.input.convertToType(test.type)).toStrictEqual(test.want);
    }
  });

  it('nullEqual', () => {
    const tests = [
      {
        input: new NullRefVal(),
        other: new NullRefVal(),
        want: new BoolRefVal(true),
      },
      {
        input: new NullRefVal(),
        other: new StringRefVal('null'),
        want: new BoolRefVal(false),
      },
    ];
    for (const test of tests) {
      expect(test.input.equal(test.other)).toStrictEqual(test.want);
    }
  });

  it('nullIsZeroValue', () => {
    expect(new NullRefVal().isZeroValue()).toEqual(true);
  });
});
