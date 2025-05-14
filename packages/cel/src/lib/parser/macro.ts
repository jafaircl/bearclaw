/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import { CELError } from '../common/error';
import {
  ADD_OPERATOR,
  ALL_MACRO,
  CONDITIONAL_OPERATOR,
  EQUALS_OPERATOR,
  EXISTS_MACRO,
  EXISTS_ONE_MACRO,
  FILTER_MACRO,
  HAS_MACRO,
  LOGICAL_AND_OPERATOR,
  LOGICAL_NOT_OPERATOR,
  LOGICAL_OR_OPERATOR,
  MAP_MACRO,
  NOT_STRICTLY_FALSE_OPERATOR,
} from '../common/operators';
import { BoolRefVal } from '../common/types/bool';
import { IntRefVal } from '../common/types/int';
import { Expr } from '../protogen/cel/expr/syntax_pb.js';
import { ExprHelper } from './helper';

/**
 * Macro interface for describing the function signature to match and the
 * MacroExpander to apply.
 *
 * Note: when a Macro should apply to multiple overloads (based on arg count)
 * of a given function, a Macro should be created per arg-count.
 */
export interface Macro {
  /**
   * Function name to match.
   */
  function(): string;

  /**
   * ArgCount for the function call.
   *
   * When the macro is a var-arg style macro, the return value will be zero,
   * but the MacroKey will contain a `*` where the arg count would have been.
   */
  argCount(): number;

  /**
   * IsReceiverStyle returns true if the macro matches a receiver style call.
   */
  isReceiverStyle(): boolean;

  /**
   * Expander returns the MacroExpander to apply when the macro key matches the
   * parsed call signature.
   */
  expander(): MacroExpander;

  /**
   * MacroKey returns the macro signatures accepted by this macro.
   *
   * Format: `<function>:<arg-count>:<is-receiver>`.
   *
   * When the macros is a var-arg style macro, the `arg-count` value is
   * represented as a `*`.
   */
  macroKey(): string;
}

/**
 * MacroExpander converts a call and its associated arguments into a new CEL
 * abstract syntax tree.
 *
 * If the MacroExpander determines within the implementation that an expansion
 * is not needed it may return a nil Expr value to indicate a non-match.
 * However, if an expansion is to be performed, but the arguments are not
 * well-formed, the result of the expansion will be an error.
 *
 * The MacroExpander accepts as arguments a MacroExprHelper as well as the
 * arguments used in the function call and produces as output an Expr ast node.
 *
 * Note: when the Macro.IsReceiverStyle() method returns true, the target
 * argument will be nil.
 */
export type MacroExpander = (
  eh: ExprHelper,
  target: Expr | null,
  args: Expr[]
) => Expr | CELError;

/**
 * Macro interface for describing the function signature to match and the
 * MacroExpander to apply.
 *
 * Note: when a Macro should apply to multiple overloads (based on arg count)
 * of a given function, a Macro should be created per arg-count.
 */
class BaseMacro implements Macro {
  private _fn: string;
  private _receiverStyle: boolean;
  private _varArgStyle: boolean;
  private _argCount: number;
  private _expander: MacroExpander;

  constructor(
    fn: string,
    receiverStyle: boolean,
    varArgStyle: boolean,
    argCount: number,
    expander: MacroExpander
  ) {
    this._fn = fn;
    this._receiverStyle = receiverStyle;
    this._varArgStyle = varArgStyle;
    this._argCount = argCount;
    this._expander = expander;
  }

  /**
   * Function name to match.
   */
  function() {
    return this._fn;
  }

  /**
   * ArgCount for the function call.
   *
   * When the macro is a var-arg style macro, the return value will be zero,
   * but the MacroKey will contain a `*` where the arg count would have been.
   */
  argCount() {
    return this._argCount;
  }

  /**
   * IsReceiverStyle returns true if the macro matches a receiver style call.
   */
  isReceiverStyle() {
    return this._receiverStyle;
  }

  /**
   * Expander returns the MacroExpander to apply when the macro key matches the
   * parsed call signature.
   */
  expander() {
    return this._expander;
  }

  /**
   * MacroKey returns the macro signatures accepted by this macro.
   *
   * Format: `<function>:<arg-count>:<is-receiver>`.
   *
   * When the macros is a var-arg style macro, the `arg-count` value is
   * represented as a `*`.
   */
  macroKey() {
    if (this._varArgStyle) {
      return makeVarArgMacroKey(this._fn, this._receiverStyle);
    }
    return makeMacroKey(this._fn, this._argCount, this._receiverStyle);
  }
}

export function makeMacroKey(
  name: string,
  args: number,
  receiverStyle: boolean
): string {
  return `${name}:${args}:${receiverStyle}`;
}

export function makeVarArgMacroKey(
  name: string,
  receiverStyle: boolean
): string {
  return `${name}:*:${receiverStyle}`;
}

/**
 * NewGlobalMacro creates a Macro for a global function with the specified arg
 * count.
 */
export class GlobalMacro extends BaseMacro {
  constructor(fn: string, argCount: number, expander: MacroExpander) {
    super(fn, false, false, argCount, expander);
  }
}

/**
 * NewReceiverMacro creates a Macro for a receiver function matching the
 * specified arg count.
 */
export class ReceiverMacro extends BaseMacro {
  constructor(fn: string, argCount: number, expander: MacroExpander) {
    super(fn, true, false, argCount, expander);
  }
}

/**
 * NewGlobalVarArgMacro creates a Macro for a global function with a variable
 * arg count.
 */
export class GlobalVarArgMacro extends BaseMacro {
  constructor(fn: string, expander: MacroExpander) {
    super(fn, false, true, 0, expander);
  }
}

/**
 * NewReceiverVarArgMacro creates a Macro for a receiver function matching a
 * variable arg count.
 */
export class ReceiverVarArgMacro extends BaseMacro {
  constructor(fn: string, expander: MacroExpander) {
    super(fn, true, true, 0, expander);
  }
}

/**
 * HasMacro expands "has(m.f)" which tests the presence of a field, avoiding
 * the need to specify the field as a string.
 */
export const HasMacro = new GlobalMacro(HAS_MACRO, 1, makeHas);

/**
 * AllMacro expands "range.all(var, predicate)" into a comprehension which
 * ensures that all elements in the range satisfy the predicate.
 */
export const AllMacro = new ReceiverMacro(ALL_MACRO, 2, makeAll);

/**
 * ExistsMacro expands "range.exists(var, predicate)" into a comprehension
 * which ensures that some element in the range satisfies the predicate.
 */
export const ExistsMacro = new ReceiverMacro(EXISTS_MACRO, 2, makeExists);

/**
 * ExistsOneMacro expands "range.exists_one(var, predicate)", which is true if
 * for exactly one element in range the predicate holds.
 *
 * Deprecated: Use ExistsOneMacroNew
 */
export const ExistsOneMacro = new ReceiverMacro(
  EXISTS_ONE_MACRO,
  2,
  makeExistsOne
);

/**
 * ExistsOneMacroNew expands "range.existsOne(var, predicate)", which is true
 * if for exactly one element in range the predicate holds.
 */
export const ExistsOneMacroNew = new ReceiverMacro(
  'existsOne',
  2,
  makeExistsOne
);

/**
 * MapMacro expands "range.map(var, function)" into a comprehension which
 * applies the function to each element in the range to produce a new list.
 */
export const MapMacro = new ReceiverMacro(MAP_MACRO, 2, makeMap);

/**
 * MapFilterMacro expands "range.map(var, predicate, function)" into a
 * comprehension which first filters the elements in the range by the
 * predicate, then applies the transform function to produce a new list.
 */
export const MapFilterMacro = new ReceiverMacro(MAP_MACRO, 3, makeMap);

/**
 * FilterMacro expands "range.filter(var, predicate)" into a comprehension
 * which filters elements in the range, producing a new list from the elements
 * that satisfy the predicate.
 */
export const FilterMacro = new ReceiverMacro(FILTER_MACRO, 2, makeFilter);

/**
 * AllMacros includes the list of all spec-supported macros.
 */
export const AllMacros = new Set<Macro>([
  HasMacro,
  AllMacro,
  ExistsMacro,
  ExistsOneMacro,
  ExistsOneMacroNew,
  MapMacro,
  MapFilterMacro,
  FilterMacro,
]);

/**
 * NoMacros list.
 */
export const NoMacros = new Set<Macro>();

/**
 * AccumulatorName is the traditional variable name assigned to the fold
 * accumulator variable.
 */
export const AccumulatorName = '__result__';

export enum QuantifierKind {
  ALL,
  EXISTS,
  EXISTS_ONE,
}

/**
 * MakeAll expands the input call arguments into a comprehension that returns
 * true if all of the elements in the range match the predicate expressions:
 * <iterRange>.all(<iterVar>, <predicate>)
 */
function makeAll(
  eh: ExprHelper,
  target: Expr | null,
  args: Expr[]
): Expr | CELError {
  return makeQuantifier(QuantifierKind.ALL, eh, target, args);
}

/**
 * MakeExists expands the input call arguments into a comprehension that
 * returns true if any of the elements in the range match the predicate
 * expressions: <iterRange>.exists(<iterVar>, <predicate>)
 */
function makeExists(
  eh: ExprHelper,
  target: Expr | null,
  args: Expr[]
): Expr | CELError {
  return makeQuantifier(QuantifierKind.EXISTS, eh, target, args);
}

/**
 * MakeExistsOne expands the input call arguments into a comprehension that
 * returns true if exactly one of the elements in the range match the predicate
 * expressions: <iterRange>.exists_one(<iterVar>, <predicate>)
 */
function makeExistsOne(
  eh: ExprHelper,
  target: Expr | null,
  args: Expr[]
): Expr | CELError {
  return makeQuantifier(QuantifierKind.EXISTS_ONE, eh, target, args);
}

/**
 * MakeMap expands the input call arguments into a comprehension that
 * transforms each element in the input to produce an output list.
 *
 * There are two call patterns supported by map:
 *
 * <iterRange>.map(<iterVar>, <transform>)
 * <iterRange>.map(<iterVar>, <predicate>, <transform>)
 *
 * In the second form only iterVar values which return true when provided to
 * the predicate expression are transformed.
 */
function makeMap(
  eh: ExprHelper,
  target: Expr | null,
  args: Expr[]
): Expr | CELError {
  const v = extractIdent(args[0]);
  if (v === '') {
    return eh.newError(args[0].id, 'argument is not an identifier');
  }
  if (v === AccumulatorName) {
    return eh.newError(
      args[0].id,
      'iteration variable overwrites accumulator variable'
    );
  }

  let fn: Expr;
  let filter: Expr | null;

  if (args.length === 3) {
    filter = args[1];
    fn = args[2];
  } else {
    filter = null;
    fn = args[1];
  }

  const init = eh.newList([]);
  const condition = eh.newLiteral(BoolRefVal.True);
  let step = eh.newCall(ADD_OPERATOR, eh.newAccuIdent(), eh.newList([fn]));
  if (!isNil(filter)) {
    step = eh.newCall(CONDITIONAL_OPERATOR, filter, step, eh.newAccuIdent());
  }
  return eh.newComprehension(
    target!,
    v,
    AccumulatorName,
    init,
    condition,
    step,
    eh.newAccuIdent()
  );
}

/**
 * MakeFilter expands the input call arguments into a comprehension which
 * produces a list which contains only elements which match the provided
 * predicate expression: <iterRange>.filter(<iterVar>, <predicate>)
 */
function makeFilter(
  eh: ExprHelper,
  target: Expr | null,
  args: Expr[]
): Expr | CELError {
  const v = extractIdent(args[0]);
  if (v === '') {
    return eh.newError(args[0].id, 'argument is not an identifier');
  }
  if (v === AccumulatorName) {
    return eh.newError(
      args[0].id,
      'iteration variable overwrites accumulator variable'
    );
  }
  const filter = args[1];
  const init = eh.newList([]);
  const condition = eh.newLiteral(BoolRefVal.True);
  let step = eh.newCall(ADD_OPERATOR, eh.newAccuIdent(), eh.newList([args[0]]));
  step = eh.newCall(CONDITIONAL_OPERATOR, filter, step, eh.newAccuIdent());
  return eh.newComprehension(
    target!,
    v,
    AccumulatorName,
    init,
    condition,
    step,
    eh.newAccuIdent()
  );
}

/**
 * MakeHas expands the input call arguments into a presence test, e.g.
 * has(<operand>.field)
 */
function makeHas(
  eh: ExprHelper,
  target: Expr | null,
  args: Expr[]
): Expr | CELError {
  if (args[0].exprKind.case === 'selectExpr') {
    const s = args[0].exprKind.value;
    return eh.newPresenceTest(s.operand!, s.field);
  }
  return eh.newError(args[0].id, 'invalid argument to has() macro');
}

function makeQuantifier(
  kind: QuantifierKind,
  eh: ExprHelper,
  target: Expr | null,
  args: Expr[]
) {
  const v = extractIdent(args[0]);
  if (v === '') {
    return eh.newError(args[0].id, 'argument must be a simple name');
  }
  if (v === AccumulatorName) {
    return eh.newError(
      args[0].id,
      'iteration variable overwrites accumulator variable'
    );
  }
  let init: Expr;
  let condition: Expr;
  let step: Expr;
  let result: Expr;
  switch (kind) {
    case QuantifierKind.ALL:
      init = eh.newLiteral(BoolRefVal.True);
      condition = eh.newCall(NOT_STRICTLY_FALSE_OPERATOR, eh.newAccuIdent());
      step = eh.newCall(LOGICAL_AND_OPERATOR, eh.newAccuIdent(), args[1]);
      result = eh.newAccuIdent();
      break;
    case QuantifierKind.EXISTS:
      init = eh.newLiteral(BoolRefVal.False);
      condition = eh.newCall(
        NOT_STRICTLY_FALSE_OPERATOR,
        eh.newCall(LOGICAL_NOT_OPERATOR, eh.newAccuIdent())
      );
      step = eh.newCall(LOGICAL_OR_OPERATOR, eh.newAccuIdent(), args[1]);
      result = eh.newAccuIdent();
      break;
    case QuantifierKind.EXISTS_ONE:
      init = eh.newLiteral(new IntRefVal(BigInt(0)));
      condition = eh.newLiteral(BoolRefVal.True);
      step = eh.newCall(
        CONDITIONAL_OPERATOR,
        args[1],
        eh.newCall(
          ADD_OPERATOR,
          eh.newAccuIdent(),
          eh.newLiteral(new IntRefVal(BigInt(1)))
        ),
        eh.newAccuIdent()
      );
      result = eh.newCall(
        EQUALS_OPERATOR,
        eh.newAccuIdent(),
        eh.newLiteral(new IntRefVal(BigInt(1)))
      );
      break;
    default:
      return eh.newError(args[0].id, `unrecognized quantifier '${kind}'`);
  }
  return eh.newComprehension(
    target!,
    v,
    AccumulatorName,
    init,
    condition,
    step,
    result
  );
}

function extractIdent(e: Expr): string {
  switch (e.exprKind.case) {
    case 'identExpr': {
      return e.exprKind.value.name;
    }
    default:
      return '';
  }
}
