/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import { FunctionDecl, VariableDecl } from '../common/decls';
import { Errors } from '../common/errors';
import {
  LOGICAL_AND_OPERATOR,
  LOGICAL_OR_OPERATOR,
  OPT_SELECT_OPERATOR,
} from '../common/operators';
import { protoConstantToType } from '../common/pb/constants';
import {
  isMapProtoExpr,
  isStructProtoExpr,
  newGlobalCallProtoExpr,
  newIdentProtoExpr,
  newMessageProtoExpr,
  unwrapCallProtoExpr,
  unwrapComprehensionProtoExpr,
  unwrapConstantProtoExpr,
  unwrapIdentProtoExpr,
  unwrapListProtoExpr,
  unwrapMapProtoExpr,
  unwrapMessageProtoExpr,
  unwrapSelectProtoExpr,
  unwrapStringProtoExpr,
} from '../common/pb/expressions';
import { toQualifiedName } from '../common/utils';
import { Expr } from '../protogen/cel/expr/syntax_pb.js';
import {
  AST,
  CheckedAST,
  newFunctionReference,
  newIdentReference,
  ReferenceInfo,
  setExprKindCase,
} from './../common/ast';
import {
  BoolType,
  DynType,
  ErrorType,
  getWellKnownTypeName,
  IntType,
  isWellKnownType,
  Kind,
  newListType,
  newMapType,
  newOptionalType,
  newTypeParamType,
  Type,
} from './../common/types/types';
import { AggregateLiteralElementType, Env } from './env';
import { Mapping } from './mapping';
import {
  isAssignable,
  isAssignableList,
  isDyn,
  isDynOrError,
  isError,
  isOptional,
  maybeUnwrapOptional,
  mostGeneral,
  newFunctionType,
  substitute,
} from './types';

export class Checker {
  #ast!: AST;
  #env: Env;
  #errors!: Errors;
  #mapping: Mapping;
  #typeMap = new Map<bigint, Type>();
  #refMap = new Map<bigint, ReferenceInfo>();
  #freeTypeVarCounter = 0;

  constructor(env: Env) {
    this.#env = env;
    this.#mapping = new Mapping();
  }

  public get errors() {
    return this.#errors;
  }

  check(ast: AST): CheckedAST {
    this.#ast = ast;
    this.#errors = new Errors(ast.sourceInfo().source());
    this.checkExpr(this.#ast.expr());

    // Walk over the final type map substituting any type parameters either by
    // their bound value or by DYN.
    for (const [id, t] of this.#typeMap) {
      this.#typeMap.set(id, substitute(this.#mapping, t, true));
    }
    return new CheckedAST(this.#ast, this.#typeMap, this.#refMap);
  }

  checkExpr(expr?: Expr) {
    if (isNil(expr)) {
      return;
    }
    switch (expr.exprKind.case) {
      case 'constExpr':
        return this.checkConstExpr(expr);
      case 'identExpr':
        return this.checkIdentExpr(expr);
      case 'selectExpr':
        return this.checkSelectExpr(expr);
      case 'callExpr':
        return this.checkCall(expr);
      case 'listExpr':
        return this.checkCreateList(expr);
      case 'structExpr':
        if (isMapProtoExpr(expr)) {
          return this.checkCreateMap(expr);
        }
        if (isStructProtoExpr(expr)) {
          return this.checkCreateStruct(expr);
        }
        this.#errors.reportInternalError('unexpected struct expr kind');
        break;
      case 'comprehensionExpr':
        return this.checkComprehension(expr);
      default:
        this.#errors.reportInternalError('unexpected expr kind');
        break;
    }
  }

  checkConstExpr(e: Expr) {
    const constant = unwrapConstantProtoExpr(e);
    if (isNil(constant)) {
      this.#errors.reportInternalError(
        `expected constant expression, got ${e.exprKind.case}`
      );
      return;
    }
    const type = protoConstantToType(constant);
    this.setType(e, type);
  }

  checkIdentExpr(e: Expr) {
    const exprIdent = unwrapIdentProtoExpr(e);
    if (isNil(exprIdent)) {
      this.#errors.reportInternalError(
        `expected ident expression, got ${e.exprKind.case}`
      );
      return;
    }
    // Check to see if the identifier is declared.
    const ident = this.#env.lookupIdent(exprIdent.name);
    if (!isNil(ident)) {
      this.setType(e, ident.type());
      this.setReference(e, newIdentReference(ident.name(), ident.value()));
      // Overwrite the identifier with its fully qualified name.
      setExprKindCase(e, newIdentProtoExpr(e.id, ident.name()));
      return;
    }
    this.setType(e, ErrorType);
    this.#errors.reportUndeclaredReference(
      e.id,
      this.location(e),
      this.#env.container,
      exprIdent.name
    );
  }

  checkSelectExpr(e: Expr) {
    const sel = unwrapSelectProtoExpr(e);
    if (isNil(sel)) {
      this.#errors.reportInternalError(
        `expected select expression, got ${e.exprKind.case}`
      );
      return;
    }
    // Before traversing down the tree, try to interpret as qualified name.
    const qname = toQualifiedName(e);
    if (!isNil(qname) && qname !== '') {
      const ident = this.#env.lookupIdent(qname);
      if (!isNil(ident)) {
        // We don't check for a TestOnly expression here since the `found`
        // result is always going to be false for TestOnly expressions.

        // Rewrite the node to be a variable reference to the resolved
        // fully-qualified variable name.
        this.setType(e, ident.type());
        this.setReference(e, newIdentReference(ident.name(), ident.value()));
        setExprKindCase(e, newIdentProtoExpr(e.id, ident.name()));
        return;
      }
    }

    let resultType = this.checkSelectField(e, sel.operand!, sel.field, false);
    if (sel.testOnly) {
      resultType = BoolType;
    }
    this.setType(e, substitute(this.#mapping, resultType, false));
  }

  checkOptSelect(e: Expr) {
    // Collect metadata related to the opt select call packaged by the parser.
    const call = unwrapCallProtoExpr(e);
    if (isNil(call)) {
      this.#errors.reportInternalError(
        `expected call expression, got ${e.exprKind.case}`
      );
      return;
    }
    const operand = call.args[0];
    const field = call.args[1];
    const fieldName = unwrapStringProtoExpr(field);
    if (isNil(fieldName)) {
      this.#errors.reportNotAnOptionalFieldSelection(
        e.id,
        this.location(e),
        field
      );
      return;
    }

    // Perform type-checking using the field selection logic.
    const resultType = this.checkSelectField(e, operand, fieldName, true);
    this.setType(e, substitute(this.#mapping, resultType, false));
    this.setReference(e, newFunctionReference('select_optional_field'));
  }

  checkSelectField(e: Expr, operand: Expr, field: string, optional: boolean) {
    // Interpret as field selection, first traversing down the operand.
    this.checkExpr(operand);
    const operandType = substitute(
      this.#mapping,
      this.getType(operand)!,
      false
    );

    // If the target type is 'optional', unwrap it for the sake of this check.
    const isOpt = isOptional(operandType);
    const targetType = maybeUnwrapOptional(operandType);

    // Assume error type by default as most types do not support field
    // selection.
    let resultType = ErrorType;
    switch (targetType.kind()) {
      case Kind.MAP:
        // Maps yield their value type as the selection result type.
        resultType = targetType.parameters()[1];
        break;
      case Kind.STRUCT:
        // Objects yield their field type declaration as the selection result
        // type, but only if the field is defined.
        const messageType = targetType;
        const fieldType = this.lookupFieldType(
          e.id,
          messageType.typeName(),
          field
        );
        if (!isNil(fieldType)) {
          resultType = fieldType;
        }
        break;
      case Kind.TYPEPARAM:
        // Set the operand type to DYN to prevent assignment to a potentially
        // incorrect type at a later point in type-checking. The isAssignable
        // call will update the type substitutions for the type param under the
        // covers.
        this.isAssignable(DynType, targetType);
        // Also, set the result type to DYN.
        resultType = DynType;
        break;
      default:
        // Dynamic / error values are treated as DYN type. Errors are handled
        // this way as well in order to allow forward progress on the check.
        if (!isDynOrError(targetType)) {
          this.#errors.reportTypeDoesNotSupportFieldSelection(
            e.id,
            this.location(e),
            targetType
          );
        }
        resultType = DynType;
        break;
    }

    // If the target type was optional coming in, then the result must be
    // optional going out.
    if (isOpt === true || optional === true) {
      return newOptionalType(resultType);
    }
    return resultType;
  }

  checkCall(e: Expr) {
    // Note: similar logic exists within the `interpreter/planner.go`. If
    // making changes here please consider the impact on planner.go and
    // consolidate implementations or mirror code as appropriate.
    const call = unwrapCallProtoExpr(e);
    if (isNil(call)) {
      this.#errors.reportInternalError(
        `expected call expression, got ${e.exprKind.case}`
      );
      return;
    }
    const fnName = call.function;
    if (fnName === OPT_SELECT_OPERATOR) {
      this.checkOptSelect(e);
      return;
    }

    const args = call.args;
    // Traverse arguments.
    for (const arg of args) {
      this.checkExpr(arg);
    }

    // Regular static call with simple name.
    if (isNil(call.target)) {
      // Check for the existence of the function.
      const fn = this.#env.lookupFunction(fnName);
      if (isNil(fn)) {
        this.#errors.reportUndeclaredReference(
          e.id,
          this.location(e),
          this.#env.container,
          fnName
        );
        this.setType(e, ErrorType);
        return;
      }
      // Overwrite the function name with its fully qualified resolved name.
      setExprKindCase(e, newGlobalCallProtoExpr(e.id, fn.name(), args));
      // Check to see whether the overload resolves.
      this.resolveOverloadOrError(e, fn, null, args);
      return;
    }

    // If a receiver 'target' is present, it may either be a receiver function,
    // or a namespaced function, but not both. Given a.b.c() either a.b.c is a
    // function or c is a function with target a.b.
    //
    // Check whether the target is a namespaced function name.
    const target = call.target;
    const qualifiedPrefix = toQualifiedName(target);
    if (!isNil(qualifiedPrefix)) {
      const maybeQualifiedName = qualifiedPrefix + '.' + fnName;
      const fn = this.#env.lookupFunction(maybeQualifiedName);
      if (!isNil(fn)) {
        // The function name is namespaced and so preserving the target operand
        // would be an inaccurate representation of the desired evaluation
        // behavior. Overwrite with fully-qualified resolved function name sans
        // receiver target.
        setExprKindCase(e, newGlobalCallProtoExpr(e.id, fn.name(), args));
        this.resolveOverloadOrError(e, fn, null, args);
        return;
      }
    }

    // Regular instance call.
    this.checkExpr(target);
    const fn = this.#env.lookupFunction(fnName);
    // Function found, attempt overload resolution.
    if (!isNil(fn)) {
      this.resolveOverloadOrError(e, fn, target, args);
      return;
    }
    // Function name not declared, record error.
    this.setType(e, ErrorType);
    this.#errors.reportUndeclaredReference(
      e.id,
      this.location(e),
      this.#env.container,
      fnName
    );
  }

  resolveOverloadOrError(
    e: Expr,
    fn: FunctionDecl,
    target: Expr | null,
    args: Expr[]
  ) {
    // Attempt to resolve the overload.
    const resolution = this.resolveOverload(e, fn, target, args);
    // No such overload, error noted in the resolveOverload call, type recorded
    // here.
    if (isNil(resolution)) {
      this.setType(e, ErrorType);
      return;
    }
    // Overload found.
    this.setType(e, resolution.type);
    this.setReference(e, resolution.reference);
  }

  resolveOverload(
    call: Expr,
    fn: FunctionDecl,
    target: Expr | null,
    args: Expr[]
  ): OverloadResolution | null {
    const argTypes: Type[] = [];
    if (!isNil(target)) {
      const targetType = this.getType(target);
      if (isNil(targetType)) {
        this.#errors.reportInternalError(
          `expected type for target expression, got ${target}`
        );
        return null;
      }
      argTypes.push(targetType);
    }
    for (const arg of args) {
      const argType = this.getType(arg);
      if (isNil(argType)) {
        this.#errors.reportInternalError(
          `expected type for argument expression, got ${arg}`
        );
        return null;
      }
      argTypes.push(argType);
    }

    let resultType: Type | null = null;
    let checkedRef: ReferenceInfo | null = null;
    for (const overload of fn.overloadDecls()) {
      // Determine whether the overload is currently considered.
      if (this.#env.isOverloadDisabled(overload.id())) {
        continue;
      }

      // Ensure the call style for the overload matches.
      if (
        (isNil(target) && overload.isMemberFunction()) ||
        (!isNil(target) && !overload.isMemberFunction())
      ) {
        // not a compatible call style.
        continue;
      }

      // Alternative type-checking behavior when the logical operators are
      // compacted into variadic AST representations.
      if (
        fn.name() === LOGICAL_AND_OPERATOR ||
        fn.name() === LOGICAL_OR_OPERATOR
      ) {
        checkedRef = newFunctionReference(overload.id());
        for (let i = 0; i < argTypes.length; i++) {
          if (!this.isAssignable(argTypes[i], BoolType)) {
            this.#errors.reportTypeMismatch(
              args[i].id,
              this.locationByID(args[i].id),
              BoolType,
              argTypes[i]
            );
            resultType = ErrorType;
          }
        }
        if (!isNil(resultType) && isError(resultType)) {
          return null;
        }
        return new OverloadResolution(BoolType, checkedRef);
      }

      let overloadType = newFunctionType(
        overload.resultType(),
        ...overload.argTypes()
      );
      const typeParams = overload.typeParams();
      if (typeParams.length !== 0) {
        // Instantiate overload's type with fresh type variables.
        const substitutions = new Mapping();
        for (const typePar of typeParams) {
          substitutions.add(newTypeParamType(typePar), this.newTypeVar());
        }
        overloadType = substitute(substitutions, overloadType, false);
      }

      const candidateArgTypes = overloadType.parameters().slice(1);
      if (this.isAssignableList(argTypes, candidateArgTypes)) {
        if (isNil(checkedRef)) {
          checkedRef = newFunctionReference(overload.id());
        } else {
          checkedRef.addOverload(overload.id());
        }

        // First matching overload, determines result type.
        const fnResultType = substitute(
          this.#mapping,
          overloadType.parameters()[0],
          false
        );
        if (isNil(resultType)) {
          resultType = fnResultType;
        } else if (
          !isDyn(resultType) &&
          !fnResultType.isExactType(resultType)
        ) {
          resultType = DynType;
        }
      }
    }

    if (isNil(resultType)) {
      for (let i = 0; i < argTypes.length; i++) {
        const argType = argTypes[i];
        argTypes[i] = substitute(this.#mapping, argType, true);
      }
      this.#errors.reportNoMatchingOverload(
        call.id,
        this.location(call),
        fn.name(),
        argTypes,
        !isNil(target)
      );
      return null;
    }
    return new OverloadResolution(resultType!, checkedRef!);
  }

  checkCreateList(e: Expr) {
    const create = unwrapListProtoExpr(e);
    if (isNil(create)) {
      this.#errors.reportInternalError(
        `expected list expression, got ${e.exprKind.case}`
      );
      return;
    }
    let elemsType: Type | null = null;
    const optionals = new Set(create.optionalIndices);
    for (let i = 0; i < create.elements.length; i++) {
      const elem = create.elements[i];
      this.checkExpr(elem);
      let elemType = this.getType(elem)!;
      if (optionals.has(i)) {
        const isOpt = isOptional(elemType);
        elemType = maybeUnwrapOptional(elemType);
        if (!isOpt && !isDyn(elemType)) {
          this.#errors.reportTypeMismatch(
            elem.id,
            this.location(elem),
            newOptionalType(elemType),
            elemType
          );
        }
      }
      elemsType = this.joinTypes(e, elemsType!, elemType);
    }
    if (isNil(elemsType)) {
      // If the list is empty, assign free type var to elem type.
      elemsType = this.newTypeVar();
    }
    this.setType(e, newListType(elemsType));
  }

  checkCreateMap(e: Expr) {
    const mapVal = unwrapMapProtoExpr(e);
    if (isNil(mapVal)) {
      this.#errors.reportInternalError(
        `expected map expression, got ${e.exprKind.case}`
      );
      return;
    }
    let mapKeyType: Type | null = null;
    let mapValueType: Type | null = null;
    for (const entry of mapVal.entries) {
      const key = entry.keyKind.value;
      this.checkExpr(key);
      mapKeyType = this.joinTypes(key, mapKeyType!, this.getType(key)!);

      const val = entry.value!;
      this.checkExpr(val);
      let valType = this.getType(val)!;
      if (entry.optionalEntry) {
        const isOpt = isOptional(valType);
        valType = maybeUnwrapOptional(valType);
        if (!isOpt && !isDyn(valType)) {
          this.#errors.reportTypeMismatch(
            val.id,
            this.location(val),
            newOptionalType(valType),
            valType
          );
        }
      }
      mapValueType = this.joinTypes(val, mapValueType!, valType);
    }
    if (isNil(mapKeyType)) {
      // If the map is empty, assign free type variables to typeKey and value
      // type.
      mapKeyType = this.newTypeVar();
      mapValueType = this.newTypeVar();
    }
    this.setType(e, newMapType(mapKeyType, mapValueType!));
  }

  checkCreateStruct(e: Expr) {
    let msgVal = unwrapMessageProtoExpr(e);
    if (isNil(msgVal)) {
      this.#errors.reportInternalError(
        `expected proto message expression, got ${e.exprKind.case}`
      );
      return;
    }
    // Determine the type of the message.
    let resultType = ErrorType;
    const ident = this.#env.lookupIdent(msgVal.messageName);
    if (isNil(ident)) {
      this.#errors.reportUndeclaredReference(
        e.id,
        this.location(e),
        this.#env.container,
        msgVal.messageName
      );
      this.setType(e, ErrorType);
      return;
    }
    // Ensure the type name is fully qualified in the AST.
    let typeName = ident.name();
    if (msgVal.messageName !== typeName) {
      setExprKindCase(e, newMessageProtoExpr(e.id, typeName, msgVal.entries));
      msgVal = unwrapMessageProtoExpr(e)!;
    }
    this.setReference(e, newIdentReference(ident.name()));
    const identKind = ident.type().kind();
    if (identKind !== Kind.ERROR) {
      if (identKind !== Kind.TYPE) {
        this.#errors.reportNotAType(
          e.id,
          this.location(e),
          ident.type().declaredTypeName()
        );
      } else {
        resultType = ident.type().parameters()[0];
        // Backwards compatibility test between well-known types and message
        // types. In this context, the type is being instantiated by its
        // protobuf name which is not ideal or recommended, but some users
        // expect this to work.
        if (isWellKnownType(resultType)) {
          typeName = getWellKnownTypeName(resultType)!;
        } else if (resultType.kind() === Kind.STRUCT) {
          typeName = resultType.declaredTypeName();
        } else {
          this.#errors.reportNotAMessageType(
            e.id,
            this.location(e),
            resultType.declaredTypeName()
          );
          resultType = ErrorType;
        }
      }
    }
    this.setType(e, resultType);

    // Check the field initializers.
    for (const field of msgVal.entries) {
      const fieldName = field.keyKind.value;
      const value = field.value!;
      this.checkExpr(value);

      let fieldType = ErrorType;
      const ft = this.lookupFieldType(field.id, typeName, fieldName);
      if (!isNil(ft)) {
        fieldType = ft;
      }

      let valType = this.getType(value)!;
      if (field.optionalEntry) {
        const isOpt = isOptional(valType);
        valType = maybeUnwrapOptional(valType);
        if (!isOpt && !isDyn(valType)) {
          this.#errors.reportTypeMismatch(
            value.id,
            this.location(value),
            newOptionalType(valType),
            valType
          );
        }
      }
      if (!this.isAssignable(fieldType, valType)) {
        this.#errors.reportFieldTypeMismatch(
          field.id,
          this.locationByID(field.id),
          fieldName,
          fieldType,
          valType
        );
      }
    }
  }

  checkComprehension(e: Expr) {
    const comp = unwrapComprehensionProtoExpr(e);
    if (isNil(comp)) {
      this.#errors.reportInternalError(
        `expected comprehension expression, got ${e.exprKind.case}`
      );
      return;
    }
    this.checkExpr(comp.iterRange);
    this.checkExpr(comp.accuInit);
    const rangeType = substitute(
      this.#mapping,
      this.getType(comp.iterRange!)!,
      false
    );

    // Create a scope for the comprehension since it has a local accumulation
    // variable. This scope will contain the accumulation variable used to
    // compute the result.
    const accuType = this.getType(comp.accuInit!)!;
    this.#env = this.#env.enterScope();
    this.#env.addIdent(new VariableDecl(comp.accuVar, accuType));

    let varType: Type | null = null;
    let var2Type: Type | null = null;
    switch (rangeType.kind()) {
      case Kind.LIST:
        // varType represents the list element type for one-variable
        // comprehensions.
        varType = rangeType.parameters()[0];
        if (comp.iterVar2 !== '') {
          // varType represents the list index (int) for two-variable
          // comprehensions, and var2Type represents the list element type.
          var2Type = varType;
          varType = IntType;
        }
        break;
      case Kind.MAP:
        // varType represents the map entry key for all comprehension types.
        varType = rangeType.parameters()[0];
        if (comp.iterVar2 !== '') {
          // var2Type represents the map entry value for two-variable
          // comprehensions.
          var2Type = rangeType.parameters()[1];
        }
        break;
      case Kind.DYN:
      case Kind.ERROR:
      case Kind.TYPEPARAM:
        // Set the range type to DYN to prevent assignment to a potentially
        // incorrect type at a later point in type-checking. The isAssignable
        // call will update the type substitutions for the type param under the
        // covers.
        this.isAssignable(DynType, rangeType);
        // Set the range iteration variable to type DYN as well.
        varType = DynType;
        if (comp.iterVar2 !== '') {
          var2Type = DynType;
        }
        break;
      default:
        this.#errors.reportNotAComprehensionRange(
          comp.iterRange!.id,
          this.location(comp.iterRange!),
          rangeType
        );
        varType = ErrorType;
        if (comp.iterVar2 !== '') {
          var2Type = ErrorType;
        }
        break;
    }

    // Create a block scope for the loop.
    this.#env = this.#env.enterScope();
    this.#env.addIdents(new VariableDecl(comp.iterVar, varType));
    if (comp.iterVar2 !== '') {
      this.#env.addIdents(new VariableDecl(comp.iterVar2, var2Type!));
    }
    // Check the variable references in the condition and step.
    this.checkExpr(comp.loopCondition);
    this.assertType(comp.loopCondition!, BoolType);
    this.checkExpr(comp.loopStep);
    this.assertType(comp.loopStep!, accuType);
    // Exit the loop's block scope before checking the result.
    this.#env = this.#env.exitScope();
    this.checkExpr(comp.result);
    // Exit the comprehension scope.
    this.#env = this.#env.exitScope();
    this.setType(
      e,
      substitute(this.#mapping, this.getType(comp.result!)!, false)
    );
  }

  /**
   * Checks compatibility of joined types, and returns the most general common
   * type.
   */
  joinTypes(expr: Expr, previous: Type, current: Type) {
    if (isNil(previous)) {
      return current;
    }
    if (this.isAssignable(previous, current)) {
      return mostGeneral(previous, current);
    }
    if (this.dynAggregateLiteralElementTypesEnabled()) {
      return DynType;
    }
    this.#errors.reportTypeMismatch(
      expr.id,
      this.location(expr),
      previous,
      current
    );
    return ErrorType;
  }

  dynAggregateLiteralElementTypesEnabled() {
    return (
      this.#env.aggLitElemType === AggregateLiteralElementType.DYN_ELEMENT_TYPE
    );
  }

  newTypeVar() {
    const id = this.#freeTypeVarCounter;
    this.#freeTypeVarCounter++;
    return newTypeParamType(`_var${id}`);
  }

  isAssignable(t1: Type, t2: Type) {
    const subs = isAssignable(this.#mapping, t1, t2);
    if (!isNil(subs)) {
      this.#mapping = subs;
      return true;
    }
    return false;
  }

  isAssignableList(l1: Type[], l2: Type[]) {
    const subs = isAssignableList(this.#mapping, l1, l2);
    if (!isNil(subs)) {
      this.#mapping = subs;
      return true;
    }
    return false;
  }

  location(expr: Expr) {
    return this.locationByID(expr.id);
  }

  locationByID(id: bigint) {
    return this.#ast.sourceInfo().getStartLocation(id);
  }

  setType(expr: Expr, t: Type) {
    const found = this.getType(expr);
    if (!isNil(found) && !t.isExactType(found)) {
      this.#errors.reportIncompatibleTypes(
        expr.id,
        this.location(expr),
        expr,
        found,
        t
      );
    }
    this.#typeMap.set(expr.id, t);
  }

  getType(expr: Expr): Type | null {
    return this.#typeMap.get(expr.id) ?? null;
  }

  /**
   * GetResultType returns the type of the result of the expression.
   */
  getResultType(): Type | null {
    return this.getType(this.#ast.expr());
  }

  assertType(e: Expr, t: Type) {
    const et = this.getType(e);
    if (isNil(et)) {
      this.#errors.reportInternalError(
        `expression type not set: ${e}(${e.id})`
      );
      return;
    }
    if (!this.isAssignable(t, et)) {
      this.#errors.reportIncompatibleTypes(e.id, this.location(e), e, t, t);
    }
  }

  setReference(expr: Expr, ref: ReferenceInfo) {
    const found = this.getReference(expr);
    if (!isNil(found) && !found.equals(ref)) {
      this.#errors.reportReferenceRedefinition(
        expr.id,
        this.location(expr),
        expr,
        found,
        ref
      );
    }
    this.#refMap.set(expr.id, ref);
  }

  getReference(expr: Expr): ReferenceInfo | null {
    return this.#refMap.get(expr.id) ?? null;
  }

  lookupFieldType(
    exprID: bigint,
    structType: string,
    fieldName: string
  ): Type | null {
    const found = this.#env.provider.findStructType(structType);
    if (isNil(found)) {
      // This should not happen, anyway, report an error.
      this.#errors.reportUnexpectedFailedResolution(
        exprID,
        this.locationByID(exprID),
        structType
      );
      return null;
    }

    const ft = this.#env.provider.findStructFieldType(structType, fieldName);
    if (!isNil(ft)) {
      return ft.type;
    }

    this.#errors.reportUndefinedField(
      exprID,
      this.locationByID(exprID),
      fieldName
    );
    return null;
  }
}

export class OverloadResolution {
  constructor(public type: Type, public reference: ReferenceInfo) {}
}
