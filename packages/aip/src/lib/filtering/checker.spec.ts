import {
  TestAllTypes_NestedEnumSchema,
  TestAllTypes_NestedMessageSchema,
  TestAllTypesSchema,
} from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto3/test_all_types_pb.js';
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  CheckedExprSchema,
  Decl,
} from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/checked_pb.js';
import { ParsedExpr } from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/syntax_pb.js';
import {
  createMutableRegistry,
  DescMessage,
  isMessage,
} from '@bufbuild/protobuf';
import { Checker } from './checker';
import {
  Declarations,
  EnumDecl,
  newEnumDeclaration,
  newFunctionDeclaration,
  newFunctionOverload,
  newIdentDeclaration,
} from './declarations';
import { drillDownOnErrorMessage } from './errors';
import { standardFunctionDeclarations } from './functions';
import { Parser } from './parser';
import {
  TypeBool,
  TypeDuration,
  TypeFloat,
  TypeInt,
  typeMap,
  typeMessage,
  TypeString,
  TypeTimestamp,
} from './types';

describe('Checker', () => {
  const testCases: {
    filter: string;
    declarations?: (Decl | EnumDecl)[];
    errorContains?: string;
    descriptors?: DescMessage[];
  }[] = [
    {
      filter: 'New York Giants',
      declarations: [
        newIdentDeclaration('New', TypeBool),
        newIdentDeclaration('York', TypeBool),
        newIdentDeclaration('Giants', TypeBool),
      ],
      errorContains: "undeclared function 'FUZZY'",
    },
    {
      filter: 'New York Giants OR Yankees',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('New', TypeBool),
        newIdentDeclaration('York', TypeBool),
        newIdentDeclaration('Giants', TypeBool),
        newIdentDeclaration('Yankees', TypeBool),
      ],
      errorContains: "undeclared function 'FUZZY'",
    },
    {
      filter: 'New York (Giants OR Yankees)',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('New', TypeBool),
        newIdentDeclaration('York', TypeBool),
        newIdentDeclaration('Giants', TypeBool),
        newIdentDeclaration('Yankees', TypeBool),
      ],
      errorContains: "undeclared function 'FUZZY'",
    },
    {
      filter: 'a b AND c AND d',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('a', TypeBool),
        newIdentDeclaration('b', TypeBool),
        newIdentDeclaration('c', TypeBool),
        newIdentDeclaration('d', TypeBool),
      ],
      errorContains: "undeclared function 'FUZZY'",
    },
    {
      filter: 'a',
      declarations: [newIdentDeclaration('a', TypeBool)],
    },
    {
      filter: '(a b) AND c AND d',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('a', TypeBool),
        newIdentDeclaration('b', TypeBool),
        newIdentDeclaration('c', TypeBool),
        newIdentDeclaration('d', TypeBool),
      ],
      errorContains: "undeclared function 'FUZZY'",
    },
    {
      filter: `author = "Karin Boye" AND NOT read`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('author', TypeString),
        newIdentDeclaration('read', TypeBool),
      ],
    },
    {
      filter: 'a < 10 OR a >= 100',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('a', TypeInt),
      ],
    },
    {
      filter: 'NOT (a OR b)',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('a', TypeBool),
        newIdentDeclaration('b', TypeBool),
      ],
    },
    {
      filter: `-file:".java"`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('file', TypeString),
      ],
    },
    {
      filter: '-30',
      errorContains: 'non-bool result type',
    },
    {
      filter: 'package=com.google',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('package', TypeString),
        newIdentDeclaration('com', typeMap(TypeString, TypeString)),
      ],
    },
    {
      filter: `msg != 'hello'`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('msg', TypeString),
      ],
    },
    {
      filter: `1 > 0`,
      declarations: [...standardFunctionDeclarations()],
    },
    {
      filter: `2.5 >= 2.4`,
      declarations: [...standardFunctionDeclarations()],
    },
    {
      filter: `foo >= -2.4`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('foo', TypeFloat),
      ],
    },
    {
      filter: `foo >= (-2.4)`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('foo', TypeFloat),
      ],
    },
    {
      filter: `-2.5 >= -2.4`,
      declarations: [...standardFunctionDeclarations()],
    },
    {
      filter: `yesterday < request.time`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('yesterday', TypeTimestamp),
      ],
      errorContains: "undeclared identifier 'request'",
    },
    {
      filter: `experiment.rollout <= cohort(request.user)`,
      declarations: [
        ...standardFunctionDeclarations(),
        newFunctionDeclaration(
          'cohort',
          newFunctionOverload('cohort_string', TypeFloat, TypeString)
        ),
      ],
      errorContains: "undeclared identifier 'experiment'",
    },
    {
      filter: `prod`,
      declarations: [newIdentDeclaration('prod', TypeBool)],
    },
    {
      filter: `expr.type_map.1.type`,
      errorContains: "undeclared identifier 'expr'",
    },
    {
      filter: `regex(m.key, '^.*prod.*$')`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('m', typeMap(TypeString, TypeString)),
        newFunctionDeclaration(
          'regex',
          newFunctionOverload('regex_string', TypeBool, TypeString, TypeString)
        ),
      ],
    },
    {
      filter: `math.mem('30mb')`,
      declarations: [
        newFunctionDeclaration(
          'math.mem',
          newFunctionOverload('math.mem_string', TypeBool, TypeString)
        ),
      ],
    },
    {
      filter: `(msg.endsWith('world') AND retries < 10)`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('retries', TypeInt),
      ],
      errorContains: "undeclared function 'msg.endsWith'",
    },
    {
      filter: `(endsWith(msg, 'world') AND retries < 10)`,
      declarations: [
        ...standardFunctionDeclarations(),
        newFunctionDeclaration(
          'endsWith',
          newFunctionOverload(
            'endsWith_string',
            TypeBool,
            TypeString,
            TypeString
          )
        ),
        newIdentDeclaration('retries', TypeInt),
        newIdentDeclaration('msg', TypeString),
      ],
    },
    {
      filter: 'expire_time > time.now()',
      declarations: [
        ...standardFunctionDeclarations(),
        newFunctionDeclaration(
          'time.now',
          newFunctionOverload('time.now', TypeTimestamp)
        ),
        newIdentDeclaration('expire_time', TypeTimestamp),
      ],
    },
    {
      filter: `time.now() > timestamp("2012-04-21T11:30:00-04:00")`,
      declarations: [
        ...standardFunctionDeclarations(),
        newFunctionDeclaration(
          'time.now',
          newFunctionOverload('time.now', TypeTimestamp)
        ),
      ],
    },
    {
      filter: `time.now() > timestamp("INVALID")`,
      declarations: [
        ...standardFunctionDeclarations(),
        newFunctionDeclaration(
          'time.now',
          newFunctionOverload('time.now', TypeTimestamp)
        ),
      ],
      errorContains: 'invalid timestamp',
    },
    {
      filter: `ttl > duration("30s")`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('ttl', TypeDuration),
      ],
    },
    {
      filter: `ttl > duration("INVALID")`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('ttl', TypeDuration),
      ],
      errorContains: 'invalid duration',
    },
    {
      filter: `ttl > duration(input_field)`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('ttl', TypeDuration),
        newIdentDeclaration('input_field', TypeString),
      ],
    },
    {
      filter: `create_time > timestamp("2006-01-02T15:04:05+07:00")`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('create_time', TypeTimestamp),
      ],
    },
    {
      filter: `
        start_time > timestamp("2006-01-02T15:04:05+07:00") AND
        (driver = "driver1" OR start_driver = "driver1" OR end_driver = "driver1")
    `,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('start_time', TypeTimestamp),
        newIdentDeclaration('driver', TypeString),
        newIdentDeclaration('start_driver', TypeString),
        newIdentDeclaration('end_driver', TypeString),
      ],
    },
    {
      filter: `annotations:schedule`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('annotations', typeMap(TypeString, TypeString)),
      ],
    },
    {
      filter: `annotations.schedule = "test"`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('annotations', typeMap(TypeString, TypeString)),
      ],
    },
    {
      filter: `enum = FOO`,
      declarations: [
        ...standardFunctionDeclarations(),
        newEnumDeclaration('enum', TestAllTypes_NestedEnumSchema),
      ],
    },
    // TODO: enums
    // {
    //   filter: `enum = FOO AND NOT enum2 = BAR`,
    //   declarations: [
    //     ...standardFunctionDeclarations(),
    //     newEnumDeclaration('enum', TestAllTypes_NestedEnumSchema),
    //     newEnumDeclaration('enum2', TestAllTypes_NestedEnumSchema),
    //   ],
    // },
    {
      filter: `create_time = "2022-08-12 22:22:22"`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('create_time', TypeTimestamp),
      ],
      errorContains: 'invalid timestamp. Should be in RFC3339 format',
    },
    {
      filter: `create_time = "2022-08-12T22:22:22+01:00"`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('create_time', TypeTimestamp),
      ],
    },
    {
      filter: `create_time != "2022-08-12T22:22:22+01:00"`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('create_time', TypeTimestamp),
      ],
    },
    {
      filter: `create_time < "2022-08-12T22:22:22+01:00"`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('create_time', TypeTimestamp),
      ],
    },
    {
      filter: `create_time > "2022-08-12T22:22:22+01:00"`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('create_time', TypeTimestamp),
      ],
    },
    {
      filter: `create_time <= "2022-08-12T22:22:22+01:00"`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('create_time', TypeTimestamp),
      ],
    },
    {
      filter: `create_time >= "2022-08-12T22:22:22+01:00"`,
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('create_time', TypeTimestamp),
      ],
    },
    {
      filter: '<',
      errorContains: 'unexpected token <',
    },
    {
      filter: `(-2.5) >= -2.4`,
      errorContains: 'unexpected token >=',
    },
    {
      filter: `a = "foo`,
      errorContains: 'unterminated string',
    },
    {
      filter: 'invalid = foo\xa0\x01bar',
      errorContains: 'invalid UTF-8',
    },
    {
      filter: 'a.single_bool',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('a', typeMessage(TestAllTypesSchema.typeName)),
      ],
      descriptors: [TestAllTypesSchema],
    },
    {
      filter: 'a.abc',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('a', typeMessage(TestAllTypesSchema.typeName)),
      ],
      descriptors: [TestAllTypesSchema],
      errorContains: `unknown field 'abc' for message type`,
    },
    {
      filter: 'a.single_int64',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('a', typeMessage(TestAllTypesSchema.typeName)),
      ],
      descriptors: [TestAllTypesSchema],
      errorContains: 'non-bool result type',
    },
    {
      filter: 'a.single_int64 = 1',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('a', typeMessage(TestAllTypesSchema.typeName)),
      ],
      descriptors: [TestAllTypesSchema],
    },
    {
      filter: 'a.standalone_message.bb > 1',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('a', typeMessage(TestAllTypesSchema.typeName)),
      ],
      descriptors: [TestAllTypesSchema, TestAllTypes_NestedMessageSchema],
    },
    {
      filter: 'a.standalone_message.bb = 1',
      declarations: [
        ...standardFunctionDeclarations(),
        newIdentDeclaration('a', typeMessage(TestAllTypesSchema.typeName)),
      ],
      descriptors: [TestAllTypesSchema],
      errorContains: `unknown field 'bb' for message type '${TestAllTypes_NestedMessageSchema.typeName}`,
    },
  ];

  for (const testCase of testCases) {
    it(`should check ${testCase.filter}`, () => {
      const parsed = new Parser(testCase.filter).parse() as ParsedExpr;
      if (parsed instanceof Error) {
        expect(drillDownOnErrorMessage(parsed)).toContain(
          testCase.errorContains
        );
        return;
      }
      const checker = new Checker(
        parsed.expr!,
        parsed.sourceInfo!,
        new Declarations({
          declarations: testCase.declarations ?? [],
          typeRegistry: createMutableRegistry(...(testCase.descriptors ?? [])),
        })
      );
      const checked = checker.check();
      if (checked instanceof Error) {
        expect(drillDownOnErrorMessage(checked)).toContain(
          testCase.errorContains
        );
        return;
      }
      expect(isMessage(checked, CheckedExprSchema)).toBeTruthy();
    });
  }

  it('should work with a simple case', () => {
    const parsed = new Parser('"a" = "b"').parse() as ParsedExpr;
    const checker = new Checker(
      parsed.expr!,
      parsed.sourceInfo!,
      new Declarations({ declarations: standardFunctionDeclarations() })
    );
    const checked = checker.check();
    expect(isMessage(checked, CheckedExprSchema)).toBeTruthy();
  });
});
