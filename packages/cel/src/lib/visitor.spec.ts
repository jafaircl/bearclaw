/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Expr,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create, toJsonString } from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';
import { CELEnvironment } from './environment';
import { CELProgram } from './program';

interface TestInfo {
  // I contains the input expression to be parsed.
  I: string;

  // P contains the expected Expr output for the parsed expression.
  P?: Expr | any;

  // E contains the expected error output for a failed parse, or "" if the parse is expected to be successful.
  E?: string;

  // L contains the expected source adorned debug output of the expression tree.
  L?: string;

  // M contains the expected adorned debug output of the macro calls map
  M?: Expr | any;

  // Opts contains the list of options to be configured with the parser before parsing the expression.
  Opts?: unknown[];
}

// See: https://github.com/google/cel-go/blob/master/parser/parser_test.go
const testCases: TestInfo[] = [
  {
    I: `"A"`,
    // P: `"A"^#1:*expr.Constant_StringValue#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'stringValue',
            value: 'A',
          },
        },
      },
    }),
  },
  {
    I: `true`,
    // P: `true^#1:*expr.Constant_BoolValue#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'boolValue',
            value: true,
          },
        },
      },
    }),
  },
  {
    I: `false`,
    // P: `false^#1:*expr.Constant_BoolValue#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'boolValue',
            value: false,
          },
        },
      },
    }),
  },
  {
    I: `0`,
    // P: `0^#1:*expr.Constant_Int64Value#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'int64Value',
            value: BigInt(0),
          },
        },
      },
    }),
  },
  {
    I: `42`,
    // P: `42^#1:*expr.Constant_Int64Value#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'int64Value',
            value: BigInt(42),
          },
        },
      },
    }),
  },
  {
    I: `0xF`,
    // P: `15^#1:*expr.Constant_Int64Value#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'int64Value',
            value: BigInt(15),
          },
        },
      },
    }),
  },
  {
    I: `0u`,
    // P: `0u^#1:*expr.Constant_Uint64Value#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'uint64Value',
            value: BigInt(0),
          },
        },
      },
    }),
  },
  {
    I: `23u`,
    // P: `23u^#1:*expr.Constant_Uint64Value#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'uint64Value',
            value: BigInt(23),
          },
        },
      },
    }),
  },
  {
    I: `24u`,
    // P: `24u^#1:*expr.Constant_Uint64Value#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'uint64Value',
            value: BigInt(24),
          },
        },
      },
    }),
  },
  {
    I: `0xFu`,
    // P: `15u^#1:*expr.Constant_Uint64Value#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'uint64Value',
            value: BigInt(15),
          },
        },
      },
    }),
  },
  {
    I: `-1`,
    // P: `-1^#1:*expr.Constant_Int64Value#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'int64Value',
            value: BigInt(-1),
          },
        },
      },
    }),
  },
  {
    I: `4--4`,
    // P: `_-_(
    // 	4^#1:*expr.Constant_Int64Value#,
    // 	-4^#3:*expr.Constant_Int64Value#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_-_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'constExpr',
                value: {
                  constantKind: {
                    case: 'int64Value',
                    value: BigInt(4),
                  },
                },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'constExpr',
                value: {
                  constantKind: {
                    case: 'int64Value',
                    value: BigInt(-4),
                  },
                },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `4--4.1`,
    // P: `_-_(
    // 	4^#1:*expr.Constant_Int64Value#,
    // 	-4.1^#3:*expr.Constant_DoubleValue#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_-_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'constExpr',
                value: {
                  constantKind: {
                    case: 'int64Value',
                    value: BigInt(4),
                  },
                },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'constExpr',
                value: {
                  constantKind: {
                    case: 'doubleValue',
                    value: -4.1,
                  },
                },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `b"abc"`,
    // P: `b"abc"^#1:*expr.Constant_BytesValue#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'bytesValue',
            value: new TextEncoder().encode('abc'),
          },
        },
      },
    }),
  },
  {
    I: '23.39',
    // P: `23.39^#1:*expr.Constant_DoubleValue#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'doubleValue',
            value: 23.39,
          },
        },
      },
    }),
  },
  {
    I: `!a`,
    // P: `!_(
    // 	a^#2:*expr.Expr_IdentExpr#
    // )^#1:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '!_',
          args: [
            {
              id: BigInt(2),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: 'null',
    // P: `null^#1:*expr.Constant_NullValue#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'nullValue',
            value: NullValue.NULL_VALUE,
          },
        },
      },
    }),
  },
  {
    I: `a`,
    // P: `a^#1:*expr.Expr_IdentExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'identExpr',
        value: { name: 'a' },
      },
    }),
  },
  {
    I: `a?b:c`,
    // P: `_?_:_(
    // 	a^#1:*expr.Expr_IdentExpr#,
    // 	b^#3:*expr.Expr_IdentExpr#,
    // 	c^#4:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_?_:_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
            {
              id: BigInt(4),
              exprKind: {
                case: 'identExpr',
                value: { name: 'c' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a || b`,
    // P: `_||_(
    // 		  a^#1:*expr.Expr_IdentExpr#,
    // 		  b^#2:*expr.Expr_IdentExpr#
    // 	)^#3:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(3),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_||_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(2),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
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
    P: create(ExprSchema, {
      id: BigInt(7),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_||_',
          args: [
            {
              id: BigInt(5),
              exprKind: {
                case: 'callExpr',
                value: {
                  function: '_||_',
                  args: [
                    {
                      id: BigInt(3),
                      exprKind: {
                        case: 'callExpr',
                        value: {
                          function: '_||_',
                          args: [
                            {
                              id: BigInt(1),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'a' },
                              },
                            },
                            {
                              id: BigInt(2),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'b' },
                              },
                            },
                          ],
                        },
                      },
                    },
                    {
                      id: BigInt(4),
                      exprKind: {
                        case: 'identExpr',
                        value: { name: 'c' },
                      },
                    },
                  ],
                },
              },
            },
            {
              id: BigInt(11),
              exprKind: {
                case: 'callExpr',
                value: {
                  function: '_||_',
                  args: [
                    {
                      id: BigInt(9),
                      exprKind: {
                        case: 'callExpr',
                        value: {
                          function: '_||_',
                          args: [
                            {
                              id: BigInt(6),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'd' },
                              },
                            },
                            {
                              id: BigInt(8),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'e' },
                              },
                            },
                          ],
                        },
                      },
                    },
                    {
                      id: BigInt(10),
                      exprKind: {
                        case: 'identExpr',
                        value: { name: 'f' },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a && b`,
    // P: `_&&_(
    // 		  a^#1:*expr.Expr_IdentExpr#,
    // 		  b^#2:*expr.Expr_IdentExpr#
    // 	)^#3:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(3),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_&&_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(2),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
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
    P: create(ExprSchema, {
      id: BigInt(9),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_&&_',
          args: [
            {
              id: BigInt(5),
              exprKind: {
                case: 'callExpr',
                value: {
                  function: '_&&_',
                  args: [
                    {
                      id: BigInt(3),
                      exprKind: {
                        case: 'callExpr',
                        value: {
                          function: '_&&_',
                          args: [
                            {
                              id: BigInt(1),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'a' },
                              },
                            },
                            {
                              id: BigInt(2),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'b' },
                              },
                            },
                          ],
                        },
                      },
                    },
                    {
                      id: BigInt(7),
                      exprKind: {
                        case: 'callExpr',
                        value: {
                          function: '_&&_',
                          args: [
                            {
                              id: BigInt(4),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'c' },
                              },
                            },
                            {
                              id: BigInt(6),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'd' },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              id: BigInt(13),
              exprKind: {
                case: 'callExpr',
                value: {
                  function: '_&&_',
                  args: [
                    {
                      id: BigInt(11),
                      exprKind: {
                        case: 'callExpr',
                        value: {
                          function: '_&&_',
                          args: [
                            {
                              id: BigInt(8),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'e' },
                              },
                            },
                            {
                              id: BigInt(10),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'f' },
                              },
                            },
                          ],
                        },
                      },
                    },
                    {
                      id: BigInt(12),
                      exprKind: {
                        case: 'identExpr',
                        value: { name: 'g' },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
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
    P: create(ExprSchema, {
      id: BigInt(15),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_||_',
          args: [
            {
              id: BigInt(5),
              exprKind: {
                case: 'callExpr',
                value: {
                  function: '_&&_',
                  args: [
                    {
                      id: BigInt(3),
                      exprKind: {
                        case: 'callExpr',
                        value: {
                          function: '_&&_',
                          args: [
                            {
                              id: BigInt(1),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'a' },
                              },
                            },
                            {
                              id: BigInt(2),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'b' },
                              },
                            },
                          ],
                        },
                      },
                    },
                    {
                      id: BigInt(7),
                      exprKind: {
                        case: 'callExpr',
                        value: {
                          function: '_&&_',
                          args: [
                            {
                              id: BigInt(4),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'c' },
                              },
                            },
                            {
                              id: BigInt(6),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'd' },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              id: BigInt(12),
              exprKind: {
                case: 'callExpr',
                value: {
                  function: '_&&_',
                  args: [
                    {
                      id: BigInt(10),
                      exprKind: {
                        case: 'callExpr',
                        value: {
                          function: '_&&_',
                          args: [
                            {
                              id: BigInt(8),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'e' },
                              },
                            },
                            {
                              id: BigInt(9),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'f' },
                              },
                            },
                          ],
                        },
                      },
                    },
                    {
                      id: BigInt(14),
                      exprKind: {
                        case: 'callExpr',
                        value: {
                          function: '_&&_',
                          args: [
                            {
                              id: BigInt(11),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'g' },
                              },
                            },
                            {
                              id: BigInt(13),
                              exprKind: {
                                case: 'identExpr',
                                value: { name: 'h' },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a + b`,
    // P: `_+_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_+_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a - b`,
    // P: `_-_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_-_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a * b`,
    // P: `_*_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_*_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a / b`,
    // P: `_/_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_/_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a % b`,
    // P: `_%_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_%_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a in b`,
    // P: `@in(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '@in',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a == b`,
    // P: `_==_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_==_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a != b`,
    // P: ` _!=_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_!=_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a > b`,
    // P: `_>_(
    //     a^#1:*expr.Expr_IdentExpr#,
    //     b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_>_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a >= b`,
    // P: `_>=_(
    //       a^#1:*expr.Expr_IdentExpr#,
    //       b^#3:*expr.Expr_IdentExpr#
    //     )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_>=_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a < b`,
    // P: `_<_(
    //       a^#1:*expr.Expr_IdentExpr#,
    //       b^#3:*expr.Expr_IdentExpr#
    //     )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_<_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a <= b`,
    // P: `_<=_(
    //       a^#1:*expr.Expr_IdentExpr#,
    //       b^#3:*expr.Expr_IdentExpr#
    //     )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_<=_',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a.b`,
    // P: `a^#1:*expr.Expr_IdentExpr#.b^#2:*expr.Expr_SelectExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'selectExpr',
        value: {
          operand: {
            id: BigInt(1),
            exprKind: {
              case: 'identExpr',
              value: { name: 'a' },
            },
          },
          field: 'b',
        },
      },
    }),
  },
  {
    I: `a.b.c`,
    // P: `a^#1:*expr.Expr_IdentExpr#.b^#2:*expr.Expr_SelectExpr#.c^#3:*expr.Expr_SelectExpr#`,
    P: create(ExprSchema, {
      id: BigInt(3),
      exprKind: {
        case: 'selectExpr',
        value: {
          operand: {
            id: BigInt(2),
            exprKind: {
              case: 'selectExpr',
              value: {
                operand: {
                  id: BigInt(1),
                  exprKind: {
                    case: 'identExpr',
                    value: { name: 'a' },
                  },
                },
                field: 'b',
              },
            },
          },
          field: 'c',
        },
      },
    }),
  },
  {
    I: `a[b]`,
    // P: `_[_](
    // 	a^#1:*expr.Expr_IdentExpr#,
    // 	b^#3:*expr.Expr_IdentExpr#
    // )^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: '_[_]',
          args: [
            {
              id: BigInt(1),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `foo{ }`,
    // P: `foo{}^#1:*expr.Expr_StructExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'structExpr',
        value: {
          messageName: 'foo',
          entries: [],
        },
      },
    }),
  },
  {
    I: `foo{ a:b }`,
    // P: `foo{
    // 	a:b^#3:*expr.Expr_IdentExpr#^#2:*expr.Expr_CreateStruct_Entry#
    // }^#1:*expr.Expr_StructExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'structExpr',
        value: {
          messageName: 'foo',
          entries: [
            {
              id: BigInt(2),
              keyKind: {
                case: 'fieldKey',
                value: 'a',
              },
              value: {
                id: BigInt(3),
                exprKind: {
                  case: 'identExpr',
                  value: { name: 'b' },
                },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `foo{ a:b, c:d }`,
    // P: `foo{
    // 	a:b^#3:*expr.Expr_IdentExpr#^#2:*expr.Expr_CreateStruct_Entry#,
    // 	c:d^#5:*expr.Expr_IdentExpr#^#4:*expr.Expr_CreateStruct_Entry#
    // }^#1:*expr.Expr_StructExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'structExpr',
        value: {
          messageName: 'foo',
          entries: [
            {
              id: BigInt(2),
              keyKind: {
                case: 'fieldKey',
                value: 'a',
              },
              value: {
                id: BigInt(3),
                exprKind: {
                  case: 'identExpr',
                  value: { name: 'b' },
                },
              },
            },
            {
              id: BigInt(4),
              keyKind: {
                case: 'fieldKey',
                value: 'c',
              },
              value: {
                id: BigInt(5),
                exprKind: {
                  case: 'identExpr',
                  value: { name: 'd' },
                },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `{}`,
    // P: `{}^#1:*expr.Expr_StructExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'structExpr',
        value: {
          messageName: '',
          entries: [],
        },
      },
    }),
  },
  {
    I: `{a:b, c:d}`,
    // P: `{
    // 	a^#3:*expr.Expr_IdentExpr#:b^#4:*expr.Expr_IdentExpr#^#2:*expr.Expr_CreateStruct_Entry#,
    // 	c^#6:*expr.Expr_IdentExpr#:d^#7:*expr.Expr_IdentExpr#^#5:*expr.Expr_CreateStruct_Entry#
    // }^#1:*expr.Expr_StructExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'structExpr',
        value: {
          messageName: '',
          entries: [
            {
              id: BigInt(2),
              keyKind: {
                case: 'mapKey',
                value: {
                  id: BigInt(3),
                  exprKind: {
                    case: 'identExpr',
                    value: { name: 'a' },
                  },
                },
              },
              value: {
                id: BigInt(4),
                exprKind: {
                  case: 'identExpr',
                  value: { name: 'b' },
                },
              },
            },
            {
              id: BigInt(5),
              keyKind: {
                case: 'mapKey',
                value: {
                  id: BigInt(6),
                  exprKind: {
                    case: 'identExpr',
                    value: { name: 'c' },
                  },
                },
              },
              value: {
                id: BigInt(7),
                exprKind: {
                  case: 'identExpr',
                  value: { name: 'd' },
                },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `[]`,
    // P: `[]^#1:*expr.Expr_ListExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'listExpr',
        value: {
          elements: [],
        },
      },
    }),
  },
  {
    I: `[a]`,
    // P: `[
    // 	a^#2:*expr.Expr_IdentExpr#
    // ]^#1:*expr.Expr_ListExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'listExpr',
        value: {
          elements: [
            {
              id: BigInt(2),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `[a, b, c]`,
    // P: `[
    // 	a^#2:*expr.Expr_IdentExpr#,
    // 	b^#3:*expr.Expr_IdentExpr#,
    // 	c^#4:*expr.Expr_IdentExpr#
    // ]^#1:*expr.Expr_ListExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'listExpr',
        value: {
          elements: [
            {
              id: BigInt(2),
              exprKind: {
                case: 'identExpr',
                value: { name: 'a' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
            {
              id: BigInt(4),
              exprKind: {
                case: 'identExpr',
                value: { name: 'c' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `(a)`,
    // P: `a^#1:*expr.Expr_IdentExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'identExpr',
        value: { name: 'a' },
      },
    }),
  },
  {
    I: `((a))`,
    // P: `a^#1:*expr.Expr_IdentExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'identExpr',
        value: { name: 'a' },
      },
    }),
  },
  {
    I: `a()`,
    // P: `a()^#1:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'callExpr',
        value: {
          function: 'a',
          args: [],
        },
      },
    }),
  },
  {
    I: `a(b)`,
    // P: `a(
    // 	b^#2:*expr.Expr_IdentExpr#
    // )^#1:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'callExpr',
        value: {
          function: 'a',
          args: [
            {
              id: BigInt(2),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a(b, c)`,
    // P: `a(
    // 	b^#2:*expr.Expr_IdentExpr#,
    // 	c^#3:*expr.Expr_IdentExpr#
    // )^#1:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(1),
      exprKind: {
        case: 'callExpr',
        value: {
          function: 'a',
          args: [
            {
              id: BigInt(2),
              exprKind: {
                case: 'identExpr',
                value: { name: 'b' },
              },
            },
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'c' },
              },
            },
          ],
        },
      },
    }),
  },
  {
    I: `a.b()`,
    // P: `a^#1:*expr.Expr_IdentExpr#.b()^#2:*expr.Expr_CallExpr#`,
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: 'b',
          target: {
            id: BigInt(1),
            exprKind: {
              case: 'identExpr',
              value: { name: 'a' },
            },
          },
          args: [],
        },
      },
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
    P: create(ExprSchema, {
      id: BigInt(2),
      exprKind: {
        case: 'callExpr',
        value: {
          function: 'b',
          target: {
            id: BigInt(1),
            exprKind: {
              case: 'identExpr',
              value: { name: 'a' },
            },
          },
          args: [
            {
              id: BigInt(3),
              exprKind: {
                case: 'identExpr',
                value: { name: 'c' },
              },
            },
          ],
        },
      },
    }),
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
  // {
  // 	I: `a | b`,
  // 	E: `ERROR: <input>:1:3: Syntax error: token recognition error at: '| '
  // 	| a | b
  // 	| ..^
  // 	ERROR: <input>:1:5: Syntax error: extraneous input 'b' expecting <EOF>
  // 	| a | b
  // 	| ....^`,
  // },
  // Macro tests
  {
    I: `has(m.f)`,
    // P: `m^#2:*expr.Expr_IdentExpr#.f~test-only~^#4:*expr.Expr_SelectExpr#`,
    // L: `m^#2[1,4]#.f~test-only~^#4[1,3]#`,
    // M: `has(
    // 	m^#2:*expr.Expr_IdentExpr#.f^#3:*expr.Expr_SelectExpr#
    //   )^#4:has#`,
    P: create(ExprSchema, {
      id: BigInt(4),
      exprKind: {
        case: 'selectExpr',
        value: {
          field: 'f',
          operand: {
            id: BigInt(2),
            exprKind: {
              case: 'identExpr',
              value: { name: 'm' },
            },
          },
          testOnly: true,
        },
      },
    }),
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
    P: create(ExprSchema, {
      id: BigInt(12),
      exprKind: {
        case: 'comprehensionExpr',
        value: {
          accuInit: {
            id: BigInt(5),
            exprKind: {
              case: 'constExpr',
              value: {
                constantKind: {
                  case: 'boolValue',
                  value: false,
                },
              },
            },
          },
          accuVar: '__result__',
          iterRange: {
            id: BigInt(1),
            exprKind: {
              case: 'identExpr',
              value: { name: 'm' },
            },
          },
          iterVar: 'v',
          iterVar2: '',
          loopCondition: {
            id: BigInt(8),
            exprKind: {
              case: 'callExpr',
              value: {
                function: '@not_strictly_false',
                args: [
                  {
                    id: BigInt(7),
                    exprKind: {
                      case: 'callExpr',
                      value: {
                        function: '!_',
                        args: [
                          {
                            id: BigInt(6),
                            exprKind: {
                              case: 'identExpr',
                              value: { name: '__result__' },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
          loopStep: {
            id: BigInt(10),
            exprKind: {
              case: 'callExpr',
              value: {
                function: '_||_',
                args: [
                  {
                    id: BigInt(9),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: '__result__' },
                    },
                  },
                  {
                    id: BigInt(4),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: 'f' },
                    },
                  },
                ],
              },
            },
          },
          result: {
            id: BigInt(11),
            exprKind: {
              case: 'identExpr',
              value: { name: '__result__' },
            },
          },
        },
      },
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
    P: create(ExprSchema, {
      id: BigInt(11),
      exprKind: {
        case: 'comprehensionExpr',
        value: {
          accuInit: {
            id: BigInt(5),
            exprKind: {
              case: 'constExpr',
              value: {
                constantKind: {
                  case: 'boolValue',
                  value: true,
                },
              },
            },
          },
          accuVar: '__result__',
          iterRange: {
            id: BigInt(1),
            exprKind: {
              case: 'identExpr',
              value: { name: 'm' },
            },
          },
          iterVar: 'v',
          iterVar2: '',
          loopCondition: {
            id: BigInt(7),
            exprKind: {
              case: 'callExpr',
              value: {
                function: '@not_strictly_false',
                args: [
                  {
                    id: BigInt(6),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: '__result__' },
                    },
                  },
                ],
              },
            },
          },
          loopStep: {
            id: BigInt(9),
            exprKind: {
              case: 'callExpr',
              value: {
                function: '_&&_',
                args: [
                  {
                    id: BigInt(8),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: '__result__' },
                    },
                  },
                  {
                    id: BigInt(4),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: 'f' },
                    },
                  },
                ],
              },
            },
          },
          result: {
            id: BigInt(10),
            exprKind: {
              case: 'identExpr',
              value: { name: '__result__' },
            },
          },
        },
      },
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
    P: create(ExprSchema, {
      id: BigInt(15),
      exprKind: {
        case: 'comprehensionExpr',
        value: {
          accuInit: {
            id: BigInt(5),
            exprKind: {
              case: 'constExpr',
              value: {
                constantKind: {
                  case: 'int64Value',
                  value: BigInt(0),
                },
              },
            },
          },
          accuVar: '__result__',
          iterRange: {
            id: BigInt(1),
            exprKind: {
              case: 'identExpr',
              value: { name: 'm' },
            },
          },
          iterVar: 'v',
          iterVar2: '',
          loopCondition: {
            id: BigInt(6),
            exprKind: {
              case: 'constExpr',
              value: {
                constantKind: {
                  case: 'boolValue',
                  value: true,
                },
              },
            },
          },
          loopStep: {
            id: BigInt(11),
            exprKind: {
              case: 'callExpr',
              value: {
                function: '_?_:_',
                args: [
                  {
                    id: BigInt(4),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: 'f' },
                    },
                  },
                  {
                    id: BigInt(9),
                    exprKind: {
                      case: 'callExpr',
                      value: {
                        function: '_+_',
                        args: [
                          {
                            id: BigInt(7),
                            exprKind: {
                              case: 'identExpr',
                              value: { name: '__result__' },
                            },
                          },
                          {
                            id: BigInt(8),
                            exprKind: {
                              case: 'constExpr',
                              value: {
                                constantKind: {
                                  case: 'int64Value',
                                  value: BigInt(1),
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    id: BigInt(10),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: '__result__' },
                    },
                  },
                ],
              },
            },
          },
          result: {
            id: BigInt(14),
            exprKind: {
              case: 'callExpr',
              value: {
                function: '_==_',
                args: [
                  {
                    id: BigInt(12),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: '__result__' },
                    },
                  },
                  {
                    id: BigInt(13),
                    exprKind: {
                      case: 'constExpr',
                      value: {
                        constantKind: {
                          case: 'int64Value',
                          value: BigInt(1),
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
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
    P: create(ExprSchema, {
      id: BigInt(11),
      exprKind: {
        case: 'comprehensionExpr',
        value: {
          accuInit: {
            id: BigInt(5),
            exprKind: {
              case: 'listExpr',
              value: {
                elements: [],
              },
            },
          },
          accuVar: '__result__',
          iterRange: {
            id: BigInt(1),
            exprKind: {
              case: 'identExpr',
              value: { name: 'm' },
            },
          },
          iterVar: 'v',
          iterVar2: '',
          loopCondition: {
            id: BigInt(6),
            exprKind: {
              case: 'constExpr',
              value: {
                constantKind: {
                  case: 'boolValue',
                  value: true,
                },
              },
            },
          },
          loopStep: {
            id: BigInt(9),
            exprKind: {
              case: 'callExpr',
              value: {
                function: '_+_',
                args: [
                  {
                    id: BigInt(7),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: '__result__' },
                    },
                  },
                  {
                    id: BigInt(8),
                    exprKind: {
                      case: 'listExpr',
                      value: {
                        elements: [
                          {
                            id: BigInt(4),
                            exprKind: {
                              case: 'identExpr',
                              value: { name: 'f' },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
          result: {
            id: BigInt(10),
            exprKind: {
              case: 'identExpr',
              value: { name: '__result__' },
            },
          },
        },
      },
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
    P: create(ExprSchema, {
      id: BigInt(14),
      exprKind: {
        case: 'comprehensionExpr',
        value: {
          accuInit: {
            id: BigInt(6),
            exprKind: {
              case: 'listExpr',
              value: {
                elements: [],
              },
            },
          },
          accuVar: '__result__',
          iterRange: {
            id: BigInt(1),
            exprKind: {
              case: 'identExpr',
              value: { name: 'm' },
            },
          },
          iterVar: 'v',
          iterVar2: '',
          loopCondition: {
            id: BigInt(7),
            exprKind: {
              case: 'constExpr',
              value: {
                constantKind: {
                  case: 'boolValue',
                  value: true,
                },
              },
            },
          },
          loopStep: {
            id: BigInt(12),
            exprKind: {
              case: 'callExpr',
              value: {
                function: '_?_:_',
                args: [
                  {
                    id: BigInt(4),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: 'p' },
                    },
                  },
                  {
                    id: BigInt(10),
                    exprKind: {
                      case: 'callExpr',
                      value: {
                        function: '_+_',
                        args: [
                          {
                            id: BigInt(8),
                            exprKind: {
                              case: 'identExpr',
                              value: { name: '__result__' },
                            },
                          },
                          {
                            id: BigInt(9),
                            exprKind: {
                              case: 'listExpr',
                              value: {
                                elements: [
                                  {
                                    id: BigInt(5),
                                    exprKind: {
                                      case: 'identExpr',
                                      value: { name: 'f' },
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    id: BigInt(11),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: '__result__' },
                    },
                  },
                ],
              },
            },
          },
          result: {
            id: BigInt(13),
            exprKind: {
              case: 'identExpr',
              value: { name: '__result__' },
            },
          },
        },
      },
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
    P: create(ExprSchema, {
      id: BigInt(13),
      exprKind: {
        case: 'comprehensionExpr',
        value: {
          accuInit: {
            id: BigInt(5),
            exprKind: {
              case: 'listExpr',
              value: {
                elements: [],
              },
            },
          },
          accuVar: '__result__',
          iterRange: {
            id: BigInt(1),
            exprKind: {
              case: 'identExpr',
              value: { name: 'm' },
            },
          },
          iterVar: 'v',
          iterVar2: '',
          loopCondition: {
            id: BigInt(6),
            exprKind: {
              case: 'constExpr',
              value: {
                constantKind: {
                  case: 'boolValue',
                  value: true,
                },
              },
            },
          },
          loopStep: {
            id: BigInt(11),
            exprKind: {
              case: 'callExpr',
              value: {
                function: '_?_:_',
                args: [
                  {
                    id: BigInt(4),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: 'p' },
                    },
                  },
                  {
                    id: BigInt(9),
                    exprKind: {
                      case: 'callExpr',
                      value: {
                        function: '_+_',
                        args: [
                          {
                            id: BigInt(7),
                            exprKind: {
                              case: 'identExpr',
                              value: { name: '__result__' },
                            },
                          },
                          {
                            id: BigInt(8),
                            exprKind: {
                              case: 'listExpr',
                              value: {
                                elements: [
                                  {
                                    id: BigInt(3),
                                    exprKind: {
                                      case: 'identExpr',
                                      value: { name: 'v' },
                                    },
                                  },
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    id: BigInt(10),
                    exprKind: {
                      case: 'identExpr',
                      value: { name: '__result__' },
                    },
                  },
                ],
              },
            },
          },
          result: {
            id: BigInt(12),
            exprKind: {
              case: 'identExpr',
              value: { name: '__result__' },
            },
          },
        },
      },
    }),
  },
];

describe('CELVisitor', () => {
  for (const testCase of testCases) {
    it(`should parse ${testCase.I}`, () => {
      // Arrange
      const env = new CELEnvironment();
      const ast = env.compile(testCase.I);
      const program = new CELProgram(env, ast);

      // Act
      const expr = program.parse();

      // Assert
      if (testCase.P) {
        try {
          expect(expr).toEqual(testCase.P);
        } catch (e) {
          // Log the tree and expression for debugging
          console.log(env.astAsString(testCase.I));
          console.log(toJsonString(ExprSchema, expr, { prettySpaces: 2 }));
          throw e;
        }
      } else if (testCase.M) {
        try {
          expect(expr).toEqual(testCase.M);
        } catch (e) {
          // Log the tree and expression for debugging
          console.log(env.astAsString(testCase.I));
          console.log(toJsonString(ExprSchema, expr, { prettySpaces: 2 }));
          throw e;
        }
      } else if (testCase.E) {
        try {
          expect(program.errors().errors).toContain(testCase.E);
        } catch (e) {
          // Log the tree and expression for debugging
          console.log(env.astAsString(testCase.I));
          console.log(toJsonString(ExprSchema, expr, { prettySpaces: 2 }));
          throw e;
        }
      } else {
        throw new Error('Invalid test case');
      }
    });
  }
});