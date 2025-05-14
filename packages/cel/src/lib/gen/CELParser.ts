// Generated from packages/cel/src/lib/gen/CEL.g4 by ANTLR 4.13.1
// noinspection ES6UnusedImports,JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import {
  ATN,
  ATNDeserializer,
  DecisionState,
  DFA,
  FailedPredicateException,
  NoViableAltException,
  Parser,
  ParserATNSimulator,
  ParserRuleContext,
  PredictionContextCache,
  RecognitionException,
  RuleContext,
  TerminalNode,
  Token,
  TokenStream,
} from 'antlr4';
import CELListener from './CELListener.js';
import CELVisitor from './CELVisitor.js';

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export default class CELParser extends Parser {
  public static readonly EQUALS = 1;
  public static readonly NOT_EQUALS = 2;
  public static readonly IN = 3;
  public static readonly LESS = 4;
  public static readonly LESS_EQUALS = 5;
  public static readonly GREATER_EQUALS = 6;
  public static readonly GREATER = 7;
  public static readonly LOGICAL_AND = 8;
  public static readonly LOGICAL_OR = 9;
  public static readonly LBRACKET = 10;
  public static readonly RPRACKET = 11;
  public static readonly LBRACE = 12;
  public static readonly RBRACE = 13;
  public static readonly LPAREN = 14;
  public static readonly RPAREN = 15;
  public static readonly DOT = 16;
  public static readonly COMMA = 17;
  public static readonly MINUS = 18;
  public static readonly EXCLAM = 19;
  public static readonly QUESTIONMARK = 20;
  public static readonly COLON = 21;
  public static readonly PLUS = 22;
  public static readonly STAR = 23;
  public static readonly SLASH = 24;
  public static readonly PERCENT = 25;
  public static readonly CEL_TRUE = 26;
  public static readonly CEL_FALSE = 27;
  public static readonly NUL = 28;
  public static readonly WHITESPACE = 29;
  public static readonly COMMENT = 30;
  public static readonly NUM_FLOAT = 31;
  public static readonly NUM_INT = 32;
  public static readonly NUM_UINT = 33;
  public static readonly STRING = 34;
  public static readonly BYTES = 35;
  public static readonly IDENTIFIER = 36;
  public static readonly ESC_IDENTIFIER = 37;
  public static override readonly EOF = Token.EOF;
  public static readonly RULE_start = 0;
  public static readonly RULE_expr = 1;
  public static readonly RULE_conditionalOr = 2;
  public static readonly RULE_conditionalAnd = 3;
  public static readonly RULE_relation = 4;
  public static readonly RULE_calc = 5;
  public static readonly RULE_unary = 6;
  public static readonly RULE_member = 7;
  public static readonly RULE_primary = 8;
  public static readonly RULE_exprList = 9;
  public static readonly RULE_listInit = 10;
  public static readonly RULE_fieldInitializerList = 11;
  public static readonly RULE_optField = 12;
  public static readonly RULE_mapInitializerList = 13;
  public static readonly RULE_escapeIdent = 14;
  public static readonly RULE_optExpr = 15;
  public static readonly RULE_literal = 16;
  public static readonly literalNames: (string | null)[] = [
    null,
    "'=='",
    "'!='",
    "'in'",
    "'<'",
    "'<='",
    "'>='",
    "'>'",
    "'&&'",
    "'||'",
    "'['",
    "']'",
    "'{'",
    "'}'",
    "'('",
    "')'",
    "'.'",
    "','",
    "'-'",
    "'!'",
    "'?'",
    "':'",
    "'+'",
    "'*'",
    "'/'",
    "'%'",
    "'true'",
    "'false'",
    "'null'",
  ];
  public static readonly symbolicNames: (string | null)[] = [
    null,
    'EQUALS',
    'NOT_EQUALS',
    'IN',
    'LESS',
    'LESS_EQUALS',
    'GREATER_EQUALS',
    'GREATER',
    'LOGICAL_AND',
    'LOGICAL_OR',
    'LBRACKET',
    'RPRACKET',
    'LBRACE',
    'RBRACE',
    'LPAREN',
    'RPAREN',
    'DOT',
    'COMMA',
    'MINUS',
    'EXCLAM',
    'QUESTIONMARK',
    'COLON',
    'PLUS',
    'STAR',
    'SLASH',
    'PERCENT',
    'CEL_TRUE',
    'CEL_FALSE',
    'NUL',
    'WHITESPACE',
    'COMMENT',
    'NUM_FLOAT',
    'NUM_INT',
    'NUM_UINT',
    'STRING',
    'BYTES',
    'IDENTIFIER',
    'ESC_IDENTIFIER',
  ];
  // tslint:disable:no-trailing-whitespace
  public static readonly ruleNames: string[] = [
    'start',
    'expr',
    'conditionalOr',
    'conditionalAnd',
    'relation',
    'calc',
    'unary',
    'member',
    'primary',
    'exprList',
    'listInit',
    'fieldInitializerList',
    'optField',
    'mapInitializerList',
    'escapeIdent',
    'optExpr',
    'literal',
  ];
  public get grammarFileName(): string {
    return 'CEL.g4';
  }
  public get literalNames(): (string | null)[] {
    return CELParser.literalNames;
  }
  public get symbolicNames(): (string | null)[] {
    return CELParser.symbolicNames;
  }
  public get ruleNames(): string[] {
    return CELParser.ruleNames;
  }
  public get serializedATN(): number[] {
    return CELParser._serializedATN;
  }

  protected createFailedPredicateException(
    predicate?: string,
    message?: string
  ): FailedPredicateException {
    return new FailedPredicateException(this, predicate, message);
  }

  constructor(input: TokenStream) {
    super(input);
    this._interp = new ParserATNSimulator(
      this,
      CELParser._ATN,
      CELParser.DecisionsToDFA,
      new PredictionContextCache()
    );
  }
  // @RuleVersion(0)
  public start(): StartContext {
    let localctx: StartContext = new StartContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, CELParser.RULE_start);
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 34;
        localctx._e = this.expr();
        this.state = 35;
        this.match(CELParser.EOF);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public expr(): ExprContext {
    let localctx: ExprContext = new ExprContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, CELParser.RULE_expr);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 37;
        localctx._e = this.conditionalOr();
        this.state = 43;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === 20) {
          {
            this.state = 38;
            localctx._op = this.match(CELParser.QUESTIONMARK);
            this.state = 39;
            localctx._e1 = this.conditionalOr();
            this.state = 40;
            this.match(CELParser.COLON);
            this.state = 41;
            localctx._e2 = this.expr();
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public conditionalOr(): ConditionalOrContext {
    let localctx: ConditionalOrContext = new ConditionalOrContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 4, CELParser.RULE_conditionalOr);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 45;
        localctx._e = this.conditionalAnd();
        this.state = 50;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === 9) {
          {
            {
              this.state = 46;
              localctx._s9 = this.match(CELParser.LOGICAL_OR);
              localctx._ops.push(localctx._s9);
              this.state = 47;
              localctx._conditionalAnd = this.conditionalAnd();
              localctx._e1.push(localctx._conditionalAnd);
            }
          }
          this.state = 52;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public conditionalAnd(): ConditionalAndContext {
    let localctx: ConditionalAndContext = new ConditionalAndContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 6, CELParser.RULE_conditionalAnd);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 53;
        localctx._e = this.relation(0);
        this.state = 58;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === 8) {
          {
            {
              this.state = 54;
              localctx._s8 = this.match(CELParser.LOGICAL_AND);
              localctx._ops.push(localctx._s8);
              this.state = 55;
              localctx._relation = this.relation(0);
              localctx._e1.push(localctx._relation);
            }
          }
          this.state = 60;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  public relation(): RelationContext;
  public relation(_p: number): RelationContext;
  // @RuleVersion(0)
  public relation(_p?: number): RelationContext {
    if (_p === undefined) {
      _p = 0;
    }

    let _parentctx: ParserRuleContext = this._ctx;
    let _parentState: number = this.state;
    let localctx: RelationContext = new RelationContext(
      this,
      this._ctx,
      _parentState
    );
    let _prevctx: RelationContext = localctx;
    let _startState: number = 8;
    this.enterRecursionRule(localctx, 8, CELParser.RULE_relation, _p);
    let _la: number;
    try {
      let _alt: number;
      this.enterOuterAlt(localctx, 1);
      {
        {
          this.state = 62;
          this.calc(0);
        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 69;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 3, this._ctx);
        while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            if (this._parseListeners != null) {
              this.triggerExitRuleEvent();
            }
            _prevctx = localctx;
            {
              {
                localctx = new RelationContext(this, _parentctx, _parentState);
                this.pushNewRecursionContext(
                  localctx,
                  _startState,
                  CELParser.RULE_relation
                );
                this.state = 64;
                if (!this.precpred(this._ctx, 1)) {
                  throw this.createFailedPredicateException(
                    'this.precpred(this._ctx, 1)'
                  );
                }
                this.state = 65;
                localctx._op = this._input.LT(1);
                _la = this._input.LA(1);
                if (!((_la & ~0x1f) === 0 && ((1 << _la) & 254) !== 0)) {
                  localctx._op = this._errHandler.recoverInline(this);
                } else {
                  this._errHandler.reportMatch(this);
                  this.consume();
                }
                this.state = 66;
                this.relation(2);
              }
            }
          }
          this.state = 71;
          this._errHandler.sync(this);
          _alt = this._interp.adaptivePredict(this._input, 3, this._ctx);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.unrollRecursionContexts(_parentctx);
    }
    return localctx;
  }

  public calc(): CalcContext;
  public calc(_p: number): CalcContext;
  // @RuleVersion(0)
  public calc(_p?: number): CalcContext {
    if (_p === undefined) {
      _p = 0;
    }

    let _parentctx: ParserRuleContext = this._ctx;
    let _parentState: number = this.state;
    let localctx: CalcContext = new CalcContext(this, this._ctx, _parentState);
    let _prevctx: CalcContext = localctx;
    let _startState: number = 10;
    this.enterRecursionRule(localctx, 10, CELParser.RULE_calc, _p);
    let _la: number;
    try {
      let _alt: number;
      this.enterOuterAlt(localctx, 1);
      {
        {
          this.state = 73;
          this.unary();
        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 83;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 5, this._ctx);
        while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            if (this._parseListeners != null) {
              this.triggerExitRuleEvent();
            }
            _prevctx = localctx;
            {
              this.state = 81;
              this._errHandler.sync(this);
              switch (this._interp.adaptivePredict(this._input, 4, this._ctx)) {
                case 1:
                  {
                    localctx = new CalcContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(
                      localctx,
                      _startState,
                      CELParser.RULE_calc
                    );
                    this.state = 75;
                    if (!this.precpred(this._ctx, 2)) {
                      throw this.createFailedPredicateException(
                        'this.precpred(this._ctx, 2)'
                      );
                    }
                    this.state = 76;
                    localctx._op = this._input.LT(1);
                    _la = this._input.LA(1);
                    if (
                      !((_la & ~0x1f) === 0 && ((1 << _la) & 58720256) !== 0)
                    ) {
                      localctx._op = this._errHandler.recoverInline(this);
                    } else {
                      this._errHandler.reportMatch(this);
                      this.consume();
                    }
                    this.state = 77;
                    this.calc(3);
                  }
                  break;
                case 2:
                  {
                    localctx = new CalcContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(
                      localctx,
                      _startState,
                      CELParser.RULE_calc
                    );
                    this.state = 78;
                    if (!this.precpred(this._ctx, 1)) {
                      throw this.createFailedPredicateException(
                        'this.precpred(this._ctx, 1)'
                      );
                    }
                    this.state = 79;
                    localctx._op = this._input.LT(1);
                    _la = this._input.LA(1);
                    if (!(_la === 18 || _la === 22)) {
                      localctx._op = this._errHandler.recoverInline(this);
                    } else {
                      this._errHandler.reportMatch(this);
                      this.consume();
                    }
                    this.state = 80;
                    this.calc(2);
                  }
                  break;
              }
            }
          }
          this.state = 85;
          this._errHandler.sync(this);
          _alt = this._interp.adaptivePredict(this._input, 5, this._ctx);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.unrollRecursionContexts(_parentctx);
    }
    return localctx;
  }
  // @RuleVersion(0)
  public unary(): UnaryContext {
    let localctx: UnaryContext = new UnaryContext(this, this._ctx, this.state);
    this.enterRule(localctx, 12, CELParser.RULE_unary);
    let _la: number;
    try {
      let _alt: number;
      this.state = 99;
      this._errHandler.sync(this);
      switch (this._interp.adaptivePredict(this._input, 8, this._ctx)) {
        case 1:
          localctx = new MemberExprContext(this, localctx);
          this.enterOuterAlt(localctx, 1);
          {
            this.state = 86;
            this.member(0);
          }
          break;
        case 2:
          localctx = new LogicalNotContext(this, localctx);
          this.enterOuterAlt(localctx, 2);
          {
            this.state = 88;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            do {
              {
                {
                  this.state = 87;
                  (localctx as LogicalNotContext)._s19 = this.match(
                    CELParser.EXCLAM
                  );
                  (localctx as LogicalNotContext)._ops.push(
                    (localctx as LogicalNotContext)._s19
                  );
                }
              }
              this.state = 90;
              this._errHandler.sync(this);
              _la = this._input.LA(1);
            } while (_la === 19);
            this.state = 92;
            this.member(0);
          }
          break;
        case 3:
          localctx = new NegateContext(this, localctx);
          this.enterOuterAlt(localctx, 3);
          {
            this.state = 94;
            this._errHandler.sync(this);
            _alt = 1;
            do {
              switch (_alt) {
                case 1:
                  {
                    {
                      this.state = 93;
                      (localctx as NegateContext)._s18 = this.match(
                        CELParser.MINUS
                      );
                      (localctx as NegateContext)._ops.push(
                        (localctx as NegateContext)._s18
                      );
                    }
                  }
                  break;
                default:
                  throw new NoViableAltException(this);
              }
              this.state = 96;
              this._errHandler.sync(this);
              _alt = this._interp.adaptivePredict(this._input, 7, this._ctx);
            } while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER);
            this.state = 98;
            this.member(0);
          }
          break;
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  public member(): MemberContext;
  public member(_p: number): MemberContext;
  // @RuleVersion(0)
  public member(_p?: number): MemberContext {
    if (_p === undefined) {
      _p = 0;
    }

    let _parentctx: ParserRuleContext = this._ctx;
    let _parentState: number = this.state;
    let localctx: MemberContext = new MemberContext(
      this,
      this._ctx,
      _parentState
    );
    let _prevctx: MemberContext = localctx;
    let _startState: number = 14;
    this.enterRecursionRule(localctx, 14, CELParser.RULE_member, _p);
    let _la: number;
    try {
      let _alt: number;
      this.enterOuterAlt(localctx, 1);
      {
        {
          localctx = new PrimaryExprContext(this, localctx);
          this._ctx = localctx;
          _prevctx = localctx;

          this.state = 102;
          this.primary();
        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 128;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 13, this._ctx);
        while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            if (this._parseListeners != null) {
              this.triggerExitRuleEvent();
            }
            _prevctx = localctx;
            {
              this.state = 126;
              this._errHandler.sync(this);
              switch (
                this._interp.adaptivePredict(this._input, 12, this._ctx)
              ) {
                case 1:
                  {
                    localctx = new SelectContext(
                      this,
                      new MemberContext(this, _parentctx, _parentState)
                    );
                    this.pushNewRecursionContext(
                      localctx,
                      _startState,
                      CELParser.RULE_member
                    );
                    this.state = 104;
                    if (!this.precpred(this._ctx, 3)) {
                      throw this.createFailedPredicateException(
                        'this.precpred(this._ctx, 3)'
                      );
                    }
                    this.state = 105;
                    (localctx as SelectContext)._op = this.match(CELParser.DOT);
                    this.state = 107;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                    if (_la === 20) {
                      {
                        this.state = 106;
                        (localctx as SelectContext)._opt = this.match(
                          CELParser.QUESTIONMARK
                        );
                      }
                    }

                    this.state = 109;
                    (localctx as SelectContext)._id = this.escapeIdent();
                  }
                  break;
                case 2:
                  {
                    localctx = new MemberCallContext(
                      this,
                      new MemberContext(this, _parentctx, _parentState)
                    );
                    this.pushNewRecursionContext(
                      localctx,
                      _startState,
                      CELParser.RULE_member
                    );
                    this.state = 110;
                    if (!this.precpred(this._ctx, 2)) {
                      throw this.createFailedPredicateException(
                        'this.precpred(this._ctx, 2)'
                      );
                    }
                    this.state = 111;
                    (localctx as MemberCallContext)._op = this.match(
                      CELParser.DOT
                    );
                    this.state = 112;
                    (localctx as MemberCallContext)._id = this.match(
                      CELParser.IDENTIFIER
                    );
                    this.state = 113;
                    (localctx as MemberCallContext)._open = this.match(
                      CELParser.LPAREN
                    );
                    this.state = 115;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                    if (
                      ((_la - 10) & ~0x1f) === 0 &&
                      ((1 << (_la - 10)) & 132580181) !== 0
                    ) {
                      {
                        this.state = 114;
                        (localctx as MemberCallContext)._args = this.exprList();
                      }
                    }

                    this.state = 117;
                    this.match(CELParser.RPAREN);
                  }
                  break;
                case 3:
                  {
                    localctx = new IndexContext(
                      this,
                      new MemberContext(this, _parentctx, _parentState)
                    );
                    this.pushNewRecursionContext(
                      localctx,
                      _startState,
                      CELParser.RULE_member
                    );
                    this.state = 118;
                    if (!this.precpred(this._ctx, 1)) {
                      throw this.createFailedPredicateException(
                        'this.precpred(this._ctx, 1)'
                      );
                    }
                    this.state = 119;
                    (localctx as IndexContext)._op = this.match(
                      CELParser.LBRACKET
                    );
                    this.state = 121;
                    this._errHandler.sync(this);
                    _la = this._input.LA(1);
                    if (_la === 20) {
                      {
                        this.state = 120;
                        (localctx as IndexContext)._opt = this.match(
                          CELParser.QUESTIONMARK
                        );
                      }
                    }

                    this.state = 123;
                    (localctx as IndexContext)._index = this.expr();
                    this.state = 124;
                    this.match(CELParser.RPRACKET);
                  }
                  break;
              }
            }
          }
          this.state = 130;
          this._errHandler.sync(this);
          _alt = this._interp.adaptivePredict(this._input, 13, this._ctx);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.unrollRecursionContexts(_parentctx);
    }
    return localctx;
  }
  // @RuleVersion(0)
  public primary(): PrimaryContext {
    let localctx: PrimaryContext = new PrimaryContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 16, CELParser.RULE_primary);
    let _la: number;
    try {
      this.state = 184;
      this._errHandler.sync(this);
      switch (this._interp.adaptivePredict(this._input, 25, this._ctx)) {
        case 1:
          localctx = new IdentContext(this, localctx);
          this.enterOuterAlt(localctx, 1);
          {
            this.state = 132;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (_la === 16) {
              {
                this.state = 131;
                (localctx as IdentContext)._leadingDot = this.match(
                  CELParser.DOT
                );
              }
            }

            this.state = 134;
            (localctx as IdentContext)._id = this.match(CELParser.IDENTIFIER);
          }
          break;
        case 2:
          localctx = new GlobalCallContext(this, localctx);
          this.enterOuterAlt(localctx, 2);
          {
            this.state = 136;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (_la === 16) {
              {
                this.state = 135;
                (localctx as GlobalCallContext)._leadingDot = this.match(
                  CELParser.DOT
                );
              }
            }

            this.state = 138;
            (localctx as GlobalCallContext)._id = this.match(
              CELParser.IDENTIFIER
            );
            {
              this.state = 139;
              (localctx as GlobalCallContext)._op = this.match(
                CELParser.LPAREN
              );
              this.state = 141;
              this._errHandler.sync(this);
              _la = this._input.LA(1);
              if (
                ((_la - 10) & ~0x1f) === 0 &&
                ((1 << (_la - 10)) & 132580181) !== 0
              ) {
                {
                  this.state = 140;
                  (localctx as GlobalCallContext)._args = this.exprList();
                }
              }

              this.state = 143;
              this.match(CELParser.RPAREN);
            }
          }
          break;
        case 3:
          localctx = new NestedContext(this, localctx);
          this.enterOuterAlt(localctx, 3);
          {
            this.state = 144;
            this.match(CELParser.LPAREN);
            this.state = 145;
            (localctx as NestedContext)._e = this.expr();
            this.state = 146;
            this.match(CELParser.RPAREN);
          }
          break;
        case 4:
          localctx = new CreateListContext(this, localctx);
          this.enterOuterAlt(localctx, 4);
          {
            this.state = 148;
            (localctx as CreateListContext)._op = this.match(
              CELParser.LBRACKET
            );
            this.state = 150;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (
              ((_la - 10) & ~0x1f) === 0 &&
              ((1 << (_la - 10)) & 132581205) !== 0
            ) {
              {
                this.state = 149;
                (localctx as CreateListContext)._elems = this.listInit();
              }
            }

            this.state = 153;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (_la === 17) {
              {
                this.state = 152;
                this.match(CELParser.COMMA);
              }
            }

            this.state = 155;
            this.match(CELParser.RPRACKET);
          }
          break;
        case 5:
          localctx = new CreateStructContext(this, localctx);
          this.enterOuterAlt(localctx, 5);
          {
            this.state = 156;
            (localctx as CreateStructContext)._op = this.match(
              CELParser.LBRACE
            );
            this.state = 158;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (
              ((_la - 10) & ~0x1f) === 0 &&
              ((1 << (_la - 10)) & 132581205) !== 0
            ) {
              {
                this.state = 157;
                (localctx as CreateStructContext)._entries =
                  this.mapInitializerList();
              }
            }

            this.state = 161;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (_la === 17) {
              {
                this.state = 160;
                this.match(CELParser.COMMA);
              }
            }

            this.state = 163;
            this.match(CELParser.RBRACE);
          }
          break;
        case 6:
          localctx = new CreateMessageContext(this, localctx);
          this.enterOuterAlt(localctx, 6);
          {
            this.state = 165;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (_la === 16) {
              {
                this.state = 164;
                (localctx as CreateMessageContext)._leadingDot = this.match(
                  CELParser.DOT
                );
              }
            }

            this.state = 167;
            (localctx as CreateMessageContext)._IDENTIFIER = this.match(
              CELParser.IDENTIFIER
            );
            (localctx as CreateMessageContext)._ids.push(
              (localctx as CreateMessageContext)._IDENTIFIER
            );
            this.state = 172;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while (_la === 16) {
              {
                {
                  this.state = 168;
                  (localctx as CreateMessageContext)._s16 = this.match(
                    CELParser.DOT
                  );
                  (localctx as CreateMessageContext)._ops.push(
                    (localctx as CreateMessageContext)._s16
                  );
                  this.state = 169;
                  (localctx as CreateMessageContext)._IDENTIFIER = this.match(
                    CELParser.IDENTIFIER
                  );
                  (localctx as CreateMessageContext)._ids.push(
                    (localctx as CreateMessageContext)._IDENTIFIER
                  );
                }
              }
              this.state = 174;
              this._errHandler.sync(this);
              _la = this._input.LA(1);
            }
            this.state = 175;
            (localctx as CreateMessageContext)._op = this.match(
              CELParser.LBRACE
            );
            this.state = 177;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (
              ((_la - 20) & ~0x1f) === 0 &&
              ((1 << (_la - 20)) & 196609) !== 0
            ) {
              {
                this.state = 176;
                (localctx as CreateMessageContext)._entries =
                  this.fieldInitializerList();
              }
            }

            this.state = 180;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (_la === 17) {
              {
                this.state = 179;
                this.match(CELParser.COMMA);
              }
            }

            this.state = 182;
            this.match(CELParser.RBRACE);
          }
          break;
        case 7:
          localctx = new ConstantLiteralContext(this, localctx);
          this.enterOuterAlt(localctx, 7);
          {
            this.state = 183;
            this.literal();
          }
          break;
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public exprList(): ExprListContext {
    let localctx: ExprListContext = new ExprListContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 18, CELParser.RULE_exprList);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 186;
        localctx._expr = this.expr();
        localctx._e.push(localctx._expr);
        this.state = 191;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === 17) {
          {
            {
              this.state = 187;
              this.match(CELParser.COMMA);
              this.state = 188;
              localctx._expr = this.expr();
              localctx._e.push(localctx._expr);
            }
          }
          this.state = 193;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public listInit(): ListInitContext {
    let localctx: ListInitContext = new ListInitContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 20, CELParser.RULE_listInit);
    try {
      let _alt: number;
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 194;
        localctx._optExpr = this.optExpr();
        localctx._elems.push(localctx._optExpr);
        this.state = 199;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 27, this._ctx);
        while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            {
              {
                this.state = 195;
                this.match(CELParser.COMMA);
                this.state = 196;
                localctx._optExpr = this.optExpr();
                localctx._elems.push(localctx._optExpr);
              }
            }
          }
          this.state = 201;
          this._errHandler.sync(this);
          _alt = this._interp.adaptivePredict(this._input, 27, this._ctx);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public fieldInitializerList(): FieldInitializerListContext {
    let localctx: FieldInitializerListContext = new FieldInitializerListContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 22, CELParser.RULE_fieldInitializerList);
    try {
      let _alt: number;
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 202;
        localctx._optField = this.optField();
        localctx._fields.push(localctx._optField);
        this.state = 203;
        localctx._s21 = this.match(CELParser.COLON);
        localctx._cols.push(localctx._s21);
        this.state = 204;
        localctx._expr = this.expr();
        localctx._values.push(localctx._expr);
        this.state = 212;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 28, this._ctx);
        while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            {
              {
                this.state = 205;
                this.match(CELParser.COMMA);
                this.state = 206;
                localctx._optField = this.optField();
                localctx._fields.push(localctx._optField);
                this.state = 207;
                localctx._s21 = this.match(CELParser.COLON);
                localctx._cols.push(localctx._s21);
                this.state = 208;
                localctx._expr = this.expr();
                localctx._values.push(localctx._expr);
              }
            }
          }
          this.state = 214;
          this._errHandler.sync(this);
          _alt = this._interp.adaptivePredict(this._input, 28, this._ctx);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public optField(): OptFieldContext {
    let localctx: OptFieldContext = new OptFieldContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 24, CELParser.RULE_optField);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 216;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === 20) {
          {
            this.state = 215;
            localctx._opt = this.match(CELParser.QUESTIONMARK);
          }
        }

        this.state = 218;
        this.escapeIdent();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public mapInitializerList(): MapInitializerListContext {
    let localctx: MapInitializerListContext = new MapInitializerListContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 26, CELParser.RULE_mapInitializerList);
    try {
      let _alt: number;
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 220;
        localctx._optExpr = this.optExpr();
        localctx._keys.push(localctx._optExpr);
        this.state = 221;
        localctx._s21 = this.match(CELParser.COLON);
        localctx._cols.push(localctx._s21);
        this.state = 222;
        localctx._expr = this.expr();
        localctx._values.push(localctx._expr);
        this.state = 230;
        this._errHandler.sync(this);
        _alt = this._interp.adaptivePredict(this._input, 30, this._ctx);
        while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            {
              {
                this.state = 223;
                this.match(CELParser.COMMA);
                this.state = 224;
                localctx._optExpr = this.optExpr();
                localctx._keys.push(localctx._optExpr);
                this.state = 225;
                localctx._s21 = this.match(CELParser.COLON);
                localctx._cols.push(localctx._s21);
                this.state = 226;
                localctx._expr = this.expr();
                localctx._values.push(localctx._expr);
              }
            }
          }
          this.state = 232;
          this._errHandler.sync(this);
          _alt = this._interp.adaptivePredict(this._input, 30, this._ctx);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public escapeIdent(): EscapeIdentContext {
    let localctx: EscapeIdentContext = new EscapeIdentContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 28, CELParser.RULE_escapeIdent);
    try {
      this.state = 235;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case 36:
          localctx = new SimpleIdentifierContext(this, localctx);
          this.enterOuterAlt(localctx, 1);
          {
            this.state = 233;
            (localctx as SimpleIdentifierContext)._id = this.match(
              CELParser.IDENTIFIER
            );
          }
          break;
        case 37:
          localctx = new EscapedIdentifierContext(this, localctx);
          this.enterOuterAlt(localctx, 2);
          {
            this.state = 234;
            (localctx as EscapedIdentifierContext)._id = this.match(
              CELParser.ESC_IDENTIFIER
            );
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public optExpr(): OptExprContext {
    let localctx: OptExprContext = new OptExprContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 30, CELParser.RULE_optExpr);
    let _la: number;
    try {
      this.enterOuterAlt(localctx, 1);
      {
        this.state = 238;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === 20) {
          {
            this.state = 237;
            localctx._opt = this.match(CELParser.QUESTIONMARK);
          }
        }

        this.state = 240;
        localctx._e = this.expr();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }
  // @RuleVersion(0)
  public literal(): LiteralContext {
    let localctx: LiteralContext = new LiteralContext(
      this,
      this._ctx,
      this.state
    );
    this.enterRule(localctx, 32, CELParser.RULE_literal);
    let _la: number;
    try {
      this.state = 256;
      this._errHandler.sync(this);
      switch (this._interp.adaptivePredict(this._input, 35, this._ctx)) {
        case 1:
          localctx = new IntContext(this, localctx);
          this.enterOuterAlt(localctx, 1);
          {
            this.state = 243;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (_la === 18) {
              {
                this.state = 242;
                (localctx as IntContext)._sign = this.match(CELParser.MINUS);
              }
            }

            this.state = 245;
            (localctx as IntContext)._tok = this.match(CELParser.NUM_INT);
          }
          break;
        case 2:
          localctx = new UintContext(this, localctx);
          this.enterOuterAlt(localctx, 2);
          {
            this.state = 246;
            (localctx as UintContext)._tok = this.match(CELParser.NUM_UINT);
          }
          break;
        case 3:
          localctx = new DoubleContext(this, localctx);
          this.enterOuterAlt(localctx, 3);
          {
            this.state = 248;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (_la === 18) {
              {
                this.state = 247;
                (localctx as DoubleContext)._sign = this.match(CELParser.MINUS);
              }
            }

            this.state = 250;
            (localctx as DoubleContext)._tok = this.match(CELParser.NUM_FLOAT);
          }
          break;
        case 4:
          localctx = new StringContext(this, localctx);
          this.enterOuterAlt(localctx, 4);
          {
            this.state = 251;
            (localctx as StringContext)._tok = this.match(CELParser.STRING);
          }
          break;
        case 5:
          localctx = new BytesContext(this, localctx);
          this.enterOuterAlt(localctx, 5);
          {
            this.state = 252;
            (localctx as BytesContext)._tok = this.match(CELParser.BYTES);
          }
          break;
        case 6:
          localctx = new BoolTrueContext(this, localctx);
          this.enterOuterAlt(localctx, 6);
          {
            this.state = 253;
            (localctx as BoolTrueContext)._tok = this.match(CELParser.CEL_TRUE);
          }
          break;
        case 7:
          localctx = new BoolFalseContext(this, localctx);
          this.enterOuterAlt(localctx, 7);
          {
            this.state = 254;
            (localctx as BoolFalseContext)._tok = this.match(
              CELParser.CEL_FALSE
            );
          }
          break;
        case 8:
          localctx = new NullContext(this, localctx);
          this.enterOuterAlt(localctx, 8);
          {
            this.state = 255;
            (localctx as NullContext)._tok = this.match(CELParser.NUL);
          }
          break;
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localctx;
  }

  public sempred(
    localctx: RuleContext,
    ruleIndex: number,
    predIndex: number
  ): boolean {
    switch (ruleIndex) {
      case 4:
        return this.relation_sempred(localctx as RelationContext, predIndex);
      case 5:
        return this.calc_sempred(localctx as CalcContext, predIndex);
      case 7:
        return this.member_sempred(localctx as MemberContext, predIndex);
    }
    return true;
  }
  private relation_sempred(
    localctx: RelationContext,
    predIndex: number
  ): boolean {
    switch (predIndex) {
      case 0:
        return this.precpred(this._ctx, 1);
    }
    return true;
  }
  private calc_sempred(localctx: CalcContext, predIndex: number): boolean {
    switch (predIndex) {
      case 1:
        return this.precpred(this._ctx, 2);
      case 2:
        return this.precpred(this._ctx, 1);
    }
    return true;
  }
  private member_sempred(localctx: MemberContext, predIndex: number): boolean {
    switch (predIndex) {
      case 3:
        return this.precpred(this._ctx, 3);
      case 4:
        return this.precpred(this._ctx, 2);
      case 5:
        return this.precpred(this._ctx, 1);
    }
    return true;
  }

  public static readonly _serializedATN: number[] = [
    4, 1, 37, 259, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4,
    2, 5, 7, 5, 2, 6, 7, 6, 2, 7, 7, 7, 2, 8, 7, 8, 2, 9, 7, 9, 2, 10, 7, 10, 2,
    11, 7, 11, 2, 12, 7, 12, 2, 13, 7, 13, 2, 14, 7, 14, 2, 15, 7, 15, 2, 16, 7,
    16, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 44, 8, 1, 1,
    2, 1, 2, 1, 2, 5, 2, 49, 8, 2, 10, 2, 12, 2, 52, 9, 2, 1, 3, 1, 3, 1, 3, 5,
    3, 57, 8, 3, 10, 3, 12, 3, 60, 9, 3, 1, 4, 1, 4, 1, 4, 1, 4, 1, 4, 1, 4, 5,
    4, 68, 8, 4, 10, 4, 12, 4, 71, 9, 4, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1, 5, 1,
    5, 1, 5, 1, 5, 5, 5, 82, 8, 5, 10, 5, 12, 5, 85, 9, 5, 1, 6, 1, 6, 4, 6, 89,
    8, 6, 11, 6, 12, 6, 90, 1, 6, 1, 6, 4, 6, 95, 8, 6, 11, 6, 12, 6, 96, 1, 6,
    3, 6, 100, 8, 6, 1, 7, 1, 7, 1, 7, 1, 7, 1, 7, 1, 7, 3, 7, 108, 8, 7, 1, 7,
    1, 7, 1, 7, 1, 7, 1, 7, 1, 7, 3, 7, 116, 8, 7, 1, 7, 1, 7, 1, 7, 1, 7, 3, 7,
    122, 8, 7, 1, 7, 1, 7, 1, 7, 5, 7, 127, 8, 7, 10, 7, 12, 7, 130, 9, 7, 1, 8,
    3, 8, 133, 8, 8, 1, 8, 1, 8, 3, 8, 137, 8, 8, 1, 8, 1, 8, 1, 8, 3, 8, 142,
    8, 8, 1, 8, 1, 8, 1, 8, 1, 8, 1, 8, 1, 8, 1, 8, 3, 8, 151, 8, 8, 1, 8, 3, 8,
    154, 8, 8, 1, 8, 1, 8, 1, 8, 3, 8, 159, 8, 8, 1, 8, 3, 8, 162, 8, 8, 1, 8,
    1, 8, 3, 8, 166, 8, 8, 1, 8, 1, 8, 1, 8, 5, 8, 171, 8, 8, 10, 8, 12, 8, 174,
    9, 8, 1, 8, 1, 8, 3, 8, 178, 8, 8, 1, 8, 3, 8, 181, 8, 8, 1, 8, 1, 8, 3, 8,
    185, 8, 8, 1, 9, 1, 9, 1, 9, 5, 9, 190, 8, 9, 10, 9, 12, 9, 193, 9, 9, 1,
    10, 1, 10, 1, 10, 5, 10, 198, 8, 10, 10, 10, 12, 10, 201, 9, 10, 1, 11, 1,
    11, 1, 11, 1, 11, 1, 11, 1, 11, 1, 11, 1, 11, 5, 11, 211, 8, 11, 10, 11, 12,
    11, 214, 9, 11, 1, 12, 3, 12, 217, 8, 12, 1, 12, 1, 12, 1, 13, 1, 13, 1, 13,
    1, 13, 1, 13, 1, 13, 1, 13, 1, 13, 5, 13, 229, 8, 13, 10, 13, 12, 13, 232,
    9, 13, 1, 14, 1, 14, 3, 14, 236, 8, 14, 1, 15, 3, 15, 239, 8, 15, 1, 15, 1,
    15, 1, 16, 3, 16, 244, 8, 16, 1, 16, 1, 16, 1, 16, 3, 16, 249, 8, 16, 1, 16,
    1, 16, 1, 16, 1, 16, 1, 16, 1, 16, 3, 16, 257, 8, 16, 1, 16, 0, 3, 8, 10,
    14, 17, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 0, 3,
    1, 0, 1, 7, 1, 0, 23, 25, 2, 0, 18, 18, 22, 22, 290, 0, 34, 1, 0, 0, 0, 2,
    37, 1, 0, 0, 0, 4, 45, 1, 0, 0, 0, 6, 53, 1, 0, 0, 0, 8, 61, 1, 0, 0, 0, 10,
    72, 1, 0, 0, 0, 12, 99, 1, 0, 0, 0, 14, 101, 1, 0, 0, 0, 16, 184, 1, 0, 0,
    0, 18, 186, 1, 0, 0, 0, 20, 194, 1, 0, 0, 0, 22, 202, 1, 0, 0, 0, 24, 216,
    1, 0, 0, 0, 26, 220, 1, 0, 0, 0, 28, 235, 1, 0, 0, 0, 30, 238, 1, 0, 0, 0,
    32, 256, 1, 0, 0, 0, 34, 35, 3, 2, 1, 0, 35, 36, 5, 0, 0, 1, 36, 1, 1, 0, 0,
    0, 37, 43, 3, 4, 2, 0, 38, 39, 5, 20, 0, 0, 39, 40, 3, 4, 2, 0, 40, 41, 5,
    21, 0, 0, 41, 42, 3, 2, 1, 0, 42, 44, 1, 0, 0, 0, 43, 38, 1, 0, 0, 0, 43,
    44, 1, 0, 0, 0, 44, 3, 1, 0, 0, 0, 45, 50, 3, 6, 3, 0, 46, 47, 5, 9, 0, 0,
    47, 49, 3, 6, 3, 0, 48, 46, 1, 0, 0, 0, 49, 52, 1, 0, 0, 0, 50, 48, 1, 0, 0,
    0, 50, 51, 1, 0, 0, 0, 51, 5, 1, 0, 0, 0, 52, 50, 1, 0, 0, 0, 53, 58, 3, 8,
    4, 0, 54, 55, 5, 8, 0, 0, 55, 57, 3, 8, 4, 0, 56, 54, 1, 0, 0, 0, 57, 60, 1,
    0, 0, 0, 58, 56, 1, 0, 0, 0, 58, 59, 1, 0, 0, 0, 59, 7, 1, 0, 0, 0, 60, 58,
    1, 0, 0, 0, 61, 62, 6, 4, -1, 0, 62, 63, 3, 10, 5, 0, 63, 69, 1, 0, 0, 0,
    64, 65, 10, 1, 0, 0, 65, 66, 7, 0, 0, 0, 66, 68, 3, 8, 4, 2, 67, 64, 1, 0,
    0, 0, 68, 71, 1, 0, 0, 0, 69, 67, 1, 0, 0, 0, 69, 70, 1, 0, 0, 0, 70, 9, 1,
    0, 0, 0, 71, 69, 1, 0, 0, 0, 72, 73, 6, 5, -1, 0, 73, 74, 3, 12, 6, 0, 74,
    83, 1, 0, 0, 0, 75, 76, 10, 2, 0, 0, 76, 77, 7, 1, 0, 0, 77, 82, 3, 10, 5,
    3, 78, 79, 10, 1, 0, 0, 79, 80, 7, 2, 0, 0, 80, 82, 3, 10, 5, 2, 81, 75, 1,
    0, 0, 0, 81, 78, 1, 0, 0, 0, 82, 85, 1, 0, 0, 0, 83, 81, 1, 0, 0, 0, 83, 84,
    1, 0, 0, 0, 84, 11, 1, 0, 0, 0, 85, 83, 1, 0, 0, 0, 86, 100, 3, 14, 7, 0,
    87, 89, 5, 19, 0, 0, 88, 87, 1, 0, 0, 0, 89, 90, 1, 0, 0, 0, 90, 88, 1, 0,
    0, 0, 90, 91, 1, 0, 0, 0, 91, 92, 1, 0, 0, 0, 92, 100, 3, 14, 7, 0, 93, 95,
    5, 18, 0, 0, 94, 93, 1, 0, 0, 0, 95, 96, 1, 0, 0, 0, 96, 94, 1, 0, 0, 0, 96,
    97, 1, 0, 0, 0, 97, 98, 1, 0, 0, 0, 98, 100, 3, 14, 7, 0, 99, 86, 1, 0, 0,
    0, 99, 88, 1, 0, 0, 0, 99, 94, 1, 0, 0, 0, 100, 13, 1, 0, 0, 0, 101, 102, 6,
    7, -1, 0, 102, 103, 3, 16, 8, 0, 103, 128, 1, 0, 0, 0, 104, 105, 10, 3, 0,
    0, 105, 107, 5, 16, 0, 0, 106, 108, 5, 20, 0, 0, 107, 106, 1, 0, 0, 0, 107,
    108, 1, 0, 0, 0, 108, 109, 1, 0, 0, 0, 109, 127, 3, 28, 14, 0, 110, 111, 10,
    2, 0, 0, 111, 112, 5, 16, 0, 0, 112, 113, 5, 36, 0, 0, 113, 115, 5, 14, 0,
    0, 114, 116, 3, 18, 9, 0, 115, 114, 1, 0, 0, 0, 115, 116, 1, 0, 0, 0, 116,
    117, 1, 0, 0, 0, 117, 127, 5, 15, 0, 0, 118, 119, 10, 1, 0, 0, 119, 121, 5,
    10, 0, 0, 120, 122, 5, 20, 0, 0, 121, 120, 1, 0, 0, 0, 121, 122, 1, 0, 0, 0,
    122, 123, 1, 0, 0, 0, 123, 124, 3, 2, 1, 0, 124, 125, 5, 11, 0, 0, 125, 127,
    1, 0, 0, 0, 126, 104, 1, 0, 0, 0, 126, 110, 1, 0, 0, 0, 126, 118, 1, 0, 0,
    0, 127, 130, 1, 0, 0, 0, 128, 126, 1, 0, 0, 0, 128, 129, 1, 0, 0, 0, 129,
    15, 1, 0, 0, 0, 130, 128, 1, 0, 0, 0, 131, 133, 5, 16, 0, 0, 132, 131, 1, 0,
    0, 0, 132, 133, 1, 0, 0, 0, 133, 134, 1, 0, 0, 0, 134, 185, 5, 36, 0, 0,
    135, 137, 5, 16, 0, 0, 136, 135, 1, 0, 0, 0, 136, 137, 1, 0, 0, 0, 137, 138,
    1, 0, 0, 0, 138, 139, 5, 36, 0, 0, 139, 141, 5, 14, 0, 0, 140, 142, 3, 18,
    9, 0, 141, 140, 1, 0, 0, 0, 141, 142, 1, 0, 0, 0, 142, 143, 1, 0, 0, 0, 143,
    185, 5, 15, 0, 0, 144, 145, 5, 14, 0, 0, 145, 146, 3, 2, 1, 0, 146, 147, 5,
    15, 0, 0, 147, 185, 1, 0, 0, 0, 148, 150, 5, 10, 0, 0, 149, 151, 3, 20, 10,
    0, 150, 149, 1, 0, 0, 0, 150, 151, 1, 0, 0, 0, 151, 153, 1, 0, 0, 0, 152,
    154, 5, 17, 0, 0, 153, 152, 1, 0, 0, 0, 153, 154, 1, 0, 0, 0, 154, 155, 1,
    0, 0, 0, 155, 185, 5, 11, 0, 0, 156, 158, 5, 12, 0, 0, 157, 159, 3, 26, 13,
    0, 158, 157, 1, 0, 0, 0, 158, 159, 1, 0, 0, 0, 159, 161, 1, 0, 0, 0, 160,
    162, 5, 17, 0, 0, 161, 160, 1, 0, 0, 0, 161, 162, 1, 0, 0, 0, 162, 163, 1,
    0, 0, 0, 163, 185, 5, 13, 0, 0, 164, 166, 5, 16, 0, 0, 165, 164, 1, 0, 0, 0,
    165, 166, 1, 0, 0, 0, 166, 167, 1, 0, 0, 0, 167, 172, 5, 36, 0, 0, 168, 169,
    5, 16, 0, 0, 169, 171, 5, 36, 0, 0, 170, 168, 1, 0, 0, 0, 171, 174, 1, 0, 0,
    0, 172, 170, 1, 0, 0, 0, 172, 173, 1, 0, 0, 0, 173, 175, 1, 0, 0, 0, 174,
    172, 1, 0, 0, 0, 175, 177, 5, 12, 0, 0, 176, 178, 3, 22, 11, 0, 177, 176, 1,
    0, 0, 0, 177, 178, 1, 0, 0, 0, 178, 180, 1, 0, 0, 0, 179, 181, 5, 17, 0, 0,
    180, 179, 1, 0, 0, 0, 180, 181, 1, 0, 0, 0, 181, 182, 1, 0, 0, 0, 182, 185,
    5, 13, 0, 0, 183, 185, 3, 32, 16, 0, 184, 132, 1, 0, 0, 0, 184, 136, 1, 0,
    0, 0, 184, 144, 1, 0, 0, 0, 184, 148, 1, 0, 0, 0, 184, 156, 1, 0, 0, 0, 184,
    165, 1, 0, 0, 0, 184, 183, 1, 0, 0, 0, 185, 17, 1, 0, 0, 0, 186, 191, 3, 2,
    1, 0, 187, 188, 5, 17, 0, 0, 188, 190, 3, 2, 1, 0, 189, 187, 1, 0, 0, 0,
    190, 193, 1, 0, 0, 0, 191, 189, 1, 0, 0, 0, 191, 192, 1, 0, 0, 0, 192, 19,
    1, 0, 0, 0, 193, 191, 1, 0, 0, 0, 194, 199, 3, 30, 15, 0, 195, 196, 5, 17,
    0, 0, 196, 198, 3, 30, 15, 0, 197, 195, 1, 0, 0, 0, 198, 201, 1, 0, 0, 0,
    199, 197, 1, 0, 0, 0, 199, 200, 1, 0, 0, 0, 200, 21, 1, 0, 0, 0, 201, 199,
    1, 0, 0, 0, 202, 203, 3, 24, 12, 0, 203, 204, 5, 21, 0, 0, 204, 212, 3, 2,
    1, 0, 205, 206, 5, 17, 0, 0, 206, 207, 3, 24, 12, 0, 207, 208, 5, 21, 0, 0,
    208, 209, 3, 2, 1, 0, 209, 211, 1, 0, 0, 0, 210, 205, 1, 0, 0, 0, 211, 214,
    1, 0, 0, 0, 212, 210, 1, 0, 0, 0, 212, 213, 1, 0, 0, 0, 213, 23, 1, 0, 0, 0,
    214, 212, 1, 0, 0, 0, 215, 217, 5, 20, 0, 0, 216, 215, 1, 0, 0, 0, 216, 217,
    1, 0, 0, 0, 217, 218, 1, 0, 0, 0, 218, 219, 3, 28, 14, 0, 219, 25, 1, 0, 0,
    0, 220, 221, 3, 30, 15, 0, 221, 222, 5, 21, 0, 0, 222, 230, 3, 2, 1, 0, 223,
    224, 5, 17, 0, 0, 224, 225, 3, 30, 15, 0, 225, 226, 5, 21, 0, 0, 226, 227,
    3, 2, 1, 0, 227, 229, 1, 0, 0, 0, 228, 223, 1, 0, 0, 0, 229, 232, 1, 0, 0,
    0, 230, 228, 1, 0, 0, 0, 230, 231, 1, 0, 0, 0, 231, 27, 1, 0, 0, 0, 232,
    230, 1, 0, 0, 0, 233, 236, 5, 36, 0, 0, 234, 236, 5, 37, 0, 0, 235, 233, 1,
    0, 0, 0, 235, 234, 1, 0, 0, 0, 236, 29, 1, 0, 0, 0, 237, 239, 5, 20, 0, 0,
    238, 237, 1, 0, 0, 0, 238, 239, 1, 0, 0, 0, 239, 240, 1, 0, 0, 0, 240, 241,
    3, 2, 1, 0, 241, 31, 1, 0, 0, 0, 242, 244, 5, 18, 0, 0, 243, 242, 1, 0, 0,
    0, 243, 244, 1, 0, 0, 0, 244, 245, 1, 0, 0, 0, 245, 257, 5, 32, 0, 0, 246,
    257, 5, 33, 0, 0, 247, 249, 5, 18, 0, 0, 248, 247, 1, 0, 0, 0, 248, 249, 1,
    0, 0, 0, 249, 250, 1, 0, 0, 0, 250, 257, 5, 31, 0, 0, 251, 257, 5, 34, 0, 0,
    252, 257, 5, 35, 0, 0, 253, 257, 5, 26, 0, 0, 254, 257, 5, 27, 0, 0, 255,
    257, 5, 28, 0, 0, 256, 243, 1, 0, 0, 0, 256, 246, 1, 0, 0, 0, 256, 248, 1,
    0, 0, 0, 256, 251, 1, 0, 0, 0, 256, 252, 1, 0, 0, 0, 256, 253, 1, 0, 0, 0,
    256, 254, 1, 0, 0, 0, 256, 255, 1, 0, 0, 0, 257, 33, 1, 0, 0, 0, 36, 43, 50,
    58, 69, 81, 83, 90, 96, 99, 107, 115, 121, 126, 128, 132, 136, 141, 150,
    153, 158, 161, 165, 172, 177, 180, 184, 191, 199, 212, 216, 230, 235, 238,
    243, 248, 256,
  ];

  private static __ATN: ATN;
  public static get _ATN(): ATN {
    if (!CELParser.__ATN) {
      CELParser.__ATN = new ATNDeserializer().deserialize(
        CELParser._serializedATN
      );
    }

    return CELParser.__ATN;
  }

  static DecisionsToDFA = CELParser._ATN.decisionToState.map(
    (ds: DecisionState, index: number) => new DFA(ds, index)
  );
}

export class StartContext extends ParserRuleContext {
  public _e!: ExprContext;
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public EOF(): TerminalNode {
    return this.getToken(CELParser.EOF, 0);
  }
  public expr(): ExprContext {
    return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
  }
  public get ruleIndex(): number {
    return CELParser.RULE_start;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterStart) {
      listener.enterStart(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitStart) {
      listener.exitStart(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitStart) {
      return visitor.visitStart(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class ExprContext extends ParserRuleContext {
  public _e!: ConditionalOrContext;
  public _op!: Token;
  public _e1!: ConditionalOrContext;
  public _e2!: ExprContext;
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public conditionalOr_list(): ConditionalOrContext[] {
    return this.getTypedRuleContexts(
      ConditionalOrContext
    ) as ConditionalOrContext[];
  }
  public conditionalOr(i: number): ConditionalOrContext {
    return this.getTypedRuleContext(
      ConditionalOrContext,
      i
    ) as ConditionalOrContext;
  }
  public COLON(): TerminalNode {
    return this.getToken(CELParser.COLON, 0);
  }
  public QUESTIONMARK(): TerminalNode {
    return this.getToken(CELParser.QUESTIONMARK, 0);
  }
  public expr(): ExprContext {
    return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
  }
  public get ruleIndex(): number {
    return CELParser.RULE_expr;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterExpr) {
      listener.enterExpr(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitExpr) {
      listener.exitExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitExpr) {
      return visitor.visitExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class ConditionalOrContext extends ParserRuleContext {
  public _e!: ConditionalAndContext;
  public _s9!: Token;
  public _ops: Token[] = [];
  public _conditionalAnd!: ConditionalAndContext;
  public _e1: ConditionalAndContext[] = [];
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public conditionalAnd_list(): ConditionalAndContext[] {
    return this.getTypedRuleContexts(
      ConditionalAndContext
    ) as ConditionalAndContext[];
  }
  public conditionalAnd(i: number): ConditionalAndContext {
    return this.getTypedRuleContext(
      ConditionalAndContext,
      i
    ) as ConditionalAndContext;
  }
  public LOGICAL_OR_list(): TerminalNode[] {
    return this.getTokens(CELParser.LOGICAL_OR);
  }
  public LOGICAL_OR(i: number): TerminalNode {
    return this.getToken(CELParser.LOGICAL_OR, i);
  }
  public get ruleIndex(): number {
    return CELParser.RULE_conditionalOr;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterConditionalOr) {
      listener.enterConditionalOr(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitConditionalOr) {
      listener.exitConditionalOr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitConditionalOr) {
      return visitor.visitConditionalOr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class ConditionalAndContext extends ParserRuleContext {
  public _e!: RelationContext;
  public _s8!: Token;
  public _ops: Token[] = [];
  public _relation!: RelationContext;
  public _e1: RelationContext[] = [];
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public relation_list(): RelationContext[] {
    return this.getTypedRuleContexts(RelationContext) as RelationContext[];
  }
  public relation(i: number): RelationContext {
    return this.getTypedRuleContext(RelationContext, i) as RelationContext;
  }
  public LOGICAL_AND_list(): TerminalNode[] {
    return this.getTokens(CELParser.LOGICAL_AND);
  }
  public LOGICAL_AND(i: number): TerminalNode {
    return this.getToken(CELParser.LOGICAL_AND, i);
  }
  public get ruleIndex(): number {
    return CELParser.RULE_conditionalAnd;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterConditionalAnd) {
      listener.enterConditionalAnd(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitConditionalAnd) {
      listener.exitConditionalAnd(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitConditionalAnd) {
      return visitor.visitConditionalAnd(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class RelationContext extends ParserRuleContext {
  public _op!: Token;
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public calc(): CalcContext {
    return this.getTypedRuleContext(CalcContext, 0) as CalcContext;
  }
  public relation_list(): RelationContext[] {
    return this.getTypedRuleContexts(RelationContext) as RelationContext[];
  }
  public relation(i: number): RelationContext {
    return this.getTypedRuleContext(RelationContext, i) as RelationContext;
  }
  public LESS(): TerminalNode {
    return this.getToken(CELParser.LESS, 0);
  }
  public LESS_EQUALS(): TerminalNode {
    return this.getToken(CELParser.LESS_EQUALS, 0);
  }
  public GREATER_EQUALS(): TerminalNode {
    return this.getToken(CELParser.GREATER_EQUALS, 0);
  }
  public GREATER(): TerminalNode {
    return this.getToken(CELParser.GREATER, 0);
  }
  public EQUALS(): TerminalNode {
    return this.getToken(CELParser.EQUALS, 0);
  }
  public NOT_EQUALS(): TerminalNode {
    return this.getToken(CELParser.NOT_EQUALS, 0);
  }
  public IN(): TerminalNode {
    return this.getToken(CELParser.IN, 0);
  }
  public get ruleIndex(): number {
    return CELParser.RULE_relation;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterRelation) {
      listener.enterRelation(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitRelation) {
      listener.exitRelation(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitRelation) {
      return visitor.visitRelation(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class CalcContext extends ParserRuleContext {
  public _op!: Token;
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public unary(): UnaryContext {
    return this.getTypedRuleContext(UnaryContext, 0) as UnaryContext;
  }
  public calc_list(): CalcContext[] {
    return this.getTypedRuleContexts(CalcContext) as CalcContext[];
  }
  public calc(i: number): CalcContext {
    return this.getTypedRuleContext(CalcContext, i) as CalcContext;
  }
  public STAR(): TerminalNode {
    return this.getToken(CELParser.STAR, 0);
  }
  public SLASH(): TerminalNode {
    return this.getToken(CELParser.SLASH, 0);
  }
  public PERCENT(): TerminalNode {
    return this.getToken(CELParser.PERCENT, 0);
  }
  public PLUS(): TerminalNode {
    return this.getToken(CELParser.PLUS, 0);
  }
  public MINUS(): TerminalNode {
    return this.getToken(CELParser.MINUS, 0);
  }
  public get ruleIndex(): number {
    return CELParser.RULE_calc;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterCalc) {
      listener.enterCalc(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitCalc) {
      listener.exitCalc(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitCalc) {
      return visitor.visitCalc(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class UnaryContext extends ParserRuleContext {
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public get ruleIndex(): number {
    return CELParser.RULE_unary;
  }
  public override copyFrom(ctx: UnaryContext): void {
    super.copyFrom(ctx);
  }
}
export class LogicalNotContext extends UnaryContext {
  public _s19!: Token;
  public _ops: Token[] = [];
  constructor(parser: CELParser, ctx: UnaryContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public member(): MemberContext {
    return this.getTypedRuleContext(MemberContext, 0) as MemberContext;
  }
  public EXCLAM_list(): TerminalNode[] {
    return this.getTokens(CELParser.EXCLAM);
  }
  public EXCLAM(i: number): TerminalNode {
    return this.getToken(CELParser.EXCLAM, i);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterLogicalNot) {
      listener.enterLogicalNot(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitLogicalNot) {
      listener.exitLogicalNot(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitLogicalNot) {
      return visitor.visitLogicalNot(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class MemberExprContext extends UnaryContext {
  constructor(parser: CELParser, ctx: UnaryContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public member(): MemberContext {
    return this.getTypedRuleContext(MemberContext, 0) as MemberContext;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterMemberExpr) {
      listener.enterMemberExpr(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitMemberExpr) {
      listener.exitMemberExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitMemberExpr) {
      return visitor.visitMemberExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class NegateContext extends UnaryContext {
  public _s18!: Token;
  public _ops: Token[] = [];
  constructor(parser: CELParser, ctx: UnaryContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public member(): MemberContext {
    return this.getTypedRuleContext(MemberContext, 0) as MemberContext;
  }
  public MINUS_list(): TerminalNode[] {
    return this.getTokens(CELParser.MINUS);
  }
  public MINUS(i: number): TerminalNode {
    return this.getToken(CELParser.MINUS, i);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterNegate) {
      listener.enterNegate(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitNegate) {
      listener.exitNegate(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitNegate) {
      return visitor.visitNegate(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class MemberContext extends ParserRuleContext {
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public get ruleIndex(): number {
    return CELParser.RULE_member;
  }
  public override copyFrom(ctx: MemberContext): void {
    super.copyFrom(ctx);
  }
}
export class MemberCallContext extends MemberContext {
  public _op!: Token;
  public _id!: Token;
  public _open!: Token;
  public _args!: ExprListContext;
  constructor(parser: CELParser, ctx: MemberContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public member(): MemberContext {
    return this.getTypedRuleContext(MemberContext, 0) as MemberContext;
  }
  public RPAREN(): TerminalNode {
    return this.getToken(CELParser.RPAREN, 0);
  }
  public DOT(): TerminalNode {
    return this.getToken(CELParser.DOT, 0);
  }
  public IDENTIFIER(): TerminalNode {
    return this.getToken(CELParser.IDENTIFIER, 0);
  }
  public LPAREN(): TerminalNode {
    return this.getToken(CELParser.LPAREN, 0);
  }
  public exprList(): ExprListContext {
    return this.getTypedRuleContext(ExprListContext, 0) as ExprListContext;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterMemberCall) {
      listener.enterMemberCall(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitMemberCall) {
      listener.exitMemberCall(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitMemberCall) {
      return visitor.visitMemberCall(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class SelectContext extends MemberContext {
  public _op!: Token;
  public _opt!: Token;
  public _id!: EscapeIdentContext;
  constructor(parser: CELParser, ctx: MemberContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public member(): MemberContext {
    return this.getTypedRuleContext(MemberContext, 0) as MemberContext;
  }
  public DOT(): TerminalNode {
    return this.getToken(CELParser.DOT, 0);
  }
  public escapeIdent(): EscapeIdentContext {
    return this.getTypedRuleContext(
      EscapeIdentContext,
      0
    ) as EscapeIdentContext;
  }
  public QUESTIONMARK(): TerminalNode {
    return this.getToken(CELParser.QUESTIONMARK, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterSelect) {
      listener.enterSelect(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitSelect) {
      listener.exitSelect(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitSelect) {
      return visitor.visitSelect(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class PrimaryExprContext extends MemberContext {
  constructor(parser: CELParser, ctx: MemberContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public primary(): PrimaryContext {
    return this.getTypedRuleContext(PrimaryContext, 0) as PrimaryContext;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterPrimaryExpr) {
      listener.enterPrimaryExpr(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitPrimaryExpr) {
      listener.exitPrimaryExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitPrimaryExpr) {
      return visitor.visitPrimaryExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class IndexContext extends MemberContext {
  public _op!: Token;
  public _opt!: Token;
  public _index!: ExprContext;
  constructor(parser: CELParser, ctx: MemberContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public member(): MemberContext {
    return this.getTypedRuleContext(MemberContext, 0) as MemberContext;
  }
  public RPRACKET(): TerminalNode {
    return this.getToken(CELParser.RPRACKET, 0);
  }
  public LBRACKET(): TerminalNode {
    return this.getToken(CELParser.LBRACKET, 0);
  }
  public expr(): ExprContext {
    return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
  }
  public QUESTIONMARK(): TerminalNode {
    return this.getToken(CELParser.QUESTIONMARK, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterIndex) {
      listener.enterIndex(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitIndex) {
      listener.exitIndex(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitIndex) {
      return visitor.visitIndex(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class PrimaryContext extends ParserRuleContext {
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public get ruleIndex(): number {
    return CELParser.RULE_primary;
  }
  public override copyFrom(ctx: PrimaryContext): void {
    super.copyFrom(ctx);
  }
}
export class CreateListContext extends PrimaryContext {
  public _op!: Token;
  public _elems!: ListInitContext;
  constructor(parser: CELParser, ctx: PrimaryContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public RPRACKET(): TerminalNode {
    return this.getToken(CELParser.RPRACKET, 0);
  }
  public LBRACKET(): TerminalNode {
    return this.getToken(CELParser.LBRACKET, 0);
  }
  public COMMA(): TerminalNode {
    return this.getToken(CELParser.COMMA, 0);
  }
  public listInit(): ListInitContext {
    return this.getTypedRuleContext(ListInitContext, 0) as ListInitContext;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterCreateList) {
      listener.enterCreateList(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitCreateList) {
      listener.exitCreateList(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitCreateList) {
      return visitor.visitCreateList(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class IdentContext extends PrimaryContext {
  public _leadingDot!: Token;
  public _id!: Token;
  constructor(parser: CELParser, ctx: PrimaryContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public IDENTIFIER(): TerminalNode {
    return this.getToken(CELParser.IDENTIFIER, 0);
  }
  public DOT(): TerminalNode {
    return this.getToken(CELParser.DOT, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterIdent) {
      listener.enterIdent(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitIdent) {
      listener.exitIdent(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitIdent) {
      return visitor.visitIdent(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class CreateStructContext extends PrimaryContext {
  public _op!: Token;
  public _entries!: MapInitializerListContext;
  constructor(parser: CELParser, ctx: PrimaryContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public RBRACE(): TerminalNode {
    return this.getToken(CELParser.RBRACE, 0);
  }
  public LBRACE(): TerminalNode {
    return this.getToken(CELParser.LBRACE, 0);
  }
  public COMMA(): TerminalNode {
    return this.getToken(CELParser.COMMA, 0);
  }
  public mapInitializerList(): MapInitializerListContext {
    return this.getTypedRuleContext(
      MapInitializerListContext,
      0
    ) as MapInitializerListContext;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterCreateStruct) {
      listener.enterCreateStruct(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitCreateStruct) {
      listener.exitCreateStruct(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitCreateStruct) {
      return visitor.visitCreateStruct(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class ConstantLiteralContext extends PrimaryContext {
  constructor(parser: CELParser, ctx: PrimaryContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public literal(): LiteralContext {
    return this.getTypedRuleContext(LiteralContext, 0) as LiteralContext;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterConstantLiteral) {
      listener.enterConstantLiteral(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitConstantLiteral) {
      listener.exitConstantLiteral(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitConstantLiteral) {
      return visitor.visitConstantLiteral(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class NestedContext extends PrimaryContext {
  public _e!: ExprContext;
  constructor(parser: CELParser, ctx: PrimaryContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public LPAREN(): TerminalNode {
    return this.getToken(CELParser.LPAREN, 0);
  }
  public RPAREN(): TerminalNode {
    return this.getToken(CELParser.RPAREN, 0);
  }
  public expr(): ExprContext {
    return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterNested) {
      listener.enterNested(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitNested) {
      listener.exitNested(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitNested) {
      return visitor.visitNested(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class CreateMessageContext extends PrimaryContext {
  public _leadingDot!: Token;
  public _IDENTIFIER!: Token;
  public _ids: Token[] = [];
  public _s16!: Token;
  public _ops: Token[] = [];
  public _op!: Token;
  public _entries!: FieldInitializerListContext;
  constructor(parser: CELParser, ctx: PrimaryContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public RBRACE(): TerminalNode {
    return this.getToken(CELParser.RBRACE, 0);
  }
  public IDENTIFIER_list(): TerminalNode[] {
    return this.getTokens(CELParser.IDENTIFIER);
  }
  public IDENTIFIER(i: number): TerminalNode {
    return this.getToken(CELParser.IDENTIFIER, i);
  }
  public LBRACE(): TerminalNode {
    return this.getToken(CELParser.LBRACE, 0);
  }
  public COMMA(): TerminalNode {
    return this.getToken(CELParser.COMMA, 0);
  }
  public DOT_list(): TerminalNode[] {
    return this.getTokens(CELParser.DOT);
  }
  public DOT(i: number): TerminalNode {
    return this.getToken(CELParser.DOT, i);
  }
  public fieldInitializerList(): FieldInitializerListContext {
    return this.getTypedRuleContext(
      FieldInitializerListContext,
      0
    ) as FieldInitializerListContext;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterCreateMessage) {
      listener.enterCreateMessage(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitCreateMessage) {
      listener.exitCreateMessage(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitCreateMessage) {
      return visitor.visitCreateMessage(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class GlobalCallContext extends PrimaryContext {
  public _leadingDot!: Token;
  public _id!: Token;
  public _op!: Token;
  public _args!: ExprListContext;
  constructor(parser: CELParser, ctx: PrimaryContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public IDENTIFIER(): TerminalNode {
    return this.getToken(CELParser.IDENTIFIER, 0);
  }
  public RPAREN(): TerminalNode {
    return this.getToken(CELParser.RPAREN, 0);
  }
  public LPAREN(): TerminalNode {
    return this.getToken(CELParser.LPAREN, 0);
  }
  public DOT(): TerminalNode {
    return this.getToken(CELParser.DOT, 0);
  }
  public exprList(): ExprListContext {
    return this.getTypedRuleContext(ExprListContext, 0) as ExprListContext;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterGlobalCall) {
      listener.enterGlobalCall(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitGlobalCall) {
      listener.exitGlobalCall(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitGlobalCall) {
      return visitor.visitGlobalCall(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class ExprListContext extends ParserRuleContext {
  public _expr!: ExprContext;
  public _e: ExprContext[] = [];
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public expr_list(): ExprContext[] {
    return this.getTypedRuleContexts(ExprContext) as ExprContext[];
  }
  public expr(i: number): ExprContext {
    return this.getTypedRuleContext(ExprContext, i) as ExprContext;
  }
  public COMMA_list(): TerminalNode[] {
    return this.getTokens(CELParser.COMMA);
  }
  public COMMA(i: number): TerminalNode {
    return this.getToken(CELParser.COMMA, i);
  }
  public get ruleIndex(): number {
    return CELParser.RULE_exprList;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterExprList) {
      listener.enterExprList(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitExprList) {
      listener.exitExprList(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitExprList) {
      return visitor.visitExprList(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class ListInitContext extends ParserRuleContext {
  public _optExpr!: OptExprContext;
  public _elems: OptExprContext[] = [];
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public optExpr_list(): OptExprContext[] {
    return this.getTypedRuleContexts(OptExprContext) as OptExprContext[];
  }
  public optExpr(i: number): OptExprContext {
    return this.getTypedRuleContext(OptExprContext, i) as OptExprContext;
  }
  public COMMA_list(): TerminalNode[] {
    return this.getTokens(CELParser.COMMA);
  }
  public COMMA(i: number): TerminalNode {
    return this.getToken(CELParser.COMMA, i);
  }
  public get ruleIndex(): number {
    return CELParser.RULE_listInit;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterListInit) {
      listener.enterListInit(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitListInit) {
      listener.exitListInit(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitListInit) {
      return visitor.visitListInit(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class FieldInitializerListContext extends ParserRuleContext {
  public _optField!: OptFieldContext;
  public _fields: OptFieldContext[] = [];
  public _s21!: Token;
  public _cols: Token[] = [];
  public _expr!: ExprContext;
  public _values: ExprContext[] = [];
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public optField_list(): OptFieldContext[] {
    return this.getTypedRuleContexts(OptFieldContext) as OptFieldContext[];
  }
  public optField(i: number): OptFieldContext {
    return this.getTypedRuleContext(OptFieldContext, i) as OptFieldContext;
  }
  public COLON_list(): TerminalNode[] {
    return this.getTokens(CELParser.COLON);
  }
  public COLON(i: number): TerminalNode {
    return this.getToken(CELParser.COLON, i);
  }
  public expr_list(): ExprContext[] {
    return this.getTypedRuleContexts(ExprContext) as ExprContext[];
  }
  public expr(i: number): ExprContext {
    return this.getTypedRuleContext(ExprContext, i) as ExprContext;
  }
  public COMMA_list(): TerminalNode[] {
    return this.getTokens(CELParser.COMMA);
  }
  public COMMA(i: number): TerminalNode {
    return this.getToken(CELParser.COMMA, i);
  }
  public get ruleIndex(): number {
    return CELParser.RULE_fieldInitializerList;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterFieldInitializerList) {
      listener.enterFieldInitializerList(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitFieldInitializerList) {
      listener.exitFieldInitializerList(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitFieldInitializerList) {
      return visitor.visitFieldInitializerList(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class OptFieldContext extends ParserRuleContext {
  public _opt!: Token;
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public escapeIdent(): EscapeIdentContext {
    return this.getTypedRuleContext(
      EscapeIdentContext,
      0
    ) as EscapeIdentContext;
  }
  public QUESTIONMARK(): TerminalNode {
    return this.getToken(CELParser.QUESTIONMARK, 0);
  }
  public get ruleIndex(): number {
    return CELParser.RULE_optField;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterOptField) {
      listener.enterOptField(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitOptField) {
      listener.exitOptField(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitOptField) {
      return visitor.visitOptField(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class MapInitializerListContext extends ParserRuleContext {
  public _optExpr!: OptExprContext;
  public _keys: OptExprContext[] = [];
  public _s21!: Token;
  public _cols: Token[] = [];
  public _expr!: ExprContext;
  public _values: ExprContext[] = [];
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public optExpr_list(): OptExprContext[] {
    return this.getTypedRuleContexts(OptExprContext) as OptExprContext[];
  }
  public optExpr(i: number): OptExprContext {
    return this.getTypedRuleContext(OptExprContext, i) as OptExprContext;
  }
  public COLON_list(): TerminalNode[] {
    return this.getTokens(CELParser.COLON);
  }
  public COLON(i: number): TerminalNode {
    return this.getToken(CELParser.COLON, i);
  }
  public expr_list(): ExprContext[] {
    return this.getTypedRuleContexts(ExprContext) as ExprContext[];
  }
  public expr(i: number): ExprContext {
    return this.getTypedRuleContext(ExprContext, i) as ExprContext;
  }
  public COMMA_list(): TerminalNode[] {
    return this.getTokens(CELParser.COMMA);
  }
  public COMMA(i: number): TerminalNode {
    return this.getToken(CELParser.COMMA, i);
  }
  public get ruleIndex(): number {
    return CELParser.RULE_mapInitializerList;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterMapInitializerList) {
      listener.enterMapInitializerList(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitMapInitializerList) {
      listener.exitMapInitializerList(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitMapInitializerList) {
      return visitor.visitMapInitializerList(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class EscapeIdentContext extends ParserRuleContext {
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public get ruleIndex(): number {
    return CELParser.RULE_escapeIdent;
  }
  public override copyFrom(ctx: EscapeIdentContext): void {
    super.copyFrom(ctx);
  }
}
export class EscapedIdentifierContext extends EscapeIdentContext {
  public _id!: Token;
  constructor(parser: CELParser, ctx: EscapeIdentContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public ESC_IDENTIFIER(): TerminalNode {
    return this.getToken(CELParser.ESC_IDENTIFIER, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterEscapedIdentifier) {
      listener.enterEscapedIdentifier(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitEscapedIdentifier) {
      listener.exitEscapedIdentifier(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitEscapedIdentifier) {
      return visitor.visitEscapedIdentifier(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class SimpleIdentifierContext extends EscapeIdentContext {
  public _id!: Token;
  constructor(parser: CELParser, ctx: EscapeIdentContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public IDENTIFIER(): TerminalNode {
    return this.getToken(CELParser.IDENTIFIER, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterSimpleIdentifier) {
      listener.enterSimpleIdentifier(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitSimpleIdentifier) {
      listener.exitSimpleIdentifier(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitSimpleIdentifier) {
      return visitor.visitSimpleIdentifier(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class OptExprContext extends ParserRuleContext {
  public _opt!: Token;
  public _e!: ExprContext;
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public expr(): ExprContext {
    return this.getTypedRuleContext(ExprContext, 0) as ExprContext;
  }
  public QUESTIONMARK(): TerminalNode {
    return this.getToken(CELParser.QUESTIONMARK, 0);
  }
  public get ruleIndex(): number {
    return CELParser.RULE_optExpr;
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterOptExpr) {
      listener.enterOptExpr(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitOptExpr) {
      listener.exitOptExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitOptExpr) {
      return visitor.visitOptExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class LiteralContext extends ParserRuleContext {
  constructor(
    parser?: CELParser,
    parent?: ParserRuleContext,
    invokingState?: number
  ) {
    super(parent, invokingState);
    this.parser = parser;
  }
  public get ruleIndex(): number {
    return CELParser.RULE_literal;
  }
  public override copyFrom(ctx: LiteralContext): void {
    super.copyFrom(ctx);
  }
}
export class BytesContext extends LiteralContext {
  public _tok!: Token;
  constructor(parser: CELParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public BYTES(): TerminalNode {
    return this.getToken(CELParser.BYTES, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterBytes) {
      listener.enterBytes(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitBytes) {
      listener.exitBytes(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitBytes) {
      return visitor.visitBytes(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class UintContext extends LiteralContext {
  public _tok!: Token;
  constructor(parser: CELParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public NUM_UINT(): TerminalNode {
    return this.getToken(CELParser.NUM_UINT, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterUint) {
      listener.enterUint(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitUint) {
      listener.exitUint(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitUint) {
      return visitor.visitUint(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class NullContext extends LiteralContext {
  public _tok!: Token;
  constructor(parser: CELParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public NUL(): TerminalNode {
    return this.getToken(CELParser.NUL, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterNull) {
      listener.enterNull(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitNull) {
      listener.exitNull(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitNull) {
      return visitor.visitNull(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class BoolFalseContext extends LiteralContext {
  public _tok!: Token;
  constructor(parser: CELParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public CEL_FALSE(): TerminalNode {
    return this.getToken(CELParser.CEL_FALSE, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterBoolFalse) {
      listener.enterBoolFalse(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitBoolFalse) {
      listener.exitBoolFalse(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitBoolFalse) {
      return visitor.visitBoolFalse(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class StringContext extends LiteralContext {
  public _tok!: Token;
  constructor(parser: CELParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public STRING(): TerminalNode {
    return this.getToken(CELParser.STRING, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterString) {
      listener.enterString(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitString) {
      listener.exitString(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitString) {
      return visitor.visitString(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class DoubleContext extends LiteralContext {
  public _sign!: Token;
  public _tok!: Token;
  constructor(parser: CELParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public NUM_FLOAT(): TerminalNode {
    return this.getToken(CELParser.NUM_FLOAT, 0);
  }
  public MINUS(): TerminalNode {
    return this.getToken(CELParser.MINUS, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterDouble) {
      listener.enterDouble(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitDouble) {
      listener.exitDouble(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitDouble) {
      return visitor.visitDouble(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class BoolTrueContext extends LiteralContext {
  public _tok!: Token;
  constructor(parser: CELParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public CEL_TRUE(): TerminalNode {
    return this.getToken(CELParser.CEL_TRUE, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterBoolTrue) {
      listener.enterBoolTrue(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitBoolTrue) {
      listener.exitBoolTrue(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitBoolTrue) {
      return visitor.visitBoolTrue(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
export class IntContext extends LiteralContext {
  public _sign!: Token;
  public _tok!: Token;
  constructor(parser: CELParser, ctx: LiteralContext) {
    super(parser, ctx.parentCtx, ctx.invokingState);
    super.copyFrom(ctx);
  }
  public NUM_INT(): TerminalNode {
    return this.getToken(CELParser.NUM_INT, 0);
  }
  public MINUS(): TerminalNode {
    return this.getToken(CELParser.MINUS, 0);
  }
  public enterRule(listener: CELListener): void {
    if (listener.enterInt) {
      listener.enterInt(this);
    }
  }
  public exitRule(listener: CELListener): void {
    if (listener.exitInt) {
      listener.exitInt(this);
    }
  }
  // @Override
  public accept<Result>(visitor: CELVisitor<Result>): Result {
    if (visitor.visitInt) {
      return visitor.visitInt(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
