/* eslint-disable @typescript-eslint/no-unused-vars */
import { assert, isNil } from '@bearclaw/is';
import {
  Expr,
  Expr_CreateList,
  Expr_CreateStruct,
  Expr_CreateStruct_Entry,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import {
  CharStream,
  CommonTokenStream,
  ParseTree,
  ParseTreeListener,
  ParserRuleContext,
  Token,
} from 'antlr4';
import { AST, OffsetRange } from '../common/ast';
import { parseBytes, parseString } from '../common/constants';
import { CELError } from '../common/error';
import {
  Errors,
  LexerErrorListener,
  ParserErrorListener,
} from '../common/errors';
import { Location, NoLocation } from '../common/location';
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
} from '../common/operators';
import {
  newListProtoExpr,
  newMapProtoExpr,
  newMessageProtoExpr,
} from '../common/pb/expressions';
import { Source } from '../common/source';
import { reflectNativeType } from '../common/types/native';
import { NullRefVal } from '../common/types/null';
import { safeParseFloat, safeParseInt } from '../common/utils';
import { ParseException } from '../exceptions';
import CELLexer from '../gen/CELLexer';
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
} from '../gen/CELParser';
import { default as GeneratedCelVisitor } from '../gen/CELVisitor';
import { ExprHelper, LogicManager, ParserHelper } from './helper';
import { AllMacros, Macro, makeMacroKey, makeVarArgMacroKey } from './macro';

export const reservedIds = new Set([
  'as',
  'break',
  'const',
  'continue',
  'else',
  'false',
  'for',
  'function',
  'if',
  'import',
  'in',
  'let',
  'loop',
  'package',
  'namespace',
  'null',
  'return',
  'true',
  'var',
  'void',
  'while',
]);

export interface ParserOptions {
  /**
   * MaxRecursionDepth limits the maximum depth the parser will attempt to
   * parse the expression before giving up.
   */
  maxRecursionDepth?: number;
  /**
   * ErrorRecoveryLookaheadTokenLimit limits the number of lexer tokens that may be considered during error recovery.
   *
   * Error recovery often involves looking ahead in the input to determine if
   * there's a point at which parsing may successfully resume. In some
   * pathological cases, the parser can look through quite a large set of input
   * which in turn generates a lot of back-tracking and performance degredation.
   *
   * The limit must be >= 1, and is recommended to be less than the default of
   * 256.
   */
  errorRecoveryTokenLookaheadLimit?: number;
  /**
   * ErrorRecoveryLimit limits the number of attempts the parser will perform
   * to recover from an error.
   */
  errorRecoveryLimit?: number;
  /**
   * ErrorReportingLimit limits the number of syntax error reports before
   * terminating parsing.
   *
   * The limit must be at least 1. If unset, the limit will be 100.
   */
  errorReportingLimit?: number;
  /**
   * ExpressionSizeCodePointLimit is an option which limits the maximum code
   * point count of an expression.
   */
  expressionSizeCodePointLimit?: number;
  /**
   * Macros adds the given macros to the parser.
   */
  macros?: Macro[];
  /**
   * PopulateMacroCalls ensures that the original call signatures replaced by
   * expanded macros are preserved in the `SourceInfo` of parse result.
   */
  populateMacroCalls?: boolean;
  /**
   * EnableOptionalSyntax enables syntax for optional field and index selection.
   */
  enableOptionalSyntax?: boolean;
  /**
   * EnableVariadicOperatorASTs enables a compact representation of chained
   * like-kind commutative operators. e.g. `a || b || c || d` -> `call(op='||',
   * args=[a, b, c, d])`
   *
   * The benefit of enabling variadic operators ASTs is a more compact
   * representation deeply nested logic graphs.
   */
  enableVariadicOperatorASTs?: boolean;
}

export class Parser extends GeneratedCelVisitor<Expr> {
  readonly #source!: Source;
  readonly #helper!: ParserHelper;
  readonly #errors!: Errors;
  #macros: Map<string, Macro> = new Map();
  #errorReportingLimit = 100;
  #recursionDepth = 0;
  #maxRecursionDepth = 250;
  #errorRecoveryTokenLookaheadLimit = 256;
  #errorRecoveryLimit = 30;
  #expressionSizeCodePointLimit = 100_000;
  #enableOptionalSyntax = false;

  constructor(source: Source, private readonly options?: ParserOptions) {
    super();
    this.#source = source;
    this.#helper = new ParserHelper(this.#source);
    this.#errors = new Errors(this.#source);
    if (this.options?.errorReportingLimit) {
      this.#errorReportingLimit = this.options.errorReportingLimit;
    }
    if (this.options?.maxRecursionDepth) {
      this.#maxRecursionDepth = this.options.maxRecursionDepth;
    }
    if (this.options?.errorRecoveryTokenLookaheadLimit) {
      this.#errorRecoveryTokenLookaheadLimit =
        this.options.errorRecoveryTokenLookaheadLimit;
    }
    if (this.options?.errorRecoveryLimit) {
      this.#errorRecoveryLimit = this.options.errorRecoveryLimit;
    }
    if (this.options?.expressionSizeCodePointLimit) {
      this.#expressionSizeCodePointLimit =
        this.options.expressionSizeCodePointLimit;
    }
    if (!isNil(this.options?.enableOptionalSyntax)) {
      this.#enableOptionalSyntax = this.options.enableOptionalSyntax;
    }
    // If the parser options include macros, add them to the parser. Otherwise,
    // add the default set of macros.
    if (this.options?.macros) {
      for (const macro of this.options.macros) {
        this.#macros.set(macro.macroKey(), macro);
      }
    } else {
      for (const macro of AllMacros) {
        this.#macros.set(macro.macroKey(), macro);
      }
    }
  }

  public get errors() {
    return this.#errors;
  }

  parse() {
    const chars = new CharStream(this.#source.content());
    const lexer = new CELLexer(chars);
    lexer.removeErrorListeners();
    lexer.addErrorListener(new LexerErrorListener(this.#errors));

    const tokens = new CommonTokenStream(lexer);
    const parser = new GenCELParser(tokens);
    parser.removeErrorListeners();
    parser.addErrorListener(new ParserErrorListener(this.#errors));
    parser.addParseListener(new RecursionListener(this.#maxRecursionDepth));

    const expr = this.visit(parser.start());
    return new AST(expr, this.#helper.getSourceInfo());
  }

  override visit = (ctx: ParseTree) => {
    const tree = this._unnest(ctx);
    if (
      tree instanceof ExprContext ||
      tree instanceof RelationContext ||
      tree instanceof CalcContext ||
      tree instanceof SelectContext ||
      tree instanceof MemberCallContext ||
      tree instanceof IndexContext
    ) {
      this._checkAndIncrementRecusionDepth();
      const out = super.visit(tree);
      this._decrementRecursionDepth();
      return out;
    }
    return super.visit(tree);
  };

  override visitStart = (ctx: StartContext): Expr => {
    return this.visit(ctx._e);
  };

  override visitExpr = (ctx: ExprContext): Expr => {
    const result = this.visit(ctx._e);
    if (isNil(ctx._op)) {
      return result;
    }
    const opId = this.#helper.id(ctx._op);
    const ifTrue = this.visit(ctx._e1);
    const ifFalse = this.visit(ctx._e2);
    return this._globalCallOrMacro(opId, CONDITIONAL_OPERATOR, [
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
    const rest = ctx._e1;
    for (let i = 0; i < ctx._ops.length; i++) {
      if (i >= rest.length) {
        return this._reportError(ctx, "unexpected character, wanted '||'");
      }
      const term = this.visit(rest[i]);
      const op = ctx._ops[i];
      logicManager.addTerm(this.#helper.id(op), term);
    }
    return logicManager.toExpr();
  };

  override visitConditionalAnd = (ctx: ConditionalAndContext): Expr => {
    const result = this.visit(ctx._e);
    const logicManager = LogicManager.newBalancingLogicManager(
      LOGICAL_AND_OPERATOR,
      result
    );
    const rest = ctx._e1;
    for (let i = 0; i < ctx._ops.length; i++) {
      if (i >= ctx._e1.length) {
        return this._reportError(ctx, "unexpected character, wanted '&&'");
      }
      const term = this.visit(rest[i]);
      const op = ctx._ops[i];
      logicManager.addTerm(this.#helper.id(op), term);
    }
    return logicManager.toExpr();
  };

  override visitRelation = (ctx: RelationContext): Expr => {
    let opText = '';
    if (!isNil(ctx._op)) {
      opText = ctx._op.text;
    }
    const operator = getOperatorFromText(opText);
    if (!isNil(operator)) {
      const left = this.visit(ctx.relation(0));
      const id = this.#helper.id(ctx._op);
      const right = this.visit(ctx.relation(1));
      return this._globalCallOrMacro(id, operator, [left, right]);
    }
    return this._reportError(ctx, 'operator not found');
  };

  override visitCalc = (ctx: CalcContext): Expr => {
    let opText = '';
    if (!isNil(ctx._op)) {
      opText = ctx._op.text;
    }
    const operator = getOperatorFromText(opText);
    if (!isNil(operator)) {
      const lhs = this.visit(ctx.calc(0));
      const opId = this.#helper.id(ctx._op);
      const rhs = this.visit(ctx.calc(1));
      return this._globalCallOrMacro(opId, operator, [lhs, rhs]);
    }
    return this._reportError(ctx, 'operator not found');
  };

  override visitMemberExpr = (ctx: MemberExprContext): Expr => {
    return this.visit(ctx.member());
  };

  override visitLogicalNot = (ctx: LogicalNotContext): Expr => {
    if (!isNil(ctx._ops) && ctx._ops.length % 2 === 0) {
      return this.visit(ctx.member());
    }
    const id = this.#helper.id(ctx._ops[0]);
    const target = this.visit(ctx.member());
    return this._globalCallOrMacro(id, LOGICAL_NOT_OPERATOR, [target]);
  };

  override visitNegate = (ctx: NegateContext): Expr => {
    if (isNil(ctx._ops) || ctx._ops.length % 2 === 0) {
      return this.visit(ctx.member());
    }
    const opId = this.#helper.id(ctx._ops[0]);
    const target = this.visit(ctx.member());
    return this._globalCallOrMacro(opId, NEGATE_OPERATOR, [target]);
  };

  override visitMemberCall = (ctx: MemberCallContext): Expr => {
    const operand = this.visit(ctx.member());
    // Handle the error case where no valid identifier is specified.
    if (isNil(ctx._id)) {
      return this.#helper.newExpr(ctx);
    }
    const id = ctx._id.text;
    const opId = this.#helper.id(ctx._open);
    let args: Expr[] = [];
    if (!isNil(ctx._args?.expr_list)) {
      args = this.visitSlice(ctx._args.expr_list());
    }
    return this._receiverCallOrMacro(opId, id, operand, args);
  };

  override visitSelect = (ctx: SelectContext): Expr => {
    const operand = this.visit(ctx.member());
    // Handle the error case where no valid identifier is specified.
    if (isNil(ctx._id) || isNil(ctx._op)) {
      return this.#helper.newExpr(ctx);
    }
    const id = ctx._id.text;
    if (!isNil(ctx._opt)) {
      if (!this.#enableOptionalSyntax) {
        return this._reportError(ctx._op, "unsupported syntax '.?'");
      }
      return this.#helper.newGlobalCall(
        ctx._op,
        OPT_SELECT_OPERATOR,
        operand,
        this.#helper.newLiteralString(ctx._id, id)
      );
    }
    return this.#helper.newSelect(ctx._op, operand, id);
  };

  override visitPrimaryExpr = (ctx: PrimaryExprContext): Expr => {
    return this.visit(ctx.primary());
  };

  override visitIndex = (ctx: IndexContext): Expr => {
    const target = this.visit(ctx.member());
    // Handle the error case where no valid identifier is specified.
    if (isNil(ctx._op)) {
      return this.#helper.newExpr(ctx);
    }
    const opId = this.#helper.id(ctx._op);
    const index = this.visit(ctx._index);
    let operator = INDEX_OPERATOR;
    if (!isNil(ctx._opt)) {
      if (this.#enableOptionalSyntax === false) {
        return this._reportError(ctx._op, "unsupported syntax '[?'");
      }
      operator = OPT_INDEX_OPERATOR;
    }
    return this._globalCallOrMacro(opId, operator, [target, index]);
  };

  override visitIdentOrGlobalCall = (ctx: IdentOrGlobalCallContext): Expr => {
    let identName = '';
    if (!isNil(ctx._leadingDot)) {
      identName = '.';
    }
    // Handle the error case where no valid identifier is specified.
    if (isNil(ctx._id)) {
      return this.#helper.newExpr(ctx);
    }
    const id = ctx._id.text;
    if (reservedIds.has(id)) {
      return this._reportError(ctx, `reserved identifier: ${id}`);
    }
    identName += id;
    if (!isNil(ctx._op)) {
      const opId = this.#helper.id(ctx._op);
      let args: Expr[] = [];
      if (!isNil(ctx._args)) {
        args = this.visitSlice(ctx._args.expr_list());
      }
      return this._globalCallOrMacro(opId, identName, args);
    }
    return this.#helper.newIdent(ctx._id, identName);
  };

  //   override visitNested = (ctx: NestedContext): Expr => {
  //     // Implementation logic here
  //   };

  override visitCreateList = (ctx: CreateListContext): Expr => {
    const listId = this.#helper.id(ctx._op);
    const listInit = this.visitListInit(ctx._elems);
    const listExpr = listInit.exprKind.value as Expr_CreateList;
    return this.#helper.newList(
      listId,
      listExpr.elements,
      listExpr.optionalIndices
    );
  };

  override visitCreateStruct = (ctx: CreateStructContext): Expr => {
    const structId = this.#helper.id(ctx._op);
    const entries: Expr_CreateStruct_Entry[] = [];
    if (!isNil(ctx._entries)) {
      const initializer = this.visit(ctx._entries);
      const entriesInitializer = initializer.exprKind
        .value as Expr_CreateStruct;
      if (isNil(entriesInitializer)) {
        // This is the result of a syntax error detected elsewhere.
        return this.#helper.newExpr(ctx);
      }
      entries.push(...entriesInitializer.entries);
    }
    return this.#helper.newMap(structId, entries);
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
      messageName = '.' + messageName;
    }
    const objID = this.#helper.id(ctx._op);
    const entriesInitializer = this.visitFieldInitializerList(ctx._entries);
    const entries = entriesInitializer.exprKind.value as Expr_CreateStruct;
    return this.#helper.newObject(objID, messageName, entries?.entries ?? []);
  };

  // override visitConstantLiteral = (ctx: ConstantLiteralContext): Expr => {
  //   const expr = this.visit(ctx.literal());
  //   if (expr.exprKind.case !== 'constExpr') {
  //     // This should never happen, but just in case.
  //     return this._reportError(ctx, 'expr is not a constant');
  //   }
  //   return this.#helper.newLiteral(ctx, expr);
  // };

  override visitExprList = (ctx: ExprListContext): Expr => {
    return newListProtoExpr(BigInt(0), this.visitSlice(ctx.expr_list()));
  };

  override visitListInit = (ctx: ListInitContext): Expr => {
    const elements = ctx?._elems ?? [];
    const result: Expr[] = [];
    const optionals: number[] = [];
    for (let i = 0; i < elements.length; i++) {
      const ex = this.visit(elements[i]._e);
      if (isNil(ex)) {
        return newListProtoExpr(BigInt(0), []);
      }
      result.push(ex);
      if (elements[i]._opt != null) {
        if (this.#enableOptionalSyntax === false) {
          this._reportError(elements[i], "unsupported syntax '?'");
          continue;
        }
        optionals.push(i);
      }
    }
    return newListProtoExpr(BigInt(0), result, optionals);
  };

  override visitFieldInitializerList = (
    ctx: FieldInitializerListContext
  ): Expr => {
    if (isNil(ctx) || isNil(ctx._fields)) {
      // This is the result of a syntax error handled elswhere, return empty.
      return this.#helper.newExpr(ctx);
    }
    const result: Expr_CreateStruct_Entry[] = [];
    const cols = ctx._cols;
    const vals = ctx._values;
    for (let i = 0; i < ctx._fields.length; i++) {
      if (i >= cols.length || i >= vals.length) {
        // This is the result of a syntax error detected elsewhere.
        return this.#helper.newExpr(ctx);
      }
      const initID = this.#helper.id(cols[i]);
      const optField = ctx._fields[i];
      const optional = !isNil(optField._opt);
      if (this.#enableOptionalSyntax === false && optional) {
        this._reportError(optField, "unsupported syntax '?'");
        continue;
      }
      // The field may be empty due to a prior error
      const id = optField.IDENTIFIER();
      if (isNil(id)) {
        return this.#helper.newExpr(optField);
      }
      const fieldName = id.getText();
      const value = this.visit(vals[i]);
      const field = this.#helper.newObjectField(
        initID,
        fieldName,
        value,
        optional
      );
      result.push(field);
    }
    // The only purpose of this method is to get the fields. We don't care
    // about the id or message name
    return newMessageProtoExpr(BigInt(0), '', result);
  };

  //   override visitOptField = (ctx: OptFieldContext): Expr => {
  //     // Implementation logic here
  //   };

  override visitMapInitializerList = (ctx: MapInitializerListContext): Expr => {
    if (isNil(ctx) || isNil(ctx._keys)) {
      // This is the result of a syntax error handled elswhere, return empty.
      return this.#helper.newExpr(ctx);
    }
    const result: Expr_CreateStruct_Entry[] = [];
    const keys = ctx._keys;
    const values = ctx._values;
    for (let i = 0; i < ctx._cols.length; i++) {
      const colID = this.#helper.id(ctx._cols[i]);
      if (i >= keys.length || i >= values.length) {
        // This is the result of a syntax error detected elsewhere.
        return this.#helper.newExpr(ctx);
      }
      const optKey = keys[i];
      const optional = !isNil(optKey._opt);
      if (this.#enableOptionalSyntax === false && optional) {
        this._reportError(optKey, "unsupported syntax '?'");
        continue;
      }
      const key = this.visit(optKey._e);
      const value = this.visit(values[i]);
      const entry = this.#helper.newMapEntry(colID, key, value, optional);
      result.push(entry);
    }
    // We don't want to increment the id for the map initializer list, so we
    // pass in 0 for the id.
    return newMapProtoExpr(BigInt(0), result);
  };

  //   override visitOptExpr = (ctx: OptExprContext): Expr => {
  //     // Implementation logic here
  //   };

  override visitInt = (ctx: IntContext): Expr => {
    let text = ctx._tok.text;
    if (!isNil(ctx._sign)) {
      text = ctx._sign.text + text;
    }
    try {
      const i = safeParseInt(text, 64, true);
      return this.#helper.newLiteralInt(ctx, BigInt(i));
    } catch (e) {
      return this._reportError(ctx, 'invalid int literal');
    }
  };

  override visitUint = (ctx: UintContext): Expr => {
    let text = ctx._tok.text;
    // trim the 'u' designator included in the uint literal.
    text = text.substring(0, text.length - 1);
    try {
      const u = safeParseInt(text, 64, false);
      return this.#helper.newLiteralUint(ctx, BigInt(u));
    } catch {
      return this._reportError(ctx, 'invalid uint literal');
    }
  };

  override visitDouble = (ctx: DoubleContext): Expr => {
    let text = ctx._tok.text;
    if (!isNil(ctx._sign)) {
      text = ctx._sign.text + text;
    }
    try {
      const f = safeParseFloat(text, 64, true);
      return this.#helper.newLiteralDouble(ctx, f);
    } catch {
      return this._reportError(ctx, 'invalid double literal');
    }
  };

  override visitString = (ctx: StringContext): Expr => {
    const str = parseString(ctx.getText());
    return this.#helper.newLiteralString(ctx, str);
  };

  override visitBytes = (ctx: BytesContext): Expr => {
    const bytes = parseBytes(ctx.getText());
    return this.#helper.newLiteralBytes(ctx, bytes);
  };

  override visitBoolTrue = (ctx: BoolTrueContext): Expr => {
    assert(ctx.getText() === 'true', new ParseException('true expected', 0));
    return this.#helper.newLiteralBool(ctx, true);
  };

  override visitBoolFalse = (ctx: BoolFalseContext): Expr => {
    assert(ctx.getText() === 'false', new ParseException('false expected', 0));
    return this.#helper.newLiteralBool(ctx, false);
  };

  override visitNull = (ctx: NullContext): Expr => {
    assert(ctx.getText() === 'null', new ParseException('null expected', 0));
    return this.#helper.newLiteral(ctx, new NullRefVal());
  };

  visitSlice = (expressions: ExprContext[]): Expr[] => {
    if (isNil(expressions) || expressions.length === 0) {
      return [];
    }
    return expressions.map((e) => this.visit(e));
  };

  public getLocationForId(id: bigint): Location {
    return this.#helper.getLocation(id);
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

  private _globalCallOrMacro(exprId: bigint, fn: string, args: Expr[]) {
    const macro = this._expandMacro(exprId, fn, null, args);
    if (!isNil(macro)) {
      return macro;
    }
    return this.#helper.newGlobalCall(exprId, fn, ...args);
  }

  private _receiverCallOrMacro(
    exprId: bigint,
    fn: string,
    target: Expr,
    args: Expr[]
  ) {
    const macro = this._expandMacro(exprId, fn, target, args);
    if (!isNil(macro)) {
      return macro;
    }
    return this.#helper.newReceiverCall(exprId, fn, target, ...args);
  }

  private _expandMacro(
    exprID: bigint,
    fn: string,
    target: Expr | null,
    args: Expr[]
  ) {
    let macro = this.#macros.get(makeMacroKey(fn, args.length, !isNil(target)));
    if (isNil(macro)) {
      macro = this.#macros.get(makeVarArgMacroKey(fn, !isNil(target)));
      if (isNil(macro)) {
        return null;
      }
    }
    const eh = new ExprHelper(exprID, this.#helper);
    const expr = macro.expander()(eh, target, args);
    // An error indicates that the macro was matched, but the arguments were
    // not well-formed.
    if (expr instanceof CELError) {
      let loc = expr.location;
      if (isNil(loc)) {
        loc = this.#helper.getLocation(exprID);
      }
      this.#helper.deleteId(exprID);
      return this._reportError(loc, expr.message);
    }
    // A nil value from the macro indicates that the macro implementation
    // decided that an expansion should not be performed.
    if (isNil(expr)) {
      return null;
    }
    if (this.options?.populateMacroCalls) {
      this.#helper.addMacroCall(exprID, fn, target, ...args);
    }
    this.#helper.deleteId(exprID);
    return expr;
  }

  private _reportError(
    ctx: ParserRuleContext | Token | Location | OffsetRange,
    message: string
  ) {
    const err = this.#helper.newExpr(ctx);
    let location: Location = NoLocation;
    // This is outside the switch because there are many classes that extend
    // ParserRuleContext and Token which we want to handle the same way.
    // `reflectNativeType` will only handle it if it is exactly a
    // ParserRuleContext or Token.
    if (ctx instanceof ParserRuleContext) {
      location = this.#helper.getLocation(err.id);
    } else if (ctx instanceof Token) {
      location = this.#helper.getLocation(err.id);
    }
    switch (reflectNativeType(ctx)) {
      case Location:
        location = ctx as Location;
        break;
      default:
        break;
    }
    this.#errors.reportErrorAtId(err.id, location!, message);
    return err;
  }

  private _checkAndIncrementRecusionDepth() {
    this.#recursionDepth++;
    if (this.#recursionDepth > this.#maxRecursionDepth) {
      return this.errors.reportInternalError('max recursion depth exceeded');
    }
  }

  private _decrementRecursionDepth() {
    this.#recursionDepth--;
  }
}

class RecursionListener extends ParseTreeListener {
  #ruleTypeDepth: Map<number, number> = new Map();
  #hasNotified = false;

  constructor(private readonly maxDepth: number) {
    super();
  }

  override enterEveryRule(ctx: ParserRuleContext): void {
    if (isNil(ctx)) {
      return;
    }
    const ruleIndex = (ctx as unknown as { ruleIndex: number }).ruleIndex;
    if (isNil(ruleIndex)) {
      return;
    }
    let depth = this.#ruleTypeDepth.get(ruleIndex);
    if (isNil(depth)) {
      this.#ruleTypeDepth.set(ruleIndex, 1);
      depth = 1;
    } else {
      depth++;
    }
    this.#ruleTypeDepth.set(ruleIndex, depth);
    if (depth > this.maxDepth && !this.#hasNotified) {
      const fakeToken = new Token();
      fakeToken.line = -1;
      fakeToken.column = -1;
      ctx.parser?.notifyErrorListeners(
        `expression recursion limit exceeded: ${this.maxDepth}`,
        fakeToken,
        undefined
      );
    }
  }

  override exitEveryRule(ctx: ParserRuleContext): void {
    if (isNil(ctx)) {
      return;
    }
    const ruleIndex = (ctx as unknown as { ruleIndex: number }).ruleIndex;
    if (isNil(ruleIndex)) {
      return;
    }
    let depth = this.#ruleTypeDepth.get(ruleIndex);
    if (!isNil(depth)) {
      depth--;
      this.#ruleTypeDepth.set(ruleIndex, depth);
    }
  }
}
