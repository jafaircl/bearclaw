import { isNil } from '@bearclaw/is';
import { create } from '@bufbuild/protobuf';
import { dequal } from 'dequal';
import {
  Decl,
  Decl_FunctionDecl_Overload,
  Decl_FunctionDecl_OverloadSchema,
  Type as ProtoType,
} from '../protogen/cel/expr/checked_pb.js';
import { BinaryOp, FunctionOp, Overload, UnaryOp } from './functions';
import { newFunctionProto, newVarIdentDeclProto } from './pb/decls';
import { RefVal } from './ref/reference';
import { ErrorRefVal, isErrorRefVal } from './types/error';
import { Trait } from './types/traits/trait';
import {
  Kind,
  newTypeTypeWithParam,
  Type,
  typeToExprType,
} from './types/types';
import { isUnknownRefVal, mergeUnknowns, UnknownRefVal } from './types/unknown';
import { isUnknownOrError } from './types/utils';

/**
 * NewFunction creates a new function declaration with a set of function
 * options to configure overloads and function definitions (implementations).
 *
 * Functions are checked for name collisions and singleton redefinition.
 */
export function newFunction(
  name: string,
  ...opts: FunctionOpt[]
): FunctionDecl | Error {
  let fn = new FunctionDecl({
    name,
    overloads: [],
    overloadOrdinals: [],
  });
  for (const opt of opts) {
    fn = opt(fn);
  }
  if (fn.overloads.size === 0) {
    return new Error(`function ${name} must have at least one overload`);
  }
  return fn;
}

export enum DeclarationState {
  UNSPECIFIED,
  DISABLED,
  ENABLED,
}

interface FunctionDeclInput {
  name: string;

  /**
   * overloads associated with the function name.
   */
  overloads: OverloadDecl[];

  /**
   * singleton implementation of the function for all overloads.
   *
   * If this option is set, an error will occur if any overloads specify a
   * per-overload implementation or if another function with the same name
   * attempts to redefine the singleton.
   */
  singleton?: Overload;

  /**
   * disableTypeGuards is a performance optimization to disable detailed
   * runtime type checks which could add overhead on common operations.
   * Setting this option true leaves error checks and argument checks intact.
   */
  disableTypeGuards?: boolean;

  /**
   * state indicates that the binding should be provided as a declaration, as
   * a runtime binding, or both.
   */
  state?: DeclarationState;

  /**
   * overloadOrdinals indicates the order in which the overload was declared.
   */
  overloadOrdinals?: string[];
}

/**
 * FunctionDecl defines a function name, overload set, and optionally a
 * singleton definition for all overload instances.
 */
export class FunctionDecl {
  private readonly _name: string;
  overloads: Map<string, OverloadDecl> = new Map();
  singleton?: Overload;
  disableTypeGuards: boolean;
  state: DeclarationState;
  overloadOrdinals: string[];

  constructor(input: FunctionDeclInput) {
    this._name = input.name;
    this.overloadOrdinals = input.overloadOrdinals ?? [];
    for (const overload of input.overloads) {
      this.addOverload(overload);
    }
    for (const oID of this.overloads.keys()) {
      if (this.overloadOrdinals.indexOf(oID) === -1) {
        this.overloadOrdinals.push(oID);
      }
    }
    this.singleton = input.singleton;
    this.disableTypeGuards = input.disableTypeGuards ?? false;
    this.state = input.state ?? DeclarationState.UNSPECIFIED;
  }

  /**
   * Name returns the function name in human-readable terms, e.g. 'contains' or
   * 'math.least'
   */
  name() {
    return this._name;
  }

  /**
   * IsDeclarationDisabled indicates that the function implementation should be
   * added to the dispatcher, but the declaration should not be exposed for use
   * in expressions.
   */
  isDeclarationDisabled() {
    return this.state === DeclarationState.DISABLED;
  }

  /**
   * Merge combines an existing function declaration with another.
   *
   * If a function is extended, by say adding new overloads to an existing
   * function, then it is merged with the prior definition of the function at
   * which point its overloads must not collide with pre-existing overloads and
   * its bindings (singleton, or per-overload) must not conflict with previous
   * definitions either.
   */
  merge(other: FunctionDecl) {
    if (dequal(this, other)) {
      return this;
    }
    if (this.name() !== other.name()) {
      throw new Error(
        `cannot merge unrelated functions. ${this.name()} and ${other.name()}`
      );
    }
    const merged = new FunctionDecl({
      name: this.name(),
      overloads: [...this.overloads.values()],
      singleton: this.singleton,
      overloadOrdinals: this.overloadOrdinals,
      // if one function is expecting type-guards and the other is not, then
      //they must not be disabled.
      disableTypeGuards: this.disableTypeGuards && other.disableTypeGuards,
      // default to the current functions declaration state.
      state: this.state,
    });
    // If the other state indicates that the declaration should be explicitly
    // enabled or disabled, then update the merged state with the most recent
    // value.
    if (other.state !== DeclarationState.UNSPECIFIED) {
      merged.state = other.state;
    }
    // overloads and their ordinals are added from the left
    for (const oID of other.overloadOrdinals) {
      const o = other.overloads.get(oID);
      if (isNil(o)) {
        continue;
      }
      try {
        merged.addOverload(o);
      } catch (err) {
        throw new Error(
          `function declaration merge failed: ${(err as Error).message}`
        );
      }
    }
    if (!isNil(other.singleton)) {
      if (
        !isNil(merged.singleton) &&
        !dequal(merged.singleton, other.singleton)
      ) {
        throw new Error(
          `function already has a singleton binding: ${this.name()}`
        );
      }
      merged.singleton = other.singleton;
    }
    return merged;
  }

  /**
   * AddOverload ensures that the new overload does not collide with an
   * existing overload signature; however, if the function signatures are
   * identical, the implementation may be rewritten as its difficult to compare
   * functions by object identity.
   */
  addOverload(overload: OverloadDecl) {
    for (const [oID, o] of this.overloads) {
      if (oID !== overload.id() && o.signatureOverlaps(overload)) {
        throw new Error(
          `overload signature collision in function ${
            this.name
          }: ${oID} collides with ${overload.id()}`
        );
      }
      if (oID === overload.id()) {
        if (o.signatureEquals(overload) && o.nonStrict === overload.nonStrict) {
          // Allow redefinition of an overload implementation so long as the
          // signatures match.
          if (overload.hasBinding()) {
            this.overloads.set(oID, overload);
          }
          return;
        }
        throw new Error(
          `overload redefinition in function. ${this.name()}: ${oID} has multiple definitions`
        );
      }
    }
    this.overloadOrdinals.push(overload.id());
    this.overloads.set(overload.id(), overload);
  }

  /**
   * OverloadDecls returns the overload declarations in the order in which they
   * were declared.
   */
  overloadDecls() {
    const overloads: OverloadDecl[] = [];
    for (const id of this.overloadOrdinals) {
      const o = this.overloads.get(id);
      if (!isNil(o)) {
        overloads.push(o);
      }
    }
    return overloads;
  }

  /**
   * Bindings produces a set of function bindings, if any are defined.
   */
  bindings() {
    let overloads: Overload[] = [];
    let nonStrict = false;
    for (const id of this.overloadOrdinals) {
      const o = this.overloads.get(id);
      if (isNil(o)) {
        continue;
      }
      if (o.hasBinding()) {
        const overload = new Overload({
          operator: o.id(),
          operandTraits: o.operandTraits,
          unary: o.guardedUnaryOp(this.name(), this.disableTypeGuards),
          binary: o.guardedBinaryOp(this.name(), this.disableTypeGuards),
          function: o.guardedFunctionOp(this.name(), this.disableTypeGuards),
          nonStrict: o.nonStrict,
        });
        overloads.push(overload);
        nonStrict = nonStrict || o.nonStrict;
      }
    }
    if (!isNil(this.singleton)) {
      if (overloads.length !== 0) {
        throw new Error(
          `singleton function incompatible with specialized overloads: ${this.name()}`
        );
      }
      overloads = [
        new Overload({
          operator: this.name(),
          operandTraits: this.singleton.operandTraits,
          unary: this.singleton.unary,
          binary: this.singleton.binary,
          function: this.singleton.function,
          nonStrict: this.singleton.nonStrict,
        }),
      ];
      // fall-through to return single overload case.
    }
    if (overloads.length === 0) {
      return overloads;
    }
    // Single overload. Replicate an entry for it using the function name as
    // well.
    if (overloads.length === 1) {
      const overload = overloads[0];
      if (overload.operator === this.name()) {
        return overloads;
      }
      return [
        overload,
        new Overload({
          operator: this.name(),
          operandTraits: overload.operandTraits,
          unary: overload.unary,
          binary: overload.binary,
          function: overload.function,
          nonStrict: overload.nonStrict,
        }),
      ];
    }
    // All of the defined overloads are wrapped into a top-level function which
    // performs dynamic dispatch to the proper overload based on the argument
    // types.
    const bindings = [...overloads];
    const funcDispatch = (...args: RefVal[]) => {
      for (const id of this.overloadOrdinals) {
        const o = this.overloads.get(id);
        if (isNil(o)) {
          continue;
        }
        // During dynamic dispatch over multiple functions, signature agreement
        // checks are preserved in order to assist with the function resolution
        // step.
        switch (args.length) {
          case 1:
            if (
              !isNil(o.unaryOp) &&
              o.matchesRuntimeUnarySignature(this.disableTypeGuards, args[0])
            ) {
              return o.unaryOp(args[0]);
            }
            break;
          case 2:
            if (
              !isNil(o.binaryOp) &&
              o.matchesRuntimeBinarySignature(
                this.disableTypeGuards,
                args[0],
                args[1]
              )
            ) {
              return o.binaryOp(args[0], args[1]);
            }
            break;
          default:
            break;
        }
        // eventually this will fall through to the noSuchOverload below.
      }
      return maybeNoSuchOverload(this.name(), ...args);
    };
    const fn = new Overload({
      operator: this.name(),
      function: funcDispatch,
      nonStrict,
    });
    return [...bindings, fn];
  }
}

/**
 * FunctionOpt defines a functional option for mutating a function declaration.
 */
export type FunctionOpt = (f: FunctionDecl) => FunctionDecl;

/**
 * DisableTypeGuards disables automatically generated function invocation
 * guards on direct overload calls. Type guards remain on during dynamic
 * dispatch for parsed-only expressions.
 */
export function disableTypeGuards(val: boolean): FunctionOpt {
  return (f: FunctionDecl) => {
    f.disableTypeGuards = val;
    return f;
  };
}

/**
 * DisableDeclaration indicates that the function declaration should be
 * disabled, but the runtime function binding should be provided. Marking a
 * function as runtime-only is a safe way to manage deprecations of function
 * declarations while still preserving the runtime behavior for previously
 * compiled expressions.
 */
export function disableDeclaration(val: boolean): FunctionOpt {
  return (f: FunctionDecl) => {
    f.state = val ? DeclarationState.DISABLED : DeclarationState.ENABLED;
    return f;
  };
}

/**
 * SingletonUnaryBinding creates a singleton function definition to be used for
 * all function overloads.
 *
 * Note, this approach works well if operand is expected to have a specific
 * trait which it implements, e.g. traits.ContainerType. Otherwise, prefer
 * per-overload function bindings.
 */
export function singletonUnaryBinding(
  fn: UnaryOp,
  traits: Trait[] = []
): FunctionOpt {
  return (f: FunctionDecl) => {
    if (f.singleton) {
      throw new Error(`function already has a singleton binding: ${f.name()}`);
    }
    f.singleton = new Overload({
      operator: f.name(),
      unary: fn,
      operandTraits: traits,
    });
    return f;
  };
}

/**
 * SingletonBinaryBinding creates a singleton function definition to be used
 * with all function overloads.
 *
 * Note, this approach works well if operand is expected to have a specific
 * trait which it implements, e.g. traits.ContainerType. Otherwise, prefer
 * per-overload function bindings.
 */
export function singletonBinaryBinding(
  fn: BinaryOp,
  traits: Trait[] = []
): FunctionOpt {
  return (f: FunctionDecl) => {
    if (f.singleton) {
      throw new Error(`function already has a singleton binding: ${f.name()}`);
    }
    f.singleton = new Overload({
      operator: f.name(),
      binary: fn,
      operandTraits: traits,
    });
    return f;
  };
}

/**
 * SingletonFunctionBinding creates a singleton function definition to be used
 * with all function overloads.
 *
 * Note, this approach works well if operand is expected to have a specific
 * trait which it implements, e.g. traits.ContainerType. Otherwise, prefer
 * per-overload function bindings.
 */
export function singletonFunctionBinding(
  fn: FunctionOp,
  traits: Trait[] = []
): FunctionOpt {
  return (f: FunctionDecl) => {
    if (f.singleton) {
      throw new Error(`function already has a singleton binding: ${f.name()}`);
    }
    f.singleton = new Overload({
      operator: f.name(),
      function: fn,
      operandTraits: traits,
    });
    return f;
  };
}

/**
 * Overload defines a new global overload with an overload id, argument types,
 * and result type. Through the use of OverloadOpt options, the overload may
 * also be configured with a binding, an operand trait, and to be non-strict.
 *
 * Note: function bindings should be commonly configured with Overload
 * instances whereas operand traits and strict-ness should be rare occurrences.
 */
export function overload(
  overloadID: string,
  args: Type[],
  resultType: Type,
  ...opts: OverloadOpt[]
) {
  return newOverload(overloadID, false, args, resultType, ...opts);
}

/**
 * MemberOverload defines a new receiver-style overload (or member function)
 * with an overload id, argument types, and result type. Through the use of
 * OverloadOpt options, the overload may also be configured with a binding, an
 * operand trait, and to be non-strict.
 *
 * Note: function bindings should be commonly configured with Overload
 * instances whereas operand traits and strict-ness should be rare occurrences.
 */
export function memberOverload(
  overloadID: string,
  args: Type[],
  resultType: Type,
  ...opts: OverloadOpt[]
) {
  return newOverload(overloadID, true, args, resultType, ...opts);
}

function newOverload(
  overloadID: string,
  memberFunction: boolean,
  args: Type[],
  resultType: Type,
  ...opts: OverloadOpt[]
): FunctionOpt {
  return (f) => {
    const overload = newOverloadInternal(
      overloadID,
      memberFunction,
      args,
      resultType,
      ...opts
    );
    f.addOverload(overload);
    return f;
  };
}

function newOverloadInternal(
  overloadID: string,
  memberFunction: boolean,
  args: Type[],
  resultType: Type,
  ...opts: OverloadOpt[]
) {
  let overload = new OverloadDecl({
    id: overloadID,
    argTypes: args,
    resultType: resultType,
    isMemberFunction: memberFunction,
  });
  for (const opt of opts) {
    overload = opt(overload);
  }
  return overload;
}

interface OverloadDeclInput {
  id: string;
  argTypes: Type[];
  resultType: Type;
  isMemberFunction?: boolean;
  /**
   * nonStrict indicates that the function will accept error and unknown
   * arguments as inputs.
   */
  nonStrict?: boolean;
  /**
   * operandTrait indicates whether the member argument should have a
   * specific type-trait.
   *
   * This is useful for creating overloads which operate on a type-interface
   * rather than a concrete type.
   */
  operandTraits?: Trait[];

  // Function implementation options. Optional, but encouraged.

  /**
   * unaryOp is a function binding that takes a single argument.
   */
  unaryOp?: UnaryOp;
  /**
   * binaryOp is a function binding that takes two arguments.
   */
  binaryOp?: BinaryOp;
  /**
   * functionOp is a catch-all for zero-arity and three-plus arity functions.
   */
  functionOp?: FunctionOp;
}

/**
 * OverloadDecl contains the definition of a single overload id with a specific
 * signature, and an optional implementation.
 */
export class OverloadDecl {
  private readonly _id: string;
  private readonly _argTypes: Type[];
  private readonly _resultType: Type;
  private readonly _isMemberFunction: boolean;
  nonStrict: boolean;
  operandTraits: Trait[];
  unaryOp?: UnaryOp;
  binaryOp?: BinaryOp;
  functionOp?: FunctionOp;

  constructor(input: OverloadDeclInput) {
    this._id = input.id;
    this._argTypes = input.argTypes;
    this._resultType = input.resultType;
    this._isMemberFunction = input.isMemberFunction ?? false;
    this.nonStrict = input.nonStrict ?? true;
    this.operandTraits = input.operandTraits ?? [];
    this.unaryOp = input.unaryOp;
    this.binaryOp = input.binaryOp;
    this.functionOp = input.functionOp;
  }

  /**
   * ID mirrors the overload signature and provides a unique id which may be
   * referenced within the type-checker and interpreter to optimize performance.
   *
   * The ID format is usually one of two styles:
   * global: <functionName>_<argType>_<argTypeN>
   * member: <memberType>_<functionName>_<argType>_<argTypeN>
   */
  id() {
    return this._id;
  }

  /**
   * ArgTypes contains the set of argument types expected by the overload.
   *
   * For member functions ArgTypes[0] represents the member operand type.
   */
  argTypes() {
    return this._argTypes;
  }

  /**
   * IsMemberFunction indicates whether the overload is a member function
   */
  isMemberFunction() {
    return this._isMemberFunction;
  }

  /**
   * ResultType indicates the output type from calling the function.
   */
  resultType() {
    return this._resultType;
  }

  /**
   * TypeParams returns the type parameter names associated with the overload.
   */
  typeParams() {
    const typeParams: string[] = [];
    collectParamNames(typeParams, this.resultType());
    for (const arg of this.argTypes()) {
      collectParamNames(typeParams, arg);
    }
    return typeParams;
  }

  /**
   * SignatureEquals determines whether the incoming overload declaration
   * signature is equal to the current signature.
   *
   * Result type, operand trait, and strict-ness are not considered as part of
   * signature equality.
   */
  signatureEquals(other: OverloadDecl) {
    if (this === other) {
      return true;
    }
    if (
      this.id() !== other.id() ||
      this.isMemberFunction() !== other.isMemberFunction() ||
      this.argTypes().length !== other.argTypes().length
    ) {
      return false;
    }
    for (let i = 0; i < this.argTypes().length; i++) {
      if (!this.argTypes()[i].isEquivalentType(other.argTypes()[i])) {
        return false;
      }
    }
    return this.resultType().isEquivalentType(other.resultType());
  }

  /**
   * SignatureOverlaps indicates whether two functions have non-equal, but
   * overloapping function signatures.
   *
   * For example, list(dyn) collides with list(string) since the 'dyn' type can
   * contain a 'string' type.
   */
  signatureOverlaps(other: OverloadDecl) {
    if (
      this.isMemberFunction() !== other.isMemberFunction() ||
      this.argTypes().length !== other.argTypes().length
    ) {
      return false;
    }
    let argsOverlap = true;
    for (let i = 0; i < this.argTypes().length; i++) {
      const thisArgType = this.argTypes()[i];
      const otherArgType = other.argTypes()[i];
      argsOverlap =
        argsOverlap &&
        (thisArgType.isAssignableType(otherArgType) ||
          otherArgType.isAssignableType(thisArgType));
    }
    return argsOverlap;
  }

  /**
   * hasBinding indicates whether the overload already has a definition.
   */
  hasBinding() {
    return (
      !isNil(this.unaryOp) || !isNil(this.binaryOp) || !isNil(this.functionOp)
    );
  }

  /**
   * guardedUnaryOp creates an invocation guard around the provided unary
   * operator, if one is defined.
   */
  guardedUnaryOp(funcName: string, disableTypeGuards: boolean) {
    const op = this.unaryOp;
    if (isNil(op)) {
      return undefined;
    }
    return (arg: RefVal) => {
      if (!this.matchesRuntimeUnarySignature(disableTypeGuards, arg)) {
        return maybeNoSuchOverload(funcName, arg);
      }
      return op(arg);
    };
  }

  /**
   * guardedBinaryOp creates an invocation guard around the provided binary
   * operator, if one is defined.
   */
  guardedBinaryOp(funcName: string, disableTypeGuards: boolean) {
    const op = this.binaryOp;
    if (isNil(op)) {
      return undefined;
    }
    return (arg1: RefVal, arg2: RefVal) => {
      if (!this.matchesRuntimeBinarySignature(disableTypeGuards, arg1, arg2)) {
        return maybeNoSuchOverload(funcName, arg1, arg2);
      }
      return op(arg1, arg2);
    };
  }

  /**
   * guardedFunctionOp creates an invocation guard around the provided variadic
   * function binding, if one is provided.
   */
  guardedFunctionOp(funcName: string, disableTypeGuards: boolean) {
    const op = this.functionOp;
    if (isNil(op)) {
      return undefined;
    }
    return (...args: RefVal[]) => {
      if (!this.matchesRuntimeSignature(disableTypeGuards, ...args)) {
        return maybeNoSuchOverload(funcName, ...args);
      }
      return op(...args);
    };
  }

  /**
   * matchesRuntimeUnarySignature indicates whether the argument type is
   * runtime assiganble to the overload's expected argument.
   */
  matchesRuntimeUnarySignature(disableTypeGuards: boolean, arg: RefVal) {
    return (
      matchRuntimeArgType(
        this.nonStrict,
        disableTypeGuards,
        this.argTypes()[0],
        arg
      ) && matchOperandTraits(this.operandTraits, arg)
    );
  }

  /**
   * matchesRuntimeBinarySignature indicates whether the argument types are
   * runtime assiganble to the overload's expected arguments.
   */
  matchesRuntimeBinarySignature(
    disableTypeGuards: boolean,
    arg1: RefVal,
    arg2: RefVal
  ) {
    return (
      matchRuntimeArgType(
        this.nonStrict,
        disableTypeGuards,
        this.argTypes()[0],
        arg1
      ) &&
      matchRuntimeArgType(
        this.nonStrict,
        disableTypeGuards,
        this.argTypes()[1],
        arg2
      ) &&
      matchOperandTraits(this.operandTraits, arg1)
    );
  }

  /**
   * matchesRuntimeSignature indicates whether the argument types are runtime
   * assiganble to the overload's expected arguments.
   */
  matchesRuntimeSignature(disableTypeGuards: boolean, ...args: RefVal[]) {
    if (args.length !== this.argTypes().length) {
      return false;
    }
    if (args.length === 0) {
      return true;
    }
    for (let i = 0; i < args.length; i++) {
      if (
        !matchRuntimeArgType(
          this.nonStrict,
          disableTypeGuards,
          this.argTypes()[i],
          args[i]
        )
      ) {
        return false;
      }
    }
    return matchOperandTraits(this.operandTraits, args[0]);
  }
}

function matchRuntimeArgType(
  nonStrict: boolean,
  disableTypeGuards: boolean,
  argType: Type,
  arg: RefVal
): boolean {
  if (nonStrict && (disableTypeGuards || isUnknownOrError(arg))) {
    return true;
  }
  if (isUnknownOrError(arg)) {
    return false;
  }
  return disableTypeGuards || argType.isAssignableRuntimeType(arg);
}

function matchOperandTraits(traits: Trait[], arg: RefVal) {
  for (const trait of traits) {
    if (
      trait === Trait.UNSPECIFIED ||
      arg.type().hasTrait(trait) ||
      isUnknownOrError(arg)
    ) {
      continue;
    }
    return false;
  }
  return true;
}

/**
 * OverloadOpt is a functional option for configuring a function overload.
 */
export type OverloadOpt = (o: OverloadDecl) => OverloadDecl;

/**
 * UnaryBinding provides the implementation of a unary overload. The provided
 * function is protected by a runtime type-guard which ensures runtime type
 * agreement between the overload signature and runtime argument types.
 */
export function unaryBinding(op: UnaryOp): OverloadOpt {
  return (o: OverloadDecl) => {
    if (o.hasBinding()) {
      throw new Error(`overload already has a binding: ${o.id()}`);
    }
    if (o.argTypes().length !== 1) {
      throw new Error(`unary function bound to non-unary overload: ${o.id()}`);
    }
    o.unaryOp = op;
    return o;
  };
}

/**
 * BinaryBinding provides the implementation of a binary overload. The provided
 * function is protected by a runtime type-guard which ensures runtime type
 * agreement between the overload signature and runtime argument types.
 */
export function binaryBinding(op: BinaryOp): OverloadOpt {
  return (o: OverloadDecl) => {
    if (o.hasBinding()) {
      throw new Error(`overload already has a binding: ${o.id()}`);
    }
    if (o.argTypes().length !== 2) {
      throw new Error(
        `binary function bound to non-binary overload: ${o.id()}`
      );
    }
    o.binaryOp = op;
    return o;
  };
}

/**
 * FunctionBinding provides the implementation of a variadic overload. The
 * provided function is protected by a runtime type-guard which ensures runtime
 * type agreement between the overload signature and runtime argument types.
 */
export function functionBinding(op: FunctionOp): OverloadOpt {
  return (o: OverloadDecl) => {
    if (o.hasBinding()) {
      throw new Error(`overload already has a binding: ${o.id()}`);
    }
    o.functionOp = op;
    return o;
  };
}

/**
 * OverloadIsNonStrict enables the function to be called with error and unknown
 * argument values.
 *
 * Note: do not use this option unless absoluately necessary as it should be an
 * uncommon feature.
 */
export function overloadIsNonStrict(): OverloadOpt {
  return (o: OverloadDecl) => {
    o.nonStrict = true;
    return o;
  };
}

/**
 * OverloadOperandTrait configures a set of traits which the first argument to
 * the overload must implement in order to be successfully invoked.
 */
export function overloadOperandTrait(traits: Trait[]): OverloadOpt {
  return (o: OverloadDecl) => {
    o.operandTraits = traits;
    return o;
  };
}

/**
 * NewConstant creates a new constant declaration.
 */
export function newConstantDecl(name: string, type: Type, value: RefVal) {
  return new VariableDecl(name, type, value);
}

/**
 * NewVariable creates a new variable declaration.
 */
export function newVariableDecl(name: string, type: Type) {
  return new VariableDecl(name, type);
}

/**
 * VariableDecl defines a variable declaration which may optionally have a
 * constant value.
 */
export class VariableDecl {
  private readonly _name: string;
  private readonly _type: Type;
  private readonly _value?: RefVal;

  constructor(name: string, type: Type, value?: RefVal) {
    this._name = name;
    this._type = type;
    this._value = value;
  }

  /**
   * Name returns the fully-qualified variable name
   */
  name() {
    return this._name;
  }

  /**
   * Type returns the types.Type value associated with the variable.
   */
  type() {
    return this._type;
  }

  /**
   * Value returns the constant value associated with the declaration.
   */
  value() {
    return this._value;
  }

  /**
   * DeclarationIsEquivalent returns true if one variable declaration has the
   * same name and same type as the input.
   */
  declarationIsEquivalent(other: VariableDecl) {
    if (this === other) {
      return true;
    }
    return (
      this.name() === other.name() && this.type().isEquivalentType(other.type())
    );
  }
}

function collectParamNames(paramNames: string[], arg: Type) {
  if (arg.kind() == Kind.TYPEPARAM) {
    paramNames.push(arg.typeName());
  }
  for (const param of arg.parameters()) {
    collectParamNames(paramNames, param);
  }
}

/**
 * MaybeNoSuchOverload determines whether to propagate an error if one is
 * provided as an argument, or to return an unknown set, or to produce a new
 * error for a missing function signature.
 */
function maybeNoSuchOverload(funcName: string, ...args: RefVal[]) {
  const argTypes: string[] = [];
  let unk: UnknownRefVal | null = null;
  for (const arg of args) {
    if (isErrorRefVal(arg)) {
      return arg;
    }
    if (isUnknownRefVal(arg)) {
      if (isNil(unk)) {
        unk = arg;
      } else {
        unk = mergeUnknowns(arg, unk);
      }
    }
    argTypes.push(arg.type().typeName());
  }
  if (!isNil(unk)) {
    return unk;
  }
  const signature = argTypes.join(', ');
  throw new ErrorRefVal(`no such overload: ${funcName}(${signature})`);
}

/**
 * TypeVariable creates a new type identifier for use within a types.Provider
 */
export function newTypeVariable(type: Type) {
  return newVariableDecl(type.typeName(), newTypeTypeWithParam(type));
}

/**
 * VariableDeclToExprDecl converts a cel-native variable declaration into a
 * protobuf-type variable declaration.
 */
export function variableDeclToExprDecl(decl: VariableDecl): Decl | Error {
  const varType = typeToExprType(decl.type());
  if (varType instanceof Error) {
    return varType;
  }
  return newVarIdentDeclProto(decl.name(), varType);
}

/**
 * FunctionDeclToExprDecl converts a cel-native function declaration into a
 * protobuf-typed function declaration.
 */
export function functionDeclToExprDecl(decl: FunctionDecl) {
  const overloads: Decl_FunctionDecl_Overload[] = [];
  for (const overload of decl.overloadDecls()) {
    const argTypes = overload
      .argTypes()
      .map((t) => typeToExprType(t)) as ProtoType[];
    const resultType = typeToExprType(overload.resultType());
    if (argTypes.some((t) => t instanceof Error)) {
      return argTypes.find((t) => t instanceof Error);
    }
    if (resultType instanceof Error) {
      return resultType;
    }
    const overloadDecl = create(Decl_FunctionDecl_OverloadSchema, {
      isInstanceFunction: overload.isMemberFunction(),
      overloadId: overload.id(),
      resultType,
      params: argTypes,
    });
    overloads.push(overloadDecl);
  }
  return newFunctionProto(decl.name(), ...overloads);
}
