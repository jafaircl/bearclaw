import { CELEnvironment } from './environment';
import { StartContext } from './gen/CELParser';
import { CELParser } from './parser';

export class CELProgram {
  constructor(
    public readonly env: CELEnvironment,
    public readonly ast: StartContext
  ) {}

  parse() {
    const parser = new CELParser(this.env);
    return this.ast.accept(parser);
  }

  errors() {
    const parser = new CELParser(this.env);
    return parser.errors;
  }
}
