/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isEmpty, isNil } from '@bearclaw/is';
import {
  CheckedExprSchema,
  Decl,
  Decl_IdentDecl,
  Decl_IdentDeclSchema,
  Reference,
  Type,
  Type_PrimitiveType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import {
  Expr,
  ParsedExpr,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { CELEnvironment } from './environment';
import { Errors } from './errors';
import {
  LOGICAL_AND_OPERATOR,
  LOGICAL_OR_OPERATOR,
  OPT_SELECT_OPERATOR,
} from './operators';
import {
  BOOL_TYPE,
  BYTES_TYPE,
  DOUBLE_TYPE,
  DURATION_TYPE,
  DYN_TYPE,
  ERROR_TYPE,
  INT64_TYPE,
  NULL_TYPE,
  STRING_TYPE,
  TIMESTAMP_TYPE,
  UINT64_TYPE,
  functionType,
  getCheckedWellKnownType,
  isAssignable,
  isAssignableList,
  isDyn,
  isDynOrError,
  isError,
  isExactType,
  isOptionalType,
  listType,
  mapType,
  maybeUnwrapOptionalType,
  mostGeneral,
  optionalType,
  primitiveType,
  substitute,
  typeParamType,
  unwrapFunctionType,
  unwrapIdentDeclType,
  unwrapOptionalType,
} from './types';
import {
  extractIdent,
  functionReference,
  getLocationByOffset,
  getWellKNownTypeName,
  identDecl,
  identReference,
  isMapExpr,
  mapToObject,
  toQualifiedName,
} from './utils';

export interface OverloadResolution {
  resultType?: Type;
  checkedRef?: Reference;
}

export class CELChecker {
  readonly #errors!: Errors;
  readonly #referenceMap = new Map<string, Reference>();
  readonly #typeMap = new Map<string, Type>();
  #mapping = new Map<string, Type>();
  #freeTypeVarCounter = 0;

  constructor(
    public readonly parsed: ParsedExpr,
    public readonly source: string,
    public env: CELEnvironment
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
    this.checkExpr(expr);
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

  checkExpr(expr?: Expr) {
    if (isNil(expr)) {
      return expr;
    }
    switch (expr.exprKind.case) {
      case 'constExpr':
        return this.checkConstExpr(expr);
      case 'identExpr':
        return this.checkIdentExpr(expr);
      case 'listExpr':
        return this.checkListExpr(expr);
      case 'selectExpr':
        return this.checkSelect(expr);
      case 'callExpr':
        return this.checkCall(expr);
      case 'structExpr':
        if (isMapExpr(expr)) {
          return this.checkCreateMap(expr);
        }
        return this.checkCreateStruct(expr);
      case 'comprehensionExpr':
        return this.checkComprehension(expr);
      default:
        this.#errors.reportUnexpectedAstTypeError(
          expr.id,
          this.getLocationById(expr.id),
          'unspecified',
          expr.exprKind.case ?? ''
        );
    }
    return expr;
  }

  checkConstExpr(expr: Expr) {
    if (expr.exprKind.case !== 'constExpr') {
      this.#errors.reportUnexpectedAstTypeError(
        expr.id,
        this.getLocationById(expr.id),
        'constExpr',
        expr.exprKind.case!
      );
      this.setType(expr.id, ERROR_TYPE);
      return expr;
    }
    switch (expr.exprKind.value.constantKind.case) {
      case 'boolValue':
        this.setType(expr.id, BOOL_TYPE);
        break;
      case 'bytesValue':
        this.setType(expr.id, BYTES_TYPE);
        break;
      case 'doubleValue':
        this.setType(expr.id, DOUBLE_TYPE);
        break;
      case 'int64Value':
        this.setType(expr.id, INT64_TYPE);
        break;
      case 'nullValue':
        this.setType(expr.id, NULL_TYPE);
        break;
      case 'stringValue':
        this.setType(expr.id, STRING_TYPE);
        break;
      case 'uint64Value':
        this.setType(expr.id, UINT64_TYPE);
        break;
      case 'durationValue':
        this.setType(expr.id, DURATION_TYPE);
        break;
      case 'timestampValue':
        this.setType(expr.id, TIMESTAMP_TYPE);
        break;
      default:
        this.#errors.reportUnexpectedAstTypeError(
          expr.id,
          this.getLocationById(expr.id),
          'constExpr',
          expr.exprKind.value.constantKind.case!
        );
        this.setType(expr.id, ERROR_TYPE);
        break;
    }
    return expr;
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
    if (isNil(ident)) {
      this.setType(expr.id, ERROR_TYPE);
      this.#errors.reportUndeclaredReference(
        expr.id,
        this.getLocationById(expr.id),
        this.env.container,
        identName
      );
      return expr;
    }
    if (ident.declKind.case !== 'ident') {
      // This should never happen
      throw new Error('ident.declKind.case is not ident');
    }
    // Overwrite the identifier with its fully qualified name.
    const qn = toQualifiedName(expr);
    expr.exprKind.value.name = qn;
    let identType = unwrapIdentDeclType(ident)!;
    // Handle special cases for well-known types.
    if (identType.type?.typeKind.case === 'messageType') {
      const checkedType = getCheckedWellKnownType(
        identType.type.typeKind.value
      );
      if (!isNil(checkedType)) {
        identType = create(Decl_IdentDeclSchema, {
          type: checkedType,
        });
      }
    }
    this.setType(expr.id, identType.type!);
    this.setReference(expr.id, identReference(ident.name, identType.value!));
    return expr;
  }

  checkSelect(expr: Expr) {
    if (expr.exprKind.case !== 'selectExpr') {
      // This should never happen
      throw new Error('expr.exprKind.case is not selectExpr');
    }
    // Before traversing down the tree, try to interpret as qualified name.
    const qname = toQualifiedName(expr);
    if (!isEmpty(qname)) {
      const decl = this.env.lookupIdent(qname);
      const ident = !isNil(decl) ? unwrapIdentDeclType(decl) : null;
      if (!isNil(ident)) {
        if (expr.exprKind.value.testOnly) {
          this.#errors.reportErrorAtId(
            expr.id,
            this.getLocationById(expr.id),
            'expression does not select a field'
          );
          this.setType(expr.id, BOOL_TYPE);
        } else {
          this.setType(expr.id, ident.type!);
          this.setReference(expr.id, identReference(decl!.name, ident.value!));
        }
        return expr;
      }
    }

    // Interpret as field selection, first traversing down the operand.
    let resultType = this.checkSelectField(
      expr,
      expr.exprKind.value.operand!,
      expr.exprKind.value.field,
      false
    );
    if (expr.exprKind.value.testOnly) {
      resultType = BOOL_TYPE;
    }
    this.setType(expr.id, substitute(this.#mapping, resultType, false));
    return expr;
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
    return expr;
  }

  checkSelectField(
    expr: Expr,
    operand: Expr,
    field: string,
    optional: boolean
  ) {
    // Interpret as field selection, first traversing down the operand.
    const checkedOperand = this.checkExpr(operand);
    const operandType = substitute(
      this.#mapping,
      this.getType(checkedOperand!.id)!,
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
        } else {
          const msg = this.env.lookupStructType(targetType.typeKind.value);
          if (isNil(msg)) {
            this.#errors.reportUnexpectedFailedResolution(
              expr.id,
              this.getLocationById(expr.id),
              targetType.typeKind.value
            );
          } else {
            this.#errors.reportUndefinedField(
              expr.id,
              this.getLocationById(expr.id),
              field
            );
          }
        }
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

  checkCall(expr: Expr) {
    if (expr.exprKind.case !== 'callExpr') {
      // This should never happen
      throw new Error('expr.exprKind.case is not callExpr');
    }
    const call = expr.exprKind.value;
    const fnName = call.function;
    if (fnName === OPT_SELECT_OPERATOR) {
      return this.checkOptSelect(expr);
    }
    const args = call.args;
    // Traverse arguments.
    for (const arg of args) {
      this.checkExpr(arg);
    }

    // Regular static call with simple name.
    if (isNil(call.target)) {
      // Check for the existence of the function.
      const fn = this.env.lookupFunction(fnName);
      if (isNil(fn)) {
        this.#errors.reportUndeclaredReference(
          expr.id,
          this.getLocationById(expr.id),
          this.env.container,
          fnName
        );
        this.setType(expr.id, ERROR_TYPE);
        return expr;
      }
      // Overwrite the function name with its fully qualified resolved name.
      expr.exprKind.value.function = fn.name;
      // Check to see whether the overload resolves.
      this.resolveOverloadOrError(expr, fn, null, args);
      return expr;
    }

    // If a receiver 'target' is present, it may either be a receiver function,
    // or a namespaced function, but not both. Given a.b.c() either a.b.c is a
    // function or c is a function with target a.b.
    //
    // Check whether the target is a namespaced function name.
    const qualifiedPrefix = toQualifiedName(call.target);
    if (!isEmpty(qualifiedPrefix)) {
      const qualifiedName = `${qualifiedPrefix}.${fnName}`;
      const fn = this.env.lookupFunction(qualifiedName);
      if (!isNil(fn)) {
        // The function name is namespaced and so preserving the target operand
        // would be an inaccurate representation of the desired evaluation
        // behavior.
        // Overwrite with fully-qualified resolved function name sans receiver
        // target.
        expr.exprKind.value.function = fn.name;
        this.resolveOverloadOrError(expr, fn, null, args);
        return expr;
      }
    }

    // Regular instance call.
    const checkedTarget = this.checkExpr(call.target)!;
    const fn = this.env.lookupFunction(fnName);
    // Function found, attempt overload resolution.
    if (!isNil(fn)) {
      this.resolveOverloadOrError(expr, fn, checkedTarget, args);
      return expr;
    }
    // Function name not declared, record error.
    this.setType(expr.id, ERROR_TYPE);
    this.#errors.reportUndeclaredReference(
      expr.id,
      this.getLocationById(expr.id),
      this.env.container,
      fnName
    );
    return expr;
  }

  resolveOverloadOrError(
    expr: Expr,
    fn: Decl,
    target: Expr | null,
    args: Expr[]
  ) {
    if (expr.exprKind.case !== 'callExpr') {
      // This should never happen but acts as a type guard.
      throw new Error('expr.exprKind.case is not callExpr');
    }
    if (fn.declKind.case !== 'function') {
      // This should never happen but acts as a type guard.
      throw new Error('fn.declKind.case is not a function');
    }
    // Attempt to resolve the overload.
    const resolution = this.resolveOverload(expr, fn, target, args);
    // No such overload, error noted in the resolveOverload call, type recorded
    // here.
    if (isNil(resolution)) {
      this.setType(expr.id, ERROR_TYPE);
      return resolution;
    }
    // Overload found
    this.setType(expr.id, resolution.resultType!);
    this.setReference(expr.id, resolution.checkedRef!);
    return resolution;
  }

  resolveOverload(
    expr: Expr,
    fn: Decl,
    target: Expr | null,
    args: Expr[]
  ): OverloadResolution | null {
    if (expr.exprKind.case !== 'callExpr') {
      // This should never happen but acts as a type guard.
      throw new Error('expr.exprKind.case is not callExpr');
    }
    if (fn.declKind.case !== 'function') {
      // This should never happen but acts as a type guard.
      throw new Error('fn.declKind.case is not a function');
    }
    const argTypes: Type[] = [];
    if (!isNil(target)) {
      argTypes.push(this.getType(target.id)!);
    }
    for (const arg of args) {
      argTypes.push(this.getType(arg.id)!);
    }

    let resultType: Type | undefined = undefined;
    let checkedRef: Reference | undefined = undefined;
    for (const overload of fn.declKind.value.overloads) {
      // TODO: implement disabled overloads
      // // Determine whether the overload is currently considered.
      // if c.env.isOverloadDisabled(overload.ID()) {
      // 	continue
      // }

      // Ensure the call style for the overload matches.
      if (
        (isNil(target) && overload.isInstanceFunction) ||
        (!isNil(target) && !overload.isInstanceFunction)
      ) {
        // not a compatible call style.
        continue;
      }

      // Alternative type-checking behavior when the logical operators are
      // compacted into variadic AST representations.
      if (fn.name === LOGICAL_AND_OPERATOR || fn.name === LOGICAL_OR_OPERATOR) {
        checkedRef = functionReference([overload.overloadId]);
        for (let i = 0; i < argTypes.length; i++) {
          const argType = argTypes[i];
          if (!this._isAssignable(argType, BOOL_TYPE)) {
            this.#errors.reportTypeMismatch(
              args[i].id,
              this.getLocationById(args[i].id),
              BOOL_TYPE,
              argType
            );
            resultType = ERROR_TYPE;
          }
        }
        if (!isNil(resultType) && isError(resultType)) {
          return null;
        }
        return {
          checkedRef,
          resultType: primitiveType(Type_PrimitiveType.BOOL),
        };
      }

      let overloadType = functionType({
        resultType: overload.resultType,
        argTypes: overload.params,
      });
      const typeParams = overload.typeParams;
      if (typeParams.length > 0) {
        // Instantiate overload's type with fresh type variables.
        const substitutions = new Map<string, Type>();
        for (const typeParam of typeParams) {
          substitutions.set(typeParam, this._newTypeVar());
        }
        overloadType = substitute(substitutions, overloadType, false);
      }

      const unwrappedOverload = unwrapFunctionType(overloadType)!;
      const candidateArgTypes = unwrappedOverload.argTypes;
      if (this._isAssignableList(argTypes, candidateArgTypes)) {
        if (isNil(checkedRef)) {
          checkedRef = functionReference([overload.overloadId]);
        } else {
          checkedRef.overloadId.push(overload.overloadId);
        }
        // First matching overload, determines result type.
        const fnResultType = substitute(
          this.#mapping,
          unwrappedOverload.resultType!,
          false
        );
        if (isNil(resultType)) {
          resultType = fnResultType;
        } else if (
          !isDyn(resultType) &&
          !isExactType(fnResultType, resultType)
        ) {
          resultType = DYN_TYPE;
        }
      }
    }

    if (isNil(resultType)) {
      for (let i = 0; i < argTypes.length; i++) {
        argTypes[i] = substitute(this.#mapping, argTypes[i], false);
      }
      this.#errors.reportNoMatchingOverload(
        expr.id,
        this.getLocationById(expr.id),
        fn.name,
        argTypes,
        !isNil(target)
      );
      return null;
    }

    return { checkedRef, resultType };
  }

  checkListExpr(expr: Expr) {
    if (expr.exprKind.case !== 'listExpr') {
      // This should never happen
      throw new Error('expr.exprKind.case is not listExpr');
    }
    const createList = expr.exprKind.value;
    let elemsType: Type | undefined = undefined;
    const optionals = {} as Record<number, boolean>;
    for (const optInd of createList.optionalIndices) {
      optionals[optInd] = true;
    }
    for (let i = 0; i < createList.elements.length; i++) {
      const e = createList.elements[i];
      this.checkExpr(e);
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
    return expr;
  }

  checkCreateMap(expr: Expr) {
    if (expr.exprKind.case !== 'structExpr') {
      // This should never happen but acts as a type guard.
      throw new Error('expr.exprKind.case is not structExpr');
    }
    let mapKeyType: Type | undefined = undefined;
    let mapValueType: Type | undefined = undefined;
    for (let i = 0; i < expr.exprKind.value.entries.length; i++) {
      const entry = expr.exprKind.value.entries[i];
      if (entry.keyKind.case !== 'mapKey') {
        // This should never happen
        throw new Error('entry.keyKind.case is not mapKey');
      }
      const checkedKey = this.checkExpr(entry.keyKind.value)!;
      mapKeyType = this._joinTypes(
        checkedKey,
        mapKeyType,
        this.getType(checkedKey.id)!
      );

      const checkedVal = this.checkExpr(entry.value)!;
      let valType = this.getType(checkedVal.id)!;
      if (isOptionalType(mapKeyType)) {
        valType = unwrapOptionalType(valType)!;
        if (!isOptionalType(valType) && !isDyn(valType)) {
          this.#errors.reportTypeMismatch(
            checkedVal.id,
            this.getLocationById(checkedVal.id),
            optionalType(valType),
            valType
          );
        }
      }
      mapValueType = this._joinTypes(checkedVal, mapValueType, valType);
    }
    if (isNil(mapKeyType)) {
      // If the map is empty, assign free type variables to typeKey and value
      // type.
      mapKeyType = this._newTypeVar();
      mapValueType = this._newTypeVar();
    }
    this.setType(
      expr.id,
      mapType({
        keyType: mapKeyType,
        valueType: mapValueType,
      })
    );
    return expr;
  }

  checkCreateStruct(expr: Expr) {
    if (expr.exprKind.case !== 'structExpr') {
      // This should never happen but acts as a type guard.
      throw new Error('expr.exprKind.case is not structExpr');
    }
    const msgVal = expr.exprKind.value;
    // Determine the type of the message.
    let resultType: Type = ERROR_TYPE;
    const ident = this.env.lookupIdent(msgVal.messageName);
    if (isNil(ident)) {
      this.#errors.reportUndeclaredReference(
        expr.id,
        this.getLocationById(expr.id),
        this.env.container,
        msgVal.messageName
      );
      this.setType(expr.id, ERROR_TYPE);
      return expr;
    }
    const identDecl = ident.declKind.value as Decl_IdentDecl;
    let typeName = ident.name;
    // Ensure the type name is fully qualified in the AST.
    if (msgVal.messageName !== typeName) {
      expr.exprKind.value.messageName = typeName;
    }
    this.setReference(expr.id, identReference(typeName, identDecl.value!));
    const identKind = identDecl.type?.typeKind.case;
    if (identKind !== 'error') {
      if (
        identKind !== 'type' &&
        identKind !== 'wellKnown' &&
        identKind !== 'messageType'
      ) {
        this.#errors.reportNotAType(
          expr.id,
          this.getLocationById(expr.id),
          typeName
        );
      } else {
        switch (identKind) {
          case 'type':
            resultType = identDecl.type!.typeKind.value;
            break;
          case 'wellKnown':
          case 'messageType':
            resultType = identDecl.type!;
            break;
        }
        // Backwards compatibility test between well-known types and message
        // types. In this context, the type is being instantiated by it
        // protobuf name which is not ideal or recommended, but some users
        // expect this to work.
        if (resultType.typeKind.case === 'wellKnown') {
          typeName = getWellKNownTypeName(resultType.typeKind.value)!;
        } else if (resultType.typeKind.case === 'messageType') {
          typeName = resultType.typeKind.value;
        } else {
          this.#errors.reportNotAMessageType(
            expr.id,
            this.getLocationById(expr.id),
            typeName
          );
          resultType = ERROR_TYPE;
        }
      }
    }
    this.setType(expr.id, resultType);

    // Check the field initializers.
    for (const field of msgVal.entries) {
      if (field.keyKind.case !== 'fieldKey') {
        // This should never happen but acts as a type guard.
        throw new Error('field.keyKind.case is not fieldKey');
      }

      const checkedValue = this.checkExpr(field.value)!;

      let fieldType = ERROR_TYPE;
      const ft = this.env.lookupFieldType(typeName, field.keyKind.value);
      if (!isNil(ft)) {
        fieldType = ft;
      } else {
        const msg = this.env.lookupStructType(typeName);
        if (isNil(msg)) {
          this.#errors.reportUnexpectedFailedResolution(
            field.value!.id,
            this.getLocationById(field.id),
            typeName
          );
        } else {
          this.#errors.reportUndefinedField(
            field.value!.id,
            this.getLocationById(field.id),
            field.keyKind.value
          );
        }
      }

      let valType = this.getType(checkedValue.id);
      if (field.optionalEntry) {
        const vt = maybeUnwrapOptionalType(valType);
        if (!isNil(vt)) {
          valType = vt;
        } else {
          this.#errors.reportTypeMismatch(
            field.value!.id,
            this.getLocationById(field.value!.id),
            optionalType(fieldType),
            valType!
          );
        }
      }
      if (!this._isAssignable(fieldType, valType!)) {
        this.#errors.reportFieldTypeMismatch(
          field.value!.id,
          this.getLocationById(field.id),
          field.keyKind.value,
          fieldType,
          valType!
        );
      }
    }
    return expr;
  }

  checkComprehension(expr: Expr) {
    if (expr.exprKind.case !== 'comprehensionExpr') {
      // This should never happen
      throw new Error('expr.exprKind.case is not comprehensionExpr');
    }
    const comp = expr.exprKind.value;
    const checkedRange = this.checkExpr(comp.iterRange);
    const checkedInit = this.checkExpr(comp.accuInit);
    const accuType = this.getType(checkedInit!.id);
    const rangeType = substitute(
      this.#mapping,
      this.getType(checkedRange!.id)!,
      false
    );
    let varType: Type | undefined = undefined;
    switch (rangeType.typeKind.case) {
      case 'listType':
        varType = rangeType.typeKind.value.elemType;
        break;
      case 'mapType':
        // Ranges over the keys.
        varType = rangeType.typeKind.value.keyType;
        break;
      case 'dyn':
      case 'error':
        varType = DYN_TYPE;
        break;
      case 'typeParam':
        // Set the range type to DYN to prevent assignment to a potentially
        // incorrect type at a later point in type-checking. The isAssignable
        // call will update the type substitutions for the type param under the
        // covers.
        this._isAssignable(DYN_TYPE, rangeType);
        // Set the range iteration variable to type DYN as well.
        varType = DYN_TYPE;
        break;
      default:
        this.#errors.reportNotAComprehensionRange(
          comp.iterRange!.id,
          this.getLocationById(comp.iterRange!.id),
          rangeType
        );
        varType = ERROR_TYPE;
    }
    // Create a scope for the comprehension since it has a local accumulation
    // variable. This scope will contain the accumulation variable used to
    // compute the result.
    this.env.enterScope();
    this.env.addIdent(identDecl(comp.accuVar, { type: accuType }));
    // Create a block scope for the loop.
    this.env.enterScope();
    this.env.addIdent(identDecl(comp.iterVar, { type: varType }));
    // Check the variable references in the condition and step.
    const checkedCondition = this.checkExpr(comp.loopCondition);
    this._assertType(checkedCondition!, BOOL_TYPE);
    const checkedStep = this.checkExpr(comp.loopStep);
    this._assertType(checkedStep!, accuType!);
    // Exit the loop's block scope before checking the result.
    this.env.exitScope();
    const checkedResult = this.checkExpr(comp.result);
    // Exit the comprehension scope.
    this.env.exitScope();
    this.setType(
      expr.id,
      substitute(this.#mapping, this.getType(checkedResult!.id)!, false)
    );
    return expr;
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

  private _joinTypes(
    expr: Expr,
    previous: Type | null | undefined,
    current: Type
  ) {
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

  private _isAssignableList(l1: Type[], l2: Type[]) {
    const subs = isAssignableList(this.#mapping, l1, l2);
    if (!isNil(subs)) {
      this.#mapping = subs;
      return true;
    }
    return false;
  }

  private _assertType(e: Expr, t: Type) {
    if (!this._isAssignable(t, this.getType(e.id)!)) {
      this.#errors.reportTypeMismatch(
        e.id,
        this.getLocationById(e.id),
        t,
        this.getType(e.id)!
      );
    }
  }
}
