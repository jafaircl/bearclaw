/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import { dequal } from 'dequal';
import { Container } from '../common/container';
import {
  FunctionDecl,
  newConstantDecl,
  newVariableDecl,
  VariableDecl,
} from '../common/decls';
import {
  GREATER_DOUBLE_INT64_OVERLOAD,
  GREATER_DOUBLE_UINT64_OVERLOAD,
  GREATER_EQUALS_DOUBLE_INT64_OVERLOAD,
  GREATER_EQUALS_DOUBLE_UINT64_OVERLOAD,
  GREATER_EQUALS_INT64_DOUBLE_OVERLOAD,
  GREATER_EQUALS_INT64_UINT64_OVERLOAD,
  GREATER_EQUALS_UINT64_DOUBLE_OVERLOAD,
  GREATER_EQUALS_UINT64_INT64_OVERLOAD,
  GREATER_INT64_DOUBLE_OVERLOAD,
  GREATER_INT64_UINT64_OVERLOAD,
  GREATER_UINT64_DOUBLE_OVERLOAD,
  GREATER_UINT64_INT64_OVERLOAD,
  LESS_DOUBLE_INT64_OVERLOAD,
  LESS_DOUBLE_UINT64_OVERLOAD,
  LESS_EQUALS_DOUBLE_INT64_OVERLOAD,
  LESS_EQUALS_DOUBLE_UINT64_OVERLOAD,
  LESS_EQUALS_INT64_DOUBLE_OVERLOAD,
  LESS_EQUALS_INT64_UINT64_OVERLOAD,
  LESS_EQUALS_UINT64_DOUBLE_OVERLOAD,
  LESS_EQUALS_UINT64_INT64_OVERLOAD,
  LESS_INT64_DOUBLE_OVERLOAD,
  LESS_INT64_UINT64_OVERLOAD,
  LESS_UINT64_DOUBLE_OVERLOAD,
  LESS_UINT64_INT64_OVERLOAD,
} from '../common/overloads';
import { Provider } from '../common/ref/provider';
import {
  ErrorType,
  IntType,
  isType,
  newTypeTypeWithParam,
} from '../common/types/types';
import { AllMacros } from '../parser/macro';
import { Scopes } from './scopes';

export enum AggregateLiteralElementType {
  DYN_ELEMENT_TYPE,
  HOMOGENEOUS_ELEMENT_TYPE,
}

export interface CheckerEnvOptions {
  crossTypeNumericComparisons?: boolean;
  homogeneousAggregateLiterals?: boolean;
  validatedDeclarations?: Scopes;
}

export const CROSS_TYPE_NUMERIC_COMPARISON_OVERLOADS = new Set([
  // double <-> int | uint
  LESS_DOUBLE_INT64_OVERLOAD,
  LESS_DOUBLE_UINT64_OVERLOAD,
  LESS_EQUALS_DOUBLE_INT64_OVERLOAD,
  LESS_EQUALS_DOUBLE_UINT64_OVERLOAD,
  GREATER_DOUBLE_INT64_OVERLOAD,
  GREATER_DOUBLE_UINT64_OVERLOAD,
  GREATER_EQUALS_DOUBLE_INT64_OVERLOAD,
  GREATER_EQUALS_DOUBLE_UINT64_OVERLOAD,
  // int <-> double | uint
  LESS_INT64_DOUBLE_OVERLOAD,
  LESS_INT64_UINT64_OVERLOAD,
  LESS_EQUALS_INT64_DOUBLE_OVERLOAD,
  LESS_EQUALS_INT64_UINT64_OVERLOAD,
  GREATER_INT64_DOUBLE_OVERLOAD,
  GREATER_INT64_UINT64_OVERLOAD,
  GREATER_EQUALS_INT64_DOUBLE_OVERLOAD,
  GREATER_EQUALS_INT64_UINT64_OVERLOAD,
  // uint <-> double | int
  LESS_UINT64_DOUBLE_OVERLOAD,
  LESS_UINT64_INT64_OVERLOAD,
  LESS_EQUALS_UINT64_DOUBLE_OVERLOAD,
  LESS_EQUALS_UINT64_INT64_OVERLOAD,
  GREATER_UINT64_DOUBLE_OVERLOAD,
  GREATER_UINT64_INT64_OVERLOAD,
  GREATER_EQUALS_UINT64_DOUBLE_OVERLOAD,
  GREATER_EQUALS_UINT64_INT64_OVERLOAD,
]);

/**
 * Env is the environment for type checking.
 *
 * The Env is comprised of a container, type provider, declarations, and other
 * related objects which can be used to assist with type-checking.
 */
export class Env {
  readonly #container: Container;
  readonly #provider: Provider;
  readonly #declarations: Scopes;
  readonly #aggLitElemType: AggregateLiteralElementType;
  readonly #filteredOverloadIDs: Set<string>;

  constructor(
    container: Container,
    provider: Provider,
    private readonly options?: CheckerEnvOptions
  ) {
    this.#container = container;
    this.#provider = provider;

    this.#declarations = new Scopes();
    this.#declarations.push();

    this.#aggLitElemType = AggregateLiteralElementType.DYN_ELEMENT_TYPE;
    if (options?.homogeneousAggregateLiterals === true) {
      this.#aggLitElemType =
        AggregateLiteralElementType.HOMOGENEOUS_ELEMENT_TYPE;
    }
    this.#filteredOverloadIDs = CROSS_TYPE_NUMERIC_COMPARISON_OVERLOADS;
    if (options?.crossTypeNumericComparisons) {
      this.#filteredOverloadIDs = new Set();
    }
    if (options?.validatedDeclarations) {
      this.#declarations = options.validatedDeclarations;
    }
  }

  get aggLitElemType() {
    return this.#aggLitElemType;
  }

  get container() {
    return this.#container;
  }

  get provider() {
    return this.#provider;
  }

  get declarations() {
    return this.#declarations;
  }

  /**
   * AddIdents configures the checker with a list of variable declarations.
   */
  addIdents(...decls: VariableDecl[]) {
    const errs: Error[] = [];
    for (const decl of decls) {
      const err = this.addIdent(decl);
      if (!isNil(err)) {
        errs.push(err);
      }
    }
    if (errs.length > 0) {
      return new Error(errs.map((e) => e.message).join('\n'));
    }
    return null;
  }

  /**
   * AddFunctions configures the checker with a list of function declarations.
   */
  addFunctions(...decls: FunctionDecl[]) {
    const errs: Error[] = [];
    for (const decl of decls) {
      const err = this.setFunction(decl);
      if (err.length > 0) {
        errs.push(...err);
      }
    }
    if (errs.length > 0) {
      return new Error(errs.map((e) => e.message).join('\n'));
    }
    return null;
  }

  /**
   * LookupIdent returns a Decl proto for typeName as an identifier in the Env.
   * Returns nil if no such identifier is found in the Env.
   */
  lookupIdent(name: string): VariableDecl | null {
    for (const candidate of this.#container.resolveCandidateNames(name)) {
      const ident = this.#declarations.findIdent(candidate);
      if (!isNil(ident)) {
        return ident;
      }

      // Next try to import the name as a reference to a message type. If
      // found, the declaration is added to the outest (global) scope of the
      // environment, so next time we can access it faster.
      const t = this.#provider.findStructType(candidate);
      if (!isNil(t)) {
        const decl = newVariableDecl(candidate, t);
        this.#declarations.addIdent(decl);
        return decl;
      }

      const i = this.#provider.findIdent(candidate);
      if (!isNil(i) && isType(i)) {
        const decl = newVariableDecl(candidate, newTypeTypeWithParam(i));
        this.#declarations.addIdent(decl);
        return decl;
      }

      // Next try to import this as an enum value by splitting the name in a
      // type prefix and the enum inside.
      const enumValue = this.#provider.enumValue(candidate);
      if (enumValue.type() !== ErrorType) {
        const decl = newConstantDecl(candidate, IntType, enumValue);
        this.#declarations.addIdent(decl);
        return decl;
      }
    }
    return null;
  }

  /**
   * LookupFunction returns a Decl proto for typeName as a function in env.
   * Returns nil if no such function is found in env.
   */
  lookupFunction(name: string): FunctionDecl | null {
    for (const candidate of this.#container.resolveCandidateNames(name)) {
      const fn = this.#declarations.findFunction(candidate);
      if (!isNil(fn)) {
        return fn;
      }
    }
    return null;
  }

  /**
   * setFunction adds the function Decl to the Env.
   * Adds a function decl if one doesn't already exist, then adds all overloads
   * from the Decl. If overload overlaps with an existing overload, adds to the
   * errors in the Env instead.
   */
  setFunction(fn: FunctionDecl) {
    const errors: Error[] = [];
    let current = this.#declarations.findFunction(fn.name());
    if (!isNil(current)) {
      try {
        current = current.merge(fn);
      } catch (e) {
        errors.push(e as Error);
        return errors;
      }
    } else {
      current = fn;
    }
    for (const overload of current.overloadDecls()) {
      for (const macro of AllMacros) {
        if (
          macro.function() === current.name() &&
          macro.isReceiverStyle() === overload.isMemberFunction() &&
          macro.argCount() === overload.argTypes().length
        ) {
          errors.push(
            new Error(
              `overlapping macro for name '${current.name()}' with ${macro.argCount()} args`
            )
          );
        }
      }
      if (errors.length > 0) {
        return errors;
      }
    }
    this.#declarations.setFunction(current);
    return errors;
  }

  /**
   * addIdent adds the Decl to the declarations in the Env.
   *
   * Returns a non-empty errorMsg if the identifier is already declared in the
   * scope.
   */
  addIdent(decl: VariableDecl): Error | null {
    const current = this.#declarations.findIdentInScope(decl.name());
    if (!isNil(current)) {
      if (dequal(current, decl)) {
        return null;
      }
      return new Error(`overlapping identifier for name '${decl.name()}'`);
    }
    this.#declarations.addIdent(decl);
    return null;
  }

  /**
   * isOverloadDisabled returns whether the overloadID is disabled in the
   * current environment.
   */
  isOverloadDisabled(overloadID: string): boolean {
    return this.#filteredOverloadIDs.has(overloadID);
  }

  /**
   * validatedDeclarations returns a reference to the validated variable and
   * function declaration scope stack. must be copied before use.
   */
  validatedDeclarations(): Scopes {
    return this.#declarations;
  }

  /**
   * enterScope creates a new Env instance with a new innermost declaration
   * scope.
   */
  enterScope() {
    return new Env(this.#container, this.#provider, {
      ...this.options,
      validatedDeclarations: this.#declarations.push(),
    });
  }

  /**
   * exitScope creates a new Env instance with the nearest outer declaration
   * scope.
   */
  exitScope() {
    return new Env(this.#container, this.#provider, {
      ...this.options,
      validatedDeclarations: this.#declarations.pop(),
    });
  }
}
