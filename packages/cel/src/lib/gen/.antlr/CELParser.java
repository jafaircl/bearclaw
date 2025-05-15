// Generated from /Users/jonathanfaircloth/Projects/bearclaw/packages/cel/src/lib/gen/CEL.g4 by ANTLR 4.13.1
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.*;
import org.antlr.v4.runtime.tree.*;
import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast", "CheckReturnValue"})
public class CELParser extends Parser {
	static { RuntimeMetaData.checkVersion("4.13.1", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		EQUALS=1, NOT_EQUALS=2, IN=3, LESS=4, LESS_EQUALS=5, GREATER_EQUALS=6, 
		GREATER=7, LOGICAL_AND=8, LOGICAL_OR=9, LBRACKET=10, RPRACKET=11, LBRACE=12, 
		RBRACE=13, LPAREN=14, RPAREN=15, DOT=16, COMMA=17, MINUS=18, EXCLAM=19, 
		QUESTIONMARK=20, COLON=21, PLUS=22, STAR=23, SLASH=24, PERCENT=25, CEL_TRUE=26, 
		CEL_FALSE=27, NUL=28, WHITESPACE=29, COMMENT=30, NUM_FLOAT=31, NUM_INT=32, 
		NUM_UINT=33, STRING=34, BYTES=35, IDENTIFIER=36, ESC_IDENTIFIER=37;
	public static final int
		RULE_start = 0, RULE_expr = 1, RULE_conditionalOr = 2, RULE_conditionalAnd = 3, 
		RULE_relation = 4, RULE_calc = 5, RULE_unary = 6, RULE_member = 7, RULE_primary = 8, 
		RULE_exprList = 9, RULE_listInit = 10, RULE_fieldInitializerList = 11, 
		RULE_optField = 12, RULE_mapInitializerList = 13, RULE_escapeIdent = 14, 
		RULE_optExpr = 15, RULE_literal = 16;
	private static String[] makeRuleNames() {
		return new String[] {
			"start", "expr", "conditionalOr", "conditionalAnd", "relation", "calc", 
			"unary", "member", "primary", "exprList", "listInit", "fieldInitializerList", 
			"optField", "mapInitializerList", "escapeIdent", "optExpr", "literal"
		};
	}
	public static final String[] ruleNames = makeRuleNames();

	private static String[] makeLiteralNames() {
		return new String[] {
			null, "'=='", "'!='", "'in'", "'<'", "'<='", "'>='", "'>'", "'&&'", "'||'", 
			"'['", "']'", "'{'", "'}'", "'('", "')'", "'.'", "','", "'-'", "'!'", 
			"'?'", "':'", "'+'", "'*'", "'/'", "'%'", "'true'", "'false'", "'null'"
		};
	}
	private static final String[] _LITERAL_NAMES = makeLiteralNames();
	private static String[] makeSymbolicNames() {
		return new String[] {
			null, "EQUALS", "NOT_EQUALS", "IN", "LESS", "LESS_EQUALS", "GREATER_EQUALS", 
			"GREATER", "LOGICAL_AND", "LOGICAL_OR", "LBRACKET", "RPRACKET", "LBRACE", 
			"RBRACE", "LPAREN", "RPAREN", "DOT", "COMMA", "MINUS", "EXCLAM", "QUESTIONMARK", 
			"COLON", "PLUS", "STAR", "SLASH", "PERCENT", "CEL_TRUE", "CEL_FALSE", 
			"NUL", "WHITESPACE", "COMMENT", "NUM_FLOAT", "NUM_INT", "NUM_UINT", "STRING", 
			"BYTES", "IDENTIFIER", "ESC_IDENTIFIER"
		};
	}
	private static final String[] _SYMBOLIC_NAMES = makeSymbolicNames();
	public static final Vocabulary VOCABULARY = new VocabularyImpl(_LITERAL_NAMES, _SYMBOLIC_NAMES);

	/**
	 * @deprecated Use {@link #VOCABULARY} instead.
	 */
	@Deprecated
	public static final String[] tokenNames;
	static {
		tokenNames = new String[_SYMBOLIC_NAMES.length];
		for (int i = 0; i < tokenNames.length; i++) {
			tokenNames[i] = VOCABULARY.getLiteralName(i);
			if (tokenNames[i] == null) {
				tokenNames[i] = VOCABULARY.getSymbolicName(i);
			}

			if (tokenNames[i] == null) {
				tokenNames[i] = "<INVALID>";
			}
		}
	}

	@Override
	@Deprecated
	public String[] getTokenNames() {
		return tokenNames;
	}

	@Override

	public Vocabulary getVocabulary() {
		return VOCABULARY;
	}

	@Override
	public String getGrammarFileName() { return "CEL.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public ATN getATN() { return _ATN; }

	public CELParser(TokenStream input) {
		super(input);
		_interp = new ParserATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	@SuppressWarnings("CheckReturnValue")
	public static class StartContext extends ParserRuleContext {
		public ExprContext e;
		public TerminalNode EOF() { return getToken(CELParser.EOF, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public StartContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_start; }
	}

	public final StartContext start() throws RecognitionException {
		StartContext _localctx = new StartContext(_ctx, getState());
		enterRule(_localctx, 0, RULE_start);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(34);
			((StartContext)_localctx).e = expr();
			setState(35);
			match(EOF);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ExprContext extends ParserRuleContext {
		public ConditionalOrContext e;
		public Token op;
		public ConditionalOrContext e1;
		public ExprContext e2;
		public List<ConditionalOrContext> conditionalOr() {
			return getRuleContexts(ConditionalOrContext.class);
		}
		public ConditionalOrContext conditionalOr(int i) {
			return getRuleContext(ConditionalOrContext.class,i);
		}
		public TerminalNode COLON() { return getToken(CELParser.COLON, 0); }
		public TerminalNode QUESTIONMARK() { return getToken(CELParser.QUESTIONMARK, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public ExprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_expr; }
	}

	public final ExprContext expr() throws RecognitionException {
		ExprContext _localctx = new ExprContext(_ctx, getState());
		enterRule(_localctx, 2, RULE_expr);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(37);
			((ExprContext)_localctx).e = conditionalOr();
			setState(43);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==QUESTIONMARK) {
				{
				setState(38);
				((ExprContext)_localctx).op = match(QUESTIONMARK);
				setState(39);
				((ExprContext)_localctx).e1 = conditionalOr();
				setState(40);
				match(COLON);
				setState(41);
				((ExprContext)_localctx).e2 = expr();
				}
			}

			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ConditionalOrContext extends ParserRuleContext {
		public ConditionalAndContext e;
		public Token s9;
		public List<Token> ops = new ArrayList<Token>();
		public ConditionalAndContext conditionalAnd;
		public List<ConditionalAndContext> e1 = new ArrayList<ConditionalAndContext>();
		public List<ConditionalAndContext> conditionalAnd() {
			return getRuleContexts(ConditionalAndContext.class);
		}
		public ConditionalAndContext conditionalAnd(int i) {
			return getRuleContext(ConditionalAndContext.class,i);
		}
		public List<TerminalNode> LOGICAL_OR() { return getTokens(CELParser.LOGICAL_OR); }
		public TerminalNode LOGICAL_OR(int i) {
			return getToken(CELParser.LOGICAL_OR, i);
		}
		public ConditionalOrContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_conditionalOr; }
	}

	public final ConditionalOrContext conditionalOr() throws RecognitionException {
		ConditionalOrContext _localctx = new ConditionalOrContext(_ctx, getState());
		enterRule(_localctx, 4, RULE_conditionalOr);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(45);
			((ConditionalOrContext)_localctx).e = conditionalAnd();
			setState(50);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==LOGICAL_OR) {
				{
				{
				setState(46);
				((ConditionalOrContext)_localctx).s9 = match(LOGICAL_OR);
				((ConditionalOrContext)_localctx).ops.add(((ConditionalOrContext)_localctx).s9);
				setState(47);
				((ConditionalOrContext)_localctx).conditionalAnd = conditionalAnd();
				((ConditionalOrContext)_localctx).e1.add(((ConditionalOrContext)_localctx).conditionalAnd);
				}
				}
				setState(52);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ConditionalAndContext extends ParserRuleContext {
		public RelationContext e;
		public Token s8;
		public List<Token> ops = new ArrayList<Token>();
		public RelationContext relation;
		public List<RelationContext> e1 = new ArrayList<RelationContext>();
		public List<RelationContext> relation() {
			return getRuleContexts(RelationContext.class);
		}
		public RelationContext relation(int i) {
			return getRuleContext(RelationContext.class,i);
		}
		public List<TerminalNode> LOGICAL_AND() { return getTokens(CELParser.LOGICAL_AND); }
		public TerminalNode LOGICAL_AND(int i) {
			return getToken(CELParser.LOGICAL_AND, i);
		}
		public ConditionalAndContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_conditionalAnd; }
	}

	public final ConditionalAndContext conditionalAnd() throws RecognitionException {
		ConditionalAndContext _localctx = new ConditionalAndContext(_ctx, getState());
		enterRule(_localctx, 6, RULE_conditionalAnd);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(53);
			((ConditionalAndContext)_localctx).e = relation(0);
			setState(58);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==LOGICAL_AND) {
				{
				{
				setState(54);
				((ConditionalAndContext)_localctx).s8 = match(LOGICAL_AND);
				((ConditionalAndContext)_localctx).ops.add(((ConditionalAndContext)_localctx).s8);
				setState(55);
				((ConditionalAndContext)_localctx).relation = relation(0);
				((ConditionalAndContext)_localctx).e1.add(((ConditionalAndContext)_localctx).relation);
				}
				}
				setState(60);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class RelationContext extends ParserRuleContext {
		public Token op;
		public CalcContext calc() {
			return getRuleContext(CalcContext.class,0);
		}
		public List<RelationContext> relation() {
			return getRuleContexts(RelationContext.class);
		}
		public RelationContext relation(int i) {
			return getRuleContext(RelationContext.class,i);
		}
		public TerminalNode LESS() { return getToken(CELParser.LESS, 0); }
		public TerminalNode LESS_EQUALS() { return getToken(CELParser.LESS_EQUALS, 0); }
		public TerminalNode GREATER_EQUALS() { return getToken(CELParser.GREATER_EQUALS, 0); }
		public TerminalNode GREATER() { return getToken(CELParser.GREATER, 0); }
		public TerminalNode EQUALS() { return getToken(CELParser.EQUALS, 0); }
		public TerminalNode NOT_EQUALS() { return getToken(CELParser.NOT_EQUALS, 0); }
		public TerminalNode IN() { return getToken(CELParser.IN, 0); }
		public RelationContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_relation; }
	}

	public final RelationContext relation() throws RecognitionException {
		return relation(0);
	}

	private RelationContext relation(int _p) throws RecognitionException {
		ParserRuleContext _parentctx = _ctx;
		int _parentState = getState();
		RelationContext _localctx = new RelationContext(_ctx, _parentState);
		RelationContext _prevctx = _localctx;
		int _startState = 8;
		enterRecursionRule(_localctx, 8, RULE_relation, _p);
		int _la;
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			{
			setState(62);
			calc(0);
			}
			_ctx.stop = _input.LT(-1);
			setState(69);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,3,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					{
					_localctx = new RelationContext(_parentctx, _parentState);
					pushNewRecursionContext(_localctx, _startState, RULE_relation);
					setState(64);
					if (!(precpred(_ctx, 1))) throw new FailedPredicateException(this, "precpred(_ctx, 1)");
					setState(65);
					((RelationContext)_localctx).op = _input.LT(1);
					_la = _input.LA(1);
					if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 254L) != 0)) ) {
						((RelationContext)_localctx).op = (Token)_errHandler.recoverInline(this);
					}
					else {
						if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
						_errHandler.reportMatch(this);
						consume();
					}
					setState(66);
					relation(2);
					}
					} 
				}
				setState(71);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,3,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class CalcContext extends ParserRuleContext {
		public Token op;
		public UnaryContext unary() {
			return getRuleContext(UnaryContext.class,0);
		}
		public List<CalcContext> calc() {
			return getRuleContexts(CalcContext.class);
		}
		public CalcContext calc(int i) {
			return getRuleContext(CalcContext.class,i);
		}
		public TerminalNode STAR() { return getToken(CELParser.STAR, 0); }
		public TerminalNode SLASH() { return getToken(CELParser.SLASH, 0); }
		public TerminalNode PERCENT() { return getToken(CELParser.PERCENT, 0); }
		public TerminalNode PLUS() { return getToken(CELParser.PLUS, 0); }
		public TerminalNode MINUS() { return getToken(CELParser.MINUS, 0); }
		public CalcContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_calc; }
	}

	public final CalcContext calc() throws RecognitionException {
		return calc(0);
	}

	private CalcContext calc(int _p) throws RecognitionException {
		ParserRuleContext _parentctx = _ctx;
		int _parentState = getState();
		CalcContext _localctx = new CalcContext(_ctx, _parentState);
		CalcContext _prevctx = _localctx;
		int _startState = 10;
		enterRecursionRule(_localctx, 10, RULE_calc, _p);
		int _la;
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			{
			setState(73);
			unary();
			}
			_ctx.stop = _input.LT(-1);
			setState(83);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,5,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(81);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,4,_ctx) ) {
					case 1:
						{
						_localctx = new CalcContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_calc);
						setState(75);
						if (!(precpred(_ctx, 2))) throw new FailedPredicateException(this, "precpred(_ctx, 2)");
						setState(76);
						((CalcContext)_localctx).op = _input.LT(1);
						_la = _input.LA(1);
						if ( !((((_la) & ~0x3f) == 0 && ((1L << _la) & 58720256L) != 0)) ) {
							((CalcContext)_localctx).op = (Token)_errHandler.recoverInline(this);
						}
						else {
							if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
							_errHandler.reportMatch(this);
							consume();
						}
						setState(77);
						calc(3);
						}
						break;
					case 2:
						{
						_localctx = new CalcContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_calc);
						setState(78);
						if (!(precpred(_ctx, 1))) throw new FailedPredicateException(this, "precpred(_ctx, 1)");
						setState(79);
						((CalcContext)_localctx).op = _input.LT(1);
						_la = _input.LA(1);
						if ( !(_la==MINUS || _la==PLUS) ) {
							((CalcContext)_localctx).op = (Token)_errHandler.recoverInline(this);
						}
						else {
							if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
							_errHandler.reportMatch(this);
							consume();
						}
						setState(80);
						calc(2);
						}
						break;
					}
					} 
				}
				setState(85);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,5,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class UnaryContext extends ParserRuleContext {
		public UnaryContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_unary; }
	 
		public UnaryContext() { }
		public void copyFrom(UnaryContext ctx) {
			super.copyFrom(ctx);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class LogicalNotContext extends UnaryContext {
		public Token s19;
		public List<Token> ops = new ArrayList<Token>();
		public MemberContext member() {
			return getRuleContext(MemberContext.class,0);
		}
		public List<TerminalNode> EXCLAM() { return getTokens(CELParser.EXCLAM); }
		public TerminalNode EXCLAM(int i) {
			return getToken(CELParser.EXCLAM, i);
		}
		public LogicalNotContext(UnaryContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class MemberExprContext extends UnaryContext {
		public MemberContext member() {
			return getRuleContext(MemberContext.class,0);
		}
		public MemberExprContext(UnaryContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class NegateContext extends UnaryContext {
		public Token s18;
		public List<Token> ops = new ArrayList<Token>();
		public MemberContext member() {
			return getRuleContext(MemberContext.class,0);
		}
		public List<TerminalNode> MINUS() { return getTokens(CELParser.MINUS); }
		public TerminalNode MINUS(int i) {
			return getToken(CELParser.MINUS, i);
		}
		public NegateContext(UnaryContext ctx) { copyFrom(ctx); }
	}

	public final UnaryContext unary() throws RecognitionException {
		UnaryContext _localctx = new UnaryContext(_ctx, getState());
		enterRule(_localctx, 12, RULE_unary);
		int _la;
		try {
			int _alt;
			setState(99);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,8,_ctx) ) {
			case 1:
				_localctx = new MemberExprContext(_localctx);
				enterOuterAlt(_localctx, 1);
				{
				setState(86);
				member(0);
				}
				break;
			case 2:
				_localctx = new LogicalNotContext(_localctx);
				enterOuterAlt(_localctx, 2);
				{
				setState(88); 
				_errHandler.sync(this);
				_la = _input.LA(1);
				do {
					{
					{
					setState(87);
					((LogicalNotContext)_localctx).s19 = match(EXCLAM);
					((LogicalNotContext)_localctx).ops.add(((LogicalNotContext)_localctx).s19);
					}
					}
					setState(90); 
					_errHandler.sync(this);
					_la = _input.LA(1);
				} while ( _la==EXCLAM );
				setState(92);
				member(0);
				}
				break;
			case 3:
				_localctx = new NegateContext(_localctx);
				enterOuterAlt(_localctx, 3);
				{
				setState(94); 
				_errHandler.sync(this);
				_alt = 1;
				do {
					switch (_alt) {
					case 1:
						{
						{
						setState(93);
						((NegateContext)_localctx).s18 = match(MINUS);
						((NegateContext)_localctx).ops.add(((NegateContext)_localctx).s18);
						}
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					setState(96); 
					_errHandler.sync(this);
					_alt = getInterpreter().adaptivePredict(_input,7,_ctx);
				} while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER );
				setState(98);
				member(0);
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class MemberContext extends ParserRuleContext {
		public MemberContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_member; }
	 
		public MemberContext() { }
		public void copyFrom(MemberContext ctx) {
			super.copyFrom(ctx);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class MemberCallContext extends MemberContext {
		public Token op;
		public Token id;
		public Token open;
		public ExprListContext args;
		public MemberContext member() {
			return getRuleContext(MemberContext.class,0);
		}
		public TerminalNode RPAREN() { return getToken(CELParser.RPAREN, 0); }
		public TerminalNode DOT() { return getToken(CELParser.DOT, 0); }
		public TerminalNode IDENTIFIER() { return getToken(CELParser.IDENTIFIER, 0); }
		public TerminalNode LPAREN() { return getToken(CELParser.LPAREN, 0); }
		public ExprListContext exprList() {
			return getRuleContext(ExprListContext.class,0);
		}
		public MemberCallContext(MemberContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class SelectContext extends MemberContext {
		public Token op;
		public Token opt;
		public EscapeIdentContext id;
		public MemberContext member() {
			return getRuleContext(MemberContext.class,0);
		}
		public TerminalNode DOT() { return getToken(CELParser.DOT, 0); }
		public EscapeIdentContext escapeIdent() {
			return getRuleContext(EscapeIdentContext.class,0);
		}
		public TerminalNode QUESTIONMARK() { return getToken(CELParser.QUESTIONMARK, 0); }
		public SelectContext(MemberContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class PrimaryExprContext extends MemberContext {
		public PrimaryContext primary() {
			return getRuleContext(PrimaryContext.class,0);
		}
		public PrimaryExprContext(MemberContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class IndexContext extends MemberContext {
		public Token op;
		public Token opt;
		public ExprContext index;
		public MemberContext member() {
			return getRuleContext(MemberContext.class,0);
		}
		public TerminalNode RPRACKET() { return getToken(CELParser.RPRACKET, 0); }
		public TerminalNode LBRACKET() { return getToken(CELParser.LBRACKET, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public TerminalNode QUESTIONMARK() { return getToken(CELParser.QUESTIONMARK, 0); }
		public IndexContext(MemberContext ctx) { copyFrom(ctx); }
	}

	public final MemberContext member() throws RecognitionException {
		return member(0);
	}

	private MemberContext member(int _p) throws RecognitionException {
		ParserRuleContext _parentctx = _ctx;
		int _parentState = getState();
		MemberContext _localctx = new MemberContext(_ctx, _parentState);
		MemberContext _prevctx = _localctx;
		int _startState = 14;
		enterRecursionRule(_localctx, 14, RULE_member, _p);
		int _la;
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			{
			_localctx = new PrimaryExprContext(_localctx);
			_ctx = _localctx;
			_prevctx = _localctx;

			setState(102);
			primary();
			}
			_ctx.stop = _input.LT(-1);
			setState(128);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,13,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(126);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,12,_ctx) ) {
					case 1:
						{
						_localctx = new SelectContext(new MemberContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_member);
						setState(104);
						if (!(precpred(_ctx, 3))) throw new FailedPredicateException(this, "precpred(_ctx, 3)");
						setState(105);
						((SelectContext)_localctx).op = match(DOT);
						setState(107);
						_errHandler.sync(this);
						_la = _input.LA(1);
						if (_la==QUESTIONMARK) {
							{
							setState(106);
							((SelectContext)_localctx).opt = match(QUESTIONMARK);
							}
						}

						setState(109);
						((SelectContext)_localctx).id = escapeIdent();
						}
						break;
					case 2:
						{
						_localctx = new MemberCallContext(new MemberContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_member);
						setState(110);
						if (!(precpred(_ctx, 2))) throw new FailedPredicateException(this, "precpred(_ctx, 2)");
						setState(111);
						((MemberCallContext)_localctx).op = match(DOT);
						setState(112);
						((MemberCallContext)_localctx).id = match(IDENTIFIER);
						setState(113);
						((MemberCallContext)_localctx).open = match(LPAREN);
						setState(115);
						_errHandler.sync(this);
						_la = _input.LA(1);
						if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 135762105344L) != 0)) {
							{
							setState(114);
							((MemberCallContext)_localctx).args = exprList();
							}
						}

						setState(117);
						match(RPAREN);
						}
						break;
					case 3:
						{
						_localctx = new IndexContext(new MemberContext(_parentctx, _parentState));
						pushNewRecursionContext(_localctx, _startState, RULE_member);
						setState(118);
						if (!(precpred(_ctx, 1))) throw new FailedPredicateException(this, "precpred(_ctx, 1)");
						setState(119);
						((IndexContext)_localctx).op = match(LBRACKET);
						setState(121);
						_errHandler.sync(this);
						_la = _input.LA(1);
						if (_la==QUESTIONMARK) {
							{
							setState(120);
							((IndexContext)_localctx).opt = match(QUESTIONMARK);
							}
						}

						setState(123);
						((IndexContext)_localctx).index = expr();
						setState(124);
						match(RPRACKET);
						}
						break;
					}
					} 
				}
				setState(130);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,13,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class PrimaryContext extends ParserRuleContext {
		public PrimaryContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_primary; }
	 
		public PrimaryContext() { }
		public void copyFrom(PrimaryContext ctx) {
			super.copyFrom(ctx);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class CreateListContext extends PrimaryContext {
		public Token op;
		public ListInitContext elems;
		public TerminalNode RPRACKET() { return getToken(CELParser.RPRACKET, 0); }
		public TerminalNode LBRACKET() { return getToken(CELParser.LBRACKET, 0); }
		public TerminalNode COMMA() { return getToken(CELParser.COMMA, 0); }
		public ListInitContext listInit() {
			return getRuleContext(ListInitContext.class,0);
		}
		public CreateListContext(PrimaryContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class IdentContext extends PrimaryContext {
		public Token leadingDot;
		public Token id;
		public TerminalNode IDENTIFIER() { return getToken(CELParser.IDENTIFIER, 0); }
		public TerminalNode DOT() { return getToken(CELParser.DOT, 0); }
		public IdentContext(PrimaryContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class CreateStructContext extends PrimaryContext {
		public Token op;
		public MapInitializerListContext entries;
		public TerminalNode RBRACE() { return getToken(CELParser.RBRACE, 0); }
		public TerminalNode LBRACE() { return getToken(CELParser.LBRACE, 0); }
		public TerminalNode COMMA() { return getToken(CELParser.COMMA, 0); }
		public MapInitializerListContext mapInitializerList() {
			return getRuleContext(MapInitializerListContext.class,0);
		}
		public CreateStructContext(PrimaryContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class ConstantLiteralContext extends PrimaryContext {
		public LiteralContext literal() {
			return getRuleContext(LiteralContext.class,0);
		}
		public ConstantLiteralContext(PrimaryContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class NestedContext extends PrimaryContext {
		public ExprContext e;
		public TerminalNode LPAREN() { return getToken(CELParser.LPAREN, 0); }
		public TerminalNode RPAREN() { return getToken(CELParser.RPAREN, 0); }
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public NestedContext(PrimaryContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class CreateMessageContext extends PrimaryContext {
		public Token leadingDot;
		public Token IDENTIFIER;
		public List<Token> ids = new ArrayList<Token>();
		public Token s16;
		public List<Token> ops = new ArrayList<Token>();
		public Token op;
		public FieldInitializerListContext entries;
		public TerminalNode RBRACE() { return getToken(CELParser.RBRACE, 0); }
		public List<TerminalNode> IDENTIFIER() { return getTokens(CELParser.IDENTIFIER); }
		public TerminalNode IDENTIFIER(int i) {
			return getToken(CELParser.IDENTIFIER, i);
		}
		public TerminalNode LBRACE() { return getToken(CELParser.LBRACE, 0); }
		public TerminalNode COMMA() { return getToken(CELParser.COMMA, 0); }
		public List<TerminalNode> DOT() { return getTokens(CELParser.DOT); }
		public TerminalNode DOT(int i) {
			return getToken(CELParser.DOT, i);
		}
		public FieldInitializerListContext fieldInitializerList() {
			return getRuleContext(FieldInitializerListContext.class,0);
		}
		public CreateMessageContext(PrimaryContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class GlobalCallContext extends PrimaryContext {
		public Token leadingDot;
		public Token id;
		public Token op;
		public ExprListContext args;
		public TerminalNode IDENTIFIER() { return getToken(CELParser.IDENTIFIER, 0); }
		public TerminalNode RPAREN() { return getToken(CELParser.RPAREN, 0); }
		public TerminalNode LPAREN() { return getToken(CELParser.LPAREN, 0); }
		public TerminalNode DOT() { return getToken(CELParser.DOT, 0); }
		public ExprListContext exprList() {
			return getRuleContext(ExprListContext.class,0);
		}
		public GlobalCallContext(PrimaryContext ctx) { copyFrom(ctx); }
	}

	public final PrimaryContext primary() throws RecognitionException {
		PrimaryContext _localctx = new PrimaryContext(_ctx, getState());
		enterRule(_localctx, 16, RULE_primary);
		int _la;
		try {
			setState(184);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,25,_ctx) ) {
			case 1:
				_localctx = new IdentContext(_localctx);
				enterOuterAlt(_localctx, 1);
				{
				setState(132);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==DOT) {
					{
					setState(131);
					((IdentContext)_localctx).leadingDot = match(DOT);
					}
				}

				setState(134);
				((IdentContext)_localctx).id = match(IDENTIFIER);
				}
				break;
			case 2:
				_localctx = new GlobalCallContext(_localctx);
				enterOuterAlt(_localctx, 2);
				{
				setState(136);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==DOT) {
					{
					setState(135);
					((GlobalCallContext)_localctx).leadingDot = match(DOT);
					}
				}

				setState(138);
				((GlobalCallContext)_localctx).id = match(IDENTIFIER);
				{
				setState(139);
				((GlobalCallContext)_localctx).op = match(LPAREN);
				setState(141);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 135762105344L) != 0)) {
					{
					setState(140);
					((GlobalCallContext)_localctx).args = exprList();
					}
				}

				setState(143);
				match(RPAREN);
				}
				}
				break;
			case 3:
				_localctx = new NestedContext(_localctx);
				enterOuterAlt(_localctx, 3);
				{
				setState(144);
				match(LPAREN);
				setState(145);
				((NestedContext)_localctx).e = expr();
				setState(146);
				match(RPAREN);
				}
				break;
			case 4:
				_localctx = new CreateListContext(_localctx);
				enterOuterAlt(_localctx, 4);
				{
				setState(148);
				((CreateListContext)_localctx).op = match(LBRACKET);
				setState(150);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 135763153920L) != 0)) {
					{
					setState(149);
					((CreateListContext)_localctx).elems = listInit();
					}
				}

				setState(153);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==COMMA) {
					{
					setState(152);
					match(COMMA);
					}
				}

				setState(155);
				match(RPRACKET);
				}
				break;
			case 5:
				_localctx = new CreateStructContext(_localctx);
				enterOuterAlt(_localctx, 5);
				{
				setState(156);
				((CreateStructContext)_localctx).op = match(LBRACE);
				setState(158);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 135763153920L) != 0)) {
					{
					setState(157);
					((CreateStructContext)_localctx).entries = mapInitializerList();
					}
				}

				setState(161);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==COMMA) {
					{
					setState(160);
					match(COMMA);
					}
				}

				setState(163);
				match(RBRACE);
				}
				break;
			case 6:
				_localctx = new CreateMessageContext(_localctx);
				enterOuterAlt(_localctx, 6);
				{
				setState(165);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==DOT) {
					{
					setState(164);
					((CreateMessageContext)_localctx).leadingDot = match(DOT);
					}
				}

				setState(167);
				((CreateMessageContext)_localctx).IDENTIFIER = match(IDENTIFIER);
				((CreateMessageContext)_localctx).ids.add(((CreateMessageContext)_localctx).IDENTIFIER);
				setState(172);
				_errHandler.sync(this);
				_la = _input.LA(1);
				while (_la==DOT) {
					{
					{
					setState(168);
					((CreateMessageContext)_localctx).s16 = match(DOT);
					((CreateMessageContext)_localctx).ops.add(((CreateMessageContext)_localctx).s16);
					setState(169);
					((CreateMessageContext)_localctx).IDENTIFIER = match(IDENTIFIER);
					((CreateMessageContext)_localctx).ids.add(((CreateMessageContext)_localctx).IDENTIFIER);
					}
					}
					setState(174);
					_errHandler.sync(this);
					_la = _input.LA(1);
				}
				setState(175);
				((CreateMessageContext)_localctx).op = match(LBRACE);
				setState(177);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if ((((_la) & ~0x3f) == 0 && ((1L << _la) & 206159478784L) != 0)) {
					{
					setState(176);
					((CreateMessageContext)_localctx).entries = fieldInitializerList();
					}
				}

				setState(180);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==COMMA) {
					{
					setState(179);
					match(COMMA);
					}
				}

				setState(182);
				match(RBRACE);
				}
				break;
			case 7:
				_localctx = new ConstantLiteralContext(_localctx);
				enterOuterAlt(_localctx, 7);
				{
				setState(183);
				literal();
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ExprListContext extends ParserRuleContext {
		public ExprContext expr;
		public List<ExprContext> e = new ArrayList<ExprContext>();
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(CELParser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(CELParser.COMMA, i);
		}
		public ExprListContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_exprList; }
	}

	public final ExprListContext exprList() throws RecognitionException {
		ExprListContext _localctx = new ExprListContext(_ctx, getState());
		enterRule(_localctx, 18, RULE_exprList);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(186);
			((ExprListContext)_localctx).expr = expr();
			((ExprListContext)_localctx).e.add(((ExprListContext)_localctx).expr);
			setState(191);
			_errHandler.sync(this);
			_la = _input.LA(1);
			while (_la==COMMA) {
				{
				{
				setState(187);
				match(COMMA);
				setState(188);
				((ExprListContext)_localctx).expr = expr();
				((ExprListContext)_localctx).e.add(((ExprListContext)_localctx).expr);
				}
				}
				setState(193);
				_errHandler.sync(this);
				_la = _input.LA(1);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class ListInitContext extends ParserRuleContext {
		public OptExprContext optExpr;
		public List<OptExprContext> elems = new ArrayList<OptExprContext>();
		public List<OptExprContext> optExpr() {
			return getRuleContexts(OptExprContext.class);
		}
		public OptExprContext optExpr(int i) {
			return getRuleContext(OptExprContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(CELParser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(CELParser.COMMA, i);
		}
		public ListInitContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_listInit; }
	}

	public final ListInitContext listInit() throws RecognitionException {
		ListInitContext _localctx = new ListInitContext(_ctx, getState());
		enterRule(_localctx, 20, RULE_listInit);
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(194);
			((ListInitContext)_localctx).optExpr = optExpr();
			((ListInitContext)_localctx).elems.add(((ListInitContext)_localctx).optExpr);
			setState(199);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,27,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					{
					{
					setState(195);
					match(COMMA);
					setState(196);
					((ListInitContext)_localctx).optExpr = optExpr();
					((ListInitContext)_localctx).elems.add(((ListInitContext)_localctx).optExpr);
					}
					} 
				}
				setState(201);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,27,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class FieldInitializerListContext extends ParserRuleContext {
		public OptFieldContext optField;
		public List<OptFieldContext> fields = new ArrayList<OptFieldContext>();
		public Token s21;
		public List<Token> cols = new ArrayList<Token>();
		public ExprContext expr;
		public List<ExprContext> values = new ArrayList<ExprContext>();
		public List<OptFieldContext> optField() {
			return getRuleContexts(OptFieldContext.class);
		}
		public OptFieldContext optField(int i) {
			return getRuleContext(OptFieldContext.class,i);
		}
		public List<TerminalNode> COLON() { return getTokens(CELParser.COLON); }
		public TerminalNode COLON(int i) {
			return getToken(CELParser.COLON, i);
		}
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(CELParser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(CELParser.COMMA, i);
		}
		public FieldInitializerListContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_fieldInitializerList; }
	}

	public final FieldInitializerListContext fieldInitializerList() throws RecognitionException {
		FieldInitializerListContext _localctx = new FieldInitializerListContext(_ctx, getState());
		enterRule(_localctx, 22, RULE_fieldInitializerList);
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(202);
			((FieldInitializerListContext)_localctx).optField = optField();
			((FieldInitializerListContext)_localctx).fields.add(((FieldInitializerListContext)_localctx).optField);
			setState(203);
			((FieldInitializerListContext)_localctx).s21 = match(COLON);
			((FieldInitializerListContext)_localctx).cols.add(((FieldInitializerListContext)_localctx).s21);
			setState(204);
			((FieldInitializerListContext)_localctx).expr = expr();
			((FieldInitializerListContext)_localctx).values.add(((FieldInitializerListContext)_localctx).expr);
			setState(212);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,28,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					{
					{
					setState(205);
					match(COMMA);
					setState(206);
					((FieldInitializerListContext)_localctx).optField = optField();
					((FieldInitializerListContext)_localctx).fields.add(((FieldInitializerListContext)_localctx).optField);
					setState(207);
					((FieldInitializerListContext)_localctx).s21 = match(COLON);
					((FieldInitializerListContext)_localctx).cols.add(((FieldInitializerListContext)_localctx).s21);
					setState(208);
					((FieldInitializerListContext)_localctx).expr = expr();
					((FieldInitializerListContext)_localctx).values.add(((FieldInitializerListContext)_localctx).expr);
					}
					} 
				}
				setState(214);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,28,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class OptFieldContext extends ParserRuleContext {
		public Token opt;
		public EscapeIdentContext escapeIdent() {
			return getRuleContext(EscapeIdentContext.class,0);
		}
		public TerminalNode QUESTIONMARK() { return getToken(CELParser.QUESTIONMARK, 0); }
		public OptFieldContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_optField; }
	}

	public final OptFieldContext optField() throws RecognitionException {
		OptFieldContext _localctx = new OptFieldContext(_ctx, getState());
		enterRule(_localctx, 24, RULE_optField);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(216);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==QUESTIONMARK) {
				{
				setState(215);
				((OptFieldContext)_localctx).opt = match(QUESTIONMARK);
				}
			}

			setState(218);
			escapeIdent();
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class MapInitializerListContext extends ParserRuleContext {
		public OptExprContext optExpr;
		public List<OptExprContext> keys = new ArrayList<OptExprContext>();
		public Token s21;
		public List<Token> cols = new ArrayList<Token>();
		public ExprContext expr;
		public List<ExprContext> values = new ArrayList<ExprContext>();
		public List<OptExprContext> optExpr() {
			return getRuleContexts(OptExprContext.class);
		}
		public OptExprContext optExpr(int i) {
			return getRuleContext(OptExprContext.class,i);
		}
		public List<TerminalNode> COLON() { return getTokens(CELParser.COLON); }
		public TerminalNode COLON(int i) {
			return getToken(CELParser.COLON, i);
		}
		public List<ExprContext> expr() {
			return getRuleContexts(ExprContext.class);
		}
		public ExprContext expr(int i) {
			return getRuleContext(ExprContext.class,i);
		}
		public List<TerminalNode> COMMA() { return getTokens(CELParser.COMMA); }
		public TerminalNode COMMA(int i) {
			return getToken(CELParser.COMMA, i);
		}
		public MapInitializerListContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_mapInitializerList; }
	}

	public final MapInitializerListContext mapInitializerList() throws RecognitionException {
		MapInitializerListContext _localctx = new MapInitializerListContext(_ctx, getState());
		enterRule(_localctx, 26, RULE_mapInitializerList);
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(220);
			((MapInitializerListContext)_localctx).optExpr = optExpr();
			((MapInitializerListContext)_localctx).keys.add(((MapInitializerListContext)_localctx).optExpr);
			setState(221);
			((MapInitializerListContext)_localctx).s21 = match(COLON);
			((MapInitializerListContext)_localctx).cols.add(((MapInitializerListContext)_localctx).s21);
			setState(222);
			((MapInitializerListContext)_localctx).expr = expr();
			((MapInitializerListContext)_localctx).values.add(((MapInitializerListContext)_localctx).expr);
			setState(230);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,30,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					{
					{
					setState(223);
					match(COMMA);
					setState(224);
					((MapInitializerListContext)_localctx).optExpr = optExpr();
					((MapInitializerListContext)_localctx).keys.add(((MapInitializerListContext)_localctx).optExpr);
					setState(225);
					((MapInitializerListContext)_localctx).s21 = match(COLON);
					((MapInitializerListContext)_localctx).cols.add(((MapInitializerListContext)_localctx).s21);
					setState(226);
					((MapInitializerListContext)_localctx).expr = expr();
					((MapInitializerListContext)_localctx).values.add(((MapInitializerListContext)_localctx).expr);
					}
					} 
				}
				setState(232);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,30,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class EscapeIdentContext extends ParserRuleContext {
		public EscapeIdentContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_escapeIdent; }
	 
		public EscapeIdentContext() { }
		public void copyFrom(EscapeIdentContext ctx) {
			super.copyFrom(ctx);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class EscapedIdentifierContext extends EscapeIdentContext {
		public Token id;
		public TerminalNode ESC_IDENTIFIER() { return getToken(CELParser.ESC_IDENTIFIER, 0); }
		public EscapedIdentifierContext(EscapeIdentContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class SimpleIdentifierContext extends EscapeIdentContext {
		public Token id;
		public TerminalNode IDENTIFIER() { return getToken(CELParser.IDENTIFIER, 0); }
		public SimpleIdentifierContext(EscapeIdentContext ctx) { copyFrom(ctx); }
	}

	public final EscapeIdentContext escapeIdent() throws RecognitionException {
		EscapeIdentContext _localctx = new EscapeIdentContext(_ctx, getState());
		enterRule(_localctx, 28, RULE_escapeIdent);
		try {
			setState(235);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case IDENTIFIER:
				_localctx = new SimpleIdentifierContext(_localctx);
				enterOuterAlt(_localctx, 1);
				{
				setState(233);
				((SimpleIdentifierContext)_localctx).id = match(IDENTIFIER);
				}
				break;
			case ESC_IDENTIFIER:
				_localctx = new EscapedIdentifierContext(_localctx);
				enterOuterAlt(_localctx, 2);
				{
				setState(234);
				((EscapedIdentifierContext)_localctx).id = match(ESC_IDENTIFIER);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class OptExprContext extends ParserRuleContext {
		public Token opt;
		public ExprContext e;
		public ExprContext expr() {
			return getRuleContext(ExprContext.class,0);
		}
		public TerminalNode QUESTIONMARK() { return getToken(CELParser.QUESTIONMARK, 0); }
		public OptExprContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_optExpr; }
	}

	public final OptExprContext optExpr() throws RecognitionException {
		OptExprContext _localctx = new OptExprContext(_ctx, getState());
		enterRule(_localctx, 30, RULE_optExpr);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(238);
			_errHandler.sync(this);
			_la = _input.LA(1);
			if (_la==QUESTIONMARK) {
				{
				setState(237);
				((OptExprContext)_localctx).opt = match(QUESTIONMARK);
				}
			}

			setState(240);
			((OptExprContext)_localctx).e = expr();
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	@SuppressWarnings("CheckReturnValue")
	public static class LiteralContext extends ParserRuleContext {
		public LiteralContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_literal; }
	 
		public LiteralContext() { }
		public void copyFrom(LiteralContext ctx) {
			super.copyFrom(ctx);
		}
	}
	@SuppressWarnings("CheckReturnValue")
	public static class BytesContext extends LiteralContext {
		public Token tok;
		public TerminalNode BYTES() { return getToken(CELParser.BYTES, 0); }
		public BytesContext(LiteralContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class UintContext extends LiteralContext {
		public Token tok;
		public TerminalNode NUM_UINT() { return getToken(CELParser.NUM_UINT, 0); }
		public UintContext(LiteralContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class NullContext extends LiteralContext {
		public Token tok;
		public TerminalNode NUL() { return getToken(CELParser.NUL, 0); }
		public NullContext(LiteralContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class BoolFalseContext extends LiteralContext {
		public Token tok;
		public TerminalNode CEL_FALSE() { return getToken(CELParser.CEL_FALSE, 0); }
		public BoolFalseContext(LiteralContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class StringContext extends LiteralContext {
		public Token tok;
		public TerminalNode STRING() { return getToken(CELParser.STRING, 0); }
		public StringContext(LiteralContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class DoubleContext extends LiteralContext {
		public Token sign;
		public Token tok;
		public TerminalNode NUM_FLOAT() { return getToken(CELParser.NUM_FLOAT, 0); }
		public TerminalNode MINUS() { return getToken(CELParser.MINUS, 0); }
		public DoubleContext(LiteralContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class BoolTrueContext extends LiteralContext {
		public Token tok;
		public TerminalNode CEL_TRUE() { return getToken(CELParser.CEL_TRUE, 0); }
		public BoolTrueContext(LiteralContext ctx) { copyFrom(ctx); }
	}
	@SuppressWarnings("CheckReturnValue")
	public static class IntContext extends LiteralContext {
		public Token sign;
		public Token tok;
		public TerminalNode NUM_INT() { return getToken(CELParser.NUM_INT, 0); }
		public TerminalNode MINUS() { return getToken(CELParser.MINUS, 0); }
		public IntContext(LiteralContext ctx) { copyFrom(ctx); }
	}

	public final LiteralContext literal() throws RecognitionException {
		LiteralContext _localctx = new LiteralContext(_ctx, getState());
		enterRule(_localctx, 32, RULE_literal);
		int _la;
		try {
			setState(256);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,35,_ctx) ) {
			case 1:
				_localctx = new IntContext(_localctx);
				enterOuterAlt(_localctx, 1);
				{
				setState(243);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==MINUS) {
					{
					setState(242);
					((IntContext)_localctx).sign = match(MINUS);
					}
				}

				setState(245);
				((IntContext)_localctx).tok = match(NUM_INT);
				}
				break;
			case 2:
				_localctx = new UintContext(_localctx);
				enterOuterAlt(_localctx, 2);
				{
				setState(246);
				((UintContext)_localctx).tok = match(NUM_UINT);
				}
				break;
			case 3:
				_localctx = new DoubleContext(_localctx);
				enterOuterAlt(_localctx, 3);
				{
				setState(248);
				_errHandler.sync(this);
				_la = _input.LA(1);
				if (_la==MINUS) {
					{
					setState(247);
					((DoubleContext)_localctx).sign = match(MINUS);
					}
				}

				setState(250);
				((DoubleContext)_localctx).tok = match(NUM_FLOAT);
				}
				break;
			case 4:
				_localctx = new StringContext(_localctx);
				enterOuterAlt(_localctx, 4);
				{
				setState(251);
				((StringContext)_localctx).tok = match(STRING);
				}
				break;
			case 5:
				_localctx = new BytesContext(_localctx);
				enterOuterAlt(_localctx, 5);
				{
				setState(252);
				((BytesContext)_localctx).tok = match(BYTES);
				}
				break;
			case 6:
				_localctx = new BoolTrueContext(_localctx);
				enterOuterAlt(_localctx, 6);
				{
				setState(253);
				((BoolTrueContext)_localctx).tok = match(CEL_TRUE);
				}
				break;
			case 7:
				_localctx = new BoolFalseContext(_localctx);
				enterOuterAlt(_localctx, 7);
				{
				setState(254);
				((BoolFalseContext)_localctx).tok = match(CEL_FALSE);
				}
				break;
			case 8:
				_localctx = new NullContext(_localctx);
				enterOuterAlt(_localctx, 8);
				{
				setState(255);
				((NullContext)_localctx).tok = match(NUL);
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public boolean sempred(RuleContext _localctx, int ruleIndex, int predIndex) {
		switch (ruleIndex) {
		case 4:
			return relation_sempred((RelationContext)_localctx, predIndex);
		case 5:
			return calc_sempred((CalcContext)_localctx, predIndex);
		case 7:
			return member_sempred((MemberContext)_localctx, predIndex);
		}
		return true;
	}
	private boolean relation_sempred(RelationContext _localctx, int predIndex) {
		switch (predIndex) {
		case 0:
			return precpred(_ctx, 1);
		}
		return true;
	}
	private boolean calc_sempred(CalcContext _localctx, int predIndex) {
		switch (predIndex) {
		case 1:
			return precpred(_ctx, 2);
		case 2:
			return precpred(_ctx, 1);
		}
		return true;
	}
	private boolean member_sempred(MemberContext _localctx, int predIndex) {
		switch (predIndex) {
		case 3:
			return precpred(_ctx, 3);
		case 4:
			return precpred(_ctx, 2);
		case 5:
			return precpred(_ctx, 1);
		}
		return true;
	}

	public static final String _serializedATN =
		"\u0004\u0001%\u0103\u0002\u0000\u0007\u0000\u0002\u0001\u0007\u0001\u0002"+
		"\u0002\u0007\u0002\u0002\u0003\u0007\u0003\u0002\u0004\u0007\u0004\u0002"+
		"\u0005\u0007\u0005\u0002\u0006\u0007\u0006\u0002\u0007\u0007\u0007\u0002"+
		"\b\u0007\b\u0002\t\u0007\t\u0002\n\u0007\n\u0002\u000b\u0007\u000b\u0002"+
		"\f\u0007\f\u0002\r\u0007\r\u0002\u000e\u0007\u000e\u0002\u000f\u0007\u000f"+
		"\u0002\u0010\u0007\u0010\u0001\u0000\u0001\u0000\u0001\u0000\u0001\u0001"+
		"\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0001\u0003\u0001"+
		",\b\u0001\u0001\u0002\u0001\u0002\u0001\u0002\u0005\u00021\b\u0002\n\u0002"+
		"\f\u00024\t\u0002\u0001\u0003\u0001\u0003\u0001\u0003\u0005\u00039\b\u0003"+
		"\n\u0003\f\u0003<\t\u0003\u0001\u0004\u0001\u0004\u0001\u0004\u0001\u0004"+
		"\u0001\u0004\u0001\u0004\u0005\u0004D\b\u0004\n\u0004\f\u0004G\t\u0004"+
		"\u0001\u0005\u0001\u0005\u0001\u0005\u0001\u0005\u0001\u0005\u0001\u0005"+
		"\u0001\u0005\u0001\u0005\u0001\u0005\u0005\u0005R\b\u0005\n\u0005\f\u0005"+
		"U\t\u0005\u0001\u0006\u0001\u0006\u0004\u0006Y\b\u0006\u000b\u0006\f\u0006"+
		"Z\u0001\u0006\u0001\u0006\u0004\u0006_\b\u0006\u000b\u0006\f\u0006`\u0001"+
		"\u0006\u0003\u0006d\b\u0006\u0001\u0007\u0001\u0007\u0001\u0007\u0001"+
		"\u0007\u0001\u0007\u0001\u0007\u0003\u0007l\b\u0007\u0001\u0007\u0001"+
		"\u0007\u0001\u0007\u0001\u0007\u0001\u0007\u0001\u0007\u0003\u0007t\b"+
		"\u0007\u0001\u0007\u0001\u0007\u0001\u0007\u0001\u0007\u0003\u0007z\b"+
		"\u0007\u0001\u0007\u0001\u0007\u0001\u0007\u0005\u0007\u007f\b\u0007\n"+
		"\u0007\f\u0007\u0082\t\u0007\u0001\b\u0003\b\u0085\b\b\u0001\b\u0001\b"+
		"\u0003\b\u0089\b\b\u0001\b\u0001\b\u0001\b\u0003\b\u008e\b\b\u0001\b\u0001"+
		"\b\u0001\b\u0001\b\u0001\b\u0001\b\u0001\b\u0003\b\u0097\b\b\u0001\b\u0003"+
		"\b\u009a\b\b\u0001\b\u0001\b\u0001\b\u0003\b\u009f\b\b\u0001\b\u0003\b"+
		"\u00a2\b\b\u0001\b\u0001\b\u0003\b\u00a6\b\b\u0001\b\u0001\b\u0001\b\u0005"+
		"\b\u00ab\b\b\n\b\f\b\u00ae\t\b\u0001\b\u0001\b\u0003\b\u00b2\b\b\u0001"+
		"\b\u0003\b\u00b5\b\b\u0001\b\u0001\b\u0003\b\u00b9\b\b\u0001\t\u0001\t"+
		"\u0001\t\u0005\t\u00be\b\t\n\t\f\t\u00c1\t\t\u0001\n\u0001\n\u0001\n\u0005"+
		"\n\u00c6\b\n\n\n\f\n\u00c9\t\n\u0001\u000b\u0001\u000b\u0001\u000b\u0001"+
		"\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0001\u000b\u0005\u000b\u00d3"+
		"\b\u000b\n\u000b\f\u000b\u00d6\t\u000b\u0001\f\u0003\f\u00d9\b\f\u0001"+
		"\f\u0001\f\u0001\r\u0001\r\u0001\r\u0001\r\u0001\r\u0001\r\u0001\r\u0001"+
		"\r\u0005\r\u00e5\b\r\n\r\f\r\u00e8\t\r\u0001\u000e\u0001\u000e\u0003\u000e"+
		"\u00ec\b\u000e\u0001\u000f\u0003\u000f\u00ef\b\u000f\u0001\u000f\u0001"+
		"\u000f\u0001\u0010\u0003\u0010\u00f4\b\u0010\u0001\u0010\u0001\u0010\u0001"+
		"\u0010\u0003\u0010\u00f9\b\u0010\u0001\u0010\u0001\u0010\u0001\u0010\u0001"+
		"\u0010\u0001\u0010\u0001\u0010\u0003\u0010\u0101\b\u0010\u0001\u0010\u0000"+
		"\u0003\b\n\u000e\u0011\u0000\u0002\u0004\u0006\b\n\f\u000e\u0010\u0012"+
		"\u0014\u0016\u0018\u001a\u001c\u001e \u0000\u0003\u0001\u0000\u0001\u0007"+
		"\u0001\u0000\u0017\u0019\u0002\u0000\u0012\u0012\u0016\u0016\u0122\u0000"+
		"\"\u0001\u0000\u0000\u0000\u0002%\u0001\u0000\u0000\u0000\u0004-\u0001"+
		"\u0000\u0000\u0000\u00065\u0001\u0000\u0000\u0000\b=\u0001\u0000\u0000"+
		"\u0000\nH\u0001\u0000\u0000\u0000\fc\u0001\u0000\u0000\u0000\u000ee\u0001"+
		"\u0000\u0000\u0000\u0010\u00b8\u0001\u0000\u0000\u0000\u0012\u00ba\u0001"+
		"\u0000\u0000\u0000\u0014\u00c2\u0001\u0000\u0000\u0000\u0016\u00ca\u0001"+
		"\u0000\u0000\u0000\u0018\u00d8\u0001\u0000\u0000\u0000\u001a\u00dc\u0001"+
		"\u0000\u0000\u0000\u001c\u00eb\u0001\u0000\u0000\u0000\u001e\u00ee\u0001"+
		"\u0000\u0000\u0000 \u0100\u0001\u0000\u0000\u0000\"#\u0003\u0002\u0001"+
		"\u0000#$\u0005\u0000\u0000\u0001$\u0001\u0001\u0000\u0000\u0000%+\u0003"+
		"\u0004\u0002\u0000&\'\u0005\u0014\u0000\u0000\'(\u0003\u0004\u0002\u0000"+
		"()\u0005\u0015\u0000\u0000)*\u0003\u0002\u0001\u0000*,\u0001\u0000\u0000"+
		"\u0000+&\u0001\u0000\u0000\u0000+,\u0001\u0000\u0000\u0000,\u0003\u0001"+
		"\u0000\u0000\u0000-2\u0003\u0006\u0003\u0000./\u0005\t\u0000\u0000/1\u0003"+
		"\u0006\u0003\u00000.\u0001\u0000\u0000\u000014\u0001\u0000\u0000\u0000"+
		"20\u0001\u0000\u0000\u000023\u0001\u0000\u0000\u00003\u0005\u0001\u0000"+
		"\u0000\u000042\u0001\u0000\u0000\u00005:\u0003\b\u0004\u000067\u0005\b"+
		"\u0000\u000079\u0003\b\u0004\u000086\u0001\u0000\u0000\u00009<\u0001\u0000"+
		"\u0000\u0000:8\u0001\u0000\u0000\u0000:;\u0001\u0000\u0000\u0000;\u0007"+
		"\u0001\u0000\u0000\u0000<:\u0001\u0000\u0000\u0000=>\u0006\u0004\uffff"+
		"\uffff\u0000>?\u0003\n\u0005\u0000?E\u0001\u0000\u0000\u0000@A\n\u0001"+
		"\u0000\u0000AB\u0007\u0000\u0000\u0000BD\u0003\b\u0004\u0002C@\u0001\u0000"+
		"\u0000\u0000DG\u0001\u0000\u0000\u0000EC\u0001\u0000\u0000\u0000EF\u0001"+
		"\u0000\u0000\u0000F\t\u0001\u0000\u0000\u0000GE\u0001\u0000\u0000\u0000"+
		"HI\u0006\u0005\uffff\uffff\u0000IJ\u0003\f\u0006\u0000JS\u0001\u0000\u0000"+
		"\u0000KL\n\u0002\u0000\u0000LM\u0007\u0001\u0000\u0000MR\u0003\n\u0005"+
		"\u0003NO\n\u0001\u0000\u0000OP\u0007\u0002\u0000\u0000PR\u0003\n\u0005"+
		"\u0002QK\u0001\u0000\u0000\u0000QN\u0001\u0000\u0000\u0000RU\u0001\u0000"+
		"\u0000\u0000SQ\u0001\u0000\u0000\u0000ST\u0001\u0000\u0000\u0000T\u000b"+
		"\u0001\u0000\u0000\u0000US\u0001\u0000\u0000\u0000Vd\u0003\u000e\u0007"+
		"\u0000WY\u0005\u0013\u0000\u0000XW\u0001\u0000\u0000\u0000YZ\u0001\u0000"+
		"\u0000\u0000ZX\u0001\u0000\u0000\u0000Z[\u0001\u0000\u0000\u0000[\\\u0001"+
		"\u0000\u0000\u0000\\d\u0003\u000e\u0007\u0000]_\u0005\u0012\u0000\u0000"+
		"^]\u0001\u0000\u0000\u0000_`\u0001\u0000\u0000\u0000`^\u0001\u0000\u0000"+
		"\u0000`a\u0001\u0000\u0000\u0000ab\u0001\u0000\u0000\u0000bd\u0003\u000e"+
		"\u0007\u0000cV\u0001\u0000\u0000\u0000cX\u0001\u0000\u0000\u0000c^\u0001"+
		"\u0000\u0000\u0000d\r\u0001\u0000\u0000\u0000ef\u0006\u0007\uffff\uffff"+
		"\u0000fg\u0003\u0010\b\u0000g\u0080\u0001\u0000\u0000\u0000hi\n\u0003"+
		"\u0000\u0000ik\u0005\u0010\u0000\u0000jl\u0005\u0014\u0000\u0000kj\u0001"+
		"\u0000\u0000\u0000kl\u0001\u0000\u0000\u0000lm\u0001\u0000\u0000\u0000"+
		"m\u007f\u0003\u001c\u000e\u0000no\n\u0002\u0000\u0000op\u0005\u0010\u0000"+
		"\u0000pq\u0005$\u0000\u0000qs\u0005\u000e\u0000\u0000rt\u0003\u0012\t"+
		"\u0000sr\u0001\u0000\u0000\u0000st\u0001\u0000\u0000\u0000tu\u0001\u0000"+
		"\u0000\u0000u\u007f\u0005\u000f\u0000\u0000vw\n\u0001\u0000\u0000wy\u0005"+
		"\n\u0000\u0000xz\u0005\u0014\u0000\u0000yx\u0001\u0000\u0000\u0000yz\u0001"+
		"\u0000\u0000\u0000z{\u0001\u0000\u0000\u0000{|\u0003\u0002\u0001\u0000"+
		"|}\u0005\u000b\u0000\u0000}\u007f\u0001\u0000\u0000\u0000~h\u0001\u0000"+
		"\u0000\u0000~n\u0001\u0000\u0000\u0000~v\u0001\u0000\u0000\u0000\u007f"+
		"\u0082\u0001\u0000\u0000\u0000\u0080~\u0001\u0000\u0000\u0000\u0080\u0081"+
		"\u0001\u0000\u0000\u0000\u0081\u000f\u0001\u0000\u0000\u0000\u0082\u0080"+
		"\u0001\u0000\u0000\u0000\u0083\u0085\u0005\u0010\u0000\u0000\u0084\u0083"+
		"\u0001\u0000\u0000\u0000\u0084\u0085\u0001\u0000\u0000\u0000\u0085\u0086"+
		"\u0001\u0000\u0000\u0000\u0086\u00b9\u0005$\u0000\u0000\u0087\u0089\u0005"+
		"\u0010\u0000\u0000\u0088\u0087\u0001\u0000\u0000\u0000\u0088\u0089\u0001"+
		"\u0000\u0000\u0000\u0089\u008a\u0001\u0000\u0000\u0000\u008a\u008b\u0005"+
		"$\u0000\u0000\u008b\u008d\u0005\u000e\u0000\u0000\u008c\u008e\u0003\u0012"+
		"\t\u0000\u008d\u008c\u0001\u0000\u0000\u0000\u008d\u008e\u0001\u0000\u0000"+
		"\u0000\u008e\u008f\u0001\u0000\u0000\u0000\u008f\u00b9\u0005\u000f\u0000"+
		"\u0000\u0090\u0091\u0005\u000e\u0000\u0000\u0091\u0092\u0003\u0002\u0001"+
		"\u0000\u0092\u0093\u0005\u000f\u0000\u0000\u0093\u00b9\u0001\u0000\u0000"+
		"\u0000\u0094\u0096\u0005\n\u0000\u0000\u0095\u0097\u0003\u0014\n\u0000"+
		"\u0096\u0095\u0001\u0000\u0000\u0000\u0096\u0097\u0001\u0000\u0000\u0000"+
		"\u0097\u0099\u0001\u0000\u0000\u0000\u0098\u009a\u0005\u0011\u0000\u0000"+
		"\u0099\u0098\u0001\u0000\u0000\u0000\u0099\u009a\u0001\u0000\u0000\u0000"+
		"\u009a\u009b\u0001\u0000\u0000\u0000\u009b\u00b9\u0005\u000b\u0000\u0000"+
		"\u009c\u009e\u0005\f\u0000\u0000\u009d\u009f\u0003\u001a\r\u0000\u009e"+
		"\u009d\u0001\u0000\u0000\u0000\u009e\u009f\u0001\u0000\u0000\u0000\u009f"+
		"\u00a1\u0001\u0000\u0000\u0000\u00a0\u00a2\u0005\u0011\u0000\u0000\u00a1"+
		"\u00a0\u0001\u0000\u0000\u0000\u00a1\u00a2\u0001\u0000\u0000\u0000\u00a2"+
		"\u00a3\u0001\u0000\u0000\u0000\u00a3\u00b9\u0005\r\u0000\u0000\u00a4\u00a6"+
		"\u0005\u0010\u0000\u0000\u00a5\u00a4\u0001\u0000\u0000\u0000\u00a5\u00a6"+
		"\u0001\u0000\u0000\u0000\u00a6\u00a7\u0001\u0000\u0000\u0000\u00a7\u00ac"+
		"\u0005$\u0000\u0000\u00a8\u00a9\u0005\u0010\u0000\u0000\u00a9\u00ab\u0005"+
		"$\u0000\u0000\u00aa\u00a8\u0001\u0000\u0000\u0000\u00ab\u00ae\u0001\u0000"+
		"\u0000\u0000\u00ac\u00aa\u0001\u0000\u0000\u0000\u00ac\u00ad\u0001\u0000"+
		"\u0000\u0000\u00ad\u00af\u0001\u0000\u0000\u0000\u00ae\u00ac\u0001\u0000"+
		"\u0000\u0000\u00af\u00b1\u0005\f\u0000\u0000\u00b0\u00b2\u0003\u0016\u000b"+
		"\u0000\u00b1\u00b0\u0001\u0000\u0000\u0000\u00b1\u00b2\u0001\u0000\u0000"+
		"\u0000\u00b2\u00b4\u0001\u0000\u0000\u0000\u00b3\u00b5\u0005\u0011\u0000"+
		"\u0000\u00b4\u00b3\u0001\u0000\u0000\u0000\u00b4\u00b5\u0001\u0000\u0000"+
		"\u0000\u00b5\u00b6\u0001\u0000\u0000\u0000\u00b6\u00b9\u0005\r\u0000\u0000"+
		"\u00b7\u00b9\u0003 \u0010\u0000\u00b8\u0084\u0001\u0000\u0000\u0000\u00b8"+
		"\u0088\u0001\u0000\u0000\u0000\u00b8\u0090\u0001\u0000\u0000\u0000\u00b8"+
		"\u0094\u0001\u0000\u0000\u0000\u00b8\u009c\u0001\u0000\u0000\u0000\u00b8"+
		"\u00a5\u0001\u0000\u0000\u0000\u00b8\u00b7\u0001\u0000\u0000\u0000\u00b9"+
		"\u0011\u0001\u0000\u0000\u0000\u00ba\u00bf\u0003\u0002\u0001\u0000\u00bb"+
		"\u00bc\u0005\u0011\u0000\u0000\u00bc\u00be\u0003\u0002\u0001\u0000\u00bd"+
		"\u00bb\u0001\u0000\u0000\u0000\u00be\u00c1\u0001\u0000\u0000\u0000\u00bf"+
		"\u00bd\u0001\u0000\u0000\u0000\u00bf\u00c0\u0001\u0000\u0000\u0000\u00c0"+
		"\u0013\u0001\u0000\u0000\u0000\u00c1\u00bf\u0001\u0000\u0000\u0000\u00c2"+
		"\u00c7\u0003\u001e\u000f\u0000\u00c3\u00c4\u0005\u0011\u0000\u0000\u00c4"+
		"\u00c6\u0003\u001e\u000f\u0000\u00c5\u00c3\u0001\u0000\u0000\u0000\u00c6"+
		"\u00c9\u0001\u0000\u0000\u0000\u00c7\u00c5\u0001\u0000\u0000\u0000\u00c7"+
		"\u00c8\u0001\u0000\u0000\u0000\u00c8\u0015\u0001\u0000\u0000\u0000\u00c9"+
		"\u00c7\u0001\u0000\u0000\u0000\u00ca\u00cb\u0003\u0018\f\u0000\u00cb\u00cc"+
		"\u0005\u0015\u0000\u0000\u00cc\u00d4\u0003\u0002\u0001\u0000\u00cd\u00ce"+
		"\u0005\u0011\u0000\u0000\u00ce\u00cf\u0003\u0018\f\u0000\u00cf\u00d0\u0005"+
		"\u0015\u0000\u0000\u00d0\u00d1\u0003\u0002\u0001\u0000\u00d1\u00d3\u0001"+
		"\u0000\u0000\u0000\u00d2\u00cd\u0001\u0000\u0000\u0000\u00d3\u00d6\u0001"+
		"\u0000\u0000\u0000\u00d4\u00d2\u0001\u0000\u0000\u0000\u00d4\u00d5\u0001"+
		"\u0000\u0000\u0000\u00d5\u0017\u0001\u0000\u0000\u0000\u00d6\u00d4\u0001"+
		"\u0000\u0000\u0000\u00d7\u00d9\u0005\u0014\u0000\u0000\u00d8\u00d7\u0001"+
		"\u0000\u0000\u0000\u00d8\u00d9\u0001\u0000\u0000\u0000\u00d9\u00da\u0001"+
		"\u0000\u0000\u0000\u00da\u00db\u0003\u001c\u000e\u0000\u00db\u0019\u0001"+
		"\u0000\u0000\u0000\u00dc\u00dd\u0003\u001e\u000f\u0000\u00dd\u00de\u0005"+
		"\u0015\u0000\u0000\u00de\u00e6\u0003\u0002\u0001\u0000\u00df\u00e0\u0005"+
		"\u0011\u0000\u0000\u00e0\u00e1\u0003\u001e\u000f\u0000\u00e1\u00e2\u0005"+
		"\u0015\u0000\u0000\u00e2\u00e3\u0003\u0002\u0001\u0000\u00e3\u00e5\u0001"+
		"\u0000\u0000\u0000\u00e4\u00df\u0001\u0000\u0000\u0000\u00e5\u00e8\u0001"+
		"\u0000\u0000\u0000\u00e6\u00e4\u0001\u0000\u0000\u0000\u00e6\u00e7\u0001"+
		"\u0000\u0000\u0000\u00e7\u001b\u0001\u0000\u0000\u0000\u00e8\u00e6\u0001"+
		"\u0000\u0000\u0000\u00e9\u00ec\u0005$\u0000\u0000\u00ea\u00ec\u0005%\u0000"+
		"\u0000\u00eb\u00e9\u0001\u0000\u0000\u0000\u00eb\u00ea\u0001\u0000\u0000"+
		"\u0000\u00ec\u001d\u0001\u0000\u0000\u0000\u00ed\u00ef\u0005\u0014\u0000"+
		"\u0000\u00ee\u00ed\u0001\u0000\u0000\u0000\u00ee\u00ef\u0001\u0000\u0000"+
		"\u0000\u00ef\u00f0\u0001\u0000\u0000\u0000\u00f0\u00f1\u0003\u0002\u0001"+
		"\u0000\u00f1\u001f\u0001\u0000\u0000\u0000\u00f2\u00f4\u0005\u0012\u0000"+
		"\u0000\u00f3\u00f2\u0001\u0000\u0000\u0000\u00f3\u00f4\u0001\u0000\u0000"+
		"\u0000\u00f4\u00f5\u0001\u0000\u0000\u0000\u00f5\u0101\u0005 \u0000\u0000"+
		"\u00f6\u0101\u0005!\u0000\u0000\u00f7\u00f9\u0005\u0012\u0000\u0000\u00f8"+
		"\u00f7\u0001\u0000\u0000\u0000\u00f8\u00f9\u0001\u0000\u0000\u0000\u00f9"+
		"\u00fa\u0001\u0000\u0000\u0000\u00fa\u0101\u0005\u001f\u0000\u0000\u00fb"+
		"\u0101\u0005\"\u0000\u0000\u00fc\u0101\u0005#\u0000\u0000\u00fd\u0101"+
		"\u0005\u001a\u0000\u0000\u00fe\u0101\u0005\u001b\u0000\u0000\u00ff\u0101"+
		"\u0005\u001c\u0000\u0000\u0100\u00f3\u0001\u0000\u0000\u0000\u0100\u00f6"+
		"\u0001\u0000\u0000\u0000\u0100\u00f8\u0001\u0000\u0000\u0000\u0100\u00fb"+
		"\u0001\u0000\u0000\u0000\u0100\u00fc\u0001\u0000\u0000\u0000\u0100\u00fd"+
		"\u0001\u0000\u0000\u0000\u0100\u00fe\u0001\u0000\u0000\u0000\u0100\u00ff"+
		"\u0001\u0000\u0000\u0000\u0101!\u0001\u0000\u0000\u0000$+2:EQSZ`cksy~"+
		"\u0080\u0084\u0088\u008d\u0096\u0099\u009e\u00a1\u00a5\u00ac\u00b1\u00b4"+
		"\u00b8\u00bf\u00c7\u00d4\u00d8\u00e6\u00eb\u00ee\u00f3\u00f8\u0100";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}