/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Container } from '../common/container';
import { FunctionDecl, newVariable, OverloadDecl } from '../common/decls';
import { TextSource } from '../common/source';
import { Registry } from '../common/types/provider';
import {
  BoolType,
  BytesType,
  DoubleType,
  IntType,
  NullType,
  StringType,
  Type,
  UintType,
} from '../common/types/types';
import { Parser, ParserOptions } from '../parser/parser';
import { Checker } from './checker';
import { Env } from './env';

interface TestCase {
  in: string;
  out: string;
  outType: Type;
  env?: () => Env;
  err?: string;
  parserOpts?: ParserOptions;
}

describe('Checker', () => {
  it('TODO', () => {
    expect(true).toBeTruthy();
  });
  const testCases: TestCase[] = [
    // Const types
    {
      in: `"A"`,
      out: `"A"~string`,
      outType: StringType,
    },
    {
      in: `12`,
      out: `12~int`,
      outType: IntType,
    },
    {
      in: `12u`,
      out: `12u~uint`,
      outType: UintType,
    },
    {
      in: `true`,
      out: `true~bool`,
      outType: BoolType,
    },
    {
      in: `false`,
      out: `false~bool`,
      outType: BoolType,
    },
    {
      in: `12.23`,
      out: `12.23~double`,
      outType: DoubleType,
    },
    {
      in: `null`,
      out: `null~null`,
      outType: NullType,
    },
    {
      in: `b"ABC"`,
      out: `b"ABC"~bytes`,
      outType: BytesType,
    },
    // Ident types
    {
      in: `is`,
      out: `is~string^is`,
      outType: StringType,
      env: getDefaultEnvironment,
    },
    {
      in: `ii`,
      out: `ii~int^ii`,
      outType: IntType,
      env: getDefaultEnvironment,
    },
    {
      in: `iu`,
      out: `iu~uint^iu`,
      outType: UintType,
      env: getDefaultEnvironment,
    },
    {
      in: `iz`,
      out: `iz~bool^iz`,
      outType: BoolType,
      env: getDefaultEnvironment,
    },
    {
      in: `id`,
      out: `id~double^id`,
      outType: DoubleType,
      env: getDefaultEnvironment,
    },
    {
      in: `ix`,
      out: `ix~null^ix`,
      outType: NullType,
      env: getDefaultEnvironment,
    },
    {
      in: `ib`,
      out: `ib~bytes^ib`,
      outType: BytesType,
      env: getDefaultEnvironment,
    },
    {
      in: `id`,
      out: `id~double^id`,
      outType: DoubleType,
      env: getDefaultEnvironment,
    },
  ];

  for (const testCase of testCases) {
    it(`should check ${testCase.in}`, () => {
      const source = new TextSource(testCase.in);
      const parser = new Parser(
        source,
        testCase.parserOpts ?? { maxRecursionDepth: 32 }
      );
      const parsed = parser.parse();
      const env = testCase.env ? testCase.env() : getDefaultEnvironment();
      const checker = new Checker(parsed, env);
      const checked = checker.check();
      if (testCase.outType) {
        expect(checker.getType(checked.expr())).toStrictEqual(testCase.outType);
      }
      if (testCase.err) {
        expect(checker.errors.toDisplayString()).toContain(
          // Account for the difference in spacing between the test case and
          // the error message
          testCase.err
            .split('\n')
            .map((line) => line.trim())
            .join('\n ')
        );
      }
    });
  }
});

function getDefaultEnvironment() {
  const container = new Container();
  const registry = new Registry();
  const env = new Env(container, registry);
  env.addFunctions(
    new FunctionDecl({
      name: 'fg_s',
      overloads: [
        new OverloadDecl({
          id: 'fg_s_0',
          argTypes: [],
          resultType: StringType,
        }),
      ],
    }),
    new FunctionDecl({
      name: 'fi_s_s',
      overloads: [
        new OverloadDecl({
          id: 'fi_s_s_0',
          argTypes: [StringType],
          resultType: StringType,
        }),
      ],
    })
  );
  env.addIdents(
    newVariable('is', StringType),
    newVariable('ii', IntType),
    newVariable('iu', UintType),
    newVariable('iz', BoolType),
    newVariable('ib', BytesType),
    newVariable('id', DoubleType),
    newVariable('ix', NullType)
  );
  return env;
}
