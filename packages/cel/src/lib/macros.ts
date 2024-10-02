/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import {
  Expr,
  ExprSchema,
  Expr_SelectSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { ACCUMULATOR_VAR } from './constants';
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
} from './operators';
import { ParserHelper } from './parser-helper';
import { boolExpr, globalCall, identExpr, int64Expr, listExpr } from './utils';

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
  helper: ParserHelper,
  op: string,
  target: Expr | null,
  args: Expr[]
): Expr {
  switch (op) {
    case HAS_MACRO:
      return expandHasMacro(helper, args);
    case ALL_MACRO:
      return expandAllMacro(helper, target!, args);
    case EXISTS_MACRO:
      return expandExistsMacro(helper, target!, args);
    case EXISTS_ONE_MACRO:
      return expandExistsOneMacro(helper, target!, args);
    case MAP_MACRO:
      return expandMapMacro(helper, target!, args);
    case FILTER_MACRO:
      return expandFilterMacro(helper, target!, args);
    default:
      throw new Error(`Unknown macro: ${op}`);
  }
}

export function expandHasMacro(helper: ParserHelper, args: Expr[]): Expr {
  const arg = args[0];
  if (arg.exprKind.case !== 'selectExpr') {
    throw new Error('Invalid argument to has() macro');
  }
  return create(ExprSchema, {
    id: helper.nextId(),
    exprKind: {
      case: 'selectExpr',
      value: create(Expr_SelectSchema, {
        operand: arg.exprKind.value.operand,
        field: arg.exprKind.value.field,
        testOnly: true,
      }),
    },
  });
}

export function expandAllMacro(
  helper: ParserHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to all() macro');
  }
  const arg1 = args[1];
  const accuInit = boolExpr(helper.nextId(), true);
  const conditionArg0 = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  const condition = globalCall(
    helper.nextId(),
    NOT_STRICTLY_FALSE_OPERATOR,
    conditionArg0
  );
  const stepArg0 = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  const step = globalCall(
    helper.nextId(),
    LOGICAL_AND_OPERATOR,
    stepArg0,
    arg1
  );
  const result = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  return fold(
    helper.nextId(),
    target,
    arg0.exprKind.value.name,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    result
  );
}

export function expandExistsMacro(
  helper: ParserHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to exists() macro');
  }
  const arg1 = args[1];
  const accuInit = boolExpr(helper.nextId(), false);
  const conditionArg0Arg0 = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  const conditionArg0 = globalCall(
    helper.nextId(),
    LOGICAL_NOT_OPERATOR,
    conditionArg0Arg0
  );
  const condition = globalCall(
    helper.nextId(),
    NOT_STRICTLY_FALSE_OPERATOR,
    conditionArg0
  );
  const stepArg0 = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  const step = globalCall(helper.nextId(), LOGICAL_OR_OPERATOR, stepArg0, arg1);
  const result = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  return fold(
    helper.nextId(),
    target,
    arg0.exprKind.value.name,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    result
  );
}

export function expandExistsOneMacro(
  helper: ParserHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to exists_one() macro');
  }
  const arg1 = args[1];
  const accuInit = int64Expr(helper.nextId(), BigInt(0));
  const condition = boolExpr(helper.nextId(), true);
  const stepArg1Arg0 = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  const stepArg1Arg1 = int64Expr(helper.nextId(), BigInt(1));
  const stepArg1 = globalCall(
    helper.nextId(),
    ADD_OPERATOR,
    stepArg1Arg0,
    stepArg1Arg1
  );
  const stepArg2 = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  const step = globalCall(
    helper.nextId(),
    CONDITIONAL_OPERATOR,
    arg1,
    stepArg1,
    stepArg2
  );
  const resultArg0 = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  const resultArg1 = int64Expr(helper.nextId(), BigInt(1));
  const result = globalCall(
    helper.nextId(),
    EQUALS_OPERATOR,
    resultArg0,
    resultArg1
  );
  return fold(
    helper.nextId(),
    target,
    arg0.exprKind.value.name,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    result
  );
}

export function expandMapMacro(
  helper: ParserHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const v = extractIdent(args[0]);
  if (isNil(v)) {
    throw new Error('argument is not an identifier');
  }
  let fn: Expr | null = null;
  let filter: Expr | null = null;
  if (args.length === 3) {
    filter = args[1];
    fn = args[2];
  } else {
    fn = args[1];
  }
  const init = listExpr(helper.nextId(), []);
  const condition = boolExpr(helper.nextId(), true);
  const stepArg0 = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  const stepArg1 = listExpr(helper.nextId(), [fn]);
  let step = globalCall(helper.nextId(), ADD_OPERATOR, stepArg0, stepArg1);
  if (!isNil(filter)) {
    const step2Arg2 = identExpr(helper.nextId(), ACCUMULATOR_VAR);
    step = globalCall(
      helper.nextId(),
      CONDITIONAL_OPERATOR,
      filter,
      step,
      step2Arg2
    );
  }
  const result = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  return fold(
    helper.nextId(),
    target,
    v,
    ACCUMULATOR_VAR,
    init,
    condition,
    step,
    result
  );
}

export function expandFilterMacro(
  helper: ParserHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const v = extractIdent(args[0]);
  if (isNil(v)) {
    throw new Error('argument is not an identifier');
  }
  const filter = args[1];
  const listInit = listExpr(helper.nextId(), []);
  const condition = boolExpr(helper.nextId(), true);
  const stepArg0 = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  const stepArg1 = listExpr(helper.nextId(), [args[0]]);
  let step = globalCall(helper.nextId(), ADD_OPERATOR, stepArg0, stepArg1);
  const step2Arg1 = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  step = globalCall(
    helper.nextId(),
    CONDITIONAL_OPERATOR,
    filter,
    step,
    step2Arg1
  );
  const result = identExpr(helper.nextId(), ACCUMULATOR_VAR);
  return fold(
    helper.nextId(),
    target,
    v,
    ACCUMULATOR_VAR,
    listInit,
    condition,
    step,
    result
  );
}

function fold(
  exprId: bigint,
  iterRange: Expr,
  iterVar: string,
  accuVar: string,
  accuInit: Expr,
  condition: Expr,
  step: Expr,
  result: Expr
): Expr {
  return create(ExprSchema, {
    id: exprId,
    exprKind: {
      case: 'comprehensionExpr',
      value: {
        iterVar,
        iterRange,
        accuVar,
        accuInit,
        loopCondition: condition,
        loopStep: step,
        result,
      },
    },
  });
}

function extractIdent(expr: Expr): string | null {
  if (expr.exprKind.case !== 'identExpr') {
    return null;
  }
  return expr.exprKind.value.name;
}
