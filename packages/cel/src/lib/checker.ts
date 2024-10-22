/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isEmpty, isNil } from '@bearclaw/is';
import {
  CheckedExprSchema,
  Decl,
  Decl_FunctionDecl,
  Decl_IdentDecl,
  Reference,
  Type,
  Type_FunctionType,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
import {
  Expr,
  Expr_Call,
  Expr_Comprehension,
  Expr_CreateList,
  Expr_CreateStruct,
  Expr_Ident,
  Expr_Select,
  ParsedExpr,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { create } from '@bufbuild/protobuf';
import { CELEnvironment } from './environment';
import { Errors } from './errors';
import { OPT_SELECT_OPERATOR } from './operators';
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
  formatCELType,
  functionType,
  getCheckedWellKnownType,
  isAssignable,
  isAssignableList,
  isDyn,
  isDynOrError,
  isExactType,
  isOptionalType,
  listType,
  mapType,
  maybeUnwrapOptionalType,
  mostGeneral,
  optionalType,
  substitute,
  typeParamType,
  unwrapIdentDeclType,
  wellKnownType,
} from './types';
import {
  functionReference,
  getLocationByOffset,
  identDecl,
  identReference,
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
        return this.checkCreateList(expr);
      case 'selectExpr':
        return this.checkSelect(expr);
      case 'callExpr':
        return this.checkCall(expr);
      case 'structExpr':
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
    const identExpr = expr.exprKind.value as Expr_Ident;
    const ident = this.env.lookupIdent(identExpr.name);
    if (!isNil(ident)) {
      const unwrapped = unwrapIdentDeclType(ident)!;
      this.setType(expr.id, unwrapped.type!);
      this.setReference(expr.id, identReference(ident.name, unwrapped.value!));
      // Overwrite the identifier with its fully qualified name.
      identExpr.name = ident.name;
      return expr;
    }
    this.setType(expr.id, ERROR_TYPE);
    this.#errors.reportUndeclaredReference(
      expr.id,
      this.getLocationById(expr.id),
      this.env.container,
      identExpr.name
    );
    return expr;
  }

  checkSelect(expr: Expr) {
    const sel = expr.exprKind.value as Expr_Select;
    // Before traversing down the tree, try to interpret as qualified name.
    const qname = toQualifiedName(expr);
    if (!isNil(qname)) {
      const ident = this.env.lookupIdent(qname);
      if (!isNil(ident)) {
        const identDecl = ident.declKind.value as Decl_IdentDecl;
        // Rewrite the node to be a variable reference to the resolved
        // fully-qualified variable name.
        this.setType(expr.id, identDecl.type!);
        this.setReference(
          expr.id,
          identReference(ident.name, identDecl.value!)
        );
        return expr;
      }
    }

    let resultType = this.checkSelectField(
      expr,
      sel.operand!,
      sel.field,
      false
    );
    if (sel.testOnly) {
      resultType = BOOL_TYPE;
    }
    this.setType(expr.id, resultType);
    return expr;
  }

  checkCall(expr: Expr) {
    // Note: similar logic exists within the `interpreter/planner.go`. If
    // making changes here please consider the impact on planner.go and
    // consolidate implementations or mirror code as appropriate.
    const call = expr.exprKind.value as Expr_Call;
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
      call.function = fn.name;
      // Check to see whether the overload resolves.
      this.resolveOverloadOrError(expr, fn, null, args);
      return expr;
    }

    // If a receiver 'target' is present, it may either be a receiver function,
    // or a namespaced function, but not both. Given a.b.c() either a.b.c is a
    // function or c is a function with target a.b.
    //
    // Check whether the target is a namespaced function name.
    const target = call.target;
    const qualifiedPrefix = toQualifiedName(target);
    if (!isNil(qualifiedPrefix)) {
      const maybeQualifiedName = `${qualifiedPrefix}.${fnName}`;
      const fn = this.env.lookupFunction(maybeQualifiedName);
      if (!isNil(fn)) {
        // The function name is namespaced and so preserving the target operand
        // would be an inaccurate representation of the desired evaluation
        // behavior. Overwrite with fully-qualified resolved function name sans
        // receiver target.
        call.function = fn.name;
        this.resolveOverloadOrError(expr, fn, null, args);
        return expr;
      }
    }

    // Regular instance call.
    this.checkExpr(target);
    // Overwrite with fully-qualified resolved function name sans receiver
    // target.
    const fn = this.env.lookupFunction(fnName);
    // Function found, attempt overload resolution.
    if (!isNil(fn)) {
      this.resolveOverloadOrError(expr, fn, target, args);
      return expr;
    }
    // Function name not declared, record error.
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
    fnDecl: Decl,
    target: Expr | null,
    args: Expr[]
  ): OverloadResolution | null {
    const fn = fnDecl.declKind.value as Decl_FunctionDecl;
    const argTypes: Type[] = [];
    if (!isNil(target)) {
      const argType = this.getType(target.id);
      if (isNil(argType)) {
        throw new Error(`Could not resolve type for target '${target}'`);
      }
      argTypes.push(argType);
    }
    for (let i = 0; i < args.length; i++) {
      const argType = this.getType(args[i].id);
      if (isNil(argType)) {
        throw new Error(`Could not resolve type for argument '${target}'`);
      }
      argTypes.push(argType);
    }

    let resultType: Type | undefined = undefined;
    let checkedRef: Reference | undefined = undefined;
    for (const overload of fn.overloads) {
      if (
        (isNil(target) && overload.isInstanceFunction) ||
        (!isNil(target) && !overload.isInstanceFunction)
      ) {
        // not a compatible call style.
        continue;
      }

      let overloadType = functionType({
        resultType: overload.resultType,
        argTypes: overload.params,
      });
      if (overload.typeParams.length > 0) {
        // Instantiate overload's type with fresh type variables.
        const substitutions = new Map<string, Type>();
        for (const typeParam of overload.typeParams) {
          substitutions.set(
            formatCELType(typeParamType(typeParam)),
            this._newTypeVar()
          );
        }
        overloadType = substitute(substitutions, overloadType, false);
      }

      const overloadTypeFn = overloadType.typeKind.value as Type_FunctionType;
      const candidateArgTypes = overloadTypeFn.argTypes;
      if (this._isAssignableList(argTypes, candidateArgTypes)) {
        if (isNil(checkedRef)) {
          checkedRef = functionReference([overload.overloadId]);
        } else {
          checkedRef.overloadId.push(overload.overloadId);
        }

        // First matching overload, determines result type.
        const fnResultType = substitute(
          this.#mapping,
          overloadTypeFn.resultType!,
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
      this.#errors.reportNoMatchingOverload(
        expr.id,
        this.getLocationById(expr.id),
        fnDecl.name,
        argTypes,
        !isNil(target)
      );
      return null;
    }
    return { resultType, checkedRef };
  }

  checkCreateList(expr: Expr) {
    const create = expr.exprKind.value as Expr_CreateList;
    let elemType: Type | undefined = undefined;
    for (let i = 0; i < create.elements.length; i++) {
      const e = create.elements[i];
      this.checkExpr(e);
      elemType = this._joinTypes(e, elemType!, this.getType(e.id)!);
    }
    if (isNil(elemType)) {
      // If the list is empty, assign free type var to elem type.
      elemType = this._newTypeVar();
    }
    this.setType(expr.id, listType({ elemType }));
    return expr;
  }

  checkCreateStruct(expr: Expr) {
    const struct = expr.exprKind.value as Expr_CreateStruct;
    if (!isEmpty(struct.messageName)) {
      return this.checkCreateMessage(expr);
    }
    return this.checkCreateMap(expr);
  }

  checkCreateMap(expr: Expr) {
    const mapVal = expr.exprKind.value as Expr_CreateStruct;
    let keyType: Type | undefined = undefined;
    let valueType: Type | undefined = undefined;
    for (let i = 0; i < mapVal.entries.length; i++) {
      const key = mapVal.entries[i].keyKind.value as Expr;
      this.checkExpr(key);
      keyType = this._joinTypes(key, keyType, this.getType(key.id)!);

      const val = mapVal.entries[i].value as Expr;
      this.checkExpr(val);
      valueType = this._joinTypes(val, valueType, this.getType(val.id)!);
    }
    if (isNil(keyType)) {
      // If the map is empty, assign free type variables to typeKey and value
      // type.
      keyType = this._newTypeVar();
      valueType = this._newTypeVar();
    }
    this.setType(expr.id, mapType({ keyType, valueType }));
    return expr;
  }

  checkCreateMessage(expr: Expr) {
    const mapVal = expr.exprKind.value as Expr_CreateStruct;
    // Determine the type of the message.
    let messageType: Type = ERROR_TYPE;
    const decl = this.env.lookupIdent(mapVal.messageName);
    if (isNil(decl)) {
      this.#errors.reportUndeclaredReference(
        expr.id,
        this.getLocationById(expr.id),
        this.env.container,
        mapVal.messageName
      );
      return expr;
    }
    // Ensure the type name is fully qualified in the AST.
    mapVal.messageName = decl.name;
    const ident = decl.declKind.value as Decl_IdentDecl;
    this.setReference(expr.id, identReference(decl.name, ident.value!));
    const identKind = ident.type!.typeKind.case;
    if (identKind === 'type') {
      messageType = ident.type!;
      if (messageType.typeKind.case !== 'messageType') {
        this.#errors.reportNotAMessageType(
          expr.id,
          this.getLocationById(expr.id),
          decl.name
        );
        messageType = ERROR_TYPE;
      }
    }
    if (identKind === 'messageType') {
      messageType = ident.type!;
    }
    const checkedType = getCheckedWellKnownType(mapVal.messageName);
    if (!isNil(checkedType)) {
      messageType = checkedType;
    }
    this.setType(expr.id, messageType);

    // Check the field initializers.
    for (const entry of mapVal.entries) {
      const field = entry.keyKind.value as string;
      const value = entry.value;
      if (isNil(value)) {
        this.#errors.reportUndefinedField(
          entry.id,
          this.getLocationById(entry.id),
          field
        );
        continue;
      }
      this.checkExpr(value);

      let fieldType: Type = ERROR_TYPE;
      const t = this.env.lookupFieldType(mapVal.messageName, field);
      if (!isNil(t)) {
        fieldType = t;
      } else {
        const msg = this.env.lookupStructType(mapVal.messageName);
        if (isNil(msg)) {
          this.#errors.reportUnexpectedFailedResolution(
            expr.id,
            this.getLocationById(expr.id),
            mapVal.messageName
          );
        } else {
          this.#errors.reportUndefinedField(
            entry.id,
            this.getLocationById(entry.id),
            field
          );
        }
      }
      if (!this._isAssignable(fieldType, this.getType(value.id)!)) {
        this.#errors.reportFieldTypeMismatch(
          entry.id,
          this.getLocationById(entry.id),
          field,
          fieldType,
          this.getType(value.id)!
        );
      }
    }
    return expr;
  }

  checkComprehension(expr: Expr) {
    const comp = expr.exprKind.value as Expr_Comprehension;
    this.checkExpr(comp.iterRange);
    this.checkExpr(comp.accuInit);
    const accuType = this.getType(comp.accuInit!.id);
    const rangeType = substitute(
      this.#mapping,
      this.getType(comp.iterRange!.id)!,
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
    this.checkExpr(comp.loopCondition);
    this._assertType(comp.loopCondition!, BOOL_TYPE);
    this.checkExpr(comp.loopStep);
    this._assertType(comp.loopStep!, accuType!);
    // Exit the loop's block scope before checking the result.
    this.env.exitScope();
    this.checkExpr(comp.result);
    // Exit the comprehension scope.
    this.env.exitScope();
    this.setType(expr.id, this.getType(comp.result!.id)!);
    return expr;
  }

  checkOptSelect(expr: Expr) {
    // Collect metadata related to the opt select call packaged by the parser.
    const call = expr.exprKind.value as Expr_Call;
    const operand = call.args[0];
    const field = call.args[1];
    if (
      field.exprKind.case !== 'constExpr' ||
      (field.exprKind.case === 'constExpr' &&
        field.exprKind.value.constantKind.case !== 'stringValue')
    ) {
      this.#errors.reportNotAnOptionalFieldSelection(
        field.id,
        this.getLocationById(field.id),
        field.exprKind.case!
      );
      return expr;
    }

    const resultType = this.checkSelectField(
      expr,
      operand,
      field.exprKind.value.constantKind.value as string,
      true
    );
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
    const checkedOperand = this.checkExpr(operand)!;
    const operandType = substitute(
      this.#mapping,
      this.getType(checkedOperand.id)!,
      false
    );

    // If the target type is 'optional', unwrap it for the sake of this check.
    const targetType = maybeUnwrapOptionalType(operandType)!;

    // Assume error type by default as most types do not support field
    // selection.
    let resultType = ERROR_TYPE;
    switch (targetType.typeKind.case) {
      case 'mapType':
        // Maps yield their value type as the selection result type.
        resultType = targetType.typeKind.value.valueType!;
        break;
      case 'messageType':
        // Objects yield their field type declaration as the selection result type, but only if
        // the field is defined.
        const fieldType = this.env.lookupFieldType(
          targetType.typeKind.value,
          field
        );
        if (!isNil(fieldType)) {
          resultType = fieldType;
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
      case 'wellKnown':
        resultType = wellKnownType(targetType.typeKind.value);
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
        // Dynamic / error values are treated as DYN type. Errors are handled
        // this way as well in order to allow forward progress on the check.
        if (!isDynOrError(targetType)) {
          this.#errors.reportTypeDoesNotSupportFieldSelection(
            expr.id,
            this.getLocationById(expr.id),
            targetType
          );
        }
        resultType = DYN_TYPE;
        break;
    }
    // If the target type was optional coming in, then the result must be
    // optional going out.
    if (isOptionalType(operandType) || optional) {
      return optionalType(resultType);
    }
    return resultType;
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
