import { isNil } from '@bearclaw/is';
import {
  TestAllTypes_NestedEnumSchema as TestAllTypes_NestedEnumSchemaProto3,
  TestAllTypes_NestedMessageSchema as TestAllTypes_NestedMessageSchemaProto3,
  TestAllTypesSchema as TestAllTypesSchemaProto3,
} from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto3/test_all_types_pb.js';
import { Container } from '../common/container';
import { newVariableDecl, VariableDecl } from '../common/decls';
import {
  CONTAINS_STRING_OVERLOAD,
  TIMESTAMP_TO_YEAR_OVERLOAD,
} from '../common/overloads';
import { TextSource } from '../common/source';
import { stdFunctions, stdTypes } from '../common/stdlib';
import { Registry } from '../common/types/provider';
import {
  BoolType,
  BytesType,
  DurationType,
  IntType,
  newListType,
  newMapType,
  newObjectType,
  StringType,
  TimestampType,
} from '../common/types/types';
import { MAX_UINT64 } from '../common/types/uint';
import { Parser, ParserOptions } from '../parser/parser';
import { Checker } from './checker';
import {
  AstNode,
  CallEstimate,
  Coster,
  CosterOptions,
  CostEstimate,
  CostEstimator,
  SizeEstimate,
} from './cost';
import { CheckerEnvOptions, Env } from './env';

describe('cost', () => {
  const allTypes = newObjectType('google.api.expr.test.v1.proto3.TestAllTypes');
  const allList = newListType(allTypes);
  const intList = newListType(IntType);
  const nestedList = newListType(allList);

  const allMap = newMapType(StringType, allTypes);
  const nestedMap = newMapType(StringType, allMap);

  const zeroCost = new CostEstimate(BigInt(0), BigInt(0));
  const oneCost = new CostEstimate(BigInt(1), BigInt(1));

  interface TestCase {
    name: string;
    expr: string;
    wanted: CostEstimate;
    vars?: VariableDecl[];
    hints?: Map<string, bigint>;
    options?: ParserOptions & CheckerEnvOptions & CosterOptions;
  }

  const testCases: TestCase[] = [
    {
      name: 'const',
      expr: `"Hello World!"`,
      wanted: zeroCost,
    },
    {
      name: 'identity',
      expr: `input`,
      vars: [newVariableDecl('input', intList)],
      wanted: new CostEstimate(BigInt(1), BigInt(1)),
    },
    {
      name: 'select: map',
      expr: `input['key']`,
      vars: [newVariableDecl('input', newMapType(StringType, StringType))],
      wanted: new CostEstimate(BigInt(2), BigInt(2)),
    },
    {
      name: 'select: field',
      expr: `input.single_int32`,
      vars: [newVariableDecl('input', allTypes)],
      wanted: new CostEstimate(BigInt(2), BigInt(2)),
    },
    {
      name: 'select: field test only no has() cost',
      expr: `has(input.single_int32)`,
      vars: [
        newVariableDecl(
          'input',
          newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
        ),
      ],
      wanted: new CostEstimate(BigInt(1), BigInt(1)),
      options: { presenceTestHasCost: false },
    },
    {
      name: 'select: field test only',
      expr: `has(input.single_int32)`,
      vars: [
        newVariableDecl(
          'input',
          newObjectType('google.api.expr.test.v1.proto3.TestAllTypes')
        ),
      ],
      wanted: new CostEstimate(BigInt(2), BigInt(2)),
    },
    {
      name: 'select: non-proto field test has() cost',
      expr: `has(input.testAttr.nestedAttr)`,
      vars: [newVariableDecl('input', nestedMap)],
      wanted: new CostEstimate(BigInt(3), BigInt(3)),
      options: { presenceTestHasCost: true },
    },
    {
      name: 'select: non-proto field test no has() cost',
      expr: `has(input.testAttr.nestedAttr)`,
      vars: [newVariableDecl('input', nestedMap)],
      wanted: new CostEstimate(BigInt(2), BigInt(2)),
      options: { presenceTestHasCost: false },
    },
    {
      name: 'select: non-proto field test',
      expr: `has(input.testAttr.nestedAttr)`,
      vars: [newVariableDecl('input', nestedMap)],
      wanted: new CostEstimate(BigInt(3), BigInt(3)),
    },
    {
      name: 'estimated function call',
      expr: `input.getFullYear()`,
      vars: [newVariableDecl('input', TimestampType)],
      wanted: new CostEstimate(BigInt(8), BigInt(8)),
    },
    {
      name: 'create list',
      expr: `[1, 2, 3]`,
      wanted: new CostEstimate(BigInt(10), BigInt(10)),
    },
    {
      name: 'create struct',
      expr: `google.api.expr.test.v1.proto3.TestAllTypes{single_int32: 1, single_float: 3.14, single_string: 'str'}`,
      wanted: new CostEstimate(BigInt(40), BigInt(40)),
    },
    {
      name: 'create map',
      expr: `{"a": 1, "b": 2, "c": 3}`,
      wanted: new CostEstimate(BigInt(30), BigInt(30)),
    },
    {
      name: 'all comprehension',
      vars: [newVariableDecl('input', allList)],
      hints: new Map([['input', BigInt(100)]]),
      expr: `input.all(x, true)`,
      wanted: new CostEstimate(BigInt(2), BigInt(302)),
    },
    // TODO: this evaluates to CostEstimate(BigInt(2), MAX_UINT64)
    {
      name: 'nested all comprehension',
      vars: [newVariableDecl('input', nestedList)],
      hints: new Map([
        ['input', BigInt(50)],
        ['input.@items', BigInt(10)],
      ]),
      expr: `input.all(x, x.all(y, true))`,
      wanted: new CostEstimate(BigInt(2), BigInt(1752)),
    },
    {
      name: 'all comprehension on literal',
      expr: `[1, 2, 3].all(x, true)`,
      wanted: new CostEstimate(BigInt(20), BigInt(20)),
    },
    {
      name: 'variable cost function',
      vars: [newVariableDecl('input', StringType)],
      hints: new Map([['input', BigInt(500)]]),
      expr: `input.matches('[0-9]')`,
      wanted: new CostEstimate(BigInt(3), BigInt(103)),
    },
    {
      name: 'variable cost function with constant',
      expr: `'123'.matches('[0-9]')`,
      wanted: new CostEstimate(BigInt(2), BigInt(2)),
    },
    {
      name: 'or',
      expr: `true || false`,
      wanted: zeroCost,
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
      wanted: new CostEstimate(BigInt(1), BigInt(4)),
    },
    {
      name: 'and',
      expr: `true && false`,
      wanted: zeroCost,
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
      wanted: new CostEstimate(BigInt(1), BigInt(4)),
    },
    {
      name: 'lt',
      expr: `1 < 2`,
      wanted: oneCost,
    },
    {
      name: 'lte',
      expr: `1 <= 2`,
      wanted: oneCost,
    },
    {
      name: 'eq',
      expr: `1 == 2`,
      wanted: oneCost,
    },
    {
      name: 'gt',
      expr: `2 > 1`,
      wanted: oneCost,
    },
    {
      name: 'gte',
      expr: `2 >= 1`,
      wanted: oneCost,
    },
    {
      name: 'in',
      expr: `2 in [1, 2, 3]`,
      wanted: new CostEstimate(BigInt(13), BigInt(13)),
    },
    {
      name: 'plus',
      expr: `1 + 1`,
      wanted: oneCost,
    },
    {
      name: 'minus',
      expr: `1 - 1`,
      wanted: oneCost,
    },
    {
      name: '/',
      expr: `1 / 1`,
      wanted: oneCost,
    },
    {
      name: '/',
      expr: `1 * 1`,
      wanted: oneCost,
    },
    {
      name: '%',
      expr: `1 % 1`,
      wanted: oneCost,
    },
    {
      name: 'ternary',
      expr: `true ? 1 : 2`,
      wanted: zeroCost,
    },
    {
      name: 'string size',
      expr: `size("123")`,
      wanted: oneCost,
    },
    {
      name: 'bytes to string conversion',
      vars: [newVariableDecl('input', BytesType)],
      hints: new Map([['input', BigInt(500)]]),
      expr: `string(input)`,
      wanted: new CostEstimate(BigInt(1), BigInt(51)),
    },
    {
      name: 'bytes to string conversion equality',
      vars: [newVariableDecl('input', BytesType)],
      hints: new Map([['input', BigInt(500)]]),
      // equality check ensures that the resultSize calculation is included in cost
      expr: `string(input) == string(input)`,
      wanted: new CostEstimate(BigInt(3), BigInt(152)),
    },
    {
      name: 'string to bytes conversion',
      vars: [newVariableDecl('input', StringType)],
      hints: new Map([['input', BigInt(500)]]),
      expr: `bytes(input)`,
      wanted: new CostEstimate(BigInt(1), BigInt(51)),
    },
    {
      name: 'string to bytes conversion equality',
      vars: [newVariableDecl('input', StringType)],
      hints: new Map([['input', BigInt(500)]]),
      // equality check ensures that the resultSize calculation is included in cost
      expr: `bytes(input) == bytes(input)`,
      wanted: new CostEstimate(BigInt(3), BigInt(302)),
    },
    {
      name: 'int to string conversion',
      expr: `string(1)`,
      wanted: new CostEstimate(BigInt(1), BigInt(1)),
    },
    {
      name: 'contains',
      expr: `input.contains(arg1)`,
      vars: [
        newVariableDecl('input', StringType),
        newVariableDecl('arg1', StringType),
      ],
      hints: new Map([
        ['input', BigInt(500)],
        ['arg1', BigInt(500)],
      ]),
      wanted: new CostEstimate(BigInt(2), BigInt(2502)),
    },
    // TODO: this evaluates to CostEstimate(BigInt(0), BigInt(0)). Probably something to do with the matches string
    // {
    //   name: 'matches',
    //   expr: `input.matches('\\d+a\\d+b')`,
    //   vars: [newVariableDecl('input', StringType)],
    //   hints: new Map([['input', BigInt(500)]]),
    //   wanted: new CostEstimate(BigInt(3), BigInt(103)),
    // },
    {
      name: 'startsWith',
      expr: `input.startsWith(arg1)`,
      vars: [
        newVariableDecl('input', StringType),
        newVariableDecl('arg1', StringType),
      ],
      hints: new Map([['arg1', BigInt(500)]]),
      wanted: new CostEstimate(BigInt(2), BigInt(52)),
    },
    {
      name: 'endsWith',
      expr: `input.endsWith(arg1)`,
      vars: [
        newVariableDecl('input', StringType),
        newVariableDecl('arg1', StringType),
      ],
      hints: new Map([['arg1', BigInt(500)]]),
      wanted: new CostEstimate(BigInt(2), BigInt(52)),
    },
    {
      name: 'size receiver',
      expr: `input.size()`,
      vars: [newVariableDecl('input', StringType)],
      wanted: new CostEstimate(BigInt(2), BigInt(2)),
    },
    {
      name: 'size',
      expr: `size(input)`,
      vars: [newVariableDecl('input', StringType)],
      wanted: new CostEstimate(BigInt(2), BigInt(2)),
    },
    {
      name: 'ternary eval',
      expr: `(x > 2 ? input1 : input2).all(y, true)`,
      vars: [
        newVariableDecl('x', IntType),
        newVariableDecl('input1', allList),
        newVariableDecl('input2', allList),
      ],
      hints: new Map([
        ['input1', BigInt(1)],
        ['input2', BigInt(1)],
      ]),
      wanted: new CostEstimate(BigInt(4), BigInt(7)),
    },
    {
      name: 'comprehension over map',
      expr: `input.all(k, input[k].single_int32 > 3)`,
      vars: [newVariableDecl('input', allMap)],
      hints: new Map([['input', BigInt(10)]]),
      wanted: new CostEstimate(BigInt(2), BigInt(82)),
    },
    // TODO: this one evaluates to CostEstimate(BigInt(2), BigInt(37))
    // {
    //   name: 'comprehension over nested map of maps',
    //   expr: `input.all(k, input[k].all(x, true))`,
    //   vars: [newVariableDecl('input', nestedMap)],
    //   hints: new Map([
    //     ['input', BigInt(5)],
    //     ['input.@values', BigInt(10)],
    //   ]),
    //   wanted: new CostEstimate(BigInt(2), BigInt(187)),
    // },
    {
      name: 'string size of map keys',
      expr: `input.all(k, k.contains(k))`,
      vars: [newVariableDecl('input', nestedMap)],
      hints: new Map([
        ['input', BigInt(5)],
        ['input.@keys', BigInt(10)],
      ]),
      wanted: new CostEstimate(BigInt(2), BigInt(32)),
    },
    // {
    //   name: 'comprehension variable shadowing',
    //   expr: `input.all(k, input[k].all(k, true) && k.contains(k))`,
    //   vars: [newVariableDecl('input', nestedMap)],
    //   hints: new Map([
    //     ['input', BigInt(2)],
    //     ['input.@values', BigInt(2)],
    //     ['input.@keys', BigInt(5)],
    //   ]),
    //   wanted: new CostEstimate(BigInt(2), BigInt(34)),
    // },
    // {
    //   name: 'comprehension variable shadowing',
    //   expr: `input.all(k, input[k].all(k, true) && k.contains(k))`,
    //   vars: [newVariableDecl('input', nestedMap)],
    //   hints: new Map([
    //     ['input', BigInt(2)],
    //     ['input.@values', BigInt(2)],
    //     ['input.@keys', BigInt(5)],
    //   ]),
    //   wanted: new CostEstimate(BigInt(2), BigInt(34)),
    // },
    {
      name: 'list concat',
      expr: `(list1 + list2).all(x, true)`,
      vars: [
        newVariableDecl('list1', newListType(IntType)),
        newVariableDecl('list2', newListType(IntType)),
      ],
      hints: new Map([
        ['list1', BigInt(10)],
        ['list2', BigInt(10)],
      ]),
      wanted: new CostEstimate(BigInt(4), BigInt(64)),
    },
    {
      name: 'str concat',
      expr: `"abcdefg".contains(str1 + str2)`,
      vars: [
        newVariableDecl('str1', StringType),
        newVariableDecl('str2', StringType),
      ],
      hints: new Map([
        ['str1', BigInt(10)],
        ['str2', BigInt(10)],
      ]),
      wanted: new CostEstimate(BigInt(2), BigInt(6)),
    },
    {
      name: 'str concat custom cost estimate',
      expr: `"abcdefg".contains(str1 + str2)`,
      vars: [
        newVariableDecl('str1', StringType),
        newVariableDecl('str2', StringType),
      ],
      hints: new Map([
        ['str1', BigInt(10)],
        ['str2', BigInt(10)],
      ]),
      options: {
        overloadCostEstimates: new Map([
          [
            CONTAINS_STRING_OVERLOAD,
            (estimator, target, args) => {
              if (!isNil(target) && args.length === 1) {
                const strSize = estimateSize(
                  estimator,
                  target
                ).multiplyByCostFactor(0.2);
                const subSize = estimateSize(
                  estimator,
                  args[0]
                ).multiplyByCostFactor(0.2);
                return new CallEstimate(strSize.multiply(subSize));
              }
              return new CallEstimate(zeroCost);
            },
          ],
        ]),
      },
      wanted: new CostEstimate(BigInt(2), BigInt(12)),
    },
    // {
    //   name: 'list size comparison',
    //   expr: `list1.size() == list2.size()`,
    //   vars: [
    //     newVariableDecl('list1', newListType(IntType)),
    //     newVariableDecl('list2', newListType(IntType)),
    //   ],
    //   wanted: new CostEstimate(BigInt(5), BigInt(5)),
    // },
    {
      name: 'list size from ternary',
      expr: `x > y ? list1.size() : list2.size()`,
      vars: [
        newVariableDecl('x', IntType),
        newVariableDecl('y', IntType),
        newVariableDecl('list1', newListType(IntType)),
        newVariableDecl('list2', newListType(IntType)),
      ],
      wanted: new CostEstimate(BigInt(5), BigInt(5)),
    },
    // {
    //   name: 'str endsWith equality',
    //   expr: `str1.endsWith("abcdefghijklmnopqrstuvwxyz") == str2.endsWith("abcdefghijklmnopqrstuvwxyz")`,
    //   vars: [
    //     newVariableDecl('str1', StringType),
    //     newVariableDecl('str2', StringType),
    //   ],
    //   wanted: new CostEstimate(BigInt(9), BigInt(9)),
    // },
    // {
    //   name: 'nested subexpression operators',
    //   expr: `((5 != 6) == (1 == 2)) == ((3 <= 4) == (9 != 9))`,
    //   wanted: new CostEstimate(BigInt(7), BigInt(7)),
    // },
    // {
    //   name: 'str size estimate',
    //   expr: `string(timestamp1) == string(timestamp2)`,
    //   vars: [
    //     newVariableDecl('timestamp1', TimestampType),
    //     newVariableDecl('timestamp2', TimestampType),
    //   ],
    //   wanted: new CostEstimate(BigInt(5), MAX_UINT64),
    // },
    {
      name: 'timestamp equality check',
      expr: `timestamp1 == timestamp2`,
      vars: [
        newVariableDecl('timestamp1', TimestampType),
        newVariableDecl('timestamp2', TimestampType),
      ],
      wanted: new CostEstimate(BigInt(3), BigInt(3)),
    },
    {
      name: 'duration inequality check',
      expr: `duration1 != duration2`,
      vars: [
        newVariableDecl('duration1', DurationType),
        newVariableDecl('duration2', DurationType),
      ],
      wanted: new CostEstimate(BigInt(3), BigInt(3)),
    },
    // {
    //   name: '.filter list literal',
    //   expr: `[1,2,3,4,5].filter(x, x % 2 == 0)`,
    //   wanted: new CostEstimate(BigInt(41), BigInt(101)),
    // },
    {
      name: '.map list literal',
      expr: `[1,2,3,4,5].map(x, x)`,
      wanted: new CostEstimate(BigInt(86), BigInt(86)),
    },
    // {
    //   name: '.map.filter list literal',
    //   expr: `[1,2,3,4,5].map(x, x).filter(x, x % 2 == 0)`,
    //   wanted: new CostEstimate(BigInt(117), BigInt(177)),
    // },
    {
      name: '.map.exists list literal',
      expr: `[1,2,3,4,5].map(x, x).exists(x, x == 5) == true`,
      wanted: new CostEstimate(BigInt(108), BigInt(118)),
    },
    {
      name: '.map.map list literal',
      expr: `[1,2,3,4,5].map(x, x).map(x, x)`,
      wanted: new CostEstimate(BigInt(162), BigInt(162)),
    },
    {
      name: '.map list literal selection',
      expr: `[1,2,3,4,5].map(x, x)[4]`,
      wanted: new CostEstimate(BigInt(87), BigInt(87)),
    },
    {
      name: 'nested array selection',
      expr: `[[1,2],[1,2],[1,2],[1,2],[1,2]][4]`,
      wanted: new CostEstimate(BigInt(61), BigInt(61)),
    },
    {
      name: 'nested array selection',
      expr: `{'a': [1,2], 'b': [1,2], 'c': [1,2], 'd': [1,2], 'e': [1,2]}.b`,
      wanted: new CostEstimate(BigInt(81), BigInt(81)),
    },
    {
      // Estimated cost does not track the sizes of nested aggregate types
      // (lists, maps, ...) and so assumes a worst case cost when an
      // expression applies a comprehension to a nested aggregated type,
      // even if the size information is available.
      // TODO: This should be fixed.
      name: 'comprehension on nested list',
      expr: `[1,2,3,4,5].map(x, [x, x]).all(y, y.all(y, y == 1))`,
      wanted: new CostEstimate(BigInt(157), MAX_UINT64),
    },
    {
      // Make sure we're accounting for not just the iteration range size,
      // but also the overall comprehension size. The chained map calls
      // will treat the result of one map as the iteration range of the other,
      // so they're planned in reverse; however, the `+` should verify that
      // the comprehension result has a size.
      name: 'comprehension size',
      expr: `[1,2,3,4,5].map(x, x).map(x, x) + [1]`,
      wanted: new CostEstimate(BigInt(173), BigInt(173)),
    },
    {
      name: 'nested comprehension',
      expr: `[1,2,3].all(i, i in [1,2,3].map(j, j + j))`,
      wanted: new CostEstimate(BigInt(20), BigInt(230)),
    },
  ];

  for (const testCase of testCases) {
    it(testCase.name, () => {
      const source = new TextSource(testCase.expr);
      const parser = new Parser(source);
      if (parser.errors.length() > 0) {
        throw new Error(parser.errors.toDisplayString());
      }
      const parsed = parser.parse();
      const registry = new Registry();
      registry.registerDescriptor(TestAllTypesSchemaProto3);
      registry.registerDescriptor(TestAllTypes_NestedEnumSchemaProto3);
      registry.registerDescriptor(TestAllTypes_NestedMessageSchemaProto3);
      const env = new Env(new Container(), registry);
      env.addFunctions(...stdFunctions);
      env.addIdents(...stdTypes, ...(testCase.vars ?? []));
      const checker = new Checker(parsed, env);
      if (checker.errors.length() > 0) {
        throw new Error(checker.errors.toDisplayString());
      }
      const checked = checker.check();
      const coster = new Coster(
        checked,
        new TestEstimator(testCase.hints ?? new Map()),
        testCase.options
      );
      expect(coster.cost()).toEqual(testCase.wanted);
    });
  }
});

class TestEstimator implements CostEstimator {
  constructor(private readonly hints: Map<string, bigint>) {}

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

function estimateSize(estimator: CostEstimator, node: AstNode): SizeEstimate {
  const computed = node.computedSize();
  if (!isNil(computed)) {
    return computed;
  }
  const estimated = estimator.estimateSize(node);
  if (!isNil(estimated)) {
    return estimated;
  }
  return new SizeEstimate(BigInt(0), MAX_UINT64);
}
