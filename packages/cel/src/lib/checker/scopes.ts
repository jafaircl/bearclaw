/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import { FunctionDecl, VariableDecl } from '../common/decls';

/**
 * Scopes represents nested Decl sets where the Scopes value contains a Groups
 * containing all identifiers in scope and an optional parent representing
 * outer scopes.
 *
 * Each Groups value is a mapping of names to Decls in the ident and function
 * namespaces.
 *
 * Lookups are performed such that bindings in inner scopes shadow those in
 * outer scopes.
 */
export class Scopes {
  readonly #scopes: Group;
  readonly #parent: Scopes | null;

  constructor(scopes?: Group, parent?: Scopes) {
    this.#scopes = scopes ?? new Group();
    this.#parent = parent ?? null;
  }

  get scopes() {
    return this.#scopes;
  }

  get parent() {
    return this.#parent;
  }

  /**
   * Copy creates a copy of the current Scopes values, including a copy of its
   * parent if non-nil.
   */
  copy(): Scopes {
    return new Scopes(this.#scopes?.copy(), this.#parent?.copy());
  }

  /**
   * Push creates a new Scopes value which references the current Scope as its
   * parent.
   */
  push() {
    return new Scopes(new Group(), this);
  }

  /**
   * Pop returns the parent Scopes value for the current scope, or the current
   * scope if the parent is nil.
   */
  pop() {
    if (!isNil(this.#parent)) {
      return this.#parent;
    }
    return this;
  }

  /**
   * AddIdent adds the ident Decl in the current scope.
   *
   * Note: If the name collides with an existing identifier in the scope, the
   * Decl is overwritten.
   */
  addIdent(decl: VariableDecl) {
    this.#scopes.idents.set(decl.name(), decl);
  }

  /**
   * FindIdent finds the first ident Decl with a matching name in Scopes, or
   * nil if one cannot be found.
   *
   * Note: The search is performed from innermost to outermost.
   */
  findIdent(name: string): VariableDecl | null {
    if (this.#scopes.idents.has(name)) {
      return this.#scopes.idents.get(name)!;
    }
    if (!isNil(this.#parent)) {
      return this.#parent.findIdent(name);
    }
    return null;
  }

  /**
   * FindIdentInScope finds the first ident Decl with a matching name in the
   * current Scopes value, or nil if one does not exist.
   *
   * Note: The search is only performed on the current scope and does not
   * search outer scopes.
   */
  findIdentInScope(name: string): VariableDecl | null {
    if (this.#scopes.idents.has(name)) {
      return this.#scopes.idents.get(name)!;
    }
    return null;
  }

  /**
   * SetFunction adds the function Decl to the current scope.
   *
   * Note: Any previous entry for a function in the current scope with the same
   * name is overwritten.
   */
  setFunction(decl: FunctionDecl) {
    this.#scopes.functions.set(decl.name(), decl);
  }

  /**
   * FindFunction finds the first function Decl with a matching name in Scopes.
   * The search is performed from innermost to outermost. Returns nil if no
   * such function in Scopes.
   */
  findFunction(name: string): FunctionDecl | null {
    if (this.#scopes.functions.has(name)) {
      return this.#scopes.functions.get(name)!;
    }
    if (!isNil(this.#parent)) {
      return this.#parent.findFunction(name);
    }
    return null;
  }

  /**
   * FindFunctionInScope finds the first function Decl with a matching name in
   * the current Scopes value, or nil if one does not exist.
   *
   * Note: The search is only performed on the current scope and does not
   * search outer scopes.
   */
  findFunctionInScope(name: string): FunctionDecl | null {
    if (this.#scopes.functions.has(name)) {
      return this.#scopes.functions.get(name)!;
    }
    return null;
  }
}

/**
 * Group is a set of Decls that is pushed on or popped off a Scopes as a unit.
 * Contains separate namespaces for identifier and function Decls.
 */
export class Group {
  readonly #idents: Map<string, VariableDecl>;
  readonly #functions: Map<string, FunctionDecl>;

  constructor(
    idents?: Map<string, VariableDecl>,
    functions?: Map<string, FunctionDecl>
  ) {
    this.#idents = idents ?? new Map();
    this.#functions = functions ?? new Map();
  }

  get idents() {
    return this.#idents;
  }

  get functions() {
    return this.#functions;
  }

  copy() {
    return new Group(new Map(this.#idents), new Map(this.#functions));
  }
}
