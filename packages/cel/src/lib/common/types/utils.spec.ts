import { Type_PrimitiveType } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import { ScalarType } from '@bufbuild/protobuf';
import { BOOL_CEL_TYPE } from './bool';
import { BYTES_CEL_TYPE } from './bytes';
import { DYN_TYPE } from './dyn';
import { ERROR_TYPE } from './error';
import { INT_CEL_TYPE } from './int';
import { primitiveType } from './primitive';
import { STRING_CEL_TYPE } from './string';
import { UINT_CEL_TYPE } from './uint';
import { isDynTypeOrErrorType, scalarTypeToPrimitiveType } from './utils';

describe('utils', () => {
  it('isDynTypeOrErrorType', () => {
    expect(isDynTypeOrErrorType(DYN_TYPE)).toBe(true);
    expect(isDynTypeOrErrorType(ERROR_TYPE)).toBe(true);
    expect(isDynTypeOrErrorType(BOOL_CEL_TYPE)).toBe(false);
    expect(isDynTypeOrErrorType(BYTES_CEL_TYPE)).toBe(false);
    expect(isDynTypeOrErrorType(INT_CEL_TYPE)).toBe(false);
    expect(isDynTypeOrErrorType(STRING_CEL_TYPE)).toBe(false);
    expect(isDynTypeOrErrorType(UINT_CEL_TYPE)).toBe(false);
  });

  it('scalarTypeToPrimitiveType', () => {
    const testCases = [
      {
        in: ScalarType.BOOL,
        out: Type_PrimitiveType.BOOL,
      },
      {
        in: ScalarType.BYTES,
        out: Type_PrimitiveType.BYTES,
      },
      {
        in: ScalarType.DOUBLE,
        out: Type_PrimitiveType.DOUBLE,
      },
      {
        in: ScalarType.INT64,
        out: Type_PrimitiveType.INT64,
      },
      {
        in: ScalarType.STRING,
        out: Type_PrimitiveType.STRING,
      },
      {
        in: ScalarType.UINT64,
        out: Type_PrimitiveType.UINT64,
      },
      {
        in: ScalarType.FIXED32,
        out: Type_PrimitiveType.DOUBLE,
      },
      {
        in: ScalarType.FIXED64,
        out: Type_PrimitiveType.DOUBLE,
      },
      {
        in: ScalarType.FLOAT,
        out: Type_PrimitiveType.DOUBLE,
      },
      {
        in: ScalarType.SFIXED32,
        out: Type_PrimitiveType.DOUBLE,
      },
      {
        in: ScalarType.SFIXED64,
        out: Type_PrimitiveType.DOUBLE,
      },
      {
        in: ScalarType.SINT32,
        out: Type_PrimitiveType.INT64,
      },
      {
        in: ScalarType.SINT64,
        out: Type_PrimitiveType.INT64,
      },
      {
        in: ScalarType.UINT32,
        out: Type_PrimitiveType.UINT64,
      },
    ];
    for (const testCase of testCases) {
      expect(scalarTypeToPrimitiveType(testCase.in)).toEqual(
        primitiveType(testCase.out)
      );
    }
  });
});
