// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// import { isNil } from '@bearclaw/is';
// import { Expr } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
// import { ParserRuleContext, Token } from 'antlr4';
// import { OffsetRange } from '../common/ast';
// import { ACCUMULATOR_VAR } from '../common/constants';
// import { Location } from '../common/location';
// import {
//   ADD_OPERATOR,
//   ALL_MACRO,
//   CONDITIONAL_OPERATOR,
//   EQUALS_OPERATOR,
//   EXISTS_MACRO,
//   EXISTS_ONE_MACRO,
//   FILTER_MACRO,
//   HAS_MACRO,
//   LOGICAL_AND_OPERATOR,
//   LOGICAL_NOT_OPERATOR,
//   LOGICAL_OR_OPERATOR,
//   MAP_MACRO,
//   NOT_STRICTLY_FALSE_OPERATOR,
// } from '../common/operators';
// import {
//   newFunctionProto,
//   newInstanceOverloadProto,
//   newOverloadProto,
// } from '../common/pb/decls';
// import {
//   isIdentProtoExpr,
//   isSelectProtoExpr,
//   isTestOnlySelectProtoExpr,
//   newBoolProtoExpr,
//   newComprehensionProtoExpr,
//   newGlobalCallProtoExpr,
//   newIdentProtoExpr,
//   newIntProtoExpr,
//   newListProtoExpr,
//   newTestOnlySelectProtoExpr,
//   unwrapIdentProtoExpr,
// } from '../common/pb/expressions';
// import { BoolProtoType, DynProtoType } from '../common/pb/types';
// import { ParserHelper } from './helper';

// export const AllProtoMacros = new Set([
//   // HasMacro expands "has(m.f)" which tests the presence of a field, avoiding
//   // the need to specify the field as a string.
//   newFunctionProto(
//     HAS_MACRO,
//     newOverloadProto(HAS_MACRO, [DynProtoType], BoolProtoType)
//   ),
//   // AllMacro expands "range.all(var, predicate)" into a comprehension which
//   // ensures that all elements in the range satisfy the predicate.
//   newFunctionProto(
//     ALL_MACRO,
//     newInstanceOverloadProto(
//       ALL_MACRO,
//       [DynProtoType, DynProtoType],
//       BoolProtoType
//     )
//   ),
//   // ExistsMacro expands "range.exists(var, predicate)" into a comprehension
//   // which ensures that some element in the range satisfies the predicate.
//   newFunctionProto(
//     EXISTS_MACRO,
//     newInstanceOverloadProto(
//       EXISTS_MACRO,
//       [DynProtoType, DynProtoType],
//       BoolProtoType
//     )
//   ),
//   // ExistsOneMacro expands "range.exists_one(var, predicate)", which is true
//   // if for exactly one element in range the predicate holds.
//   newFunctionProto(
//     EXISTS_ONE_MACRO,
//     newInstanceOverloadProto(
//       EXISTS_ONE_MACRO,
//       [DynProtoType, DynProtoType],
//       BoolProtoType
//     )
//   ),
//   // MapMacro expands "range.map(var, function)" into a comprehension which
//   // applies the function to each element in the range to produce a new list.
//   newFunctionProto(
//     MAP_MACRO,
//     newInstanceOverloadProto(
//       MAP_MACRO,
//       [DynProtoType, DynProtoType],
//       DynProtoType
//     )
//   ),
//   // MapFilterMacro expands "range.map(var, predicate, function)" into a
//   // comprehension which first filters the elements in the range by the
//   // predicate, then applies the transform function to produce a new list.
//   // // MAP_FILTER_MACRO, // TODO: Implement this
//   // FilterMacro expands "range.filter(var, predicate)" into a comprehension
//   // which filters elements in the range, producing a new list from the
//   // elements that satisfy the predicate.
//   newFunctionProto(
//     FILTER_MACRO,
//     newInstanceOverloadProto(
//       FILTER_MACRO,
//       [DynProtoType, DynProtoType],
//       DynProtoType
//     )
//   ),
// ]);

// export function findMacro(name: string) {
//   for (const macro of AllProtoMacros) {
//     if (macro.name === name) {
//       return name;
//     }
//   }
//   return null;
// }

// export function expandMacro(
//   ctx: ParserRuleContext | Token | Location | OffsetRange | null,
//   helper: ParserHelper,
//   op: string,
//   target: Expr | null,
//   args: Expr[]
// ): Expr {
//   switch (op) {
//     case HAS_MACRO:
//       return expandHasMacro(ctx, helper, args);
//     case ALL_MACRO:
//       return expandAllMacro(ctx, helper, target!, args);
//     case EXISTS_MACRO:
//       return expandExistsMacro(ctx, helper, target!, args);
//     case EXISTS_ONE_MACRO:
//       return expandExistsOneMacro(ctx, helper, target!, args);
//     case MAP_MACRO:
//       return expandMapMacro(ctx, helper, target!, args);
//     case FILTER_MACRO:
//       return expandFilterMacro(ctx, helper, target!, args);
//     default:
//       throw new Error(`Unknown macro: ${op}`);
//   }
// }

// export function expandHasMacro(
//   ctx: ParserRuleContext | Token | Location | OffsetRange | null,
//   helper: ParserHelper,
//   args: Expr[]
// ): Expr {
//   const arg = args[0];
//   if (!isSelectProtoExpr(arg) && !isTestOnlySelectProtoExpr(arg)) {
//     throw new MacroError('invalid argument to has() macro', ctx, arg);
//   }
//   return newTestOnlySelectProtoExpr(
//     helper.nextId(ctx),
//     arg.exprKind.value.operand,
//     arg.exprKind.value.field
//   );
// }

// export function expandAllMacro(
//   ctx: ParserRuleContext | Token | Location | OffsetRange | null,
//   helper: ParserHelper,
//   target: Expr,
//   args: Expr[]
// ): Expr {
//   const arg0 = args[0];
//   if (!isIdentProtoExpr(arg0)) {
//     throw new MacroError('argument must be a simple name', ctx, arg0);
//   }
//   const arg1 = args[1];
//   const accuInit = newBoolProtoExpr(helper.nextId(ctx), true);
//   const conditionArg0 = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   const condition = newGlobalCallProtoExpr(
//     helper.nextId(ctx),
//     NOT_STRICTLY_FALSE_OPERATOR,
//     [conditionArg0]
//   );
//   const stepArg0 = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   const step = newGlobalCallProtoExpr(
//     helper.nextId(ctx),
//     LOGICAL_AND_OPERATOR,
//     [stepArg0, arg1]
//   );
//   const result = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   return newComprehensionProtoExpr(helper.nextId(ctx), {
//     iterRange: target,
//     iterVar: arg0.exprKind.value.name,
//     accuVar: ACCUMULATOR_VAR,
//     accuInit,
//     loopCondition: condition,
//     loopStep: step,
//     result,
//   });
// }

// export function expandExistsMacro(
//   ctx: ParserRuleContext | Token | Location | OffsetRange | null,
//   helper: ParserHelper,
//   target: Expr,
//   args: Expr[]
// ): Expr {
//   const arg0 = args[0];
//   if (!isIdentProtoExpr(arg0)) {
//     throw new MacroError('argument must be a simple name', ctx, arg0);
//   }
//   const arg1 = args[1];
//   const accuInit = newBoolProtoExpr(helper.nextId(ctx), false);
//   const conditionArg0Arg0 = newIdentProtoExpr(
//     helper.nextId(ctx),
//     ACCUMULATOR_VAR
//   );
//   const conditionArg0 = newGlobalCallProtoExpr(
//     helper.nextId(ctx),
//     LOGICAL_NOT_OPERATOR,
//     [conditionArg0Arg0]
//   );
//   const condition = newGlobalCallProtoExpr(
//     helper.nextId(ctx),
//     NOT_STRICTLY_FALSE_OPERATOR,
//     [conditionArg0]
//   );
//   const stepArg0 = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   const step = newGlobalCallProtoExpr(helper.nextId(ctx), LOGICAL_OR_OPERATOR, [
//     stepArg0,
//     arg1,
//   ]);
//   const result = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   return newComprehensionProtoExpr(helper.nextId(ctx), {
//     iterRange: target,
//     iterVar: arg0.exprKind.value.name,
//     accuVar: ACCUMULATOR_VAR,
//     accuInit,
//     loopCondition: condition,
//     loopStep: step,
//     result,
//   });
// }

// export function expandExistsOneMacro(
//   ctx: ParserRuleContext | Token | Location | OffsetRange | null,
//   helper: ParserHelper,
//   target: Expr,
//   args: Expr[]
// ): Expr {
//   const arg0 = args[0];
//   if (!isIdentProtoExpr(arg0)) {
//     throw new MacroError('argument must be a simple name', ctx, arg0);
//   }
//   const arg1 = args[1];
//   const accuInit = newIntProtoExpr(helper.nextId(ctx), BigInt(0));
//   const condition = newBoolProtoExpr(helper.nextId(ctx), true);
//   const stepArg1Arg0 = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   const stepArg1Arg1 = newIntProtoExpr(helper.nextId(ctx), BigInt(1));
//   const stepArg1 = newGlobalCallProtoExpr(helper.nextId(ctx), ADD_OPERATOR, [
//     stepArg1Arg0,
//     stepArg1Arg1,
//   ]);
//   const stepArg2 = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   const step = newGlobalCallProtoExpr(
//     helper.nextId(ctx),
//     CONDITIONAL_OPERATOR,
//     [arg1, stepArg1, stepArg2]
//   );
//   const resultArg0 = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   const resultArg1 = newIntProtoExpr(helper.nextId(ctx), BigInt(1));
//   const result = newGlobalCallProtoExpr(helper.nextId(ctx), EQUALS_OPERATOR, [
//     resultArg0,
//     resultArg1,
//   ]);
//   return newComprehensionProtoExpr(helper.nextId(ctx), {
//     iterRange: target,
//     iterVar: arg0.exprKind.value.name,
//     accuVar: ACCUMULATOR_VAR,
//     accuInit,
//     loopCondition: condition,
//     loopStep: step,
//     result,
//   });
// }

// export function expandMapMacro(
//   ctx: ParserRuleContext | Token | Location | OffsetRange | null,
//   helper: ParserHelper,
//   target: Expr,
//   args: Expr[]
// ): Expr {
//   const v = unwrapIdentProtoExpr(args[0]);
//   if (isNil(v)) {
//     throw new MacroError('argument is not an identifier', ctx, args[0]);
//   }
//   if (v === ACCUMULATOR_VAR) {
//     throw new MacroError(
//       'iteration variable overwrites accumulator variable',
//       ctx,
//       args[0]
//     );
//   }
//   let fn: Expr | null = null;
//   let filter: Expr | null = null;
//   if (args.length === 3) {
//     filter = args[1];
//     fn = args[2];
//   } else {
//     fn = args[1];
//   }
//   const init = newListProtoExpr(helper.nextId(ctx), []);
//   const condition = newBoolProtoExpr(helper.nextId(ctx), true);
//   const stepArg0 = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   const stepArg1 = newListProtoExpr(helper.nextId(ctx), [fn]);
//   let step = newGlobalCallProtoExpr(helper.nextId(ctx), ADD_OPERATOR, [
//     stepArg0,
//     stepArg1,
//   ]);
//   if (!isNil(filter)) {
//     const step2Arg2 = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//     step = newGlobalCallProtoExpr(helper.nextId(ctx), CONDITIONAL_OPERATOR, [
//       filter,
//       step,
//       step2Arg2,
//     ]);
//   }
//   const result = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   return newComprehensionProtoExpr(helper.nextId(ctx), {
//     iterRange: target,
//     iterVar: v,
//     accuVar: ACCUMULATOR_VAR,
//     accuInit: init,
//     loopCondition: condition,
//     loopStep: step,
//     result,
//   });
// }

// export function expandFilterMacro(
//   ctx: ParserRuleContext | Token | Location | OffsetRange | null,
//   helper: ParserHelper,
//   target: Expr,
//   args: Expr[]
// ): Expr {
//   const v = unwrapIdentProtoExpr(args[0]);
//   if (isNil(v)) {
//     throw new MacroError('argument is not an identifier', ctx, args[0]);
//   }
//   if (v === ACCUMULATOR_VAR) {
//     throw new MacroError(
//       'iteration variable overwrites accumulator variable',
//       ctx,
//       args[0]
//     );
//   }
//   const filter = args[1];
//   const listInit = newListProtoExpr(helper.nextId(ctx), []);
//   const condition = newBoolProtoExpr(helper.nextId(ctx), true);
//   const stepArg0 = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   const stepArg1 = newListProtoExpr(helper.nextId(ctx), [args[0]]);
//   let step = newGlobalCallProtoExpr(helper.nextId(ctx), ADD_OPERATOR, [
//     stepArg0,
//     stepArg1,
//   ]);
//   const step2Arg1 = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   step = newGlobalCallProtoExpr(helper.nextId(ctx), CONDITIONAL_OPERATOR, [
//     filter,
//     step,
//     step2Arg1,
//   ]);
//   const result = newIdentProtoExpr(helper.nextId(ctx), ACCUMULATOR_VAR);
//   return newComprehensionProtoExpr(helper.nextId(ctx), {
//     iterRange: target,
//     iterVar: v,
//     accuVar: ACCUMULATOR_VAR,
//     accuInit: listInit,
//     loopCondition: condition,
//     loopStep: step,
//     result,
//   });
// }

// export class MacroError extends Error {
//   constructor(
//     message: string,
//     public readonly ctx:
//       | ParserRuleContext
//       | Token
//       | Location
//       | OffsetRange
//       | null,
//     public readonly expr?: Expr
//   ) {
//     super(message);
//     this.name = 'MacroError';
//   }
// }
