/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HashMap } from '@bearclaw/collections';
import { isNil } from '@bearclaw/is';
import { TestAllTypesSchema } from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto3/test_all_types_pb.js';
import { create, createRegistry } from '@bufbuild/protobuf';
import { timestampNow } from '@bufbuild/protobuf/wkt';
import { Checker } from '../checker/checker';
import {
  AstNode,
  CallEstimate,
  Coster,
  CostEstimate,
  CostEstimator,
  SizeEstimate,
} from '../checker/cost';
import { Env } from '../checker/env';
import { Container } from '../common/container';
import { newVariableDecl, VariableDecl } from '../common/decls';
import { TIMESTAMP_TO_YEAR_OVERLOAD } from '../common/overloads';
import { RefVal } from '../common/ref/reference';
import { TextSource } from '../common/source';
import { stdFunctions, stdTypes } from '../common/stdlib';
import { reflectNativeType } from '../common/types/native';
import { Registry } from '../common/types/provider';
import {
  BoolType,
  BytesType,
  IntType,
  newListType,
  newMapType,
  newObjectType,
  StringType,
  TimestampType,
} from '../common/types/types';
import { objectToMap } from '../common/utils';
import { AllMacros } from '../parser/macro';
import { Parser } from '../parser/parser';
import { Activation, EmptyActivation, newActivation } from './activation';
import { AttrFactory } from './attributes';
import { DefaultDispatcher } from './dispatcher';
import { ExprInterpreter, observe } from './interpreter';
import {
  ActualCostEstimator,
  costObserver,
  CostTracker,
  costTrackerLimit,
  CostTrackerOption,
  presenceTestHasCost,
} from './runtimecost';

describe('runtimecost', () => {
  describe('TestTrackCostAdvanced', () => {
    const equalCases = [
      {
        lhsExpr: `1`,
        rhsExpr: `2`,
      },
      {
        lhsExpr: `"abc".contains("d")`,
        rhsExpr: `"def".contains("d")`,
      },
      {
        lhsExpr: `1 in [4, 5, 6]`,
        rhsExpr: `2 in [15, 17, 16]`,
      },
    ];
    for (const tc of equalCases) {
      it(`${tc.lhsExpr} vs ${tc.rhsExpr}`, () => {
        const ctx = new EmptyActivation();
        const [lhsCost] = computeCost(tc.lhsExpr, [], ctx, []);
        expect(lhsCost).not.toBeNull();
        const [rhsCost] = computeCost(tc.rhsExpr, [], ctx, []);
        expect(rhsCost).not.toBeNull();
        expect(lhsCost).toEqual(rhsCost);
      });
    }
    const smallerCases = [
      {
        lhsExpr: `1`,
        rhsExpr: `1 + 2`,
      },
      {
        lhsExpr: `"abc".contains("d")`,
        rhsExpr: `"abcdhdflsfiehfieubdkwjbdwgxvuyagwsdwdnw qdbgquyidvbwqi".contains("e")`,
      },
      {
        lhsExpr: `1 in [4, 5, 6]`,
        rhsExpr: `1 in [4, 5, 6, 7, 8, 9]`,
      },
    ];
    for (const tc of smallerCases) {
      it(`${tc.lhsExpr} vs ${tc.rhsExpr}`, () => {
        const ctx = new EmptyActivation();
        const [lhsCost] = computeCost(tc.lhsExpr, [], ctx, []);
        expect(lhsCost).not.toBeNull();
        const [rhsCost] = computeCost(tc.rhsExpr, [], ctx, []);
        expect(rhsCost).not.toBeNull();
        expect(lhsCost).toBeLessThan(rhsCost!);
      });
    }
  });

  describe('TestRuntimeCost', () => {
    const allTypes = newObjectType(
      'google.api.expr.test.v1.proto3.TestAllTypes'
    );
    const allList = newListType(allTypes);
    const intList = newListType(IntType);
    const nestedList = newListType(allList);
    const allMap = newMapType(StringType, allTypes);
    const nestedMap = newMapType(StringType, allMap);
    interface TestCase {
      name: string;
      expr: string;
      vars?: VariableDecl[];
      want: bigint;
      in?: any;
      testFuncCost?: boolean;
      limit?: bigint;
      options?: CostTrackerOption[];

      expectExceedsLimit?: boolean;
    }
    const testCases: TestCase[] = [
      {
        name: 'const',
        expr: `"Hello World!"`,
        want: BigInt(0),
      },
      {
        name: 'identity',
        expr: `input`,
        vars: [newVariableDecl('input', intList)],
        want: BigInt(1),
        in: objectToMap({ input: [1, 2] }),
      },
      {
        name: 'select: map',
        expr: `input['key']`,
        vars: [newVariableDecl('input', newMapType(StringType, StringType))],
        want: BigInt(2),
        in: objectToMap({ input: { key: 'v' } }),
      },
      {
        name: 'select: array index',
        expr: `input[0]`,
        vars: [newVariableDecl('input', newListType(StringType))],
        want: BigInt(2),
        in: objectToMap({ input: ['v'] }),
      },
      {
        name: 'select: field',
        expr: `input.single_int32`,
        vars: [newVariableDecl('input', allTypes)],
        want: BigInt(2),
        in: objectToMap({
          input: create(TestAllTypesSchema, {
            repeatedBool: [false],
            mapInt64NestedType: {
              1: {},
            },
            mapStringString: {},
          }),
        }),
      },
      {
        name: 'expr select: map',
        expr: `input['ke' + 'y']`,
        vars: [newVariableDecl('input', newMapType(StringType, StringType))],
        want: BigInt(3),
        in: objectToMap({ input: { key: 'v' } }),
      },
      {
        name: 'expr select: array index',
        expr: `input[3-3]`,
        vars: [newVariableDecl('input', newListType(StringType))],
        want: BigInt(3),
        in: objectToMap({ input: ['v'] }),
      },
      {
        name: 'select: field test only no has() cost',
        expr: `has(input.single_int32)`,
        vars: [
          newVariableDecl(
            'input',
            newObjectType('google.api.expr.proto3.test.TestAllTypes')
          ),
        ],
        want: BigInt(1),
        options: [presenceTestHasCost(false)],
        in: objectToMap({
          input: create(TestAllTypesSchema, {
            repeatedBool: [false],
            mapInt64NestedType: {
              1: {},
            },
            mapStringString: {},
          }),
        }),
      },
      {
        name: 'select: field test only',
        expr: `has(input.single_int32)`,
        vars: [
          newVariableDecl(
            'input',
            newObjectType('google.api.expr.proto3.test.TestAllTypes')
          ),
        ],
        want: BigInt(2),
        in: objectToMap({
          input: create(TestAllTypesSchema, {
            repeatedBool: [false],
            mapInt64NestedType: {
              1: {},
            },
            mapStringString: {},
          }),
        }),
      },
      {
        name: 'select: non-proto field test has() cost',
        expr: `has(input.testAttr.nestedAttr)`,
        vars: [newVariableDecl('input', nestedMap)],
        want: BigInt(3),
        options: [presenceTestHasCost(true)],
        in: objectToMap({
          input: objectToMap({
            testAttr: objectToMap({
              nestedAttr: '0',
            }),
          }),
        }),
      },
      {
        name: 'select: non-proto field test no has() cost',
        expr: `has(input.testAttr.nestedAttr)`,
        vars: [newVariableDecl('input', nestedMap)],
        want: BigInt(2),
        options: [presenceTestHasCost(false)],
        in: objectToMap({
          input: objectToMap({
            testAttr: objectToMap({
              nestedAttr: '0',
            }),
          }),
        }),
      },
      {
        name: 'select: non-proto field test',
        expr: `has(input.testAttr.nestedAttr)`,
        vars: [newVariableDecl('input', nestedMap)],
        want: BigInt(3),
        in: objectToMap({
          input: objectToMap({
            testAttr: objectToMap({
              nestedAttr: '0',
            }),
          }),
        }),
      },
      {
        name: 'estimated function call',
        expr: `input.getFullYear()`,
        vars: [newVariableDecl('input', TimestampType)],
        want: BigInt(8),
        in: objectToMap({ input: timestampNow() }),
        testFuncCost: true,
      },
      {
        name: 'create list',
        expr: `[1, 2, 3]`,
        want: BigInt(10),
      },
      {
        name: 'create struct',
        expr: `google.api.expr.test.v1.proto3.TestAllTypes{single_int32: 1, single_float: 3.14, single_string: 'str'}`,
        want: BigInt(40),
      },
      {
        name: 'create map',
        expr: `{"a": 1, "b": 2, "c": 3}`,
        want: BigInt(30),
      },
      {
        name: 'all comprehension',
        vars: [newVariableDecl('input', allList)],
        expr: `input.all(x, true)`,
        want: BigInt(2),
        in: objectToMap({
          input: [],
        }),
      },
      {
        name: 'nested all comprehension',
        vars: [newVariableDecl('input', allList)],
        expr: `input.all(x, x.all(y, true))`,
        want: BigInt(2),
        in: objectToMap({
          input: [],
        }),
      },
      {
        name: 'all comprehension on literal',
        expr: `[1, 2, 3].all(x, true)`,
        want: BigInt(20),
      },
      {
        name: 'variable cost function',
        vars: [newVariableDecl('input', StringType)],
        expr: `input.matches('[0-9]')`,
        want: BigInt(103),
        in: objectToMap({ input: randSeq(500) }),
      },
      {
        name: 'variable cost function with constant',
        expr: `'123'.matches('[0-9]')`,
        want: BigInt(2),
      },
      {
        name: 'or',
        expr: `false || false`,
        want: BigInt(0),
      },
      {
        name: 'or short-circuit',
        expr: `true || false`,
        want: BigInt(0),
      },
      {
        name: 'or accumulated branch cost',
        expr: `a || b || c || d`,
        vars: [
          newVariableDecl('a', BoolType),
          newVariableDecl('b', BoolType),
          newVariableDecl('c', BoolType),
          newVariableDecl('d', BoolType),
        ],
        in: objectToMap({
          a: false,
          b: false,
          c: false,
          d: false,
        }),
        want: BigInt(4),
      },
      {
        name: 'and',
        expr: `true && false`,
        want: BigInt(0),
      },
      {
        name: 'and short-circuit',
        expr: `false && true`,
        want: BigInt(0),
      },
      {
        name: 'and accumulated branch cost',
        expr: `a && b && c && d`,
        vars: [
          newVariableDecl('a', BoolType),
          newVariableDecl('b', BoolType),
          newVariableDecl('c', BoolType),
          newVariableDecl('d', BoolType),
        ],
        in: objectToMap({
          a: true,
          b: true,
          c: true,
          d: true,
        }),
        want: BigInt(4),
      },
      {
        name: 'lt',
        expr: `1 < 2`,
        want: BigInt(1),
      },
      {
        name: 'lte',
        expr: `1 <= 2`,
        want: BigInt(1),
      },
      {
        name: 'eq',
        expr: `1 == 2`,
        want: BigInt(1),
      },
      {
        name: 'gt',
        expr: `2 > 1`,
        want: BigInt(1),
      },
      {
        name: 'gte',
        expr: `2 >= 1`,
        want: BigInt(1),
      },
      {
        name: 'in',
        expr: `2 in [1, 2, 3]`,
        want: BigInt(13),
      },
      {
        name: 'plus',
        expr: `1 + 1`,
        want: BigInt(1),
      },
      {
        name: 'minus',
        expr: `1 - 1`,
        want: BigInt(1),
      },
      {
        name: '/',
        expr: `1 / 1`,
        want: BigInt(1),
      },
      {
        name: '/',
        expr: `1 * 1`,
        want: BigInt(1),
      },
      {
        name: '%',
        expr: `1 % 1`,
        want: BigInt(1),
      },
      {
        name: 'ternary',
        expr: `true ? 1 : 2`,
        want: BigInt(0),
      },
      {
        name: 'string size',
        expr: `size("123")`,
        want: BigInt(1),
      },
      {
        name: 'str eq str',
        expr: `'12345678901234567890' == '123456789012345678901234567890'`,
        want: BigInt(2),
      },
      {
        name: 'bytes to string conversion',
        vars: [newVariableDecl('input', BytesType)],
        expr: `string(input)`,
        want: BigInt(51),
        in: objectToMap({ input: new Uint8Array(500) }),
      },
      {
        name: 'string to bytes conversion',
        vars: [newVariableDecl('input', StringType)],
        expr: `bytes(input)`,
        want: BigInt(51),
        in: objectToMap({ input: randSeq(500) }),
      },
      {
        name: 'int to string conversion',
        expr: `string(1)`,
        want: BigInt(1),
      },
      // TODO: more tests
    ];

    for (const tc of testCases) {
      it(tc.name, () => {
        const ctx = tc.in ? newActivation(tc.in) : new EmptyActivation();
        tc.options = tc.options ?? [];
        if (!isNil(tc.limit)) {
          tc.options.push(costTrackerLimit(tc.limit));
        }
        const [cost, est] = computeCost(
          tc.expr,
          tc.vars ?? [],
          ctx,
          tc.options ?? []
        );
        expect(cost).not.toBeNull();
        if (tc.expectExceedsLimit) {
          expect(cost).toBeGreaterThan(tc.limit!);
        }
        expect(cost).toEqual(tc.want);
        if (est) {
          expect(est.min).toBeLessThanOrEqual(cost!);
          expect(est.max).toBeGreaterThanOrEqual(cost!);
        }
      });
    }
  });
});

function computeCost(
  expr: string,
  vars: VariableDecl[],
  ctx: Activation,
  options: CostTrackerOption[]
): [bigint | null, CostEstimate | null] {
  const s = new TextSource(expr);
  const p = new Parser({ macros: [...AllMacros] });
  const parsed = p.parse(s);

  const cont = new Container();
  const reg = new Registry(undefined, createRegistry(TestAllTypesSchema));
  const attrs = new AttrFactory(cont, reg, reg);
  const env = new Env(cont, reg, {});
  env.addFunctions(...stdFunctions);
  env.addIdents(...stdTypes, ...(vars ?? []));
  const costTracker = new CostTracker(
    new TestRuntimeCostEstimator(),
    ...options
  );
  const checker = new Checker(env);
  const checked = checker.check(parsed);
  const est = new Coster(checked, new TestCostEstimator(), {
    presenceTestHasCost: costTracker.presenceTestHasCost,
  }).cost();
  const disp = new DefaultDispatcher();
  for (const fn of stdFunctions) {
    disp.add(...fn.bindings());
  }
  const interp = new ExprInterpreter(disp, cont, reg, reg, attrs);
  const prg = interp.newInterpretable(
    checked,
    observe(costObserver(costTracker))
  );
  if (prg instanceof Error) {
    throw prg;
  }
  prg.eval(ctx);
  // TODO: enable this once all attributes are properly pushed and popped from stack.
  //if len(costTracker.stack) != 1 {
  //	t.Fatalf(`Expected resulting stack size to be 1 but got %d: %#+v`, len(costTracker.stack), costTracker.stack)
  //}
  return [costTracker.cost, est];
}

class TestRuntimeCostEstimator implements ActualCostEstimator {
  callCost(fn: string, overloadID: string, args: RefVal[], result: RefVal) {
    const argsSize: bigint[] = [];
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const reflectV = reflectNativeType(arg.value());
      switch (reflectV) {
        // Note that the CEL bytes type is implemented with Go byte slices, therefore also supported by the following
        // code.
        case String:
        case Array:
          argsSize[i] = BigInt(arg.value().length);
          break;
        case Map:
        case HashMap:
          argsSize[i] = BigInt(arg.value().size);
          break;
        default:
          argsSize[i] = BigInt(1);
          break;
      }
    }

    switch (overloadID) {
      case TIMESTAMP_TO_YEAR_OVERLOAD:
        return BigInt(7);
      default:
        return null;
    }
  }
}

class TestCostEstimator implements CostEstimator {
  constructor(private readonly hints: Map<string, bigint> = new Map()) {}

  estimateSize(element: AstNode): SizeEstimate | null {
    const l = this.hints.get(element.path().join('.'));
    if (!isNil(l)) {
      return new SizeEstimate(BigInt(0), l);
    }
    return null;
  }

  estimateCallCost(
    fn: string,
    overloadID: string,
    target: AstNode,
    args: AstNode[]
  ): CallEstimate | null {
    switch (overloadID) {
      case TIMESTAMP_TO_YEAR_OVERLOAD:
        return new CallEstimate(new CostEstimate(BigInt(7), BigInt(7)));
      default:
        return null;
    }
  }
}

function randSeq(int: number) {
  const letterBytes = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const seq = [];
  for (let i = 0; i < int; i++) {
    seq.push(letterBytes[Math.floor(Math.random() * letterBytes.length)]);
  }
  return seq.join('');
}
