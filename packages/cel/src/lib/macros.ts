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

export function expandMacro(op: string, target: Expr, args: Expr[]): Expr {
  switch (op) {
    case HAS_MACRO:
      return expandHasMacro(target, args);
    case ALL_MACRO:
      return expandAllMacro(target, args);
    case EXISTS_MACRO:
      return expandExistsMacro(target, args);
    case EXISTS_ONE_MACRO:
      return expandExistsOneMacro(target, args);
    case MAP_MACRO:
      return expandMapMacro(target, args);
    case FILTER_MACRO:
      return expandFilterMacro(target, args);
    default:
      throw new Error(`Unknown macro: ${op}`);
  }
}

export function expandHasMacro(target: Expr, args: Expr[]): Expr {
  const arg = args[0];
  if (arg.exprKind.case !== 'selectExpr') {
    throw new Error('Invalid argument to has() macro');
  }
  return create(ExprSchema, {
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

export function expandAllMacro(target: Expr, args: Expr[]): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to all() macro');
  }
  const arg1 = args[1];
  const accuInit = boolExpr(true);
  const condition = globalCall(
    NOT_STRICTLY_FALSE_OPERATOR,
    identExpr(ACCUMULATOR_VAR)
  );
  const step = globalCall(
    LOGICAL_AND_OPERATOR,
    identExpr(ACCUMULATOR_VAR),
    arg1
  );
  const result = identExpr(ACCUMULATOR_VAR);
  return fold(
    arg0.exprKind.value.name,
    target,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    result
  );
}

export function expandExistsMacro(target: Expr, args: Expr[]): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to all() macro');
  }
  const arg1 = args[1];
  const accuInit = boolExpr(false);
  const condition = globalCall(
    NOT_STRICTLY_FALSE_OPERATOR,
    globalCall(LOGICAL_NOT_OPERATOR, identExpr(ACCUMULATOR_VAR))
  );
  const step = globalCall(
    LOGICAL_OR_OPERATOR,
    identExpr(ACCUMULATOR_VAR),
    arg1
  );
  const result = identExpr(ACCUMULATOR_VAR);
  return fold(
    arg0.exprKind.value.name,
    target,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    result
  );
}

export function expandExistsOneMacro(target: Expr, args: Expr[]): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to all() macro');
  }
  const arg1 = args[1];
  const zeroExpr = int64Expr(BigInt(0));
  const oneExpr = int64Expr(BigInt(1));
  const accuInit = zeroExpr;
  const condition = boolExpr(true);
  const step = globalCall(
    CONDITIONAL_OPERATOR,
    arg1,
    globalCall(ADD_OPERATOR, identExpr(ACCUMULATOR_VAR), oneExpr),
    identExpr(ACCUMULATOR_VAR)
  );
  const result = globalCall(
    EQUALS_OPERATOR,
    identExpr(ACCUMULATOR_VAR),
    oneExpr
  );
  return fold(
    arg0.exprKind.value.name,
    target,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    result
  );
}

export function expandMapMacro(target: Expr, args: Expr[]): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to map() macro');
  }
  let arg1: Expr;
  let arg2: Expr;
  if (args.length === 3) {
    arg2 = args[1];
    arg1 = args[2];
  } else {
    arg1 = args[1];
    arg2 = null as unknown as Expr;
  }
  const accuInit = listExpr([]);
  const condition = boolExpr(true);
  let step = globalCall(
    ADD_OPERATOR,
    identExpr(ACCUMULATOR_VAR),
    listExpr([arg1])
  );
  if (!isNil(arg2)) {
    step = globalCall(
      CONDITIONAL_OPERATOR,
      arg2,
      step,
      identExpr(ACCUMULATOR_VAR)
    );
  }
  return fold(
    arg0.exprKind.value.name,
    target,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    identExpr(ACCUMULATOR_VAR)
  );
}

export function expandFilterMacro(target: Expr, args: Expr[]): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to filter() macro');
  }
  const arg1 = args[1];
  const accuInit = listExpr([]);
  const condition = boolExpr(true);
  let step = globalCall(
    ADD_OPERATOR,
    identExpr(ACCUMULATOR_VAR),
    listExpr([arg0])
  );
  step = globalCall(
    CONDITIONAL_OPERATOR,
    arg1,
    step,
    identExpr(ACCUMULATOR_VAR)
  );
  return fold(
    arg0.exprKind.value.name,
    target,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    identExpr(ACCUMULATOR_VAR)
  );
}

function fold(
  iterVar: string,
  iterRange: Expr,
  accuVar: string,
  accuInit: Expr,
  condition: Expr,
  step: Expr,
  result: Expr
): Expr {
  return create(ExprSchema, {
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
