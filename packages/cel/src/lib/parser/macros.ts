/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import { Expr } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ParserRuleContext, Token } from 'antlr4';
import { Location, OffsetRange } from '../common/ast';
import { ACCUMULATOR_VAR } from '../common/constants';
import { functionDecl, overloadDecl } from '../common/decls/function-decl';
import { BOOL_CEL_TYPE, boolExpr } from '../common/types/bool';
import { callExpr } from '../common/types/call';
import { comprehensionExpr } from '../common/types/comprehension';
import { DYN_CEL_TYPE } from '../common/types/dyn';
import { identExpr, isIdentExpr, unwrapIdentExpr } from '../common/types/ident';
import { int64Expr } from '../common/types/int';
import { listExpr } from '../common/types/list';
import { isSelectExpr, selectExpr } from '../common/types/select';
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
} from '../operators';
import { ParserHelper } from './parser-helper';

export const STANDARD_MACRO_DECLARATIONS = new Set([
  // HasMacro expands "has(m.f)" which tests the presence of a field, avoiding
  // the need to specify the field as a string.
  functionDecl(HAS_MACRO, {
    overloads: [
      overloadDecl({
        isInstanceFunction: false,
        params: [DYN_CEL_TYPE],
        resultType: BOOL_CEL_TYPE,
      }),
    ],
  }),
  // AllMacro expands "range.all(var, predicate)" into a comprehension which
  // ensures that all elements in the range satisfy the predicate.
  functionDecl(ALL_MACRO, {
    overloads: [
      overloadDecl({
        isInstanceFunction: true,
        params: [DYN_CEL_TYPE, DYN_CEL_TYPE],
        resultType: BOOL_CEL_TYPE,
      }),
    ],
  }),
  // ExistsMacro expands "range.exists(var, predicate)" into a comprehension
  // which ensures that some element in the range satisfies the predicate.
  functionDecl(EXISTS_MACRO, {
    overloads: [
      overloadDecl({
        isInstanceFunction: true,
        params: [DYN_CEL_TYPE, DYN_CEL_TYPE],
        resultType: BOOL_CEL_TYPE,
      }),
    ],
  }),
  // ExistsOneMacro expands "range.exists_one(var, predicate)", which is true
  // if for exactly one element in range the predicate holds.
  functionDecl(EXISTS_ONE_MACRO, {
    overloads: [
      overloadDecl({
        isInstanceFunction: true,
        params: [DYN_CEL_TYPE, DYN_CEL_TYPE],
        resultType: BOOL_CEL_TYPE,
      }),
    ],
  }),
  // MapMacro expands "range.map(var, function)" into a comprehension which
  // applies the function to each element in the range to produce a new list.
  functionDecl(MAP_MACRO, {
    overloads: [
      overloadDecl({
        isInstanceFunction: true,
        params: [DYN_CEL_TYPE, DYN_CEL_TYPE],
        resultType: DYN_CEL_TYPE,
      }),
    ],
  }),
  // MapFilterMacro expands "range.map(var, predicate, function)" into a
  // comprehension which first filters the elements in the range by the
  // predicate, then applies the transform function to produce a new list.
  // // MAP_FILTER_MACRO, // TODO: Implement this
  // FilterMacro expands "range.filter(var, predicate)" into a comprehension
  // which filters elements in the range, producing a new list from the
  // elements that satisfy the predicate.
  functionDecl(FILTER_MACRO, {
    overloads: [
      overloadDecl({
        isInstanceFunction: true,
        params: [DYN_CEL_TYPE, DYN_CEL_TYPE],
        resultType: DYN_CEL_TYPE,
      }),
    ],
  }),
]);

export function findMacro(name: string) {
  for (const macro of STANDARD_MACRO_DECLARATIONS) {
    if (macro.name === name) {
      return name;
    }
  }
  return null;
}

export function expandMacro(
  ctx: ParserRuleContext | Token | Location | OffsetRange | null,
  helper: ParserHelper,
  op: string,
  target: Expr | null,
  args: Expr[]
): Expr {
  switch (op) {
    case HAS_MACRO:
      return expandHasMacro(ctx, helper, args);
    case ALL_MACRO:
      return expandAllMacro(ctx, helper, target!, args);
    case EXISTS_MACRO:
      return expandExistsMacro(ctx, helper, target!, args);
    case EXISTS_ONE_MACRO:
      return expandExistsOneMacro(ctx, helper, target!, args);
    case MAP_MACRO:
      return expandMapMacro(ctx, helper, target!, args);
    case FILTER_MACRO:
      return expandFilterMacro(ctx, helper, target!, args);
    default:
      throw new Error(`Unknown macro: ${op}`);
  }
}

export function expandHasMacro(
  ctx: ParserRuleContext | Token | Location | OffsetRange | null,
  helper: ParserHelper,
  args: Expr[]
): Expr {
  const arg = args[0];
  if (!isSelectExpr(arg)) {
    throw new MacroError('invalid argument to has() macro', ctx, arg);
  }
  return selectExpr(helper.nextId(ctx), {
    operand: arg.exprKind.value.operand,
    field: arg.exprKind.value.field,
    testOnly: true,
  });
}

export function expandAllMacro(
  ctx: ParserRuleContext | Token | Location | OffsetRange | null,
  helper: ParserHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const arg0 = args[0];
  if (!isIdentExpr(arg0)) {
    throw new MacroError('argument must be a simple name', ctx, arg0);
  }
  const arg1 = args[1];
  const accuInit = boolExpr(helper.nextId(ctx), true);
  const conditionArg0 = identExpr(helper.nextId(ctx), {
    name: ACCUMULATOR_VAR,
  });
  const condition = callExpr(helper.nextId(ctx), {
    function: NOT_STRICTLY_FALSE_OPERATOR,
    args: [conditionArg0],
  });
  const stepArg0 = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
  const step = callExpr(helper.nextId(ctx), {
    function: LOGICAL_AND_OPERATOR,
    args: [stepArg0, arg1],
  });
  const result = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
  return comprehensionExpr(helper.nextId(ctx), {
    iterRange: target,
    iterVar: arg0.exprKind.value.name,
    accuVar: ACCUMULATOR_VAR,
    accuInit,
    loopCondition: condition,
    loopStep: step,
    result,
  });
}

export function expandExistsMacro(
  ctx: ParserRuleContext | Token | Location | OffsetRange | null,
  helper: ParserHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const arg0 = args[0];
  if (!isIdentExpr(arg0)) {
    throw new MacroError('argument must be a simple name', ctx, arg0);
  }
  const arg1 = args[1];
  const accuInit = boolExpr(helper.nextId(ctx), false);
  const conditionArg0Arg0 = identExpr(helper.nextId(ctx), {
    name: ACCUMULATOR_VAR,
  });
  const conditionArg0 = callExpr(helper.nextId(ctx), {
    function: LOGICAL_NOT_OPERATOR,
    args: [conditionArg0Arg0],
  });
  const condition = callExpr(helper.nextId(ctx), {
    function: NOT_STRICTLY_FALSE_OPERATOR,
    args: [conditionArg0],
  });
  const stepArg0 = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
  const step = callExpr(helper.nextId(ctx), {
    function: LOGICAL_OR_OPERATOR,
    args: [stepArg0, arg1],
  });
  const result = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
  return comprehensionExpr(helper.nextId(ctx), {
    iterRange: target,
    iterVar: arg0.exprKind.value.name,
    accuVar: ACCUMULATOR_VAR,
    accuInit,
    loopCondition: condition,
    loopStep: step,
    result,
  });
}

export function expandExistsOneMacro(
  ctx: ParserRuleContext | Token | Location | OffsetRange | null,
  helper: ParserHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const arg0 = args[0];
  if (!isIdentExpr(arg0)) {
    throw new MacroError('argument must be a simple name', ctx, arg0);
  }
  const arg1 = args[1];
  const accuInit = int64Expr(helper.nextId(ctx), BigInt(0));
  const condition = boolExpr(helper.nextId(ctx), true);
  const stepArg1Arg0 = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
  const stepArg1Arg1 = int64Expr(helper.nextId(ctx), BigInt(1));
  const stepArg1 = callExpr(helper.nextId(ctx), {
    function: ADD_OPERATOR,
    args: [stepArg1Arg0, stepArg1Arg1],
  });
  const stepArg2 = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
  const step = callExpr(helper.nextId(ctx), {
    function: CONDITIONAL_OPERATOR,
    args: [arg1, stepArg1, stepArg2],
  });
  const resultArg0 = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
  const resultArg1 = int64Expr(helper.nextId(ctx), BigInt(1));
  const result = callExpr(helper.nextId(ctx), {
    function: EQUALS_OPERATOR,
    args: [resultArg0, resultArg1],
  });
  return comprehensionExpr(helper.nextId(ctx), {
    iterRange: target,
    iterVar: arg0.exprKind.value.name,
    accuVar: ACCUMULATOR_VAR,
    accuInit,
    loopCondition: condition,
    loopStep: step,
    result,
  });
}

export function expandMapMacro(
  ctx: ParserRuleContext | Token | Location | OffsetRange | null,
  helper: ParserHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const v = unwrapIdentExpr(args[0]);
  if (isNil(v)) {
    throw new MacroError('argument is not an identifier', ctx, args[0]);
  }
  if (v.name === ACCUMULATOR_VAR) {
    throw new MacroError(
      'iteration variable overwrites accumulator variable',
      ctx,
      args[0]
    );
  }
  let fn: Expr | null = null;
  let filter: Expr | null = null;
  if (args.length === 3) {
    filter = args[1];
    fn = args[2];
  } else {
    fn = args[1];
  }
  const init = listExpr(helper.nextId(ctx), {});
  const condition = boolExpr(helper.nextId(ctx), true);
  const stepArg0 = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
  const stepArg1 = listExpr(helper.nextId(ctx), { elements: [fn] });
  let step = callExpr(helper.nextId(ctx), {
    function: ADD_OPERATOR,
    args: [stepArg0, stepArg1],
  });
  if (!isNil(filter)) {
    const step2Arg2 = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
    step = callExpr(helper.nextId(ctx), {
      function: CONDITIONAL_OPERATOR,
      args: [filter, step, step2Arg2],
    });
  }
  const result = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
  return comprehensionExpr(helper.nextId(ctx), {
    iterRange: target,
    iterVar: v.name,
    accuVar: ACCUMULATOR_VAR,
    accuInit: init,
    loopCondition: condition,
    loopStep: step,
    result,
  });
}

export function expandFilterMacro(
  ctx: ParserRuleContext | Token | Location | OffsetRange | null,
  helper: ParserHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const v = unwrapIdentExpr(args[0]);
  if (isNil(v)) {
    throw new MacroError('argument is not an identifier', ctx, args[0]);
  }
  if (v.name === ACCUMULATOR_VAR) {
    throw new MacroError(
      'iteration variable overwrites accumulator variable',
      ctx,
      args[0]
    );
  }
  const filter = args[1];
  const listInit = listExpr(helper.nextId(ctx), {});
  const condition = boolExpr(helper.nextId(ctx), true);
  const stepArg0 = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
  const stepArg1 = listExpr(helper.nextId(ctx), { elements: [args[0]] });
  let step = callExpr(helper.nextId(ctx), {
    function: ADD_OPERATOR,
    args: [stepArg0, stepArg1],
  });
  const step2Arg1 = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
  step = callExpr(helper.nextId(ctx), {
    function: CONDITIONAL_OPERATOR,
    args: [filter, step, step2Arg1],
  });
  const result = identExpr(helper.nextId(ctx), { name: ACCUMULATOR_VAR });
  return comprehensionExpr(helper.nextId(ctx), {
    iterRange: target,
    iterVar: v.name,
    accuVar: ACCUMULATOR_VAR,
    accuInit: listInit,
    loopCondition: condition,
    loopStep: step,
    result,
  });
}

export class MacroError extends Error {
  constructor(
    message: string,
    public readonly ctx:
      | ParserRuleContext
      | Token
      | Location
      | OffsetRange
      | null,
    public readonly expr?: Expr
  ) {
    super(message);
    this.name = 'MacroError';
  }
}
