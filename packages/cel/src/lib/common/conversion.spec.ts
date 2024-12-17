import { CheckedExprSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import { ExprSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb';
import { create } from '@bufbuild/protobuf';
import {
  AST,
  CheckedAST,
  newFunctionReference,
  newIdentReference,
  SourceInfo,
} from './ast';
import { toAST, toProto } from './conversion';
import { LOGICAL_NOT_OVERLOAD } from './overloads';
import { BoolProtoType, DynProtoType } from './pb/types';
import { InfoSource } from './source';
import { BoolRefVal } from './types/bool';
import { BoolType, DynType } from './types/types';

describe('conversion', () => {
  const astTests = [
    {
      cel: new CheckedAST(
        new AST(
          create(ExprSchema),
          new SourceInfo(new InfoSource(), '', '', [], 0, 0)
        ),
        new Map([
          [BigInt(1), BoolType],
          [BigInt(2), DynType],
        ]),
        new Map([
          [BigInt(1), newFunctionReference(LOGICAL_NOT_OVERLOAD)],
          [BigInt(2), newIdentReference('TRUE', BoolRefVal.True)],
        ])
      ),
      pb: create(CheckedExprSchema, {
        expr: {},
        sourceInfo: {},
        typeMap: {
          '1': BoolProtoType,
          '2': DynProtoType,
        },
        referenceMap: {
          '1': {
            overloadId: [LOGICAL_NOT_OVERLOAD],
          },
          '2': {
            name: 'TRUE',
            value: {
              constantKind: {
                case: 'boolValue',
                value: true,
              },
            },
            overloadId: [],
          },
        },
      }),
    },
  ];
  for (const tc of astTests) {
    it('should convert to proto', () => {
      expect(toProto(tc.cel)).toStrictEqual(tc.pb);
    });
    it('should convert to AST', () => {
      expect(toAST(tc.pb)).toStrictEqual(tc.cel);
    });
  }

  // TODO: more conversion tests
});
