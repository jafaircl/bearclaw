import { isNil } from '@bearclaw/is';
import {
  Decl,
  Type,
} from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  DescEnum,
  DescExtension,
  DescMessage,
  DescService,
  MutableRegistry,
  Registry,
  createMutableRegistry,
} from '@bufbuild/protobuf';
import { CELContainer } from './container';
import { CELParser } from './parser';
import { DYN_TYPE, messageType } from './types';
import { getFieldDescriptorType, identDecl } from './utils';

export interface CELEnvironmentOptions {
  container?: CELContainer;
  registry?: MutableRegistry;
  declarations?: Decl[];
  aggLitElemType?: Type;
}

export class CELEnvironment {
  public readonly container: CELContainer = new CELContainer();
  public readonly registry: MutableRegistry = createMutableRegistry();
  public readonly declarations: Decl[] = [];
  public readonly aggLitElemType = DYN_TYPE;
  readonly #declMap = new Map<string, Decl>();

  constructor(options?: CELEnvironmentOptions) {
    if (options?.container) {
      this.container = options.container;
    }
    if (options?.registry) {
      this.registry = options.registry;
    }
    if (options?.declarations) {
      this.declarations = options.declarations;
      this._syncDecls();
    }
  }

  compile(input: string): CELParser {
    return new CELParser(input);
  }

  /**
   * Finds the declaration by name in the environment's declarations.
   *
   * @param name the name of the declaration to look up.
   * @returns the declaration, or undefined if not found.
   */
  findDeclaration(name: string) {
    return this.#declMap.get(name);
  }

  /**
   * Adds a declaration to the environment.
   *
   * @param decl the declaration to add to the environment.
   */
  addDeclaration(decl: Decl) {
    const existing = this.findIdent(decl.name);
    if (!isNil(existing)) {
      switch (decl.declKind.case) {
        case 'ident':
          throw new Error(`overlapping identifier for name '${decl.name}'`);
        case 'function':
          throw new Error(`overlapping function for name '${decl.name}'`);
        default:
          throw new Error(`overlapping declaration for name '${decl.name}'`);
      }
    }
    this.declarations.push(decl);
    this.#declMap.set(decl.name, decl);
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
   * Merge the declarations into the environment's declarations.
   *
   * @param decls the declarations to merge into the environment's declarations.
   */
  mergeDeclarations(decls: Decl[]) {
    for (const decl of decls) {
      this.addDeclaration(decl);
    }
  }

  /**
   * Merge the registry into the environment's registry.
   *
   * @param registry the registry to merge into the environment's registry.
   */
  mergeRegistry(registry: Registry) {
    for (const descriptor of registry) {
      this.addDescriptor(descriptor);
    }
  }

  /**
   * Finds the identifier declaration by name in the environment's registry.
   *
   * @param name the name of the identifier to look up.
   * @returns the identifier declaration, or null if not found.
   */
  findIdent(name: string) {
    const decl = this.findDeclaration(name);
    if (decl?.declKind.case === 'ident') {
      return decl;
    }
    return null;
  }

  /**
   * Adds an identifier declaration to the environment.
   *
   * @param decl the identifier declaration to add to the environment.
   */
  addIdent(decl: Decl) {
    if (decl.declKind.case !== 'ident') {
      throw new Error('Expected ident declaration');
    }
    this.addDeclaration(decl);
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
    const decl = this.findDeclaration(name);
    if (decl?.declKind.case === 'function') {
      return decl;
    }
    return null;
  }

  /**
   * Adds a function declaration to the environment's declarations.
   *
   * @param decl the function declaration to add to the environment.
   */
  addFunction(decl: Decl) {
    if (decl.declKind.case !== 'function') {
      throw new Error('Expected function declaration');
    }
    const existing = this.findFunction(decl.name);
    if (!isNil(existing)) {
      throw new Error(`overlapping function for name '${decl.name}'`);
    }
    this.addDeclaration(decl);
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
      const type = this.registry.get(candidateName);
      if (!isNil(type)) {
        const decl = identDecl(candidateName, {
          type: messageType(candidateName),
        });
        this.addIdent(decl);
        return decl;
      }
    }
    return null;
  }

  lookupFieldType(message: string, field: string) {
    const candidateNames = this.container.resolveCandidateNames(message);
    for (const candidateName of candidateNames) {
      const fieldType = this.findMessageFieldType(candidateName, field);
      if (!isNil(fieldType)) {
        return fieldType;
      }
    }
    return null;
  }

  /**
   * Syncs the declarations array with the declaration map.
   */
  private _syncDecls() {
    this.#declMap.clear();
    for (const decl of this.declarations) {
      this.#declMap.set(decl.name, decl);
    }
  }
}
