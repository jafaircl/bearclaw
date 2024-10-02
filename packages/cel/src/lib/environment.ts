import { Decl } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb.js';
import {
  DescEnum,
  DescExtension,
  DescMessage,
  DescService,
  MutableRegistry,
  Registry,
  createMutableRegistry,
} from '@bufbuild/protobuf';
import { CELParser } from './parser';

export interface CELEnvironmentOptions {
  container?: string;
  registry?: MutableRegistry;
  declarations?: Decl[];
}

export class CELEnvironment {
  public readonly container?: string;
  public readonly registry: MutableRegistry;
  public readonly declarations: Decl[];

  constructor(options?: CELEnvironmentOptions) {
    this.container = options?.container;
    this.registry = options?.registry ?? createMutableRegistry();
    this.declarations = options?.declarations ?? [];
  }

  compile(input: string): CELParser {
    return new CELParser(input);
  }

  addDeclaration(decl: Decl) {
    this.declarations.push(decl);
  }

  addDescriptor(
    descriptor: DescMessage | DescEnum | DescExtension | DescService
  ) {
    this.registry.add(descriptor);
  }

  mergeDeclarations(decls: Decl[]) {
    for (const decl of decls) {
      this.addDeclaration(decl);
    }
  }

  mergeRegistry(registry: Registry) {
    for (const descriptor of registry) {
      this.addDescriptor(descriptor);
    }
  }
}
