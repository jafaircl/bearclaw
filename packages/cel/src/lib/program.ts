import { CELEnvironment } from './environment';
import { StartContext } from './gen/CELParser';

export class CELProgram {
  constructor(
    public readonly env: CELEnvironment,
    public readonly ast: StartContext
  ) {}
}
