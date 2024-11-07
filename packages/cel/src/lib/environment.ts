import { isNil } from '@bearclaw/is';
import {
  Decl,
  Decl_IdentDecl,
  Type,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  DescEnum,
  DescExtension,
  DescMessage,
  DescService,
  MutableRegistry,
  createMutableRegistry,
} from '@bufbuild/protobuf';
import { CELContainer } from './common/container';
import { identDecl } from './common/decls/ident-decl';
import {
  STANDARD_DESCRIPTORS,
  STANDARD_FUNCTION_DECLARATIONS,
  STANDARD_IDENT_DECLARATIONS,
} from './common/standard';
import { DYN_TYPE } from './common/types/dyn';
import { INT_CEL_TYPE } from './common/types/int';
import { mapType } from './common/types/map';
import { messageType } from './common/types/message';
import { STRING_CEL_TYPE } from './common/types/string';
import { getFieldDescriptorType } from './common/types/utils';
import {
  getCheckedWellKnownType,
  isCheckedWellKnownType,
} from './common/types/wkt';
import { CELParser } from './parser/parser';

export interface CELEnvironmentOptions {
  container?: CELContainer;
  registry?: MutableRegistry;
  idents?: Decl[];
  functions?: Decl[];
  aggLitElemType?: Type;
}

export class CELEnvironment {
  public readonly container: CELContainer = new CELContainer();
  public readonly registry: MutableRegistry = createMutableRegistry();
  public readonly scopes: DeclGroup[] = [new DeclGroup(new Map(), new Map())];
  public readonly aggLitElemType = DYN_TYPE;

  constructor(options?: CELEnvironmentOptions) {
    if (options?.container) {
      this.container = options.container;
    }
    if (options?.registry) {
      this.registry = options.registry;
    }
    if (options?.idents) {
      for (const decl of options.idents) {
        this.addIdent(decl);
      }
    }
    if (options?.functions) {
      for (const decl of options.functions) {
        this.addFunction(decl);
      }
    }
  }

  compile(input: string): CELParser {
    return new CELParser(input);
  }

  extend(options?: CELEnvironmentOptions) {
    let container = new CELContainer(
      this.container.name,
      new Map(this.container.aliases)
    );
    if (options?.container) {
      container = container.extend(
        options.container.name,
        options.container.aliases
      );
    }
    const registry = createMutableRegistry(this.registry);
    if (options?.registry) {
      for (const descriptor of options.registry) {
        registry.add(descriptor);
      }
    }
    const env = new CELEnvironment({
      container,
      registry,
    });
    for (const scope of this.scopes) {
      env.scopes.push(new DeclGroup(scope.idents, scope.functions));
    }
    for (const ident of options?.idents || []) {
      env.addIdent(ident);
    }
    for (const func of options?.functions || []) {
      env.addFunction(func);
    }
    return env;
  }

  /**
   * Finds the descriptor by name in the environment's registry.
   *
   * @param name the name of the descriptor to look up.
   * @returns the descriptor, or undefined if not found.
   */
  findDescriptor(name: string) {
    return this.registry.get(name);
  }

  /**
   * Adds a descriptor to the environment's registry.
   *
   * @param descriptor the descriptor to add to the environment's registry.
   */
  addDescriptor(
    descriptor: DescMessage | DescEnum | DescExtension | DescService
  ) {
    const existing = this.findDescriptor(descriptor.name);
    if (!isNil(existing)) {
      throw new Error(`overlapping descriptor for name '${descriptor.name}'`);
    }
    this.registry.add(descriptor);
  }

  /**
   * Finds the message by name in the environment's registry.
   *
   * @param name the name of the message to look up.
   */
  findMessage(name: string) {
    return this.registry.getMessage(name);
  }

  /**
   * Adds a message descriptor to the environment's registry.
   *
   * @param descriptor the descriptor to add to the environment's registry.
   */
  addMessage(descriptor: DescMessage) {
    this.addDescriptor(descriptor);
  }

  /**
   * Finds the enum by name in the environment's registry.
   *
   * @param name the name of the enum to look up.
   * @returns the enum descriptor, or undefined if not found.
   */
  findEnum(name: string) {
    return this.registry.getEnum(name);
  }

  /**
   * Adds an enum descriptor to the environment's registry.
   *
   * @param descriptor the descriptor to add to the environment's registry.
   */
  addEnum(descriptor: DescEnum) {
    this.registry.add(descriptor);
  }

  /**
   * Finds the identifier declaration by name in the environment's registry.
   *
   * @param name the name of the identifier to look up.
   * @returns the identifier declaration, or null if not found.
   */
  findIdent(name: string) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const decl = this.scopes[i].findIdent(name);
      if (!isNil(decl)) {
        return decl;
      }
    }
    return null;
  }

  /**
   * Adds an identifier declaration to the environment.
   *
   * @param decl the identifier declaration to add to the environment.
   */
  addIdent(decl: Decl) {
    const scope = this._getScope();
    scope.addIdent(decl);
  }

  /**
   * Finds the Type for a message by name in the environment's registry.
   *
   * @param name the name of the message type to look up.
   * @returns the message type, or null if not found.
   */
  findMessageType(name: string) {
    const descriptor = this.registry.get(name);
    if (!isNil(descriptor)) {
      return messageType(name);
    }
    return null;
  }

  findMessageFieldType(message: string, fieldName: string) {
    const m = this.findMessage(message);
    if (isNil(m)) {
      return null;
    }
    const field = m.fields.find((field) => field.name === fieldName);
    if (isNil(field)) {
      return null;
    }
    return getFieldDescriptorType(field);
  }

  /**
   * Finds the function declaration by name in the environment's declarations.
   *
   * @param name the name of the function to look up.
   * @returns the function declaration, or null if not found.
   */
  findFunction(name: string) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const decl = this.scopes[i].findFunction(name);
      if (!isNil(decl)) {
        return decl;
      }
    }
    return null;
  }

  /**
   * Adds a function declaration to the environment's declarations.
   *
   * @param decl the function declaration to add to the environment.
   */
  addFunction(decl: Decl) {
    const scope = this._getScope();
    scope.addFunction(decl);
  }

  /**
   * Returns a Decl proto for typeName as an identifier in the Env. Returns null
   * if no such identifier is found in the Env.
   *
   * @param name the name of the identifier to look up.
   * @returns a Decl proto for the identifier, or null if not found.
   */
  lookupIdent(name: string): Decl | null {
    const candidateNames = this.container.resolveCandidateNames(name);
    for (const candidateName of candidateNames) {
      const ident = this.findIdent(candidateName);
      if (!isNil(ident)) {
        return ident;
      }

      // Next try to import the name as a reference to a message type. If found,
      // the declaration is added to the outest (global) scope of the
      // environment, so next time we can access it faster.
      const messageDesc = this.registry.getMessage(candidateName);
      if (!isNil(messageDesc)) {
        const decl = identDecl(candidateName, {
          type: messageType(candidateName),
        });
        this.addIdent(decl);
        return decl;
      }

      // Next try to import this as an enum value by splitting the name in a
      // type prefix and the enum inside.
      const enumDesc = this.registry.getEnum(candidateName);
      if (!isNil(enumDesc)) {
        const decl = identDecl(candidateName, {
          type: mapType({
            keyType: STRING_CEL_TYPE,
            valueType: INT_CEL_TYPE,
          }),
        });
        this.addIdent(decl);
        return decl;
      }
    }
    return null;
  }

  /**
   * Returns a Decl proto for typeName as a function in the Env. Returns null if
   * no such function is found in the Env.
   *
   * @param name the name of the function to look up.
   * @returns the function declaration, or null if not found.
   */
  lookupFunction(name: string): Decl | null {
    const candidateNames = this.container.resolveCandidateNames(name);
    for (const candidateName of candidateNames) {
      const func = this.findFunction(candidateName);
      if (!isNil(func)) {
        return func;
      }
    }
    return null;
  }

  /**
   * Look up a message descriptor by name.
   *
   * @param name the name of the message to look up.
   * @returns the message descriptor, or null if not found.
   */
  lookupStructType(name: string): DescMessage | null {
    const candidateNames = this.container.resolveCandidateNames(name);
    for (const candidateName of candidateNames) {
      const message = this.findMessage(candidateName);
      if (!isNil(message)) {
        return message;
      }
    }
    return null;
  }

  /**
   * Look up the type of a field in a message.
   *
   * @param message the message name
   * @param field the field name
   * @returns the field type, or null if not found.
   */
  lookupFieldType(message: string, field: string) {
    // Make sure the message exists
    const m = this.lookupStructType(message);
    if (isNil(m)) {
      return null;
    }
    const candidateNames = this.container.resolveCandidateNames(message);
    for (const candidateName of candidateNames) {
      const fieldType = this.findMessageFieldType(candidateName, field);
      if (!isNil(fieldType)) {
        return fieldType;
      }
    }
    return null;
  }

  enterScope() {
    const scope = this._getScope();
    this.scopes.push(new DeclGroup(scope.idents, scope.functions));
  }

  exitScope() {
    this.scopes.pop();
  }

  private _getScope() {
    return this.scopes[this.scopes.length - 1];
  }
}

export function STANDARD_ENV() {
  return new CELEnvironment({
    container: new CELContainer(),
    registry: createMutableRegistry(...STANDARD_DESCRIPTORS),
    functions: STANDARD_FUNCTION_DECLARATIONS,
    idents: STANDARD_IDENT_DECLARATIONS,
  });
}

export class DeclGroup {
  public readonly idents = new Map<string, Decl>();
  public readonly functions = new Map<string, Decl>();

  constructor(idents: Map<string, Decl>, functions: Map<string, Decl>) {
    for (const decl of idents.values()) {
      this.addIdent(decl);
    }
    for (const decl of functions.values()) {
      this.addFunction(decl);
    }
  }

  addIdent(decl: Decl): void {
    this.idents.set(decl.name, this.sanitizeIdent(decl));
  }

  findIdent(name: string): Decl | null {
    return this.idents.get(name) || null;
  }

  sanitizeIdent(decl: Decl) {
    const ident = decl.declKind.value as Decl_IdentDecl;
    if (!isNil(ident.type) && isCheckedWellKnownType(ident.type)) {
      return identDecl(decl.name, {
        type: getCheckedWellKnownType(
          ident.type.typeKind.value as string
        ) as Type,
      });
    }
    return decl;
  }

  addFunction(decl: Decl): void {
    this.functions.set(decl.name, decl);
  }

  findFunction(name: string): Decl | null {
    return this.functions.get(name) || null;
  }
}
