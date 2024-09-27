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
import { CharStream, CommonTokenStream } from 'antlr4';
import CELLexer from './gen/CELLexer';
import CELParser, { StartContext } from './gen/CELParser';

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

  compile(input: string, check = false): StartContext {
    const chars = new CharStream(input);
    const lexer = new CELLexer(chars);
    const tokens = new CommonTokenStream(lexer);
    const parser = new CELParser(tokens);
    const tree = parser.start();
    if (tree.exception) throw tree.exception;
    if (check) this.check(tree);
    return tree;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  check(ast: StartContext) {
    // TODO: implement
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
