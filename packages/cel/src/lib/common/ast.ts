import { isNil } from '@bearclaw/is';
import {
  Expr,
  SourceInfo as ProtoSourceInfo,
  SourceInfoSchema,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { Location, NoLocation } from './location';
import { RefVal } from './ref/reference';
import { Source } from './source';
import { DynType, Type } from './types/types';
import { mapToObject } from './utils';

/**
 * AST contains a protobuf expression and source info along with CEL-native
 * type and reference information.
 */
export class AST {
  protected _expr: Expr;
  protected _sourceInfo: SourceInfo;
  protected _typeMap = new Map<bigint, Type>();
  protected _refMap = new Map<bigint, ReferenceInfo>();

  constructor(e: Expr, s: SourceInfo) {
    this._expr = e;
    this._sourceInfo = s;
  }

  /**
   * Expr returns the root ast.Expr value in the AST.
   */
  expr() {
    return this._expr;
  }

  /**
   * SourceInfo returns the source metadata associated with the parse /
   * type-check passes.
   */
  sourceInfo() {
    return this._sourceInfo;
  }

  /**
   * GetType returns the type for the expression at the given id, if one
   * exists, else types.DynType.
   */
  getType(id: bigint) {
    if (this._typeMap.has(id)) {
      return this._typeMap.get(id);
    }
    return DynType;
  }

  /**
   * SetType sets the type of the expression node at the given id.
   */
  setType(id: bigint, t: Type) {
    this._typeMap.set(id, t);
  }

  /**
   * TypeMap returns the map of expression ids to type-checked types.
   *
   * If the AST is not type-checked, the map will be empty.
   */
  typeMap() {
    return this._typeMap;
  }

  /**
   * GetOverloadIDs returns the set of overload function names for a given
   * expression id.
   *
   * If the expression id is not a function call, or the AST is not
   * type-checked, the result will be empty.
   */
  getOverloadIDs(id: bigint) {
    if (this._refMap.has(id)) {
      return this._refMap.get(id)?.overloadIds ?? [];
    }
    return [];
  }

  /**
   * GetReference returns the reference information for the given expression id.
   */
  getReference(id: bigint) {
    return this._refMap.get(id);
  }

  /**
   * SetReference adds a reference to the checked AST type map.
   */
  setReference(id: bigint, ref: ReferenceInfo) {
    this._refMap.set(id, ref);
  }

  /**
   * ReferenceMap returns the map of expression id to identifier, constant, and
   * function references.
   */
  referenceMap() {
    return this._refMap;
  }

  /**
   * IsChecked returns whether the AST is type-checked.
   */
  isChecked() {
    return this._typeMap.size > 0;
  }
}

/**
 * NewCheckedAST wraps an parsed AST and augments it with type and reference
 * metadata.
 */
export class CheckedAST extends AST {
  protected _parsed: AST;

  constructor(
    parsed: AST,
    typeMap: Map<bigint, Type>,
    refMap: Map<bigint, ReferenceInfo>
  ) {
    super(parsed.expr(), parsed.sourceInfo());
    this._parsed = parsed;
    this._typeMap = typeMap;
    this._refMap = refMap;
  }
}

export class SourceInfo {
  private _source: Source;
  private _syntax: string | null;
  private _desc: string;
  private _lines: number[];
  private _baseLine: number;
  private _baseCol: number;
  private _offsetRanges = new Map<bigint, OffsetRange>();
  private _macroCalls = new Map<bigint, Expr>();

  constructor(
    source: Source,
    syntax: string | null,
    desc: string,
    lines: number[],
    baseLine: number,
    baseCol: number
  ) {
    this._source = source;
    this._syntax = syntax;
    this._desc = desc;
    this._lines = lines;
    this._baseLine = baseLine;
    this._baseCol = baseCol;
  }

  /**
   * Source returns the Source object associated with the SourceInfo.
   */
  source() {
    return this._source;
  }

  /**
   * SyntaxVersion returns the syntax version associated with the text
   * expression.
   */
  syntaxVersion() {
    return this._syntax;
  }

  /**
   * Description provides information about where the expression came from.
   */
  description() {
    return this._desc;
  }

  /**
   * LineOffsets returns a list of the 0-based character offsets in the input
   * text where newlines appear.
   */
  lineOffsets() {
    return this._lines;
  }

  /**
   * MacroCalls returns a map of expression id to ast.Expr value where the id
   * represents the expression node where the macro was inserted into the AST,
   * and the ast.Expr value represents the original call signature which was
   * replaced.
   */
  macroCalls() {
    return this._macroCalls;
  }

  /**
   * GetMacroCall returns the original ast.Expr value for the given expression
   * if it was generated via a macro replacement.
   *
   * Note, parsing options must be enabled to track macro calls before this
   * method will return a value.
   */
  getMacroCall(id: bigint) {
    return this._macroCalls.get(id) ?? null;
  }

  /**
   * SetMacroCall records a macro call at a specific location.
   */
  setMacroCall(id: bigint, expr: Expr) {
    this._macroCalls.set(id, expr);
  }

  /**
   * ClearMacroCall removes the macro call at the given expression id.
   */
  clearMacroCall(id: bigint) {
    this._macroCalls.delete(id);
  }

  /**
   * OffsetRanges returns a map of expression id to OffsetRange values where
   * the range indicates either: the start and end position in the input stream
   * where the expression occurs, or the start position only. If the range only
   * captures start position, the stop position of the range will be equal to
   * the start.
   */
  offsetRanges() {
    return this._offsetRanges;
  }

  /**
   * GetOffsetRange retrieves an OffsetRange for the given expression id if one
   * exists.
   */
  getOffsetRange(id: bigint) {
    return this._offsetRanges.get(id) ?? null;
  }

  /**
   * SetOffsetRange sets the OffsetRange for the given expression id.
   */
  setOffsetRange(id: bigint, range: OffsetRange) {
    this._offsetRanges.set(id, range);
  }

  /**
   * ClearOffsetRange removes the OffsetRange for the given expression id.
   */
  clearOffsetRange(id: bigint) {
    this._offsetRanges.delete(id);
  }

  /**
   * GetStartLocation calculates the human-readable 1-based line and 0-based
   * column of the first character of the expression node at the id.
   */
  getStartLocation(id: bigint) {
    const range = this.getOffsetRange(id);
    if (isNil(range)) {
      return NoLocation;
    }
    return this.getLocationByOffset(range.start);
  }

  /**
   * GetStopLocation calculates the human-readable 1-based line and 0-based
   * column of the last character for the expression node at the given id.
   *
   * If the SourceInfo was generated from a serialized protobuf representation,
   * the stop location will be identical to the start location for the expression.
   */
  getStopLocation(id: bigint) {
    const range = this.getOffsetRange(id);
    if (isNil(range)) {
      return NoLocation;
    }
    return this.getLocationByOffset(range.stop);
  }

  /**
   * GetLocationByOffset returns the line and column information for a given
   * character offset.
   */
  getLocationByOffset(offset: number) {
    let line = 1;
    let column = offset;
    for (let i = 0; i < this.lineOffsets().length; i++) {
      const lineOffset = this.lineOffsets()[i];
      if (lineOffset > offset) {
        break;
      }
      line++;
      column = offset - lineOffset;
    }
    return new Location(line, column);
  }

  /**
   * ComputeOffset calculates the 0-based character offset from a 1-based line
   * and 0-based column.
   */
  computeOffset(line: number, column: number) {
    line = this._baseLine + line;
    column = this._baseCol + column;
    if (line === 1) {
      return column;
    }
    if (line < 1 || line > this.lineOffsets().length) {
      return -1;
    }
    const offset = this.lineOffsets()[line - 2];
    return offset + column;
  }

  toProto(): ProtoSourceInfo {
    const macroCallsMap = new Map<string, Expr>();
    this._macroCalls.forEach((v, k) => {
      macroCallsMap.set(k.toString(), v);
    });
    const positionsMap = new Map<string, number>();
    this._offsetRanges.forEach((v, k) => {
      positionsMap.set(k.toString(), v.start);
    });
    return create(SourceInfoSchema, {
      lineOffsets: this.lineOffsets(),
      location: this.description(),
      macroCalls: mapToObject(macroCallsMap),
      syntaxVersion: this.syntaxVersion() ?? '',
      positions: mapToObject(positionsMap),
    });
  }
}

export class OffsetRange {
  constructor(public start: number, public stop: number) {}
}

/**
 * NewSourceInfo creates a simple SourceInfo object from an input common.Source
 * value.
 */
export function newSourceInfo(src: Source) {
  let lineOffsets: number[] | undefined;
  let desc: string | undefined;
  let baseLine = 0;
  let baseCol = 0;
  if (!isNil(src)) {
    desc = src.description();
    lineOffsets = src.lineOffsets();
    // Determine whether the source metadata should be computed relative
    // to a base line and column value. This can be determined by requesting
    // the location for offset 0 from the source object.
    const loc = src.offsetLocation(0);
    if (!isNil(loc)) {
      baseLine = loc.line - 1;
      baseCol = loc.column;
    }
  }
  return new SourceInfo(
    src,
    null,
    desc ?? '',
    lineOffsets ?? [],
    baseLine,
    baseCol
  );
}

/**
 * ReferenceInfo contains a CEL native representation of an identifier
 * reference which may refer to  either a qualified identifier name, a set of
 * overload ids, or a constant value from an enum.
 */
export class ReferenceInfo {
  constructor(
    public readonly name?: string,
    public readonly overloadIds?: string[],
    public readonly value?: RefVal
  ) {}

  /**
   * AddOverload appends a function overload ID to the ReferenceInfo.
   */
  addOverload(id: string) {
    for (const o of this.overloadIds ?? []) {
      if (o === id) {
        return;
      }
    }
    this.overloadIds?.push(id);
  }

  /**
   * Equals returns whether two references are identical to each other.
   */
  equals(other: ReferenceInfo) {
    if (this.name !== other.name) {
      return false;
    }
    if (this.overloadIds?.length !== other.overloadIds?.length) {
      return false;
    }
    const otherOverloads = new Set(other.overloadIds);
    for (let i = 0; i < (this.overloadIds?.length ?? 0); i++) {
      if (this.overloadIds && !otherOverloads.has(this.overloadIds[i])) {
        return false;
      }
    }
    if (this.value && !other.value) {
      return false;
    }
    if (other.value && !this.value) {
      return false;
    }
    if (this.value && other.value && !this.value.equal(other.value).value()) {
      return false;
    }
    return true;
  }
}

/**
 * NewIdentReference creates a ReferenceInfo instance for an identifier with an
 * optional constant value.
 */
export function newIdentReference(name: string, value?: RefVal) {
  return new ReferenceInfo(name, undefined, value);
}

/**
 * NewFunctionReference creates a ReferenceInfo instance for a set of function
 * overloads.
 */
export function newFunctionReference(...overloads: string[]) {
  return new ReferenceInfo(undefined, overloads);
}
