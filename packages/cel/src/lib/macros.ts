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
import {
  IdHelper,
  boolExpr,
  globalCall,
  identExpr,
  int64Expr,
  listExpr,
} from './utils';

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
  id: IdHelper,
  op: string,
  target: Expr | null,
  args: Expr[]
): Expr {
  switch (op) {
    case HAS_MACRO:
      return expandHasMacro(id, args);
    case ALL_MACRO:
      return expandAllMacro(id, target!, args);
    case EXISTS_MACRO:
      return expandExistsMacro(id, target!, args);
    case EXISTS_ONE_MACRO:
      return expandExistsOneMacro(id, target!, args);
    case MAP_MACRO:
      return expandMapMacro(id, target!, args);
    case FILTER_MACRO:
      return expandFilterMacro(id, target!, args);
    default:
      throw new Error(`Unknown macro: ${op}`);
  }
}

export function expandHasMacro(id: IdHelper, args: Expr[]): Expr {
  const arg = args[0];
  if (arg.exprKind.case !== 'selectExpr') {
    throw new Error('Invalid argument to has() macro');
  }
  return create(ExprSchema, {
    id: id.nextId(),
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

export function expandAllMacro(id: IdHelper, target: Expr, args: Expr[]): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to all() macro');
  }
  const arg1 = args[1];
  const accuInit = boolExpr(id, true);
  const condition = globalCall(
    id,
    NOT_STRICTLY_FALSE_OPERATOR,
    identExpr(id, ACCUMULATOR_VAR)
  );
  const step = globalCall(
    id,
    LOGICAL_AND_OPERATOR,
    identExpr(id, ACCUMULATOR_VAR),
    arg1
  );
  const result = identExpr(id, ACCUMULATOR_VAR);
  return fold(
    id.nextId(),
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
  id: IdHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to exists() macro');
  }
  const arg1 = args[1];
  const accuInit = boolExpr(id, false);
  const condition = globalCall(
    id,
    NOT_STRICTLY_FALSE_OPERATOR,
    globalCall(id, LOGICAL_NOT_OPERATOR, identExpr(id, ACCUMULATOR_VAR))
  );
  const step = globalCall(
    id,
    LOGICAL_OR_OPERATOR,
    identExpr(id, ACCUMULATOR_VAR),
    arg1
  );
  const result = identExpr(id, ACCUMULATOR_VAR);
  return fold(
    id.nextId(),
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
  id: IdHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const arg0 = args[0];
  if (arg0.exprKind.case !== 'identExpr') {
    throw new Error('Invalid argument to exists_one() macro');
  }
  const arg1 = args[1];
  const accuInit = int64Expr(id, BigInt(0));
  const condition = boolExpr(id, true);
  const step = globalCall(
    id,
    CONDITIONAL_OPERATOR,
    arg1,
    globalCall(
      id,
      ADD_OPERATOR,
      identExpr(id, ACCUMULATOR_VAR),
      int64Expr(id, BigInt(1))
    ),
    identExpr(id, ACCUMULATOR_VAR)
  );
  const result = globalCall(
    id,
    EQUALS_OPERATOR,
    identExpr(id, ACCUMULATOR_VAR),
    int64Expr(id, BigInt(1))
  );
  return fold(
    id.nextId(),
    target,
    arg0.exprKind.value.name,
    ACCUMULATOR_VAR,
    accuInit,
    condition,
    step,
    result
  );
}

export function expandMapMacro(id: IdHelper, target: Expr, args: Expr[]): Expr {
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
  const init = listExpr(id, []);
  const condition = boolExpr(id, true);
  let step = globalCall(
    id,
    ADD_OPERATOR,
    identExpr(id, ACCUMULATOR_VAR),
    listExpr(id, [fn])
  );
  if (!isNil(filter)) {
    step = globalCall(
      id,
      CONDITIONAL_OPERATOR,
      filter,
      step,
      identExpr(id, ACCUMULATOR_VAR)
    );
  }
  const result = identExpr(id, ACCUMULATOR_VAR);
  return fold(
    id.nextId(),
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
  id: IdHelper,
  target: Expr,
  args: Expr[]
): Expr {
  const v = extractIdent(args[0]);
  if (isNil(v)) {
    throw new Error('argument is not an identifier');
  }
  const filter = args[1];
  const listInit = listExpr(id, []);
  const condition = boolExpr(id, true);
  let step = globalCall(
    id,
    ADD_OPERATOR,
    identExpr(id, ACCUMULATOR_VAR),
    listExpr(id, [args[0]])
  );
  step = globalCall(
    id,
    CONDITIONAL_OPERATOR,
    filter,
    step,
    identExpr(id, ACCUMULATOR_VAR)
  );
  const result = identExpr(id, ACCUMULATOR_VAR);
  return fold(
    id.nextId(),
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
