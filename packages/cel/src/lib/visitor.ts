/* eslint-disable @typescript-eslint/no-unused-vars */
import { assert, isNil } from '@bearclaw/is';
import { ErrorSetSchema } from '@buf/google_cel-spec.bufbuild_es/cel/expr/eval_pb.js';
import {
  ConstantSchema,
  Expr,
  ExprSchema,
  Expr_CreateStruct,
  Expr_CreateStruct_Entry,
  Expr_CreateStruct_EntrySchema,
  SourceInfoSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import {
  Status,
  StatusSchema,
} from '@buf/googleapis_googleapis.bufbuild_es/google/rpc/status_pb.js';
import { create, fromJson } from '@bufbuild/protobuf';
import { NullValue, StringValueSchema, anyPack } from '@bufbuild/protobuf/wkt';
import { ParseTree, ParserRuleContext, Token } from 'antlr4';
import {
  RESERVED_IDS,
  parseBytesConstant,
  parseDoubleConstant,
  parseIntConstant,
  parseStringConstant,
  parseUintConstant,
} from './constants';
import { CELEnvironment } from './environment';
import { NullException, ParseException } from './exceptions';
import {
  BoolFalseContext,
  BoolTrueContext,
  BytesContext,
  CalcContext,
  ConditionalAndContext,
  ConditionalOrContext,
  ConstantLiteralContext,
  CreateListContext,
  CreateMessageContext,
  CreateStructContext,
  DoubleContext,
  ExprContext,
  ExprListContext,
  FieldInitializerListContext,
  IdentOrGlobalCallContext,
  IndexContext,
  IntContext,
  ListInitContext,
  LogicalNotContext,
  MapInitializerListContext,
  MemberCallContext,
  MemberExprContext,
  NegateContext,
  NestedContext,
  NullContext,
  PrimaryExprContext,
  RelationContext,
  SelectContext,
  StartContext,
  StringContext,
  UintContext,
} from './gen/CELParser';
import { default as GeneratedCelVisitor } from './gen/CELVisitor';
import { LogicManager } from './logic-manager';
import { expandMacro, findMacro } from './macros';
import {
  CONDITIONAL_OPERATOR,
  INDEX_OPERATOR,
  LOGICAL_AND_OPERATOR,
  LOGICAL_NOT_OPERATOR,
  LOGICAL_OR_OPERATOR,
  NEGATE_OPERATOR,
  OPT_INDEX_OPERATOR,
  OPT_SELECT_OPERATOR,
  getOperatorFromText,
} from './operators';
import { IdHelper } from './utils';

export class CELVisitor extends GeneratedCelVisitor<Expr> {
  #id = new IdHelper();
  #ERROR = create(ConstantSchema, {
    constantKind: {
      case: 'stringValue',
      value: '<<error>>',
    },
  });
  public readonly errors = create(ErrorSetSchema);

  constructor(
    public readonly env: CELEnvironment,
    private readonly options?: {
      enableOptionalSyntax?: boolean;
      retainRepeatedUnaryOperators?: boolean;
    }
  ) {
    super();
  }

  override visit = (ctx: ParseTree) => {
    return super.visit(this._unnest(ctx));
  };

  override visitStart = (ctx: StartContext): Expr => {
    this._checkNotNil(ctx);
    if (isNil(ctx._e)) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no expression context',
        })
      );
    }
    return this.visit(ctx._e);
  };

  override visitExpr = (ctx: ExprContext): Expr => {
    this._checkNotNil(ctx);
    if (isNil(ctx._e)) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no expression context',
        })
      );
    }
    if (!ctx._op) {
      return this.visit(ctx._e);
    }
    if (isNil(ctx._e1) || isNil(ctx._e2)) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no conditional context',
        })
      );
    }
    // If the expression is a ternary expression
    const condition = this.visit(ctx._e); // Visit the condition part
    const id = this.#id.nextId();
    const trueExpr = this.visit(ctx._e1); // Visit the true part
    const falseExpr = this.visit(ctx._e2); // Visit the false part
    // Handle the ternary expression, e.g., return condition ? trueExpr : falseExpr;
    return create(ExprSchema, {
      id,
      exprKind: {
        case: 'callExpr',
        value: {
          function: CONDITIONAL_OPERATOR,
          args: [condition, trueExpr, falseExpr],
        },
      },
    });
  };

  override visitConditionalOr = (ctx: ConditionalOrContext): Expr => {
    this._checkNotNil(ctx);
    if (isNil(ctx._e)) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no conditionalor context',
        })
      );
    }
    const result = this.visit(ctx._e);
    const logicManager = LogicManager.newBalancingLogicManager(
      LOGICAL_OR_OPERATOR,
      result
    );
    for (let i = 0; i < ctx._ops.length; i++) {
      if (isNil(ctx._e1) || i >= ctx._e1.length) {
        return this._reportError(ctx, "unexpected character, wanted '||'");
      }
      const term = this.visit(ctx._e1[i]);
      logicManager.addTerm(this.#id.nextId(), term);
    }
    return logicManager.toExpr();
  };

  override visitConditionalAnd = (ctx: ConditionalAndContext): Expr => {
    this._checkNotNil(ctx);
    if (isNil(ctx._e)) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no conditionaland context',
        })
      );
    }
    const result = this.visit(ctx._e);
    const logicManager = LogicManager.newBalancingLogicManager(
      LOGICAL_AND_OPERATOR,
      result
    );
    for (let i = 0; i < ctx._ops.length; i++) {
      if (isNil(ctx._e1) || i >= ctx._e1.length) {
        return this._reportError(ctx, "unexpected character, wanted '^^'");
      }
      const term = this.visit(ctx._e1[i]);
      logicManager.addTerm(this.#id.nextId(), term);
    }
    return logicManager.toExpr();
  };

  override visitRelation = (ctx: RelationContext): Expr => {
    this._checkNotNil(ctx);
    if (!isNil(ctx.calc())) {
      return this.visit(ctx.calc());
    }
    if (
      isNil(ctx.relation_list()) ||
      ctx.relation_list().length === 0 ||
      isNil(ctx._op)
    ) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no relation context',
        })
      );
    }
    const operator = getOperatorFromText(ctx._op.text);
    if (isNil(operator)) {
      return this._reportError(ctx, 'operator not found');
    }
    const left = this.visit(ctx.relation(0));
    const id = this.#id.nextId();
    const right = this.visit(ctx.relation(1));
    return create(ExprSchema, {
      id,
      exprKind: {
        case: 'callExpr',
        value: {
          function: operator,
          args: [left, right],
        },
      },
    });
  };

  override visitCalc = (ctx: CalcContext): Expr => {
    this._checkNotNil(ctx);
    if (!isNil(ctx.unary())) {
      return this.visit(ctx.unary());
    }
    if (
      isNil(ctx.calc_list()) ||
      ctx.calc_list().length === 0 ||
      isNil(ctx._op)
    ) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no calc context',
        })
      );
    }
    const operator = getOperatorFromText(ctx._op.text);
    if (isNil(operator)) {
      return this._reportError(ctx, 'operator not found');
    }
    const left = this.visit(ctx.calc(0));
    const id = this.#id.nextId();
    const right = this.visit(ctx.calc(1));
    return create(ExprSchema, {
      id,
      exprKind: {
        case: 'callExpr',
        value: {
          function: operator,
          args: [left, right],
        },
      },
    });
  };

  override visitMemberExpr = (ctx: MemberExprContext): Expr => {
    this._checkNotNil(ctx);
    if (isNil(ctx.member())) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no member expr context',
        })
      );
    }
    return this.visit(ctx.member());
  };

  override visitLogicalNot = (ctx: LogicalNotContext): Expr => {
    this._checkNotNil(ctx);
    if (isNil(ctx.member())) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no member expr context',
        })
      );
    }
    if (!isNil(ctx._ops) && ctx._ops.length % 2 === 0) {
      return this.visit(ctx.member());
    }
    const id = this.#id.nextId();
    const member = this.visit(ctx.member());
    return create(ExprSchema, {
      id,
      exprKind: {
        case: 'callExpr',
        value: {
          function: LOGICAL_NOT_OPERATOR,
          args: [member],
        },
      },
    });
  };

  override visitNegate = (ctx: NegateContext): Expr => {
    this._checkNotNil(ctx);
    if (isNil(ctx.member())) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no member context',
        })
      );
    }
    const expr = this.visit(ctx.member());
    if (isNil(ctx._ops) || ctx._ops.length % 2 === 0) {
      return expr;
    }
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'callExpr',
        value: {
          function: NEGATE_OPERATOR,
          args: [expr],
        },
      },
    });
  };

  override visitMemberCall = (ctx: MemberCallContext): Expr => {
    this._checkNotNil(ctx);
    const operand = this.visit(ctx.member());
    if (isNil(ctx._id)) {
      return create(ExprSchema, {
        id: this.#id.nextId(),
      });
    }
    const id = ctx._id.text;
    return this._receiverCallOrMacro(ctx, id, operand);
  };

  override visitSelect = (ctx: SelectContext): Expr => {
    this._checkNotNil(ctx);
    const operand = this.visit(ctx.member());
    // Handle the error case where no valid identifier is specified.
    if (isNil(ctx._id) || isNil(ctx._op)) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no valid identifier specified',
        })
      );
    }
    const id = ctx._id.text;
    const opId = this.#id.nextId();
    if (!isNil(ctx._opt)) {
      const literalString = create(ExprSchema, {
        id: opId,
        exprKind: {
          case: 'constExpr',
          value: {
            constantKind: {
              case: 'stringValue',
              value: id,
            },
          },
        },
      });
      return create(ExprSchema, {
        id: opId,
        exprKind: {
          case: 'callExpr',
          value: {
            function: OPT_SELECT_OPERATOR,
            args: [operand, literalString],
          },
        },
      });
    }
    return create(ExprSchema, {
      id: opId,
      exprKind: {
        case: 'selectExpr',
        value: {
          operand,
          field: id,
        },
      },
    });
  };

  override visitPrimaryExpr = (ctx: PrimaryExprContext): Expr => {
    this._checkNotNil(ctx);
    if (isNil(ctx.primary())) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no primary expr context',
        })
      );
    }
    return this.visit(ctx.primary());
  };

  override visitIndex = (ctx: IndexContext): Expr => {
    this._checkNotNil(ctx);
    if (isNil(ctx.member()) || isNil(ctx._index)) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no index context',
        })
      );
    }
    const target = this.visit(ctx.member());
    const id = this.#id.nextId();
    const index = this.visit(ctx._index);
    let operatorIndex = INDEX_OPERATOR;
    if (!isNil(ctx._op) && ctx._op.text === '?') {
      if (!this.options?.enableOptionalSyntax) {
        return this._reportError(ctx, "unsupported syntax '[?'");
      }
      operatorIndex = OPT_INDEX_OPERATOR;
    }
    return create(ExprSchema, {
      id,
      exprKind: {
        case: 'callExpr',
        value: {
          function: operatorIndex,
          args: [target, index],
        },
      },
    });
  };

  override visitIdentOrGlobalCall = (ctx: IdentOrGlobalCallContext): Expr => {
    this._checkNotNil(ctx);
    if (isNil(ctx._id)) {
      return this._reportError(ctx, 'no identifier context');
    }
    let id = ctx._id.text;
    if (RESERVED_IDS.has(id)) {
      return this._reportError(ctx, `reserved identifier: ${id}`);
    }
    if (!isNil(ctx._leadingDot)) {
      id = `.${id}`;
    }
    if (isNil(ctx._op)) {
      return create(ExprSchema, {
        id: this.#id.nextId(),
        exprKind: {
          case: 'identExpr',
          value: {
            name: id,
          },
        },
      });
    }
    return this._globalCallOrMacro(ctx, id);
  };

  //   override visitNested = (ctx: NestedContext): Expr => {
  //     // Implementation logic here
  //   };

  override visitCreateList = (ctx: CreateListContext): Expr => {
    this._checkNotNil(ctx);
    const listId = this.#id.nextId();
    let elements: Expr[] = [];
    let optionalIndices: number[] = [];
    if (!isNil(ctx._elems)) {
      const listInit = this.visit(ctx._elems);
      if (listInit.exprKind.case !== 'listExpr') {
        return this._ensureErrorsExist(
          create(StatusSchema, {
            code: 1,
            message: 'no list initializer',
          })
        );
      }
      elements = listInit.exprKind.value.elements;
      optionalIndices = listInit.exprKind.value.optionalIndices;
    }
    return create(ExprSchema, {
      id: listId,
      exprKind: {
        case: 'listExpr',
        value: {
          elements,
          optionalIndices,
        },
      },
    });
  };

  override visitCreateStruct = (ctx: CreateStructContext): Expr => {
    this._checkNotNil(ctx);
    const structId = this.#id.nextId();
    let entries: Expr_CreateStruct_Entry[] = [];
    if (!isNil(ctx._entries)) {
      const mapInit = this.visit(ctx._entries);
      if (mapInit.exprKind.case !== 'structExpr') {
        return this._ensureErrorsExist(
          create(StatusSchema, {
            code: 1,
            message: 'no struct initializer',
          })
        );
      }
      entries = mapInit.exprKind.value.entries;
    }
    return create(ExprSchema, {
      id: structId,
      exprKind: {
        case: 'structExpr',
        value: {
          entries,
        },
      },
    });
  };

  override visitCreateMessage = (ctx: CreateMessageContext): Expr => {
    this._checkNotNil(ctx);
    let messageName = '';
    for (const id of ctx._ids) {
      if (messageName.length !== 0) {
        messageName += '.';
      }
      messageName += id.text;
    }
    if (!isNil(ctx._leadingDot)) {
      messageName = `.${messageName}`;
    }
    const id = this.#id.nextId();
    let entries: Expr_CreateStruct_Entry[] = [];
    if (!isNil(ctx._entries)) {
      const initializer = this.visit(ctx._entries);
      const entriesInitializer = initializer.exprKind
        .value as Expr_CreateStruct;
      entries = entriesInitializer.entries;
    }
    return create(ExprSchema, {
      id,
      exprKind: {
        case: 'structExpr',
        value: {
          messageName,
          entries,
        },
      },
    });
  };

  override visitConstantLiteral = (ctx: ConstantLiteralContext): Expr => {
    this._checkNotNil(ctx);
    const expr = this.visit(ctx.literal());
    if (isNil(expr)) {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no literal context',
        })
      );
    }
    if (expr.exprKind.case !== 'constExpr') {
      return this._ensureErrorsExist(
        create(StatusSchema, {
          code: 1,
          message: 'no constant context',
        })
      );
    }
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'constExpr',
        value: expr.exprKind.value,
      },
    });
  };

  override visitExprList = (ctx: ExprListContext): Expr => {
    this._checkNotNil(ctx);
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'listExpr',
        value: {
          elements: this.visitSlice(ctx.expr_list()),
        },
      },
    });
  };

  override visitListInit = (ctx: ListInitContext): Expr => {
    this._checkNotNil(ctx);
    const elements = ctx._elems;
    const result: Expr[] = [];
    const optionals: number[] = [];
    for (let i = 0; i < elements.length; i++) {
      const ex = this.visit(elements[i]._e);
      if (isNil(ex)) {
        return create(ExprSchema, {
          id: this.#id.nextId(),
          exprKind: {
            case: 'listExpr',
            value: {
              elements: [],
              optionalIndices: [],
            },
          },
        });
      }
      result.push(ex);
      if (elements[i]._opt != null) {
        if (!this.options?.enableOptionalSyntax) {
          this._reportError(elements[i], "unsupported syntax '?'");
          continue;
        }
        optionals.push(i);
      }
    }
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'listExpr',
        value: {
          elements: result,
          optionalIndices: optionals,
        },
      },
    });
  };

  override visitFieldInitializerList = (
    ctx: FieldInitializerListContext
  ): Expr => {
    this._checkNotNil(ctx);
    const fields: Expr_CreateStruct_Entry[] = [];
    for (let i = 0; i < ctx._fields.length; i++) {
      if (i >= ctx._values.length || i >= ctx._fields.length) {
        return this._ensureErrorsExist(
          create(StatusSchema, {
            code: 1,
            message: 'no field initializer list',
          })
        );
      }
      const field = ctx._fields[i];
      const exprId = this.#id.nextId();
      const optionalEntry = !isNil(field._opt);
      const id = field.IDENTIFIER();
      if (isNil(id)) {
        return this._ensureErrorsExist(
          create(StatusSchema, {
            code: 1,
            message: 'no field identifier',
          })
        );
      }
      fields.push(
        create(Expr_CreateStruct_EntrySchema, {
          id: exprId,
          keyKind: {
            case: 'fieldKey',
            value: id.getText(),
          },
          value: this.visit(ctx._values[i]),
          optionalEntry,
        })
      );
    }
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'structExpr',
        value: {
          entries: fields,
        },
      },
    });
  };

  //   override visitOptField = (ctx: OptFieldContext): Expr => {
  //     // Implementation logic here
  //   };

  override visitMapInitializerList = (ctx: MapInitializerListContext): Expr => {
    this._checkNotNil(ctx);
    const fields: Expr_CreateStruct_Entry[] = [];
    for (let i = 0; i < ctx._cols.length; i++) {
      if (i >= ctx._values.length || i >= ctx._cols.length) {
        return this._ensureErrorsExist(
          create(StatusSchema, {
            code: 1,
            message: 'no field initializer list',
          })
        );
      }
      const colId = this.#id.nextId();
      const optKey = ctx._keys[i];
      const optionalKey = !isNil(optKey._opt);
      const key = this.visit(optKey._e);
      const value = this.visit(ctx._values[i]);
      fields.push(
        create(Expr_CreateStruct_EntrySchema, {
          id: colId,
          keyKind: {
            case: 'mapKey',
            value: key,
          },
          value,
          optionalEntry: optionalKey,
        })
      );
    }
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'structExpr',
        value: {
          entries: fields,
        },
      },
    });
  };

  //   override visitOptExpr = (ctx: OptExprContext): Expr => {
  //     // Implementation logic here
  //   };

  override visitInt = (ctx: IntContext): Expr => {
    this._checkNotNil(ctx);
    const constant = parseIntConstant(ctx.getText());
    // TODO: parse error handling
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  override visitUint = (ctx: UintContext): Expr => {
    this._checkNotNil(ctx);
    const constant = parseUintConstant(ctx.getText());
    // TODO: parse error handling
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  override visitDouble = (ctx: DoubleContext): Expr => {
    this._checkNotNil(ctx);
    const constant = parseDoubleConstant(ctx.getText());
    // TODO: parse error handling
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  override visitString = (ctx: StringContext): Expr => {
    this._checkNotNil(ctx);
    const constant = parseStringConstant(ctx.getText());
    // TODO: parse error handling
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  override visitBytes = (ctx: BytesContext): Expr => {
    this._checkNotNil(ctx);
    const constant = parseBytesConstant(ctx.getText());
    // TODO: parse error handling
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'constExpr',
        value: constant,
      },
    });
  };

  override visitBoolTrue = (ctx: BoolTrueContext): Expr => {
    this._checkNotNil(ctx);
    assert(ctx.getText() === 'true', new ParseException('true expected', 0));
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'boolValue',
            value: true,
          },
        },
      },
    });
  };

  override visitBoolFalse = (ctx: BoolFalseContext): Expr => {
    this._checkNotNil(ctx);
    assert(ctx.getText() === 'false', new ParseException('false expected', 0));
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'boolValue',
            value: false,
          },
        },
      },
    });
  };

  override visitNull = (ctx: NullContext): Expr => {
    this._checkNotNil(ctx);
    assert(ctx.getText() === 'null', new ParseException('null expected', 0));
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'nullValue',
            value: NullValue.NULL_VALUE,
          },
        },
      },
    });
  };

  visitSlice = (expressions: ExprContext[]): Expr[] => {
    if (isNil(expressions) || expressions.length === 0) {
      return [];
    }
    return expressions.map((e) => this.visit(e));
  };

  private _checkNotNil(value: unknown, message?: string): asserts value {
    if (isNil(value)) {
      throw new NullException(message || 'value is nil');
    }
  }

  private _ensureErrorsExist(status: Status) {
    this.errors.errors.push(status);
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'constExpr',
        value: this.#ERROR,
      },
    });
  }

  private _reportError(context: ParserRuleContext, message: string) {
    return this._ensureErrorsExist(
      create(StatusSchema, {
        code: 1,
        message,
        details: [
          anyPack(
            SourceInfoSchema,
            create(SourceInfoSchema, {
              location: `${context.start.line}:${context.start.column}`,
              // TODO: more info
            })
          ),
          anyPack(
            StringValueSchema,
            fromJson(StringValueSchema, this.env.astAsString(context.getText()))
          ),
        ],
      })
    );
  }

  private _unnest(tree: ParseTree) {
    while (tree != null) {
      if (tree instanceof ExprContext) {
        // conditionalOr op='?' conditionalOr : expr
        if (tree._op != null) {
          return tree;
        }
        // conditionalOr
        tree = tree._e;
      } else if (tree instanceof ConditionalOrContext) {
        // conditionalAnd (ops=|| conditionalAnd)*
        if (tree._ops != null && tree._ops.length > 0) {
          return tree;
        }
        // conditionalAnd
        tree = (tree as ConditionalOrContext)._e;
      } else if (tree instanceof ConditionalAndContext) {
        // relation (ops=&& relation)*
        if (tree._ops != null && tree._ops.length > -1) {
          return tree;
        }

        // relation
        tree = tree._e;
      } else if (tree instanceof RelationContext) {
        // relation op relation
        if (tree._op != null) {
          return tree;
        }
        // calc
        tree = tree.calc();
      } else if (tree instanceof CalcContext) {
        // calc op calc
        if (tree._op != null) {
          return tree;
        }

        // unary
        tree = tree.unary();
      } else if (tree instanceof MemberExprContext) {
        // member expands to one of: primary, select, index, or create message
        tree = tree.member();
      } else if (tree instanceof PrimaryExprContext) {
        // primary expands to one of identifier, nested, create list, create struct, literal
        tree = tree.primary();
      } else if (tree instanceof NestedContext) {
        // contains a nested 'expr'
        tree = tree._e;
      } else if (tree instanceof ConstantLiteralContext) {
        // expands to a primitive literal
        tree = tree.literal();
      } else {
        return tree;
      }
    }

    return tree;
  }

  private _receiverCallOrMacro(
    ctx: MemberCallContext,
    id: string,
    member: Expr
  ) {
    return this._macroOrCall(ctx._args, ctx._open, id, member, true);
  }

  private _globalCallOrMacro(ctx: IdentOrGlobalCallContext, id: string) {
    return this._macroOrCall(ctx._args, ctx._op, id, undefined, false);
  }

  private _macroOrCall(
    args: ExprListContext,
    open: Token,
    id: string,
    member?: Expr,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isReceiverStyle?: boolean
  ) {
    const macro = findMacro(id);
    if (macro) {
      const argList = this.visitExprList(args);
      if (argList.exprKind.case !== 'listExpr') {
        return this._reportError(args, 'unexpected argument list');
      }
      return expandMacro(
        this.#id,
        macro,
        member as Expr,
        argList.exprKind.value.elements
      );
    }
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'callExpr',
        value: {
          function: id,
          args: this.visitSlice(args?.expr_list() ?? []),
          target: member,
        },
      },
    });
  }
}
