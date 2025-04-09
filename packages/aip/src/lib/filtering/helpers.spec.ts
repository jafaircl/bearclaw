import { CheckedExprSchema } from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/checked_pb';
import { ParsedExprSchema } from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/syntax_pb.js';
import { isMessage } from '@bufbuild/protobuf';
import { newIdentDeclaration } from './declarations';
import {
  extendStandardFilterDeclarations,
  parseAndCheckFilter,
  parseFilter,
} from './helpers';
import { TypeInt } from './types';

describe('helpers', () => {
  it('parse should return a ParsedExpr object', () => {
    const parsed = parseFilter('a = 1');
    expect(isMessage(parsed, ParsedExprSchema)).toBeTruthy();
  });

  it('parse should throw an error for invalid input', () => {
    expect(() => parseFilter('=')).toThrowError('unexpected token =');
  });

  it('parseAndCheck should return a CheckedExpr object', () => {
    const checked = parseAndCheckFilter(
      'a = 1',
      extendStandardFilterDeclarations([newIdentDeclaration('a', TypeInt)])
    );
    expect(isMessage(checked, CheckedExprSchema)).toBeTruthy();
  });

  it('parseAndCheck should throw an error for invalid input', () => {
    expect(() => parseAndCheckFilter('a = 1')).toThrowError(
      `undeclared identifier 'a'`
    );
  });
});
