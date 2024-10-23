/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import { Expr } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { ParserRuleContext, Token } from 'antlr4';
import { Location, OffsetRange } from '../common/ast';
import { ACCUMULATOR_VAR } from '../common/constants';
import { boolExpr } from '../common/types/bool';
import { callExpr } from '../common/types/call';
import { comprehensionExpr } from '../common/types/comprehension';
import { identExpr, unwrapIdentExpr } from '../common/types/ident';
import { int64Expr } from '../common/types/int';
import { listExpr } from '../common/types/list';
import { selectExpr } from '../common/types/select';
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

export const STANDARD_MACROS = new Set([
  HAS_MACRO,
  ALL_MACRO,
  EXISTS_MACRO,
  EXISTS_ONE_MACRO,
  MAP_MACRO,
  // MAP_FILTER_MACRO, // TODO: Implement this
  FILTER_MACRO,
]);

export function findMacro(name: string) {
  return STANDARD_MACROS.has(name) ? name : undefined;
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
  if (arg.exprKind.case !== 'selectExpr') {
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
  if (arg0.exprKind.case !== 'identExpr') {
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
  if (arg0.exprKind.case !== 'identExpr') {
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
  if (arg0.exprKind.case !== 'identExpr') {
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
