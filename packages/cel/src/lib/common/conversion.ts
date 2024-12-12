import { InfoSource } from './source';
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import {
  CheckedExpr,
  CheckedExprSchema,
  Type as ProtoType,
  Reference,
  ReferenceSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  Constant,
  Expr,
  SourceInfo as ProtoSourceInfo,
  SourceInfoSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { AST, CheckedAST, OffsetRange, ReferenceInfo, SourceInfo } from './ast';
import { protoConstantToRefVal, refValToProtoConstant } from './pb/constants';
import { RefVal } from './ref/reference';
import { exprTypeToType, Type, typeToExprType } from './types/types';

/**
 * ToProto converts an AST to a CheckedExpr protobouf.
 */
export function toProto(ast: AST): CheckedExpr {
  const refMap: Record<string, Reference> = {};
  for (const [id, ref] of ast.referenceMap()) {
    refMap[id.toString()] = referenceInfoToProto(ref);
  }
  const typeMap: Record<string, ProtoType> = {};
  for (const [id, type] of ast.typeMap()) {
    const t = typeToExprType(type);
    if (t instanceof Error) {
      throw t;
    }
    typeMap[id.toString()] = t;
  }
  const info = sourceInfoToProto(ast.sourceInfo());
  return create(CheckedExprSchema, {
    expr: ast.expr(),
    referenceMap: refMap,
    typeMap,
    sourceInfo: info,
  });
}

/**
 * ToAST converts a CheckedExpr protobuf to an AST instance.
 */
export function toAST(expr: CheckedExpr): AST {
  const refMap = new Map<bigint, ReferenceInfo>();
  for (const [id, ref] of Object.entries(expr.referenceMap)) {
    refMap.set(BigInt(id), protoToReferenceInfo(ref));
  }
  const typeMap = new Map<bigint, Type>();
  for (const [id, type] of Object.entries(expr.typeMap)) {
    const t = exprTypeToType(type);
    if (t instanceof Error) {
      throw t;
    }
    typeMap.set(BigInt(id), t);
  }
  if (isNil(expr.sourceInfo)) {
    throw new Error('sourceInfo is required');
  }
  const info = protoToSourceInfo(expr.sourceInfo);
  const ast = new AST(expr.expr!, info);
  return new CheckedAST(ast, typeMap, refMap);
}

/**
 * SourceInfoToProto serializes an ast.SourceInfo value to a protobuf
 * SourceInfo object.
 */
export function sourceInfoToProto(info: SourceInfo) {
  const positions: Record<string, number> = {};
  for (const [id, offset] of info.offsetRanges()) {
    positions[id.toString()] = offset.start;
  }
  const macroCalls: Record<string, Expr> = {};
  for (const [id, e] of info.macroCalls()) {
    macroCalls[id.toString()] = e;
  }
  return create(SourceInfoSchema, {
    syntaxVersion: info.syntaxVersion() ?? undefined,
    location: info.description(),
    lineOffsets: info.lineOffsets(),
    positions,
    macroCalls,
  });
}

/**
 * ProtoToSourceInfo deserializes the protobuf into a native SourceInfo value.
 */
export function protoToSourceInfo(info: ProtoSourceInfo) {
  const sourceInfo = new SourceInfo(
    new InfoSource(info),
    info.syntaxVersion,
    info.location,
    info.lineOffsets,
    0,
    0
  );
  for (const [id, offset] of Object.entries(info.positions)) {
    sourceInfo.setOffsetRange(BigInt(id), new OffsetRange(offset, offset));
  }
  for (const [id, e] of Object.entries(info.macroCalls)) {
    sourceInfo.setMacroCall(BigInt(id), e);
  }
  return sourceInfo;
}

/**
 * ReferenceInfoToProto converts a ReferenceInfo instance to a protobuf
 * Reference suitable for serialization.
 */
export function referenceInfoToProto(info: ReferenceInfo) {
  const c = isNil(info.value) ? undefined : valToConstant(info.value);
  return create(ReferenceSchema, {
    name: info.name,
    overloadId: info.overloadIds ?? [],
    value: c,
  });
}

/**
 * ProtoToReferenceInfo converts a protobuf Reference into a CEL-native
 * ReferenceInfo instance.
 */
export function protoToReferenceInfo(ref: Reference) {
  const v = isNil(ref.value) ? undefined : constantToVal(ref.value);
  return new ReferenceInfo(ref.name, ref.overloadId, v);
}

/**
 * ValToConstant converts a CEL-native ref.Val to a protobuf Constant.
 *
 * Only simple scalar types are supported by this method.
 */
export function valToConstant(v: RefVal): Constant {
  return refValToProtoConstant(v);
}

/**
 * ConstantToVal converts a protobuf Constant to a CEL-native ref.Val.
 */
export function constantToVal(c: Constant): RefVal {
  return protoConstantToRefVal(c);
}
