/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import {
  CheckedExprSchema,
  Reference,
  Type,
  Type_PrimitiveType,
  Type_WellKnownType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import {
  Expr,
  ParsedExpr,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { CELEnvironment } from './environment';
import { Errors } from './errors';
import {
  DYN_TYPE,
  ERROR_TYPE,
  NULL_TYPE,
  isAssignable,
  isDyn,
  isDynOrError,
  isOptionalType,
  listType,
  mostGeneral,
  optionalType,
  primitiveType,
  substitute,
  typeParamType,
  unwrapOptionalType,
  wellKnownType,
} from './types';
import {
  extractIdent,
  functionReference,
  getLocationByOffset,
  identReference,
  mapToObject,
  toQualifiedName,
} from './utils';

export class CELChecker {
  readonly #errors!: Errors;
  readonly #referenceMap = new Map<string, Reference>();
  readonly #typeMap = new Map<string, Type>();
  #mapping = new Map<string, Type>();
  #freeTypeVarCounter = 0;

  constructor(
    public readonly parsed: ParsedExpr,
    public readonly source: string,
    public readonly env: CELEnvironment
  ) {
    this.#errors = new Errors(source);
  }

  public get dynAggregateLiteralElementTypesEnabled() {
    return this.env.aggLitElemType.typeKind.case === DYN_TYPE.typeKind.case;
  }

  public get errors() {
    return this.#errors;
  }

  check(expr: Expr = this.parsed.expr!) {
    if (isNil(expr)) {
      throw new Error('expr is nil');
    }
    const sourceInfo = this.parsed.sourceInfo;
    if (isNil(sourceInfo)) {
      throw new Error('ParsedExpr.sourceInfo is nil');
    }
    switch (expr.exprKind.case) {
      case 'constExpr':
        this.setType(expr.id, this.checkConstExpr(expr));
        break;
      case 'identExpr':
        this.checkIdentExpr(expr);
        break;
      case 'listExpr':
        this.checkListExpr(expr);
        break;
      case 'selectExpr':
        this.checkSelect(expr);
        break;
      default:
        this.#errors.reportUnexpectedAstTypeError(
          expr.id,
          this.getLocationById(expr.id),
          'unspecified',
          expr.exprKind.case ?? ''
        );
    }
    // Walk over the final type map substituting any type parameters either by
    // their bound value or by DYN.
    for (const [id, t] of this.#typeMap) {
      this.setType(BigInt(id), substitute(this.#mapping, t, true));
    }
    return create(CheckedExprSchema, {
      expr,
      sourceInfo,
      referenceMap: mapToObject(this.#referenceMap),
      typeMap: mapToObject(this.#typeMap),
    });
  }

  checkConstExpr(expr: Expr): Type {
    if (expr.exprKind.case !== 'constExpr') {
      this.#errors.reportUnexpectedAstTypeError(
        expr.id,
        this.getLocationById(expr.id),
        'constExpr',
        expr.exprKind.case!
      );
      return ERROR_TYPE;
    }
    switch (expr.exprKind.value.constantKind.case) {
      case 'boolValue':
        return primitiveType(Type_PrimitiveType.BOOL);
      case 'bytesValue':
        return primitiveType(Type_PrimitiveType.BYTES);
      case 'doubleValue':
        return primitiveType(Type_PrimitiveType.DOUBLE);
      case 'int64Value':
        return primitiveType(Type_PrimitiveType.INT64);
      case 'nullValue':
        return NULL_TYPE;
      case 'stringValue':
        return primitiveType(Type_PrimitiveType.STRING);
      case 'uint64Value':
        return primitiveType(Type_PrimitiveType.UINT64);
      case 'durationValue':
        return wellKnownType(Type_WellKnownType.DURATION);
      case 'timestampValue':
        return wellKnownType(Type_WellKnownType.TIMESTAMP);
      default:
        this.#errors.reportUnexpectedAstTypeError(
          expr.id,
          this.getLocationById(expr.id),
          'constExpr',
          expr.exprKind.value.constantKind.case!
        );
        return ERROR_TYPE;
    }
  }

  checkIdentExpr(expr: Expr) {
    if (expr.exprKind.case !== 'identExpr') {
      // This should never happen
      throw new Error('expr.exprKind.case is not identExpr');
    }
    const identName = extractIdent(expr);
    if (isNil(identName)) {
      throw new Error('identName is nil');
    }
    const ident = this.env.lookupIdent(identName);
    if (!isNil(ident)) {
      if (ident.declKind.case !== 'ident') {
        // This should never happen
        throw new Error('ident.declKind.case is not ident');
      }
      this.setType(expr.id, ident.declKind.value.type!);
      this.setReference(
        expr.id,
        identReference(ident.name, ident.declKind.value.value!)
      );
      return;
    }
    this.setType(expr.id, ERROR_TYPE);
    this.#errors.reportUndeclaredReference(
      expr.id,
      this.getLocationById(expr.id),
      this.env.container,
      identName
    );
  }

  checkSelect(expr: Expr) {
    if (expr.exprKind.case !== 'selectExpr') {
      // This should never happen
      throw new Error('expr.exprKind.case is not identExpr');
    }
    // Before traversing down the tree, try to interpret as qualified name.
    const qname = toQualifiedName(expr);
    if (qname !== '') {
      const ident = this.env.lookupIdent(qname);
      if (!isNil(ident)) {
        if (ident.declKind.case !== 'ident') {
          // This should never happen
          throw new Error('ident.declKind.case is not ident');
        }
        this.setType(expr.id, ident.declKind.value.type!);
        this.setReference(
          expr.id,
          identReference(ident.name, ident.declKind.value.value!)
        );
        return;
      }
    }
    let resultType = this.checkSelectField(
      expr,
      expr.exprKind.value.operand!,
      expr.exprKind.value.field,
      false
    );
    if (expr.exprKind.value.testOnly) {
      resultType = primitiveType(Type_PrimitiveType.BOOL);
    }
    this.setType(expr.id, substitute(this.#mapping, resultType, false));
  }

  checkOptSelect(expr: Expr) {
    if (expr.exprKind.case !== 'selectExpr') {
      // This should never happen
      throw new Error('expr.exprKind.case is not identExpr');
    }
    // Collect metadata related to the opt select call packaged by the parser.
    const operand = expr.exprKind.value.operand!;
    const field = expr.exprKind.value.field;

    // Perform type-checking using the field selection logic.
    const resultType = this.checkSelectField(expr, operand, field, true);
    this.setType(expr.id, substitute(this.#mapping, resultType, false));
    this.setReference(expr.id, functionReference(['select_optional_field']));
  }

  checkSelectField(
    expr: Expr,
    operand: Expr,
    field: string,
    optional: boolean
  ) {
    // Interpret as field selection, first traversing down the operand.
    this.check(operand);
    const operandType = substitute(
      this.#mapping,
      this.getType(operand.id)!,
      false
    );

    // If the target type is 'optional', unwrap it for the sake of this check.
    const targetType = isOptionalType(operandType)
      ? unwrapOptionalType(operandType)
      : operandType;
    if (isNil(targetType)) {
      // This should never happen
      throw new Error('targetType is nil');
    }

    // Assume error type by default as most types do not support field
    // selection.
    let resultType = ERROR_TYPE;
    switch (targetType.typeKind.case) {
      case 'mapType':
        // Maps yield their value type as the selection result type.
        resultType = targetType.typeKind.value.valueType!;
        break;
      case 'messageType':
        // Objects yield their field type declaration as the selection result
        // type, but only if the field is defined.
        const fieldType = this.env.lookupFieldType(
          targetType.typeKind.value,
          field
        );
        if (!isNil(fieldType)) {
          resultType = fieldType;
          break;
        }
        this.#errors.reportUndefinedField(
          expr.id,
          this.getLocationById(expr.id),
          field
        );
        break;
      case 'typeParam':
        // Set the operand type to DYN to prevent assignment to a potentially
        // incorrect type at a later point in type-checking. The isAssignable
        // call will update the type substitutions for the type param under the
        // covers.
        this._isAssignable(DYN_TYPE, targetType);
        // Also, set the result type to DYN.
        resultType = DYN_TYPE;
        break;
      default:
        if (!isDynOrError(targetType)) {
          this.#errors.reportTypeDoesNotSupportFieldSelection(
            expr.id,
            this.getLocationById(expr.id),
            targetType
          );
        }
        resultType = DYN_TYPE;
    }
    if (isOptionalType(operandType) || optional) {
      return optionalType(resultType);
    }
    return resultType;
  }

  checkListExpr(expr: Expr) {
    if (expr.exprKind.case !== 'listExpr') {
      // This should never happen
      throw new Error('expr.exprKind.case is not identExpr');
    }
    const createList = expr.exprKind.value;
    let elemsType: Type | undefined = undefined;
    const optionals = {} as Record<number, boolean>;
    for (const optInd of createList.optionalIndices) {
      optionals[optInd] = true;
    }
    for (let i = 0; i < createList.elements.length; i++) {
      const e = createList.elements[i];
      this.check(e);
      const elemType = this.getType(e.id);
      if (isNil(elemType)) {
        continue;
      }
      if (optionals[i]) {
        if (!isOptionalType(elemType) && !isDyn(elemType)) {
          this.#errors.reportTypeMismatch(
            e.id,
            this.getLocationById(e.id),
            optionalType(elemType),
            elemType
          );
        }
      }
      elemsType = this._joinTypes(e, elemsType!, elemType!);
    }
    if (isNil(elemsType)) {
      elemsType = this._newTypeVar();
    }
    this.setType(expr.id, listType({ elemType: elemsType }));
  }

  setType(id: bigint, type: Type) {
    this.#typeMap.set(id.toString(), type);
  }

  getType(id: bigint) {
    return this.#typeMap.get(id.toString());
  }

  setReference(id: bigint, ref: Reference) {
    this.#referenceMap.set(id.toString(), ref);
  }

  getReference(id: bigint) {
    return this.#referenceMap.get(id.toString());
  }

  getLocationById(id: bigint) {
    return getLocationByOffset(
      this.parsed.sourceInfo!,
      this.parsed.sourceInfo!.positions[id.toString()]
    );
  }

  private _joinTypes(expr: Expr, previous: Type, current: Type) {
    if (isNil(previous)) {
      return current;
    }
    if (this._isAssignable(previous, current)) {
      return mostGeneral(previous, current);
    }
    if (this.dynAggregateLiteralElementTypesEnabled) {
      return DYN_TYPE;
    }
    this.#errors.reportTypeMismatch(
      expr.id,
      getLocationByOffset(
        this.parsed.sourceInfo!,
        this.parsed.sourceInfo!.positions[expr.id.toString()]
      ),
      previous,
      current
    );
    return ERROR_TYPE;
  }

  private _newTypeVar() {
    const id = this.#freeTypeVarCounter;
    this.#freeTypeVarCounter++;
    return typeParamType(`_var${id}`);
  }

  private _isAssignable(t1: Type, t2: Type) {
    const subs = isAssignable(this.#mapping, t1, t2);
    if (!isNil(subs)) {
      this.#mapping = subs;
      return true;
    }
    return false;
  }
}
