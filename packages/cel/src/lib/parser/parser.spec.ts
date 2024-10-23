/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from '@bearclaw/is';
import { Expr } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { Location } from '../common/ast';
import { ACCUMULATOR_VAR } from '../common/constants';
import { boolExpr } from '../common/types/bool';
import { bytesExpr } from '../common/types/bytes';
import { callExpr } from '../common/types/call';
import { comprehensionExpr } from '../common/types/comprehension';
import { doubleExpr } from '../common/types/double';
import { identExpr } from '../common/types/ident';
import { int64Expr } from '../common/types/int';
import { listExpr } from '../common/types/list';
import { nullExpr } from '../common/types/null';
import { selectExpr } from '../common/types/select';
import { stringExpr } from '../common/types/string';
import {
  structExpr,
  structFieldEntry,
  structMapEntry,
} from '../common/types/struct';
import { uint64Expr } from '../common/types/uint';
import {
  ADD_OPERATOR,
  CONDITIONAL_OPERATOR,
  DIVIDE_OPERATOR,
  EQUALS_OPERATOR,
  GREATER_EQUALS_OPERATOR,
  GREATER_OPERATOR,
  INDEX_OPERATOR,
  IN_OPERATOR,
  LESS_EQUALS_OPERATOR,
  LESS_OPERATOR,
  LOGICAL_AND_OPERATOR,
  LOGICAL_NOT_OPERATOR,
  LOGICAL_OR_OPERATOR,
  MODULO_OPERATOR,
  MULTIPLY_OPERATOR,
  NEGATE_OPERATOR,
  NOT_EQUALS_OPERATOR,
  NOT_STRICTLY_FALSE_OPERATOR,
  OPT_INDEX_OPERATOR,
  OPT_SELECT_OPERATOR,
  SUBTRACT_OPERATOR,
} from '../operators';
import { CELParser, CELParserOptions } from './parser';

interface TestInfo {
  // I contains the input expression to be parsed.
  I: string;

  // P contains the expected Expr output for the parsed expression.
  P?: Expr | any;

  // E contains the expected error output for a failed parse, or "" if the parse is expected to be successful.
  E?: string;

  // L contains the expected source adorned debug output of the expression tree.
  L?: { [key: string]: Location };

  // M contains the expected adorned debug output of the macro calls map
  M?: Expr | any;

  // Opts contains the list of options to be configured with the parser before parsing the expression.
  Opts?: CELParserOptions;
}

// See: https://github.com/google/cel-go/blob/master/parser/parser_test.go
const testCases: TestInfo[] = [
  {
    I: `has("a")`,
    E: `ERROR: <input>:1:5: invalid argument to has() macro
    | has("a")
    | ....^`,
  },
  {
    I: `1.exists(2, 3)`,
    E: `ERROR: <input>:1:10: argument must be a simple name
  	| 1.exists(2, 3)
  	| .........^`,
  },
  {
    I: `1.exists_one(2, 3)`,
    E: `ERROR: <input>:1:14: argument must be a simple name
  	| 1.exists_one(2, 3)
  	| .............^`,
  },
  {
    I: `e.map(1, t)`,
    E: `ERROR: <input>:1:7: argument is not an identifier
  	| e.map(1, t)
  	| ......^`,
  },
  {
    I: `e.filter(1, t)`,
    E: `ERROR: <input>:1:10: argument is not an identifier
  	| e.filter(1, t)
  	| .........^`,
  },

  // Tests from Go parser
  {
    I: `"A"`,
    // P: `"A"^#1:*expr.Constant_StringValue#`,
    P: stringExpr(BigInt(1), 'A'),
  },
  {
    I: `true`,
    // P: `true^#1:*expr.Constant_BoolValue#`,
    P: boolExpr(BigInt(1), true),
  },
  {
    I: `false`,
    // P: `false^#1:*expr.Constant_BoolValue#`,
    P: boolExpr(BigInt(1), false),
  },
  {
    I: `0`,
    // P: `0^#1:*expr.Constant_Int64Value#`,
    P: int64Expr(BigInt(1), BigInt(0)),
  },
  {
    I: `42`,
    // P: `42^#1:*expr.Constant_Int64Value#`,
    P: int64Expr(BigInt(1), BigInt(42)),
  },
  {
    I: `0xF`,
    // P: `15^#1:*expr.Constant_Int64Value#`,
    P: int64Expr(BigInt(1), BigInt(15)),
  },
  {
    I: `0u`,
    // P: `0u^#1:*expr.Constant_Uint64Value#`,
    P: uint64Expr(BigInt(1), BigInt(0)),
  },
  {
    I: `23u`,
    // P: `23u^#1:*expr.Constant_Uint64Value#`,
    P: uint64Expr(BigInt(1), BigInt(23)),
  },
  {
    I: `24u`,
    // P: `24u^#1:*expr.Constant_Uint64Value#`,
    P: uint64Expr(BigInt(1), BigInt(24)),
  },
  {
    I: `0xFu`,
    // P: `15u^#1:*expr.Constant_Uint64Value#`,
    P: uint64Expr(BigInt(1), BigInt(15)),
  },
  {
    I: `-1`,
    // P: `-1^#1:*expr.Constant_Int64Value#`,
    P: int64Expr(BigInt(1), BigInt(-1)),
  },
  {
    I: `4--4`,
    // P: `_-_(
    // 	4^#1:*expr.Constant_Int64Value#,
    // 	-4^#3:*expr.Constant_Int64Value#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: SUBTRACT_OPERATOR,
      args: [int64Expr(BigInt(1), BigInt(4)), int64Expr(BigInt(3), BigInt(-4))],
    }),
  },
  {
    I: `4--4.1`,
    // P: `_-_(
    // 	4^#1:*expr.Constant_Int64Value#,
    // 	-4.1^#3:*expr.Constant_DoubleValue#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: SUBTRACT_OPERATOR,
      args: [int64Expr(BigInt(1), BigInt(4)), doubleExpr(BigInt(3), -4.1)],
    }),
  },
  {
    I: `b"abc"`,
    // P: `b"abc"^#1:*expr.Constant_BytesValue#`,
    P: bytesExpr(BigInt(1), new TextEncoder().encode('abc')),
  },
  {
    I: '23.39',
    // P: `23.39^#1:*expr.Constant_DoubleValue#`,
    P: doubleExpr(BigInt(1), 23.39),
  },
  {
    I: `!a`,
    // P: `!_(
    // 	a^#2:*expr.Expr_IdentExpr#
    // )^#1:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(1), {
      function: LOGICAL_NOT_OPERATOR,
      args: [identExpr(BigInt(2), { name: 'a' })],
    }),
  },
  {
    I: 'null',
    // P: `null^#1:*expr.Constant_NullValue#`,
    P: nullExpr(BigInt(1)),
  },
  {
    I: `a`,
    // P: `a^#1:*expr.Expr_IdentExpr#`,
    P: identExpr(BigInt(1), { name: 'a' }),
  },
  {
    I: `a?b:c`,
    // P: `_?_:_(
    // 	a^#1:*expr.Expr_IdentExpr#,
    // 	b^#3:*expr.Expr_IdentExpr#,
    // 	c^#4:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: CONDITIONAL_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
        identExpr(BigInt(4), { name: 'c' }),
      ],
    }),
  },
  {
    I: `a || b`,
    // P: `_||_(
    // 		  a^#1:*expr.Expr_IdentExpr#,
    // 		  b^#2:*expr.Expr_IdentExpr#
    // 	)^#3:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(3), {
      function: LOGICAL_OR_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(2), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a || b || c || d || e || f `,
    // P: ` _||_(
    // 	_||_(
    // 	  _||_(
    // 		a^#1:*expr.Expr_IdentExpr#,
    // 		b^#2:*expr.Expr_IdentExpr#
    // 	  )^#3:*expr.Expr_CallExpr#,
    // 	  c^#4:*expr.Expr_IdentExpr#
    // 	)^#5:*expr.Expr_CallExpr#,
    // 	_||_(
    // 	  _||_(
    // 		d^#6:*expr.Expr_IdentExpr#,
    // 		e^#8:*expr.Expr_IdentExpr#
    // 	  )^#9:*expr.Expr_CallExpr#,
    // 	  f^#10:*expr.Expr_IdentExpr#
    // 	)^#11:*expr.Expr_CallExpr#
    //   )^#7:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(7), {
      function: LOGICAL_OR_OPERATOR,
      args: [
        callExpr(BigInt(5), {
          function: LOGICAL_OR_OPERATOR,
          args: [
            callExpr(BigInt(3), {
              function: LOGICAL_OR_OPERATOR,
              args: [
                identExpr(BigInt(1), { name: 'a' }),
                identExpr(BigInt(2), { name: 'b' }),
              ],
            }),
            identExpr(BigInt(4), { name: 'c' }),
          ],
        }),
        callExpr(BigInt(11), {
          function: LOGICAL_OR_OPERATOR,
          args: [
            callExpr(BigInt(9), {
              function: LOGICAL_OR_OPERATOR,
              args: [
                identExpr(BigInt(6), { name: 'd' }),
                identExpr(BigInt(8), { name: 'e' }),
              ],
            }),
            identExpr(BigInt(10), { name: 'f' }),
          ],
        }),
      ],
    }),
  },
  {
    I: `a && b`,
    // P: `_&&_(
    // 		  a^#1:*expr.Expr_IdentExpr#,
    // 		  b^#2:*expr.Expr_IdentExpr#
    // 	)^#3:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(3), {
      function: LOGICAL_AND_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(2), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a && b && c && d && e && f && g`,
    // P: `_&&_(
    // 	_&&_(
    // 	  _&&_(
    // 		a^#1:*expr.Expr_IdentExpr#,
    // 		b^#2:*expr.Expr_IdentExpr#
    // 	  )^#3:*expr.Expr_CallExpr#,
    // 	  _&&_(
    // 		c^#4:*expr.Expr_IdentExpr#,
    // 		d^#6:*expr.Expr_IdentExpr#
    // 	  )^#7:*expr.Expr_CallExpr#
    // 	)^#5:*expr.Expr_CallExpr#,
    // 	_&&_(
    // 	  _&&_(
    // 		e^#8:*expr.Expr_IdentExpr#,
    // 		f^#10:*expr.Expr_IdentExpr#
    // 	  )^#11:*expr.Expr_CallExpr#,
    // 	  g^#12:*expr.Expr_IdentExpr#
    // 	)^#13:*expr.Expr_CallExpr#
    //   )^#9:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(9), {
      function: LOGICAL_AND_OPERATOR,
      args: [
        callExpr(BigInt(5), {
          function: LOGICAL_AND_OPERATOR,
          args: [
            callExpr(BigInt(3), {
              function: LOGICAL_AND_OPERATOR,
              args: [
                identExpr(BigInt(1), { name: 'a' }),
                identExpr(BigInt(2), { name: 'b' }),
              ],
            }),
            callExpr(BigInt(7), {
              function: LOGICAL_AND_OPERATOR,
              args: [
                identExpr(BigInt(4), { name: 'c' }),
                identExpr(BigInt(6), { name: 'd' }),
              ],
            }),
          ],
        }),
        callExpr(BigInt(13), {
          function: LOGICAL_AND_OPERATOR,
          args: [
            callExpr(BigInt(11), {
              function: LOGICAL_AND_OPERATOR,
              args: [
                identExpr(BigInt(8), { name: 'e' }),
                identExpr(BigInt(10), { name: 'f' }),
              ],
            }),
            identExpr(BigInt(12), { name: 'g' }),
          ],
        }),
      ],
    }),
  },
  {
    I: `a && b && c && d || e && f && g && h`,
    // P: `_||_(
    // 	_&&_(
    // 	  _&&_(
    // 		a^#1:*expr.Expr_IdentExpr#,
    // 		b^#2:*expr.Expr_IdentExpr#
    // 	  )^#3:*expr.Expr_CallExpr#,
    // 	  _&&_(
    // 		c^#4:*expr.Expr_IdentExpr#,
    // 		d^#6:*expr.Expr_IdentExpr#
    // 	  )^#7:*expr.Expr_CallExpr#
    // 	)^#5:*expr.Expr_CallExpr#,
    // 	_&&_(
    // 	  _&&_(
    // 		e^#8:*expr.Expr_IdentExpr#,
    // 		f^#9:*expr.Expr_IdentExpr#
    // 	  )^#10:*expr.Expr_CallExpr#,
    // 	  _&&_(
    // 		g^#11:*expr.Expr_IdentExpr#,
    // 		h^#13:*expr.Expr_IdentExpr#
    // 	  )^#14:*expr.Expr_CallExpr#
    // 	)^#12:*expr.Expr_CallExpr#
    //   )^#15:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(15), {
      function: LOGICAL_OR_OPERATOR,
      args: [
        callExpr(BigInt(5), {
          function: LOGICAL_AND_OPERATOR,
          args: [
            callExpr(BigInt(3), {
              function: LOGICAL_AND_OPERATOR,
              args: [
                identExpr(BigInt(1), { name: 'a' }),
                identExpr(BigInt(2), { name: 'b' }),
              ],
            }),
            callExpr(BigInt(7), {
              function: LOGICAL_AND_OPERATOR,
              args: [
                identExpr(BigInt(4), { name: 'c' }),
                identExpr(BigInt(6), { name: 'd' }),
              ],
            }),
          ],
        }),
        callExpr(BigInt(12), {
          function: LOGICAL_AND_OPERATOR,
          args: [
            callExpr(BigInt(10), {
              function: LOGICAL_AND_OPERATOR,
              args: [
                identExpr(BigInt(8), { name: 'e' }),
                identExpr(BigInt(9), { name: 'f' }),
              ],
            }),
            callExpr(BigInt(14), {
              function: LOGICAL_AND_OPERATOR,
              args: [
                identExpr(BigInt(11), { name: 'g' }),
                identExpr(BigInt(13), { name: 'h' }),
              ],
            }),
          ],
        }),
      ],
    }),
  },
  {
    I: `a + b`,
    // P: `_+_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: ADD_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a - b`,
    // P: `_-_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: SUBTRACT_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a * b`,
    // P: `_*_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: MULTIPLY_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a / b`,
    // P: `_/_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: DIVIDE_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a % b`,
    // P: `_%_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: MODULO_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a in b`,
    // P: `@in(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: IN_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a == b`,
    // P: `_==_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: EQUALS_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a != b`,
    // P: ` _!=_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: NOT_EQUALS_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a > b`,
    // P: `_>_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: GREATER_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a >= b`,
    // P: `_>=_(
    //       a^#1:*expr.Expr_IdentExpr#,
    //       b^#3:*expr.Expr_IdentExpr#
    //     )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: GREATER_EQUALS_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a < b`,
    // P: `_<_(
    //       a^#1:*expr.Expr_IdentExpr#,
    //       b^#3:*expr.Expr_IdentExpr#
    //     )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: LESS_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a <= b`,
    // P: `_<=_(
    //       a^#1:*expr.Expr_IdentExpr#,
    //       b^#3:*expr.Expr_IdentExpr#
    //     )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: LESS_EQUALS_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `a.b`,
    // P: `a^#1:*expr.Expr_IdentExpr#.b^#2:*expr.Expr_SelectExpr#`,
    P: selectExpr(BigInt(2), {
      operand: identExpr(BigInt(1), { name: 'a' }),
      field: 'b',
    }),
  },
  {
    I: `a.b.c`,
    // P: `a^#1:*expr.Expr_IdentExpr#.b^#2:*expr.Expr_SelectExpr#.c^#3:*expr.Expr_SelectExpr#`,
    P: selectExpr(BigInt(3), {
      operand: selectExpr(BigInt(2), {
        operand: identExpr(BigInt(1), { name: 'a' }),
        field: 'b',
      }),
      field: 'c',
    }),
  },
  {
    I: `a[b]`,
    // P: `_[_](
    // 	a^#1:*expr.Expr_IdentExpr#,
    // 	b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: INDEX_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
    }),
  },
  {
    I: `foo{ }`,
    // P: `foo{}^#1:*expr.Expr_StructExpr#`,
    P: structExpr(BigInt(1), {
      messageName: 'foo',
    }),
  },
  {
    I: `foo{ a:b }`,
    // P: `foo{
    // 	a:b^#3:*expr.Expr_IdentExpr#^#2:*expr.Expr_CreateStruct_Entry#
    // }^#1:*expr.Expr_StructExpr#`,
    P: structExpr(BigInt(1), {
      messageName: 'foo',
      entries: [
        structFieldEntry(BigInt(2), 'a', identExpr(BigInt(3), { name: 'b' })),
      ],
    }),
  },
  {
    I: `foo{ a:b, c:d }`,
    // P: `foo{
    // 	a:b^#3:*expr.Expr_IdentExpr#^#2:*expr.Expr_CreateStruct_Entry#,
    // 	c:d^#5:*expr.Expr_IdentExpr#^#4:*expr.Expr_CreateStruct_Entry#
    // }^#1:*expr.Expr_StructExpr#`,
    P: structExpr(BigInt(1), {
      messageName: 'foo',
      entries: [
        structFieldEntry(BigInt(2), 'a', identExpr(BigInt(3), { name: 'b' })),
        structFieldEntry(BigInt(4), 'c', identExpr(BigInt(5), { name: 'd' })),
      ],
    }),
  },
  {
    I: `{}`,
    // P: `{}^#1:*expr.Expr_StructExpr#`,
    P: structExpr(BigInt(1), {}),
  },
  {
    I: `{a:b, c:d}`,
    // P: `{
    // 	a^#3:*expr.Expr_IdentExpr#:b^#4:*expr.Expr_IdentExpr#^#2:*expr.Expr_CreateStruct_Entry#,
    // 	c^#6:*expr.Expr_IdentExpr#:d^#7:*expr.Expr_IdentExpr#^#5:*expr.Expr_CreateStruct_Entry#
    // }^#1:*expr.Expr_StructExpr#`,
    P: structExpr(BigInt(1), {
      entries: [
        structMapEntry(
          BigInt(2),
          identExpr(BigInt(3), { name: 'a' }),
          identExpr(BigInt(4), { name: 'b' })
        ),
        structMapEntry(
          BigInt(5),
          identExpr(BigInt(6), { name: 'c' }),
          identExpr(BigInt(7), { name: 'd' })
        ),
      ],
    }),
  },
  {
    I: `[]`,
    // P: `[]^#1:*expr.Expr_ListExpr#`,
    P: listExpr(BigInt(1), {}),
  },
  {
    I: `[a]`,
    // P: `[
    // 	a^#2:*expr.Expr_IdentExpr#
    // ]^#1:*expr.Expr_ListExpr#`,
    P: listExpr(BigInt(1), {
      elements: [identExpr(BigInt(2), { name: 'a' })],
    }),
  },
  {
    I: `[a, b, c]`,
    // P: `[
    // 	a^#2:*expr.Expr_IdentExpr#,
    // 	b^#3:*expr.Expr_IdentExpr#,
    // 	c^#4:*expr.Expr_IdentExpr#
    // ]^#1:*expr.Expr_ListExpr#`,
    P: listExpr(BigInt(1), {
      elements: [
        identExpr(BigInt(2), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
        identExpr(BigInt(4), { name: 'c' }),
      ],
    }),
  },
  {
    I: `(a)`,
    // P: `a^#1:*expr.Expr_IdentExpr#`,
    P: identExpr(BigInt(1), { name: 'a' }),
  },
  {
    I: `((a))`,
    // P: `a^#1:*expr.Expr_IdentExpr#`,
    P: identExpr(BigInt(1), { name: 'a' }),
  },
  {
    I: `a()`,
    // P: `a()^#1:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(1), { function: 'a', args: [] }),
  },
  {
    I: `a(b)`,
    // P: `a(
    // 	b^#2:*expr.Expr_IdentExpr#
    // )^#1:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(1), {
      function: 'a',
      args: [identExpr(BigInt(2), { name: 'b' })],
    }),
  },
  {
    I: `a(b, c)`,
    // P: `a(
    // 	b^#2:*expr.Expr_IdentExpr#,
    // 	c^#3:*expr.Expr_IdentExpr#
    // )^#1:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(1), {
      function: 'a',
      args: [
        identExpr(BigInt(2), { name: 'b' }),
        identExpr(BigInt(3), { name: 'c' }),
      ],
    }),
  },
  {
    I: `a.b()`,
    // P: `a^#1:*expr.Expr_IdentExpr#.b()^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: 'b',
      target: identExpr(BigInt(1), { name: 'a' }),
      args: [],
    }),
  },
  {
    I: `a.b(c)`,
    // P: `a^#1:*expr.Expr_IdentExpr#.b(
    // 	c^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    // L: `a^#1[1,0]#.b(
    // 		  c^#3[1,4]#
    // 		)^#2[1,3]#`,
    P: callExpr(BigInt(2), {
      function: 'b',
      target: identExpr(BigInt(1), { name: 'a' }),
      args: [identExpr(BigInt(3), { name: 'c' })],
    }),
    L: {
      '1': { line: 1, column: 0 },
      '2': { line: 1, column: 3 },
      '3': { line: 1, column: 4 },
    },
  },
  // TODO: Parse error tests
  // // Parse error tests
  // {
  // 	I: `0xFFFFFFFFFFFFFFFFF`,
  // 	E: `ERROR: <input>:1:1: invalid int literal
  // 	| 0xFFFFFFFFFFFFFFFFF
  // 	| ^`,
  // },
  // {
  // 	I: `0xFFFFFFFFFFFFFFFFFu`,
  // 	E: `ERROR: <input>:1:1: invalid uint literal
  // 	| 0xFFFFFFFFFFFFFFFFFu
  // 	| ^`,
  // },
  // {
  // 	I: `1.99e90000009`,
  // 	E: `ERROR: <input>:1:1: invalid double literal
  // 	| 1.99e90000009
  // 	| ^`,
  // },
  // {
  // 	I: `*@a | b`,
  // 	E: `ERROR: <input>:1:1: Syntax error: extraneous input '*' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  // 	| *@a | b
  // 	| ^
  // 	ERROR: <input>:1:2: Syntax error: token recognition error at: '@'
  // 	| *@a | b
  // 	| .^
  // 	ERROR: <input>:1:5: Syntax error: token recognition error at: '| '
  // 	| *@a | b
  // 	| ....^
  // 	ERROR: <input>:1:7: Syntax error: extraneous input 'b' expecting <EOF>
  // 	| *@a | b
  // 	| ......^`,
  // },
  {
    I: `a | b`,
    E: `ERROR: <input>:1:3: Syntax error: token recognition error at: '| '
  	| a | b
  	| ..^
  	ERROR: <input>:1:5: Syntax error: extraneous input 'b' expecting <EOF>
  	| a | b
  	| ....^`,
  },
  // Macro tests
  {
    I: `has(m.f)`,
    // P: `m^#2:*expr.Expr_IdentExpr#.f~test-only~^#4:*expr.Expr_SelectExpr#`,
    // L: `m^#2[1,4]#.f~test-only~^#4[1,3]#`,
    // M: `has(
    // 	m^#2:*expr.Expr_IdentExpr#.f^#3:*expr.Expr_SelectExpr#
    //   )^#4:has#`,
    P: selectExpr(BigInt(4), {
      operand: identExpr(BigInt(2), { name: 'm' }),
      field: 'f',
      testOnly: true,
    }),
    // L: {
    //   '2': { line: 1, column: 4 },
    //   '4': { line: 1, column: 3 },
    // },
  },
  {
    I: `m.exists(v, f)`,
    // P: `__comprehension__(
    // 	// Variable
    // 	v,
    // 	// Target
    // 	m^#1:*expr.Expr_IdentExpr#,
    // 	// Accumulator
    // 	__result__,
    // 	// Init
    // 	false^#5:*expr.Constant_BoolValue#,
    // 	// LoopCondition
    // 	@not_strictly_false(
    //             !_(
    //               __result__^#6:*expr.Expr_IdentExpr#
    //             )^#7:*expr.Expr_CallExpr#
    // 	)^#8:*expr.Expr_CallExpr#,
    // 	// LoopStep
    // 	_||_(
    //             __result__^#9:*expr.Expr_IdentExpr#,
    //             f^#4:*expr.Expr_IdentExpr#
    // 	)^#10:*expr.Expr_CallExpr#,
    // 	// Result
    // 	__result__^#11:*expr.Expr_IdentExpr#)^#12:*expr.Expr_ComprehensionExpr#`,
    // M: `m^#1:*expr.Expr_IdentExpr#.exists(
    // 	v^#3:*expr.Expr_IdentExpr#,
    // 	f^#4:*expr.Expr_IdentExpr#
    //   	)^#12:exists#`,
    P: comprehensionExpr(BigInt(12), {
      iterRange: identExpr(BigInt(1), { name: 'm' }),
      iterVar: 'v',
      accuVar: ACCUMULATOR_VAR,
      accuInit: boolExpr(BigInt(5), false),
      loopCondition: callExpr(BigInt(8), {
        function: NOT_STRICTLY_FALSE_OPERATOR,
        args: [
          callExpr(BigInt(7), {
            function: LOGICAL_NOT_OPERATOR,
            args: [identExpr(BigInt(6), { name: ACCUMULATOR_VAR })],
          }),
        ],
      }),
      loopStep: callExpr(BigInt(10), {
        function: LOGICAL_OR_OPERATOR,
        args: [
          identExpr(BigInt(9), { name: ACCUMULATOR_VAR }),
          identExpr(BigInt(4), { name: 'f' }),
        ],
      }),
      result: identExpr(BigInt(11), { name: ACCUMULATOR_VAR }),
    }),
  },
  {
    I: `m.all(v, f)`,
    // P: `__comprehension__(
    // 	// Variable
    // 	v,
    // 	// Target
    // 	m^#1:*expr.Expr_IdentExpr#,
    // 	// Accumulator
    // 	__result__,
    // 	// Init
    // 	true^#5:*expr.Constant_BoolValue#,
    // 	// LoopCondition
    // 	@not_strictly_false(
    //             __result__^#6:*expr.Expr_IdentExpr#
    //         )^#7:*expr.Expr_CallExpr#,
    // 	// LoopStep
    // 	_&&_(
    //             __result__^#8:*expr.Expr_IdentExpr#,
    //             f^#4:*expr.Expr_IdentExpr#
    //         )^#9:*expr.Expr_CallExpr#,
    // 	// Result
    // 	__result__^#10:*expr.Expr_IdentExpr#)^#11:*expr.Expr_ComprehensionExpr#`,
    // M: `m^#1:*expr.Expr_IdentExpr#.all(
    // 	v^#3:*expr.Expr_IdentExpr#,
    // 	f^#4:*expr.Expr_IdentExpr#
    //   	)^#11:all#`,
    P: comprehensionExpr(BigInt(11), {
      iterRange: identExpr(BigInt(1), { name: 'm' }),
      iterVar: 'v',
      accuVar: ACCUMULATOR_VAR,
      accuInit: boolExpr(BigInt(5), true),
      loopCondition: callExpr(BigInt(7), {
        function: NOT_STRICTLY_FALSE_OPERATOR,
        args: [identExpr(BigInt(6), { name: ACCUMULATOR_VAR })],
      }),
      loopStep: callExpr(BigInt(9), {
        function: LOGICAL_AND_OPERATOR,
        args: [
          identExpr(BigInt(8), { name: ACCUMULATOR_VAR }),
          identExpr(BigInt(4), { name: 'f' }),
        ],
      }),
      result: identExpr(BigInt(10), { name: ACCUMULATOR_VAR }),
    }),
  },
  {
    I: `m.exists_one(v, f)`,
    // P: `__comprehension__(
    // 	// Variable
    // 	v,
    // 	// Target
    // 	m^#1:*expr.Expr_IdentExpr#,
    // 	// Accumulator
    // 	__result__,
    // 	// Init
    // 	0^#5:*expr.Constant_Int64Value#,
    // 	// LoopCondition
    // 	true^#6:*expr.Constant_BoolValue#,
    // 	// LoopStep
    // 	_?_:_(
    // 		f^#4:*expr.Expr_IdentExpr#,
    // 		_+_(
    // 			  __result__^#7:*expr.Expr_IdentExpr#,
    // 		  1^#8:*expr.Constant_Int64Value#
    // 		)^#9:*expr.Expr_CallExpr#,
    // 		__result__^#10:*expr.Expr_IdentExpr#
    // 	)^#11:*expr.Expr_CallExpr#,
    // 	// Result
    // 	_==_(
    // 		__result__^#12:*expr.Expr_IdentExpr#,
    // 		1^#13:*expr.Constant_Int64Value#
    // 	)^#14:*expr.Expr_CallExpr#)^#15:*expr.Expr_ComprehensionExpr#`,
    // M: `m^#1:*expr.Expr_IdentExpr#.exists_one(
    // 	v^#3:*expr.Expr_IdentExpr#,
    // 	f^#4:*expr.Expr_IdentExpr#
    //   	)^#15:exists_one#`,
    P: comprehensionExpr(BigInt(15), {
      iterRange: identExpr(BigInt(1), { name: 'm' }),
      iterVar: 'v',
      accuVar: ACCUMULATOR_VAR,
      accuInit: int64Expr(BigInt(5), BigInt(0)),
      loopCondition: boolExpr(BigInt(6), true),
      loopStep: callExpr(BigInt(11), {
        function: CONDITIONAL_OPERATOR,
        args: [
          identExpr(BigInt(4), { name: 'f' }),
          callExpr(BigInt(9), {
            function: ADD_OPERATOR,
            args: [
              identExpr(BigInt(7), { name: ACCUMULATOR_VAR }),
              int64Expr(BigInt(8), BigInt(1)),
            ],
          }),
          identExpr(BigInt(10), { name: ACCUMULATOR_VAR }),
        ],
      }),
      result: callExpr(BigInt(14), {
        function: '_==_',
        args: [
          identExpr(BigInt(12), { name: ACCUMULATOR_VAR }),
          int64Expr(BigInt(13), BigInt(1)),
        ],
      }),
    }),
  },
  {
    I: `m.map(v, f)`,
    // P: `__comprehension__(
    // 	// Variable
    // 	v,
    // 	// Target
    // 	m^#1:*expr.Expr_IdentExpr#,
    // 	// Accumulator
    // 	__result__,
    // 	// Init
    // 	[]^#5:*expr.Expr_ListExpr#,
    // 	// LoopCondition
    // 	true^#6:*expr.Constant_BoolValue#,
    // 	// LoopStep
    // 	_+_(
    // 		__result__^#7:*expr.Expr_IdentExpr#,
    // 		[
    // 			f^#4:*expr.Expr_IdentExpr#
    // 		]^#8:*expr.Expr_ListExpr#
    // 	)^#9:*expr.Expr_CallExpr#,
    // 	// Result
    // 	__result__^#10:*expr.Expr_IdentExpr#)^#11:*expr.Expr_ComprehensionExpr#`,
    // M: `m^#1:*expr.Expr_IdentExpr#.map(
    // 	v^#3:*expr.Expr_IdentExpr#,
    // 	f^#4:*expr.Expr_IdentExpr#
    //   	)^#11:map#`,
    P: comprehensionExpr(BigInt(11), {
      iterRange: identExpr(BigInt(1), { name: 'm' }),
      iterVar: 'v',
      accuVar: ACCUMULATOR_VAR,
      accuInit: listExpr(BigInt(5), {}),
      loopCondition: boolExpr(BigInt(6), true),
      loopStep: callExpr(BigInt(9), {
        function: ADD_OPERATOR,
        args: [
          identExpr(BigInt(7), { name: ACCUMULATOR_VAR }),
          listExpr(BigInt(8), {
            elements: [identExpr(BigInt(4), { name: 'f' })],
          }),
        ],
      }),
      result: identExpr(BigInt(10), { name: ACCUMULATOR_VAR }),
    }),
  },
  {
    I: `m.map(v, p, f)`,
    // P: `__comprehension__(
    // 	// Variable
    // 	v,
    // 	// Target
    // 	m^#1:*expr.Expr_IdentExpr#,
    // 	// Accumulator
    // 	__result__,
    // 	// Init
    // 	[]^#6:*expr.Expr_ListExpr#,
    // 	// LoopCondition
    // 	true^#7:*expr.Constant_BoolValue#,
    // 	// LoopStep
    // 	_?_:_(
    // 		p^#4:*expr.Expr_IdentExpr#,
    // 		_+_(
    // 			__result__^#8:*expr.Expr_IdentExpr#,
    // 			[
    // 				f^#5:*expr.Expr_IdentExpr#
    // 			]^#9:*expr.Expr_ListExpr#
    // 		)^#10:*expr.Expr_CallExpr#,
    // 		__result__^#11:*expr.Expr_IdentExpr#
    // 	)^#12:*expr.Expr_CallExpr#,
    // 	// Result
    // 	__result__^#13:*expr.Expr_IdentExpr#)^#14:*expr.Expr_ComprehensionExpr#`,
    // M: `m^#1:*expr.Expr_IdentExpr#.map(
    // 	v^#3:*expr.Expr_IdentExpr#,
    // 	p^#4:*expr.Expr_IdentExpr#,
    // 	f^#5:*expr.Expr_IdentExpr#
    //   	)^#14:map#`,
    P: comprehensionExpr(BigInt(14), {
      iterRange: identExpr(BigInt(1), { name: 'm' }),
      iterVar: 'v',
      accuVar: ACCUMULATOR_VAR,
      accuInit: listExpr(BigInt(6), {}),
      loopCondition: boolExpr(BigInt(7), true),
      loopStep: callExpr(BigInt(12), {
        function: CONDITIONAL_OPERATOR,
        args: [
          identExpr(BigInt(4), { name: 'p' }),
          callExpr(BigInt(10), {
            function: ADD_OPERATOR,
            args: [
              identExpr(BigInt(8), { name: ACCUMULATOR_VAR }),
              listExpr(BigInt(9), {
                elements: [identExpr(BigInt(5), { name: 'f' })],
              }),
            ],
          }),
          identExpr(BigInt(11), { name: ACCUMULATOR_VAR }),
        ],
      }),
      result: identExpr(BigInt(13), { name: ACCUMULATOR_VAR }),
    }),
  },
  {
    I: `m.filter(v, p)`,
    // P: `__comprehension__(
    // 	// Variable
    // 	v,
    // 	// Target
    // 	m^#1:*expr.Expr_IdentExpr#,
    // 	// Accumulator
    // 	__result__,
    // 	// Init
    // 	[]^#5:*expr.Expr_ListExpr#,
    // 	// LoopCondition
    // 	true^#6:*expr.Constant_BoolValue#,
    // 	// LoopStep
    // 	_?_:_(
    // 		p^#4:*expr.Expr_IdentExpr#,
    // 		_+_(
    // 			__result__^#7:*expr.Expr_IdentExpr#,
    // 			[
    // 				v^#3:*expr.Expr_IdentExpr#
    // 			]^#8:*expr.Expr_ListExpr#
    // 		)^#9:*expr.Expr_CallExpr#,
    // 		__result__^#10:*expr.Expr_IdentExpr#
    // 	)^#11:*expr.Expr_CallExpr#,
    // 	// Result
    // 	__result__^#12:*expr.Expr_IdentExpr#)^#13:*expr.Expr_ComprehensionExpr#`,
    // M: `m^#1:*expr.Expr_IdentExpr#.filter(
    // 	v^#3:*expr.Expr_IdentExpr#,
    // 	p^#4:*expr.Expr_IdentExpr#
    //   	)^#13:filter#`,
    P: comprehensionExpr(BigInt(13), {
      iterRange: identExpr(BigInt(1), { name: 'm' }),
      iterVar: 'v',
      accuVar: ACCUMULATOR_VAR,
      accuInit: listExpr(BigInt(5), {}),
      loopCondition: boolExpr(BigInt(6), true),
      loopStep: callExpr(BigInt(11), {
        function: CONDITIONAL_OPERATOR,
        args: [
          identExpr(BigInt(4), { name: 'p' }),
          callExpr(BigInt(9), {
            function: ADD_OPERATOR,
            args: [
              identExpr(BigInt(7), { name: ACCUMULATOR_VAR }),
              listExpr(BigInt(8), {
                elements: [identExpr(BigInt(3), { name: 'v' })],
              }),
            ],
          }),
          identExpr(BigInt(10), { name: ACCUMULATOR_VAR }),
        ],
      }),
      result: identExpr(BigInt(12), { name: ACCUMULATOR_VAR }),
    }),
  },

  // Tests from C++ parser
  {
    I: 'x * 2',
    // P: `_*_(
    // 	x^#1:*expr.Expr_IdentExpr#,
    // 	2^#3:*expr.Constant_Int64Value#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: MULTIPLY_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'x' }),
        int64Expr(BigInt(3), BigInt(2)),
      ],
    }),
  },
  {
    I: 'x * 2u',
    // P: `_*_(
    // 	x^#1:*expr.Expr_IdentExpr#,
    // 	2u^#3:*expr.Constant_Uint64Value#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: MULTIPLY_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'x' }),
        uint64Expr(BigInt(3), BigInt(2)),
      ],
    }),
  },
  {
    I: 'x * 2.0',
    // P: `_*_(
    // 	x^#1:*expr.Expr_IdentExpr#,
    // 	2^#3:*expr.Constant_DoubleValue#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: MULTIPLY_OPERATOR,
      args: [identExpr(BigInt(1), { name: 'x' }), doubleExpr(BigInt(3), 2.0)],
    }),
  },
  {
    I: `"\u2764"`,
    // P: "\"\u2764\"^#1:*expr.Constant_StringValue#",
    P: stringExpr(BigInt(1), '❤'),
  },
  {
    I: `! false`,
    // P: `!_(
    // 	false^#2:*expr.Constant_BoolValue#
    // )^#1:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(1), {
      function: LOGICAL_NOT_OPERATOR,
      args: [boolExpr(BigInt(2), false)],
    }),
  },
  {
    I: `-a`,
    // P: `-_(
    // 	a^#2:*expr.Expr_IdentExpr#
    // )^#1:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(1), {
      function: NEGATE_OPERATOR,
      args: [identExpr(BigInt(2), { name: 'a' })],
    }),
  },
  {
    I: `a.b(5)`,
    // P: `a^#1:*expr.Expr_IdentExpr#.b(
    // 	5^#3:*expr.Constant_Int64Value#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: 'b',
      target: identExpr(BigInt(1), { name: 'a' }),
      args: [int64Expr(BigInt(3), BigInt(5))],
    }),
  },
  {
    I: `a[3]`,
    // P: `_[_](
    // 	a^#1:*expr.Expr_IdentExpr#,
    // 	3^#3:*expr.Constant_Int64Value#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: INDEX_OPERATOR,
      args: [
        identExpr(BigInt(1), { name: 'a' }),
        int64Expr(BigInt(3), BigInt(3)),
      ],
    }),
  },
  {
    I: `SomeMessage{foo: 5, bar: "xyz"}`,
    // P: `SomeMessage{
    // 	foo:5^#3:*expr.Constant_Int64Value#^#2:*expr.Expr_CreateStruct_Entry#,
    // 	bar:"xyz"^#5:*expr.Constant_StringValue#^#4:*expr.Expr_CreateStruct_Entry#
    // }^#1:*expr.Expr_StructExpr#`,
    P: structExpr(BigInt(1), {
      messageName: 'SomeMessage',
      entries: [
        structFieldEntry(BigInt(2), 'foo', int64Expr(BigInt(3), BigInt(5))),
        structFieldEntry(BigInt(4), 'bar', stringExpr(BigInt(5), 'xyz')),
      ],
    }),
  },
  {
    I: `[3, 4, 5]`,
    // P: `[
    // 	3^#2:*expr.Constant_Int64Value#,
    // 	4^#3:*expr.Constant_Int64Value#,
    // 	5^#4:*expr.Constant_Int64Value#
    // ]^#1:*expr.Expr_ListExpr#`,
    P: listExpr(BigInt(1), {
      elements: [
        int64Expr(BigInt(2), BigInt(3)),
        int64Expr(BigInt(3), BigInt(4)),
        int64Expr(BigInt(4), BigInt(5)),
      ],
    }),
  },
  {
    I: `[3, 4, 5,]`,
    // P: `[
    // 	3^#2:*expr.Constant_Int64Value#,
    // 	4^#3:*expr.Constant_Int64Value#,
    // 	5^#4:*expr.Constant_Int64Value#
    // ]^#1:*expr.Expr_ListExpr#`,
    P: listExpr(BigInt(1), {
      elements: [
        int64Expr(BigInt(2), BigInt(3)),
        int64Expr(BigInt(3), BigInt(4)),
        int64Expr(BigInt(4), BigInt(5)),
      ],
    }),
  },
  {
    I: `{foo: 5, bar: "xyz"}`,
    // P: `{
    // 	foo^#3:*expr.Expr_IdentExpr#:5^#4:*expr.Constant_Int64Value#^#2:*expr.Expr_CreateStruct_Entry#,
    // 	bar^#6:*expr.Expr_IdentExpr#:"xyz"^#7:*expr.Constant_StringValue#^#5:*expr.Expr_CreateStruct_Entry#
    // }^#1:*expr.Expr_StructExpr#`,
    P: structExpr(BigInt(1), {
      entries: [
        structMapEntry(
          BigInt(2),
          identExpr(BigInt(3), { name: 'foo' }),
          int64Expr(BigInt(4), BigInt(5))
        ),
        structMapEntry(
          BigInt(5),
          identExpr(BigInt(6), { name: 'bar' }),
          stringExpr(BigInt(7), 'xyz')
        ),
      ],
    }),
  },
  {
    I: `{foo: 5, bar: "xyz", }`,
    // P: `{
    // 	foo^#3:*expr.Expr_IdentExpr#:5^#4:*expr.Constant_Int64Value#^#2:*expr.Expr_CreateStruct_Entry#,
    // 	bar^#6:*expr.Expr_IdentExpr#:"xyz"^#7:*expr.Constant_StringValue#^#5:*expr.Expr_CreateStruct_Entry#
    // }^#1:*expr.Expr_StructExpr#`,
    P: structExpr(BigInt(1), {
      entries: [
        structMapEntry(
          BigInt(2),
          identExpr(BigInt(3), { name: 'foo' }),
          int64Expr(BigInt(4), BigInt(5))
        ),
        structMapEntry(
          BigInt(5),
          identExpr(BigInt(6), { name: 'bar' }),
          stringExpr(BigInt(7), 'xyz')
        ),
      ],
    }),
  },
  {
    I: `a > 5 && a < 10`,
    // P: `_&&_(
    // 	_>_(
    // 	  a^#1:*expr.Expr_IdentExpr#,
    // 	  5^#3:*expr.Constant_Int64Value#
    // 	)^#2:*expr.Expr_CallExpr#,
    // 	_<_(
    // 	  a^#4:*expr.Expr_IdentExpr#,
    // 	  10^#6:*expr.Constant_Int64Value#
    // 	)^#5:*expr.Expr_CallExpr#
    // )^#7:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(7), {
      function: LOGICAL_AND_OPERATOR,
      args: [
        callExpr(BigInt(2), {
          function: GREATER_OPERATOR,
          args: [
            identExpr(BigInt(1), { name: 'a' }),
            int64Expr(BigInt(3), BigInt(5)),
          ],
        }),
        callExpr(BigInt(5), {
          function: LESS_OPERATOR,
          args: [
            identExpr(BigInt(4), { name: 'a' }),
            int64Expr(BigInt(6), BigInt(10)),
          ],
        }),
      ],
    }),
  },
  {
    I: `a < 5 || a > 10`,
    // P: `_||_(
    // 	_<_(
    // 	  a^#1:*expr.Expr_IdentExpr#,
    // 	  5^#3:*expr.Constant_Int64Value#
    // 	)^#2:*expr.Expr_CallExpr#,
    // 	_>_(
    // 	  a^#4:*expr.Expr_IdentExpr#,
    // 	  10^#6:*expr.Constant_Int64Value#
    // 	)^#5:*expr.Expr_CallExpr#
    // )^#7:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(7), {
      function: LOGICAL_OR_OPERATOR,
      args: [
        callExpr(BigInt(2), {
          function: LESS_OPERATOR,
          args: [
            identExpr(BigInt(1), { name: 'a' }),
            int64Expr(BigInt(3), BigInt(5)),
          ],
        }),
        callExpr(BigInt(5), {
          function: GREATER_OPERATOR,
          args: [
            identExpr(BigInt(4), { name: 'a' }),
            int64Expr(BigInt(6), BigInt(10)),
          ],
        }),
      ],
    }),
  },
  {
    I: `{`,
    E: `ERROR: <input>:1:2: Syntax error: mismatched input '<EOF>' expecting {'[', '{', '}', '(', '.', ',', '-', '!', '?', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  	 | {
  	 | .^`,
  },

  // Tests from Java parser
  {
    I: `[] + [1,2,3,] + [4]`,
    // P: `_+_(
    // 	_+_(
    // 		[]^#1:*expr.Expr_ListExpr#,
    // 		[
    // 			1^#4:*expr.Constant_Int64Value#,
    // 			2^#5:*expr.Constant_Int64Value#,
    // 			3^#6:*expr.Constant_Int64Value#
    // 		]^#3:*expr.Expr_ListExpr#
    // 	)^#2:*expr.Expr_CallExpr#,
    // 	[
    // 		4^#9:*expr.Constant_Int64Value#
    // 	]^#8:*expr.Expr_ListExpr#
    // )^#7:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(7), {
      function: ADD_OPERATOR,
      args: [
        callExpr(BigInt(2), {
          function: ADD_OPERATOR,
          args: [
            listExpr(BigInt(1), {}),
            listExpr(BigInt(3), {
              elements: [
                int64Expr(BigInt(4), BigInt(1)),
                int64Expr(BigInt(5), BigInt(2)),
                int64Expr(BigInt(6), BigInt(3)),
              ],
            }),
          ],
        }),
        listExpr(BigInt(8), {
          elements: [int64Expr(BigInt(9), BigInt(4))],
        }),
      ],
    }),
  },
  {
    I: `{1:2u, 2:3u}`,
    // P: `{
    // 	1^#3:*expr.Constant_Int64Value#:2u^#4:*expr.Constant_Uint64Value#^#2:*expr.Expr_CreateStruct_Entry#,
    // 	2^#6:*expr.Constant_Int64Value#:3u^#7:*expr.Constant_Uint64Value#^#5:*expr.Expr_CreateStruct_Entry#
    // }^#1:*expr.Expr_StructExpr#`,
    P: structExpr(BigInt(1), {
      entries: [
        structMapEntry(
          BigInt(2),
          int64Expr(BigInt(3), BigInt(1)),
          uint64Expr(BigInt(4), BigInt(2))
        ),
        structMapEntry(
          BigInt(5),
          int64Expr(BigInt(6), BigInt(2)),
          uint64Expr(BigInt(7), BigInt(3))
        ),
      ],
    }),
  },
  {
    I: `TestAllTypes{single_int32: 1, single_int64: 2}`,
    // P: `TestAllTypes{
    // 	single_int32:1^#3:*expr.Constant_Int64Value#^#2:*expr.Expr_CreateStruct_Entry#,
    // 	single_int64:2^#5:*expr.Constant_Int64Value#^#4:*expr.Expr_CreateStruct_Entry#
    // }^#1:*expr.Expr_StructExpr#`,
    P: structExpr(BigInt(1), {
      messageName: 'TestAllTypes',
      entries: [
        structFieldEntry(
          BigInt(2),
          'single_int32',
          int64Expr(BigInt(3), BigInt(1))
        ),
        structFieldEntry(
          BigInt(4),
          'single_int64',
          int64Expr(BigInt(5), BigInt(2))
        ),
      ],
    }),
  },
  {
    I: `TestAllTypes(){}`,
    E: `ERROR: <input>:1:15: Syntax error: mismatched input '{' expecting <EOF>
  	| TestAllTypes(){}
  	| ..............^`,
  },
  {
    I: `TestAllTypes{}()`,
    E: `ERROR: <input>:1:15: Syntax error: mismatched input '(' expecting <EOF>
  	| TestAllTypes{}()
  	| ..............^`,
  },
  {
    I: `size(x) == x.size()`,
    // P: `_==_(
    // 	size(
    // 		x^#2:*expr.Expr_IdentExpr#
    // 	)^#1:*expr.Expr_CallExpr#,
    // 	x^#4:*expr.Expr_IdentExpr#.size()^#5:*expr.Expr_CallExpr#
    // )^#3:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(3), {
      function: EQUALS_OPERATOR,
      args: [
        callExpr(BigInt(1), {
          function: 'size',
          args: [identExpr(BigInt(2), { name: 'x' })],
        }),
        callExpr(BigInt(5), {
          function: 'size',
          target: identExpr(BigInt(4), { name: 'x' }),
        }),
      ],
    }),
  },
  {
    I: `1 + $`,
    E: `ERROR: <input>:1:5: Syntax error: token recognition error at: '$'
  		| 1 + $
  		| ....^
  		ERROR: <input>:1:6: Syntax error: mismatched input '<EOF>' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  		| 1 + $
  		| .....^`,
  },
  {
    I: `1 + 2
3 +`,
    E: `ERROR: <input>:2:1: Syntax error: mismatched input '3' expecting <EOF>
  		| 3 +
  		| ^`,
  },
  {
    I: `"\\""`, // TODO: revisit this test
    // P: `"\""^#1:*expr.Constant_StringValue#`,
    P: stringExpr(BigInt(1), '"'),
  },
  {
    I: `[1,3,4][0]`,
    // P: `_[_](
    // 	[
    // 		1^#2:*expr.Constant_Int64Value#,
    // 		3^#3:*expr.Constant_Int64Value#,
    // 		4^#4:*expr.Constant_Int64Value#
    // 	]^#1:*expr.Expr_ListExpr#,
    // 	0^#6:*expr.Constant_Int64Value#
    // )^#5:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(5), {
      function: INDEX_OPERATOR,
      args: [
        listExpr(BigInt(1), {
          elements: [
            int64Expr(BigInt(2), BigInt(1)),
            int64Expr(BigInt(3), BigInt(3)),
            int64Expr(BigInt(4), BigInt(4)),
          ],
        }),
        int64Expr(BigInt(6), BigInt(0)),
      ],
    }),
  },
  // TODO: errors
  {
    I: `1.all(2, 3)`,
    E: `ERROR: <input>:1:7: argument must be a simple name
  	| 1.all(2, 3)
  	| ......^`,
  },
  {
    I: `x["a"].single_int32 == 23`,
    // P: `_==_(
    // 	_[_](
    // 		x^#1:*expr.Expr_IdentExpr#,
    // 		"a"^#3:*expr.Constant_StringValue#
    // 	)^#2:*expr.Expr_CallExpr#.single_int32^#4:*expr.Expr_SelectExpr#,
    // 	23^#6:*expr.Constant_Int64Value#
    // )^#5:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(5), {
      function: EQUALS_OPERATOR,
      args: [
        selectExpr(BigInt(4), {
          operand: callExpr(BigInt(2), {
            function: INDEX_OPERATOR,
            args: [
              identExpr(BigInt(1), { name: 'x' }),
              stringExpr(BigInt(3), 'a'),
            ],
          }),
          field: 'single_int32',
        }),
        int64Expr(BigInt(6), BigInt(23)),
      ],
    }),
  },
  {
    I: `x.single_nested_message != null`,
    // P: `_!=_(
    // 	x^#1:*expr.Expr_IdentExpr#.single_nested_message^#2:*expr.Expr_SelectExpr#,
    // 	null^#4:*expr.Constant_NullValue#
    // )^#3:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(3), {
      function: NOT_EQUALS_OPERATOR,
      args: [
        selectExpr(BigInt(2), {
          operand: identExpr(BigInt(1), { name: 'x' }),
          field: 'single_nested_message',
        }),
        nullExpr(BigInt(4)),
      ],
    }),
  },
  {
    I: `false && !true || false ? 2 : 3`,
    // P: `_?_:_(
    // 	_||_(
    // 		_&&_(
    // 			false^#1:*expr.Constant_BoolValue#,
    // 			!_(
    // 				true^#3:*expr.Constant_BoolValue#
    // 			)^#2:*expr.Expr_CallExpr#
    // 		)^#4:*expr.Expr_CallExpr#,
    // 		false^#5:*expr.Constant_BoolValue#
    // 	)^#6:*expr.Expr_CallExpr#,
    // 	2^#8:*expr.Constant_Int64Value#,
    // 	3^#9:*expr.Constant_Int64Value#
    // )^#7:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(7), {
      function: CONDITIONAL_OPERATOR,
      args: [
        callExpr(BigInt(6), {
          function: LOGICAL_OR_OPERATOR,
          args: [
            callExpr(BigInt(4), {
              function: LOGICAL_AND_OPERATOR,
              args: [
                boolExpr(BigInt(1), false),
                callExpr(BigInt(2), {
                  function: LOGICAL_NOT_OPERATOR,
                  args: [boolExpr(BigInt(3), true)],
                }),
              ],
            }),
            boolExpr(BigInt(5), false),
          ],
        }),
        int64Expr(BigInt(8), BigInt(2)),
        int64Expr(BigInt(9), BigInt(3)),
      ],
    }),
  },
  {
    I: `b"abc" + B"def"`,
    // P: `_+_(
    // 	b"abc"^#1:*expr.Constant_BytesValue#,
    // 	b"def"^#3:*expr.Constant_BytesValue#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: ADD_OPERATOR,
      args: [
        bytesExpr(BigInt(1), new TextEncoder().encode('abc')),
        bytesExpr(BigInt(3), new TextEncoder().encode('def')),
      ],
    }),
  },
  {
    I: `1 + 2 * 3 - 1 / 2 == 6 % 1`,
    // P: `_==_(
    // 	_-_(
    // 		_+_(
    // 			1^#1:*expr.Constant_Int64Value#,
    // 			_*_(
    // 				2^#3:*expr.Constant_Int64Value#,
    // 				3^#5:*expr.Constant_Int64Value#
    // 			)^#4:*expr.Expr_CallExpr#
    // 		)^#2:*expr.Expr_CallExpr#,
    // 		_/_(
    // 			1^#7:*expr.Constant_Int64Value#,
    // 			2^#9:*expr.Constant_Int64Value#
    // 		)^#8:*expr.Expr_CallExpr#
    // 	)^#6:*expr.Expr_CallExpr#,
    // 	_%_(
    // 		6^#11:*expr.Constant_Int64Value#,
    // 		1^#13:*expr.Constant_Int64Value#
    // 	)^#12:*expr.Expr_CallExpr#
    // )^#10:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(10), {
      function: EQUALS_OPERATOR,
      args: [
        callExpr(BigInt(6), {
          function: SUBTRACT_OPERATOR,
          args: [
            callExpr(BigInt(2), {
              function: ADD_OPERATOR,
              args: [
                int64Expr(BigInt(1), BigInt(1)),
                callExpr(BigInt(4), {
                  function: MULTIPLY_OPERATOR,
                  args: [
                    int64Expr(BigInt(3), BigInt(2)),
                    int64Expr(BigInt(5), BigInt(3)),
                  ],
                }),
              ],
            }),
            callExpr(BigInt(8), {
              function: DIVIDE_OPERATOR,
              args: [
                int64Expr(BigInt(7), BigInt(1)),
                int64Expr(BigInt(9), BigInt(2)),
              ],
            }),
          ],
        }),
        callExpr(BigInt(12), {
          function: MODULO_OPERATOR,
          args: [
            int64Expr(BigInt(11), BigInt(6)),
            int64Expr(BigInt(13), BigInt(1)),
          ],
        }),
      ],
    }),
  },
  {
    I: `1 + +`,
    E: `ERROR: <input>:1:5: Syntax error: mismatched input '+' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  	| 1 + +
  	| ....^
  	ERROR: <input>:1:6: Syntax error: mismatched input '<EOF>' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  	| 1 + +
  	| .....^`,
  },
  {
    I: `"abc" + "def"`,
    // P: `_+_(
    // 	"abc"^#1:*expr.Constant_StringValue#,
    // 	"def"^#3:*expr.Constant_StringValue#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: ADD_OPERATOR,
      args: [stringExpr(BigInt(1), 'abc'), stringExpr(BigInt(3), 'def')],
    }),
  },
  {
    I: `{"a": 1}."a"`,
    E: `ERROR: <input>:1:10: Syntax error: no viable alternative at input '."a"'
    | {"a": 1}."a"
    | .........^`,
  },
  // { // TODO: this comes up with the wrong value
  //   I: `"\xC3\XBF"`,
  //   // P: `"Ã¿"^#1:*expr.Constant_StringValue#`,
  //   P: create(ExprSchema, {
  //     id: BigInt(1),
  //     exprKind: {
  //       case: 'constExpr',
  //       value: {
  //         constantKind: {
  //           case: 'stringValue',
  //           value: 'Ã¿',
  //         },
  //       },
  //     },
  //   }),
  // },
  // JS throws an error "octal escape sequences are not allowed in strict mode"
  // {
  // 	I: `"\303\277"`,
  // 	P: `"Ã¿"^#1:*expr.Constant_StringValue#`,
  // },
  {
    I: `"hi\u263A \u263Athere"`,
    // P: `"hi☺ ☺there"^#1:*expr.Constant_StringValue#`,
    P: stringExpr(BigInt(1), 'hi☺ ☺there'),
  },
  // {
  //   I: `"\U000003A8\?"`, // TODO: it parses this wrong
  //   // P: `"Ψ?"^#1:*expr.Constant_StringValue#`,
  //   P: create(ExprSchema, {
  //     id: BigInt(1),
  //     exprKind: {
  //       case: 'constExpr',
  //       value: {
  //         constantKind: {
  //           case: 'stringValue',
  //           value: 'Ψ?',
  //         },
  //       },
  //     },
  //   }),
  // },
  // {
  //   I: `"\a\b\f\n\r\t\v'\"\\\? Legal escapes"`, // TODO: it struggles with this too
  //   // P: `"\a\b\f\n\r\t\v'\"\\? Legal escapes"^#1:*expr.Constant_StringValue#`,
  //   P: create(ExprSchema, {
  //     id: BigInt(1),
  //     exprKind: {
  //       case: 'constExpr',
  //       value: {
  //         constantKind: {
  //           case: 'stringValue',
  //           value: `a\b\f\n\r\t\v\'"\\? Legal escapes`,
  //         },
  //       },
  //     },
  //   }),
  // },
  // {
  // 	I: `"\xFh"`, // TODO: JS won't run this
  // 	E: `ERROR: <input>:1:1: Syntax error: token recognition error at: '"\xFh'
  // 	| "\xFh"
  // 	| ^
  // 	ERROR: <input>:1:6: Syntax error: token recognition error at: '"'
  // 	| "\xFh"
  // 	| .....^
  // 	ERROR: <input>:1:7: Syntax error: mismatched input '<EOF>' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  // 	| "\xFh"
  // 	| ......^`,
  // },
  // { // TODO: it throws an error but the message is wonky because of the escapes
  //   I: `"\a\b\f\n\r\t\v\'\"\\\? Illegal escape \>"`,
  //   E: `ERROR: <input>:1:1: Syntax error: token recognition error at: '"\a\b\f\n\r\t\v\'\"\\\? Illegal escape \>'
  // 	| "\a\b\f\n\r\t\v\'\"\\\? Illegal escape \>"
  // 	| ^
  // 	ERROR: <input>:1:42: Syntax error: token recognition error at: '"'
  // 	| "\a\b\f\n\r\t\v\'\"\\\? Illegal escape \>"
  // 	| .........................................^
  // 	ERROR: <input>:1:43: Syntax error: mismatched input '<EOF>' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  // 	| "\a\b\f\n\r\t\v\'\"\\\? Illegal escape \>"
  // 	| ..........................................^`,
  // },
  {
    I: `"😁" in ["😁", "😑", "😦"]`,
    // P: `@in(
    // 	"😁"^#1:*expr.Constant_StringValue#,
    // 	[
    // 		"😁"^#4:*expr.Constant_StringValue#,
    // 		"😑"^#5:*expr.Constant_StringValue#,
    // 		"😦"^#6:*expr.Constant_StringValue#
    // 	]^#3:*expr.Expr_ListExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(2), {
      function: IN_OPERATOR,
      args: [
        stringExpr(BigInt(1), '😁'),
        listExpr(BigInt(3), {
          elements: [
            stringExpr(BigInt(4), '😁'),
            stringExpr(BigInt(5), '😑'),
            stringExpr(BigInt(6), '😦'),
          ],
        }),
      ],
    }),
  },
  // { // TODO: the error message points at the wrong characters
  //   I: `      '😁' in ['😁', '😑', '😦']
  // && in.😁`,
  //   E: `ERROR: <input>:2:7: Syntax error: extraneous input 'in' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  // 	|    && in.😁
  // 	| ......^
  //     ERROR: <input>:2:10: Syntax error: token recognition error at: '😁'
  // 	|    && in.😁
  // 	| .........＾
  // 	ERROR: <input>:2:11: Syntax error: no viable alternative at input '.'
  // 	|    && in.😁
  // 	| .........．^`,
  // },
  {
    I: 'as',
    E: `ERROR: <input>:1:1: reserved identifier: as
		| as
		| ^`,
  },
  {
    I: 'break',
    E: `ERROR: <input>:1:1: reserved identifier: break
		| break
		| ^`,
  },
  {
    I: 'const',
    E: `ERROR: <input>:1:1: reserved identifier: const
		| const
		| ^`,
  },
  {
    I: 'continue',
    E: `ERROR: <input>:1:1: reserved identifier: continue
		| continue
		| ^`,
  },
  {
    I: 'else',
    E: `ERROR: <input>:1:1: reserved identifier: else
		| else
		| ^`,
  },
  {
    I: 'for',
    E: `ERROR: <input>:1:1: reserved identifier: for
		| for
		| ^`,
  },
  {
    I: 'function',
    E: `ERROR: <input>:1:1: reserved identifier: function
		| function
		| ^`,
  },
  {
    I: 'if',
    E: `ERROR: <input>:1:1: reserved identifier: if
		| if
		| ^`,
  },
  {
    I: 'import',
    E: `ERROR: <input>:1:1: reserved identifier: import
		| import
		| ^`,
  },
  {
    I: 'in',
    E: `ERROR: <input>:1:1: Syntax error: mismatched input 'in' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
		| in
		| ^
        ERROR: <input>:1:3: Syntax error: mismatched input '<EOF>' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
		| in
		| ..^`,
  },
  {
    I: 'let',
    E: `ERROR: <input>:1:1: reserved identifier: let
		| let
		| ^`,
  },
  {
    I: 'loop',
    E: `ERROR: <input>:1:1: reserved identifier: loop
		| loop
		| ^`,
  },
  {
    I: 'package',
    E: `ERROR: <input>:1:1: reserved identifier: package
		| package
		| ^`,
  },
  {
    I: 'namespace',
    E: `ERROR: <input>:1:1: reserved identifier: namespace
		| namespace
		| ^`,
  },
  {
    I: 'return',
    E: `ERROR: <input>:1:1: reserved identifier: return
		| return
		| ^`,
  },
  {
    I: 'var',
    E: `ERROR: <input>:1:1: reserved identifier: var
		| var
		| ^`,
  },
  {
    I: 'void',
    E: `ERROR: <input>:1:1: reserved identifier: void
		| void
		| ^`,
  },
  {
    I: 'while',
    E: `ERROR: <input>:1:1: reserved identifier: while
		| while
		| ^`,
  },
  // { // TODO: the errors in the message are in the wrong order
  //   I: '[1, 2, 3].map(var, var * var)',
  //   E: `ERROR: <input>:1:15: reserved identifier: var
  // 	| [1, 2, 3].map(var, var * var)
  // 	| ..............^
  // 	ERROR: <input>:1:15: argument is not an identifier
  // 	| [1, 2, 3].map(var, var * var)
  // 	| ..............^
  // 	ERROR: <input>:1:20: reserved identifier: var
  // 	| [1, 2, 3].map(var, var * var)
  // 	| ...................^
  // 	ERROR: <input>:1:26: reserved identifier: var
  // 	| [1, 2, 3].map(var, var * var)
  // 	| .........................^`,
  // },
  {
    I: 'func{{a}}',
    E: `ERROR: <input>:1:6: Syntax error: extraneous input '{' expecting {'}', ',', '?', IDENTIFIER}
		| func{{a}}
		| .....^
	    ERROR: <input>:1:8: Syntax error: mismatched input '}' expecting ':'
		| func{{a}}
		| .......^
	    ERROR: <input>:1:9: Syntax error: extraneous input '}' expecting <EOF>
		| func{{a}}
		| ........^`,
  },
  {
    I: 'msg{:a}',
    E: `ERROR: <input>:1:5: Syntax error: extraneous input ':' expecting {'}', ',', '?', IDENTIFIER}
		| msg{:a}
		| ....^
	    ERROR: <input>:1:7: Syntax error: mismatched input '}' expecting ':'
		| msg{:a}
		| ......^`,
  },
  {
    I: '{a}',
    E: `ERROR: <input>:1:3: Syntax error: mismatched input '}' expecting ':'
		| {a}
		| ..^`,
  },
  {
    I: '{:a}',
    E: `ERROR: <input>:1:2: Syntax error: extraneous input ':' expecting {'[', '{', '}', '(', '.', ',', '-', '!', '?', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
		| {:a}
		| .^
	    ERROR: <input>:1:4: Syntax error: mismatched input '}' expecting ':'
		| {:a}
		| ...^`,
  },
  {
    I: 'ind[a{b}]',
    E: `ERROR: <input>:1:8: Syntax error: mismatched input '}' expecting ':'
		| ind[a{b}]
		| .......^`,
  },
  // TODO: something is weird with these ones: TypeError: Cannot read properties of null (reading 'accept')
  // {
  //   I: `--`,
  //   E: `ERROR: <input>:1:3: Syntax error: no viable alternative at input '-'
  // 	| --
  // 	| ..^
  //     ERROR: <input>:1:3: Syntax error: mismatched input '<EOF>' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  // 	| --
  // 	| ..^`,
  // },
  // {
  //   I: `?`,
  //   E: `ERROR: <input>:1:1: Syntax error: mismatched input '?' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  // 	| ?
  // 	| ^
  //     ERROR: <input>:1:2: Syntax error: mismatched input '<EOF>' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  // 	| ?
  // 	| .^`,
  // },
  // {
  //   I: `a ? b ((?))`,
  //   E: `ERROR: <input>:1:9: Syntax error: mismatched input '?' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  // 	| a ? b ((?))
  // 	| ........^
  //     ERROR: <input>:1:10: Syntax error: mismatched input ')' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  // 	| a ? b ((?))
  // 	| .........^
  //     ERROR: <input>:1:12: Syntax error: error recovery attempt limit exceeded: 4
  // 	| a ? b ((?))
  // 	| ...........^`,
  // },
  {
    I: `[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[
  		[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[['too many']]]]]]]]]]]]]]]]]]]]]]]]]]]]
  		]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]`,
    E: 'ERROR: <input>:-1:0: expression recursion limit exceeded: 32',
  },
  // { // TODO: the error order is wrong
  //   I: `-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1
  // 	--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1--1--1--1--0--1--1--1
  // 	--3-[-1--1--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1
  // 	--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1
  // 	--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1
  // 	--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1
  // 	--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1--1--1--1--0--1--1--1
  // 	--3-[-1--1--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1
  // 	--3-[-1--1--1--1---1-1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1
  // 	--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1
  // 	--1--1---1--1-À1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1
  // 	--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1
  // 	--1--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1
  // 	--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1
  // 	--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1
  // 	--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1
  // 	--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1
  // 	--1--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1--1--1
  // 	--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1
  // 	--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1
  // 	--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1
  // 	--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1
  // 	--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1--1--1
  // 	--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1
  // 	--1--0--1--1--1--3-[-1--1--1--1---1--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1
  // 	--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1
  // 	--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1
  // 	--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1
  // 	--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1
  // 	--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1
  // 	--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1
  // 	--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1
  // 	--1---1--1--1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1--1
  // 	--1---1--1--1--0--1--1--1--1--0--3--1--1--0--1`,
  //   E: `ERROR: <input>:-1:0: expression recursion limit exceeded: 32
  //       ERROR: <input>:3:33: Syntax error: extraneous input '/' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  //       |   --3-[-1--1--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1
  //       | ................................^
  //       ERROR: <input>:8:33: Syntax error: extraneous input '/' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  //       |   --3-[-1--1--1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1
  //       | ................................^
  //       ERROR: <input>:11:17: Syntax error: token recognition error at: 'À'
  //       |   --1--1---1--1-À1--0--1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1
  //       | ................＾
  //       ERROR: <input>:14:23: Syntax error: extraneous input '/' expecting {'[', '{', '(', '.', '-', '!', 'true', 'false', 'null', NUM_FLOAT, NUM_INT, NUM_UINT, STRING, BYTES, IDENTIFIER}
  //       |   --1--1---1--1--1--0-/1--1--1--1--0--2--1--1--0--1--1--1--1--0--1--1--1--3-[-1--1
  //       | ......................^`,
  // },
  // TODO: javascript doesn't like the one that starts with "I: `ó"
  // Macro Calls Tests
  // TODO: these are very complicated
  // {
  //   I: `x.filter(y, y.filter(z, z > 0))`,
  //   P: `__comprehension__(
  //   	// Variable
  //   	y,
  //   	// Target
  //   	x^#1:*expr.Expr_IdentExpr#,
  //   	// Accumulator
  //   	__result__,
  //   	// Init
  //   	[]^#19:*expr.Expr_ListExpr#,
  //   	// LoopCondition
  //   	true^#20:*expr.Constant_BoolValue#,
  //   	// LoopStep
  //   	_?_:_(
  //   	  __comprehension__(
  //   		// Variable
  //   		z,
  //   		// Target
  //   		y^#4:*expr.Expr_IdentExpr#,
  //   		// Accumulator
  //   		__result__,
  //   		// Init
  //   		[]^#10:*expr.Expr_ListExpr#,
  //   		// LoopCondition
  //   		true^#11:*expr.Constant_BoolValue#,
  //   		// LoopStep
  //   		_?_:_(
  //   		  _>_(
  //   			z^#7:*expr.Expr_IdentExpr#,
  //   			0^#9:*expr.Constant_Int64Value#
  //   		  )^#8:*expr.Expr_CallExpr#,
  //   		  _+_(
  //   			__result__^#12:*expr.Expr_IdentExpr#,
  //   			[
  //   			  z^#6:*expr.Expr_IdentExpr#
  //   			]^#13:*expr.Expr_ListExpr#
  //   		  )^#14:*expr.Expr_CallExpr#,
  //   		  __result__^#15:*expr.Expr_IdentExpr#
  //   		)^#16:*expr.Expr_CallExpr#,
  //   		// Result
  //   		__result__^#17:*expr.Expr_IdentExpr#)^#18:*expr.Expr_ComprehensionExpr#,
  //   	  _+_(
  //   		__result__^#21:*expr.Expr_IdentExpr#,
  //   		[
  //   		  y^#3:*expr.Expr_IdentExpr#
  //   		]^#22:*expr.Expr_ListExpr#
  //   	  )^#23:*expr.Expr_CallExpr#,
  //   	  __result__^#24:*expr.Expr_IdentExpr#
  //   	)^#25:*expr.Expr_CallExpr#,
  //   	// Result
  //   	__result__^#26:*expr.Expr_IdentExpr#)^#27:*expr.Expr_ComprehensionExpr#`,
  //   M: `x^#1:*expr.Expr_IdentExpr#.filter(
  //   	y^#3:*expr.Expr_IdentExpr#,
  //   	^#18:filter#
  //     )^#27:filter#,
  //     y^#4:*expr.Expr_IdentExpr#.filter(
  //   	z^#6:*expr.Expr_IdentExpr#,
  //   	_>_(
  //   	  z^#7:*expr.Expr_IdentExpr#,
  //   	  0^#9:*expr.Constant_Int64Value#
  //   	)^#8:*expr.Expr_CallExpr#
  //     )^#18:filter#`,
  // },
  // {
  // 	I: `has(a.b).filter(c, c)`,
  // 	P: `__comprehension__(
  // 		// Variable
  // 		c,
  // 		// Target
  // 		a^#2:*expr.Expr_IdentExpr#.b~test-only~^#4:*expr.Expr_SelectExpr#,
  // 		// Accumulator
  // 		__result__,
  // 		// Init
  // 		[]^#8:*expr.Expr_ListExpr#,
  // 		// LoopCondition
  // 		true^#9:*expr.Constant_BoolValue#,
  // 		// LoopStep
  // 		_?_:_(
  // 		  c^#7:*expr.Expr_IdentExpr#,
  // 		  _+_(
  // 			__result__^#10:*expr.Expr_IdentExpr#,
  // 			[
  // 			  c^#6:*expr.Expr_IdentExpr#
  // 			]^#11:*expr.Expr_ListExpr#
  // 		  )^#12:*expr.Expr_CallExpr#,
  // 		  __result__^#13:*expr.Expr_IdentExpr#
  // 		)^#14:*expr.Expr_CallExpr#,
  // 		// Result
  // 		__result__^#15:*expr.Expr_IdentExpr#)^#16:*expr.Expr_ComprehensionExpr#`,
  // 	M: `^#4:has#.filter(
  // 		c^#6:*expr.Expr_IdentExpr#,
  // 		c^#7:*expr.Expr_IdentExpr#
  // 		)^#16:filter#,
  // 		has(
  // 			a^#2:*expr.Expr_IdentExpr#.b^#3:*expr.Expr_SelectExpr#
  // 		)^#4:has#`,
  // },
  // {
  // 	I: `x.filter(y, y.exists(z, has(z.a)) && y.exists(z, has(z.b)))`,
  // 	P: `__comprehension__(
  // 		// Variable
  // 		y,
  // 		// Target
  // 		x^#1:*expr.Expr_IdentExpr#,
  // 		// Accumulator
  // 		__result__,
  // 		// Init
  // 		[]^#35:*expr.Expr_ListExpr#,
  // 		// LoopCondition
  // 		true^#36:*expr.Constant_BoolValue#,
  // 		// LoopStep
  // 		_?_:_(
  // 		  _&&_(
  // 			__comprehension__(
  // 			  // Variable
  // 			  z,
  // 			  // Target
  // 			  y^#4:*expr.Expr_IdentExpr#,
  // 			  // Accumulator
  // 			  __result__,
  // 			  // Init
  // 			  false^#11:*expr.Constant_BoolValue#,
  // 			  // LoopCondition
  // 			  @not_strictly_false(
  // 				!_(
  // 				  __result__^#12:*expr.Expr_IdentExpr#
  // 				)^#13:*expr.Expr_CallExpr#
  // 			  )^#14:*expr.Expr_CallExpr#,
  // 			  // LoopStep
  // 			  _||_(
  // 				__result__^#15:*expr.Expr_IdentExpr#,
  // 				z^#8:*expr.Expr_IdentExpr#.a~test-only~^#10:*expr.Expr_SelectExpr#
  // 			  )^#16:*expr.Expr_CallExpr#,
  // 			  // Result
  // 			  __result__^#17:*expr.Expr_IdentExpr#)^#18:*expr.Expr_ComprehensionExpr#,
  // 			__comprehension__(
  // 			  // Variable
  // 			  z,
  // 			  // Target
  // 			  y^#19:*expr.Expr_IdentExpr#,
  // 			  // Accumulator
  // 			  __result__,
  // 			  // Init
  // 			  false^#26:*expr.Constant_BoolValue#,
  // 			  // LoopCondition
  // 			  @not_strictly_false(
  // 				!_(
  // 				  __result__^#27:*expr.Expr_IdentExpr#
  // 				)^#28:*expr.Expr_CallExpr#
  // 			  )^#29:*expr.Expr_CallExpr#,
  // 			  // LoopStep
  // 			  _||_(
  // 				__result__^#30:*expr.Expr_IdentExpr#,
  // 				z^#23:*expr.Expr_IdentExpr#.b~test-only~^#25:*expr.Expr_SelectExpr#
  // 			  )^#31:*expr.Expr_CallExpr#,
  // 			  // Result
  // 			  __result__^#32:*expr.Expr_IdentExpr#)^#33:*expr.Expr_ComprehensionExpr#
  // 		  )^#34:*expr.Expr_CallExpr#,
  // 		  _+_(
  // 			__result__^#37:*expr.Expr_IdentExpr#,
  // 			[
  // 			  y^#3:*expr.Expr_IdentExpr#
  // 			]^#38:*expr.Expr_ListExpr#
  // 		  )^#39:*expr.Expr_CallExpr#,
  // 		  __result__^#40:*expr.Expr_IdentExpr#
  // 		)^#41:*expr.Expr_CallExpr#,
  // 		// Result
  // 		__result__^#42:*expr.Expr_IdentExpr#)^#43:*expr.Expr_ComprehensionExpr#`,
  // 	M: `x^#1:*expr.Expr_IdentExpr#.filter(
  // 		y^#3:*expr.Expr_IdentExpr#,
  // 		_&&_(
  // 		  ^#18:exists#,
  // 		  ^#33:exists#
  // 		)^#34:*expr.Expr_CallExpr#
  // 		)^#43:filter#,
  // 		y^#19:*expr.Expr_IdentExpr#.exists(
  // 			z^#21:*expr.Expr_IdentExpr#,
  // 			^#25:has#
  // 		)^#33:exists#,
  // 		has(
  // 			z^#23:*expr.Expr_IdentExpr#.b^#24:*expr.Expr_SelectExpr#
  // 		)^#25:has#,
  // 		y^#4:*expr.Expr_IdentExpr#.exists(
  // 			z^#6:*expr.Expr_IdentExpr#,
  // 			^#10:has#
  // 		)^#18:exists#,
  // 		has(
  // 			z^#8:*expr.Expr_IdentExpr#.a^#9:*expr.Expr_SelectExpr#
  // 		)^#10:has#`,
  // },
  // {
  //   I: `(has(a.b) || has(c.d)).string()`,
  //   P: `_||_(
  // 		  a^#2:*expr.Expr_IdentExpr#.b~test-only~^#4:*expr.Expr_SelectExpr#,
  // 		  c^#6:*expr.Expr_IdentExpr#.d~test-only~^#8:*expr.Expr_SelectExpr#
  // 	    )^#9:*expr.Expr_CallExpr#.string()^#10:*expr.Expr_CallExpr#`,
  //   M: `has(
  // 		  c^#6:*expr.Expr_IdentExpr#.d^#7:*expr.Expr_SelectExpr#
  // 		)^#8:has#,
  // 		has(
  // 		  a^#2:*expr.Expr_IdentExpr#.b^#3:*expr.Expr_SelectExpr#
  // 		)^#4:has#`,
  // },
  // {
  // 	I: `has(a.b).asList().exists(c, c)`,
  // 	P: `__comprehension__(
  // 		// Variable
  // 		c,
  // 		// Target
  // 		a^#2:*expr.Expr_IdentExpr#.b~test-only~^#4:*expr.Expr_SelectExpr#.asList()^#5:*expr.Expr_CallExpr#,
  // 		// Accumulator
  // 		__result__,
  // 		// Init
  // 		false^#9:*expr.Constant_BoolValue#,
  // 		// LoopCondition
  // 		@not_strictly_false(
  // 		  !_(
  // 			__result__^#10:*expr.Expr_IdentExpr#
  // 		  )^#11:*expr.Expr_CallExpr#
  // 		)^#12:*expr.Expr_CallExpr#,
  // 		// LoopStep
  // 		_||_(
  // 		  __result__^#13:*expr.Expr_IdentExpr#,
  // 		  c^#8:*expr.Expr_IdentExpr#
  // 		)^#14:*expr.Expr_CallExpr#,
  // 		// Result
  // 		__result__^#15:*expr.Expr_IdentExpr#)^#16:*expr.Expr_ComprehensionExpr#`,
  // 	M: `^#4:has#.asList()^#5:*expr.Expr_CallExpr#.exists(
  // 		c^#7:*expr.Expr_IdentExpr#,
  // 		c^#8:*expr.Expr_IdentExpr#
  // 	  )^#16:exists#,
  // 	  has(
  // 		a^#2:*expr.Expr_IdentExpr#.b^#3:*expr.Expr_SelectExpr#
  // 	  )^#4:has#`,
  // },
  // {
  // 	I: `[has(a.b), has(c.d)].exists(e, e)`,
  // 	P: `__comprehension__(
  // 		// Variable
  // 		e,
  // 		// Target
  // 		[
  // 		  a^#3:*expr.Expr_IdentExpr#.b~test-only~^#5:*expr.Expr_SelectExpr#,
  // 		  c^#7:*expr.Expr_IdentExpr#.d~test-only~^#9:*expr.Expr_SelectExpr#
  // 		]^#1:*expr.Expr_ListExpr#,
  // 		// Accumulator
  // 		__result__,
  // 		// Init
  // 		false^#13:*expr.Constant_BoolValue#,
  // 		// LoopCondition
  // 		@not_strictly_false(
  // 		  !_(
  // 			__result__^#14:*expr.Expr_IdentExpr#
  // 		  )^#15:*expr.Expr_CallExpr#
  // 		)^#16:*expr.Expr_CallExpr#,
  // 		// LoopStep
  // 		_||_(
  // 		  __result__^#17:*expr.Expr_IdentExpr#,
  // 		  e^#12:*expr.Expr_IdentExpr#
  // 		)^#18:*expr.Expr_CallExpr#,
  // 		// Result
  // 		__result__^#19:*expr.Expr_IdentExpr#)^#20:*expr.Expr_ComprehensionExpr#`,
  // 	M: `[
  // 		^#5:has#,
  // 		^#9:has#
  // 	  ]^#1:*expr.Expr_ListExpr#.exists(
  // 		e^#11:*expr.Expr_IdentExpr#,
  // 		e^#12:*expr.Expr_IdentExpr#
  // 	  )^#20:exists#,
  // 	  has(
  // 		c^#7:*expr.Expr_IdentExpr#.d^#8:*expr.Expr_SelectExpr#
  // 	  )^#9:has#,
  // 	  has(
  // 		a^#3:*expr.Expr_IdentExpr#.b^#4:*expr.Expr_SelectExpr#
  // 	  )^#5:has#`,
  // },
  {
    I: `y!=y!=y!=y!=y!=y!=y!=y!=y!=-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y
		!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y
		!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y
		!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y
		!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y
		!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y!=-y!=-y-y!=-y`,
    E: `ERROR: <input>:-1:0: max recursion depth exceeded`,
  },
  {
    // More than 32 nested list creation statements
    I: `[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[['not fine']]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]`,
    E: `ERROR: <input>:-1:0: expression recursion limit exceeded: 32`,
  },
  {
    // More than 32 arithmetic operations.
    I: `1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10
		+ 11 + 12 + 13 + 14 + 15 + 16 + 17 + 18 + 19 + 20
		+ 21 + 22 + 23 + 24 + 25 + 26 + 27 + 28 + 29 + 30
		+ 31 + 32 + 33 + 34`,
    E: `ERROR: <input>:-1:0: max recursion depth exceeded`,
  },
  {
    // More than 32 field selections
    I: `a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.A.B.C.D.E.F.G.H`,
    E: `ERROR: <input>:-1:0: max recursion depth exceeded`,
  },
  {
    // More than 32 index operations
    I: `a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20]
		     [21][22][23][24][25][26][27][28][29][30][31][32][33]`,
    E: `ERROR: <input>:-1:0: max recursion depth exceeded`,
  },
  {
    // More than 32 relation operators
    I: `a < 1 < 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < 11
		      < 12 < 13 < 14 < 15 < 16 < 17 < 18 < 19 < 20 < 21
			  < 22 < 23 < 24 < 25 < 26 < 27 < 28 < 29 < 30 < 31
			  < 32 < 33`,
    E: `ERROR: <input>:-1:0: max recursion depth exceeded`,
  },
  {
    // More than 32 index / relation operators. Note, the recursion count is the
    // maximum recursion level on the left or right side index expression (20) plus
    // the number of relation operators (13)
    I: `a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20] !=
		a[1][2][3][4][5][6][7][8][9][10][11][12][13][14][15][16][17][18][19][20]`,
    E: `ERROR: <input>:-1:0: max recursion depth exceeded`,
  },
  // { // TODO: the error message is wrong
  //   I: `self.true == 1`,
  //   E: `ERROR: <input>:1:6: Syntax error: mismatched input 'true' expecting IDENTIFIER
  // 	| self.true == 1
  // 	| .....^`,
  // },
  {
    I: `a.?b && a[?b]`,
    E: `ERROR: <input>:1:2: unsupported syntax '.?'
        | a.?b && a[?b]
        | .^
        ERROR: <input>:1:10: unsupported syntax '[?'
        | a.?b && a[?b]
		    | .........^`,
  },
  {
    I: `a.?b[?0] && a[?c]`,
    Opts: { enableOptionalSyntax: true },
    // P: `_&&_(
    // 	_[?_](
    // 	  _?._(
    // 		a^#1:*expr.Expr_IdentExpr#,
    // 		"b"^#2:*expr.Constant_StringValue#
    // 	  )^#3:*expr.Expr_CallExpr#,
    // 	  0^#5:*expr.Constant_Int64Value#
    // 	)^#4:*expr.Expr_CallExpr#,
    // 	_[?_](
    // 	  a^#6:*expr.Expr_IdentExpr#,
    // 	  c^#8:*expr.Expr_IdentExpr#
    // 	)^#7:*expr.Expr_CallExpr#
    //   )^#9:*expr.Expr_CallExpr#`,
    P: callExpr(BigInt(9), {
      function: LOGICAL_AND_OPERATOR,
      args: [
        callExpr(BigInt(4), {
          function: OPT_INDEX_OPERATOR,
          args: [
            callExpr(BigInt(3), {
              function: OPT_SELECT_OPERATOR,
              args: [
                identExpr(BigInt(1), { name: 'a' }),
                stringExpr(BigInt(2), 'b'),
              ],
            }),
            int64Expr(BigInt(5), BigInt(0)),
          ],
        }),
        callExpr(BigInt(7), {
          function: OPT_INDEX_OPERATOR,
          args: [
            identExpr(BigInt(6), { name: 'a' }),
            identExpr(BigInt(8), { name: 'c' }),
          ],
        }),
      ],
    }),
  },
  {
    I: `[?a, ?b]`,
    Opts: { enableOptionalSyntax: true },
    // P: `[
    // 	a^#2:*expr.Expr_IdentExpr#,
    // 	b^#3:*expr.Expr_IdentExpr#
    //   ]^#1:*expr.Expr_ListExpr#`,
    P: listExpr(BigInt(1), {
      elements: [
        identExpr(BigInt(2), { name: 'a' }),
        identExpr(BigInt(3), { name: 'b' }),
      ],
      optionalIndices: [0, 1],
    }),
  },
  {
    I: `[?a[?b]]`,
    Opts: { enableOptionalSyntax: true },
    // P: `[
    // 	_[?_](
    // 	  a^#2:*expr.Expr_IdentExpr#,
    // 	  b^#4:*expr.Expr_IdentExpr#
    // 	)^#3:*expr.Expr_CallExpr#
    //   ]^#1:*expr.Expr_ListExpr#`,
    P: listExpr(BigInt(1), {
      elements: [
        callExpr(BigInt(3), {
          function: OPT_INDEX_OPERATOR,
          args: [
            identExpr(BigInt(2), { name: 'a' }),
            identExpr(BigInt(4), { name: 'b' }),
          ],
        }),
      ],
      optionalIndices: [0],
    }),
  },
  {
    I: `[?a, ?b]`,
    E: `ERROR: <input>:1:2: unsupported syntax '?'
		 | [?a, ?b]
		 | .^
	    ERROR: <input>:1:6: unsupported syntax '?'
		 | [?a, ?b]
		 | .....^`,
  },
  {
    I: `Msg{?field: value}`,
    Opts: { enableOptionalSyntax: true },
    // P: `Msg{
    // 	?field:value^#3:*expr.Expr_IdentExpr#^#2:*expr.Expr_CreateStruct_Entry#
    //   }^#1:*expr.Expr_StructExpr#`,
    P: structExpr(BigInt(1), {
      messageName: 'Msg',
      entries: [
        structFieldEntry(
          BigInt(2),
          'field',
          identExpr(BigInt(3), { name: 'value' }),
          true
        ),
      ],
    }),
  },
  {
    I: `Msg{?field: value} && {?'key': value}`,
    E: `ERROR: <input>:1:5: unsupported syntax '?'
	 	 | Msg{?field: value} && {?'key': value}
		 | ....^
	    ERROR: <input>:1:24: unsupported syntax '?'
		 | Msg{?field: value} && {?'key': value}
		 | .......................^`,
  },
  // { // TODO
  // 	I: `noop_macro(123)`,
  // 	Opts: []Option{
  // 		Macros(NewGlobalVarArgMacro("noop_macro",
  // 			func(eh ExprHelper, target ast.Expr, args []ast.Expr) (ast.Expr, *common.Error) {
  // 				return nil, nil
  // 			})),
  // 	},
  // 	P: `noop_macro(
  // 		123^#2:*expr.Constant_Int64Value#
  // 	  )^#1:*expr.Expr_CallExpr#`,
  // },
  // { // TODO
  // 	I: `x{?.`,
  // 	Opts: []Option{
  // 		ErrorRecoveryLookaheadTokenLimit(10),
  // 		ErrorRecoveryLimit(10),
  // 	},
  // 	E: `
  // 	ERROR: <input>:1:3: unsupported syntax '?'
  // 	 | x{?.
  // 	 | ..^
  //     ERROR: <input>:1:4: Syntax error: mismatched input '.' expecting IDENTIFIER
  // 	 | x{?.
  // 	 | ...^`,
  // },
  {
    I: `x{.`,
    E: `ERROR: <input>:1:3: Syntax error: mismatched input '.' expecting {'}', ',', '?', IDENTIFIER}
		 | x{.
		 | ..^`,
  },
  // { // TODO
  // 	I:    `'3# < 10" '& tru ^^`,
  // 	Opts: []Option{ErrorReportingLimit(2)},
  // 	E: `
  // 	ERROR: <input>:1:12: Syntax error: token recognition error at: '& '
  // 	 | '3# < 10" '& tru ^^
  // 	 | ...........^
  // 	ERROR: <input>:1:18: Syntax error: token recognition error at: '^'
  // 	 | '3# < 10" '& tru ^^
  // 	 | .................^
  // 	ERROR: <input>:1:19: Syntax error: More than 2 syntax errors
  // 	 | '3# < 10" '& tru ^^
  // 	 | ..................^
  // 	`,
  // },
];

describe('CELVisitor', () => {
  for (const testCase of testCases) {
    it(`should parse ${testCase.I}`, () => {
      // Arrange
      const parser = new CELParser(
        testCase.I,
        testCase.Opts ?? { maxRecursionDepth: 32 }
      );

      // Act
      const expr = parser.parse();

      // Assert
      if (testCase.P) {
        expect(expr.expr).toEqual(testCase.P);
      }
      if (testCase.L) {
        const positions = expr.sourceInfo?.positions;
        if (isNil(positions)) {
          throw new Error(`Invalid test case: ${testCase.I}`);
        }
        const output: Record<string, Location> = {};
        for (const key of Object.keys(positions)) {
          output[key] = parser.getLocationForId(key);
        }
        expect(output).toEqual(testCase.L);
      }
      if (testCase.M) {
        expect(expr.expr).toEqual(testCase.M);
      }
      if (testCase.E) {
        expect(parser.errors.toDisplayString()).toEqual(
          // Account for the difference in spacing between the test case and
          // the error message
          testCase.E.split('\n')
            .map((line) => line.trim())
            .join('\n ')
        );
      }
    });
  }
});
