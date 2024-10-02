/* eslint-disable @typescript-eslint/no-unused-vars */
import { assert, isNil } from '@bearclaw/is';
import {
  Expr,
  ExprSchema,
  Expr_CreateStruct,
  Expr_CreateStruct_Entry,
  Expr_CreateStruct_EntrySchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { NullValue } from '@bufbuild/protobuf/wkt';
import {
  CharStream,
  CommonTokenStream,
  ParseTree,
  ParserRuleContext,
} from 'antlr4';
import {
  RESERVED_IDS,
  parseBytesConstant,
  parseDoubleConstant,
  parseIntConstant,
  parseStringConstant,
  parseUintConstant,
} from './constants';
import { Errors, LexerErrorListener, ParserErrorListener } from './errors';
import { ParseException } from './exceptions';
import CELLexer from './gen/CELLexer';
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
  default as GenCELParser,
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

export class CELParser extends GeneratedCelVisitor<Expr> {
  #id = new IdHelper();
  readonly #errors!: Errors;

  constructor(
    public readonly source: string,
    private readonly options?: {
      enableOptionalSyntax?: boolean;
      retainRepeatedUnaryOperators?: boolean;
    }
  ) {
    super();
    this.#errors = new Errors(source);
  }

  public get errors() {
    return this.#errors;
  }

  parse() {
    const chars = new CharStream(this.source);
    const lexer = new CELLexer(chars);
    lexer.removeErrorListeners();
    const lexerErrorListener = new LexerErrorListener(this.#errors);
    lexer.addErrorListener(lexerErrorListener);

    const tokens = new CommonTokenStream(lexer);
    const parser = new GenCELParser(tokens);
    parser.removeErrorListeners();
    const parserErrorListener = new ParserErrorListener(this.#errors);
    parser.addErrorListener(parserErrorListener);

    return this.visit(parser.start());
  }

  override visit = (ctx: ParseTree) => {
    return super.visit(this._unnest(ctx));
  };

  override visitStart = (ctx: StartContext): Expr => {
    return this.visit(ctx._e);
  };

  override visitExpr = (ctx: ExprContext): Expr => {
    const result = this.visit(ctx._e);
    if (isNil(ctx._op)) {
      return result;
    }
    const opId = this.#id.nextId();
    const ifTrue = this.visit(ctx._e1);
    const ifFalse = this.visit(ctx._e2);
    return this._globalCallOrMacro(ctx, opId, CONDITIONAL_OPERATOR, [
      result,
      ifTrue,
      ifFalse,
    ]);
  };

  override visitConditionalOr = (ctx: ConditionalOrContext): Expr => {
    const result = this.visit(ctx._e);
    const logicManager = LogicManager.newBalancingLogicManager(
      LOGICAL_OR_OPERATOR,
      result
    );
    for (let i = 0; i < ctx._ops.length; i++) {
      if (i >= ctx._e1.length) {
        return this._reportError(ctx, "unexpected character, wanted '||'");
      }
      const term = this.visit(ctx._e1[i]);
      logicManager.addTerm(this.#id.nextId(), term);
    }
    return logicManager.toExpr();
  };

  override visitConditionalAnd = (ctx: ConditionalAndContext): Expr => {
    const result = this.visit(ctx._e);
    const logicManager = LogicManager.newBalancingLogicManager(
      LOGICAL_AND_OPERATOR,
      result
    );
    for (let i = 0; i < ctx._ops.length; i++) {
      if (i >= ctx._e1.length) {
        return this._reportError(ctx, "unexpected character, wanted '&&'");
      }
      const term = this.visit(ctx._e1[i]);
      logicManager.addTerm(this.#id.nextId(), term);
    }
    return logicManager.toExpr();
  };

  override visitRelation = (ctx: RelationContext): Expr => {
    let opText = '';
    if (!isNil(ctx._op)) {
      opText = ctx._op.text;
    }
    const operator = getOperatorFromText(opText);
    if (isNil(operator)) {
      return this._reportError(ctx, 'operator not found');
    }
    const left = this.visit(ctx.relation(0));
    const id = this.#id.nextId();
    const right = this.visit(ctx.relation(1));
    return this._globalCallOrMacro(ctx, id, operator, [left, right]);
  };

  override visitCalc = (ctx: CalcContext): Expr => {
    let opText = '';
    if (!isNil(ctx._op)) {
      opText = ctx._op.text;
    }
    const operator = getOperatorFromText(opText);
    if (isNil(operator)) {
      return this._reportError(ctx, 'operator not found');
    }
    const lhs = this.visit(ctx.calc(0));
    const opId = this.#id.nextId();
    const rhs = this.visit(ctx.calc(1));
    return this._globalCallOrMacro(ctx, opId, operator, [lhs, rhs]);
  };

  override visitMemberExpr = (ctx: MemberExprContext): Expr => {
    return this.visit(ctx.member());
  };

  override visitLogicalNot = (ctx: LogicalNotContext): Expr => {
    if (!isNil(ctx._ops) && ctx._ops.length % 2 === 0) {
      return this.visit(ctx.member());
    }
    const id = this.#id.nextId();
    const target = this.visit(ctx.member());
    return this._globalCallOrMacro(ctx, id, LOGICAL_NOT_OPERATOR, [target]);
  };

  override visitNegate = (ctx: NegateContext): Expr => {
    if (isNil(ctx._ops) || ctx._ops.length % 2 === 0) {
      return this.visit(ctx.member());
    }
    const opId = this.#id.nextId();
    const target = this.visit(ctx.member());
    return this._globalCallOrMacro(ctx, opId, NEGATE_OPERATOR, [target]);
  };

  override visitMemberCall = (ctx: MemberCallContext): Expr => {
    const operand = this.visit(ctx.member());
    const id = ctx._id.text;
    const opId = this.#id.nextId();
    let args: Expr[] = [];
    if (!isNil(ctx._args?.expr_list)) {
      args = this.visitSlice(ctx._args.expr_list());
    }
    return this._receiverCallOrMacro(ctx, opId, id, operand, args);
  };

  override visitSelect = (ctx: SelectContext): Expr => {
    const operand = this.visit(ctx.member());
    const id = ctx._id.text;
    if (!isNil(ctx._opt)) {
      if (!this.options?.enableOptionalSyntax) {
        return this._reportError(ctx, "unsupported syntax '.?'");
      }
      return create(ExprSchema, {
        id: this.#id.nextId(),
        exprKind: {
          case: 'callExpr',
          value: {
            function: OPT_SELECT_OPERATOR,
            args: [
              operand,
              create(ExprSchema, {
                id: this.#id.nextId(),
                exprKind: {
                  case: 'constExpr',
                  value: {
                    constantKind: {
                      case: 'stringValue',
                      value: id,
                    },
                  },
                },
              }),
            ],
          },
        },
      });
    }
    return create(ExprSchema, {
      id: this.#id.nextId(),
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
    return this.visit(ctx.primary());
  };

  override visitIndex = (ctx: IndexContext): Expr => {
    const target = this.visit(ctx.member());
    if (isNil(ctx._op)) {
      return this._reportError(ctx, 'no valid identifier is specified');
    }
    const opId = this.#id.nextId();
    const index = this.visit(ctx._index);
    let operator = INDEX_OPERATOR;
    if (!isNil(ctx._opt)) {
      if (!this.options?.enableOptionalSyntax) {
        return this._reportError(ctx, "unsupported syntax '[?'");
      }
      operator = OPT_INDEX_OPERATOR;
    }
    return this._globalCallOrMacro(ctx, opId, operator, [target, index]);
  };

  override visitIdentOrGlobalCall = (ctx: IdentOrGlobalCallContext): Expr => {
    let identName = '';
    if (!isNil(ctx._leadingDot)) {
      identName = '.';
    }
    if (isNil(ctx._id)) {
      return this._reportError(ctx, 'no valid identifier specified');
    }
    const id = ctx._id.text;
    if (RESERVED_IDS.has(id)) {
      return this._reportError(ctx, `reserved identifier: ${id}`);
    }
    identName += id;
    if (!isNil(ctx._op)) {
      const opId = this.#id.nextId();
      let args: Expr[] = [];
      if (!isNil(ctx._args)) {
        args = this.visitSlice(ctx._args.expr_list());
      }
      return this._globalCallOrMacro(ctx, opId, identName, args);
    }
    return create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'identExpr',
        value: {
          name: identName,
        },
      },
    });
  };

  //   override visitNested = (ctx: NestedContext): Expr => {
  //     // Implementation logic here
  //   };

  override visitCreateList = (ctx: CreateListContext): Expr => {
    const listId = this.#id.nextId();
    let elements: Expr[] = [];
    let optionalIndices: number[] = [];
    if (!isNil(ctx._elems)) {
      const listInit = this.visit(ctx._elems);
      if (listInit.exprKind.case !== 'listExpr') {
        // This should never happen, but just in case.
        return this._reportError(ctx, 'no list initializer');
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
    const structId = this.#id.nextId();
    let entries: Expr_CreateStruct_Entry[] = [];
    if (!isNil(ctx._entries)) {
      const mapInit = this.visit(ctx._entries);
      if (mapInit.exprKind.case !== 'structExpr') {
        // This should never happen, but just in case.
        return this._reportError(ctx, 'no struct initializer');
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
      if (isNil(entriesInitializer)) {
        // This is the result of a syntax error detected elsewhere.
        return create(ExprSchema);
      }
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
    const expr = this.visit(ctx.literal());
    if (expr.exprKind.case !== 'constExpr') {
      // This should never happen, but just in case.
      return this._reportError(ctx, 'expr is not a constant');
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
    const elements = ctx._elems;
    const result: Expr[] = [];
    const optionals: number[] = [];
    for (let i = 0; i < elements.length; i++) {
      const ex = this.visit(elements[i]._e);
      if (isNil(ex)) {
        return create(ExprSchema, {
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
    const fields: Expr_CreateStruct_Entry[] = [];
    for (let i = 0; i < ctx._fields.length; i++) {
      if (i >= ctx._values.length || i >= ctx._fields.length) {
        // This is the result of a syntax error detected elsewhere.
        return create(ExprSchema);
      }
      const field = ctx._fields[i];
      const exprId = this.#id.nextId();
      const optionalEntry = !isNil(field._opt);
      const id = field.IDENTIFIER();
      if (isNil(id)) {
        return this._reportError(ctx, 'no valid identifier specified');
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
    const fields: Expr_CreateStruct_Entry[] = [];
    for (let i = 0; i < ctx._cols.length; i++) {
      if (i >= ctx._values.length || i >= ctx._cols.length) {
        // This is the result of a syntax error detected elsewhere.
        return create(ExprSchema);
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

  private _globalCallOrMacro(
    ctx: ParserRuleContext,
    exprId: bigint,
    fn: string,
    args: Expr[]
  ) {
    const macro = this._expandMacro(ctx, fn, null, args);
    if (!isNil(macro)) {
      return macro;
    }
    return create(ExprSchema, {
      id: exprId,
      exprKind: {
        case: 'callExpr',
        value: {
          function: fn,
          args,
        },
      },
    });
  }

  private _receiverCallOrMacro(
    ctx: ParserRuleContext,
    exprId: bigint,
    fn: string,
    target: Expr,
    args: Expr[]
  ) {
    const macro = this._expandMacro(ctx, fn, target, args);
    if (!isNil(macro)) {
      return macro;
    }
    return create(ExprSchema, {
      id: exprId,
      exprKind: {
        case: 'callExpr',
        value: {
          function: fn,
          args,
          target,
        },
      },
    });
  }

  private _expandMacro(
    ctx: ParserRuleContext,
    fn: string,
    target: Expr | null,
    args: Expr[]
  ) {
    const macro = findMacro(fn);
    if (isNil(macro)) {
      return null;
    }
    try {
      const expanded = expandMacro(this.#id, macro, target, args);
      return expanded;
    } catch (e) {
      return this._reportError(ctx, (e as Error).message);
    }
  }

  private _reportError(ctx: ParserRuleContext, message: string) {
    const error = create(ExprSchema, {
      id: this.#id.nextId(),
      exprKind: {
        case: 'constExpr',
        value: {
          constantKind: {
            case: 'stringValue',
            value: '<<error>>',
          },
        },
      },
    });
    this.#errors.reportErrorAtId(
      error.id,
      ctx.start.line,
      ctx.start.column,
      message
    );
    return error;
  }
}
