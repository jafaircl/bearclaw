/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Expr,
  ExprSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
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
  M?: string;

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
      expect(expr).toEqual(testCase.P);
    });
  }
});
