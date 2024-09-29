import { CELEnvironment } from './environment';
import { StartContext } from './gen/CELParser';
import { CELVisitor } from './visitor';

export class CELProgram {
  constructor(
    public readonly env: CELEnvironment,
    public readonly ast: StartContext
  ) {}

  parse() {
    const parser = new CELVisitor(this.env);
    return this.ast.accept(parser);
  }

  errors() {
    const parser = new CELVisitor(this.env);
    return parser.errors;
  }
}
