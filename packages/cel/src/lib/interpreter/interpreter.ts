import { AST } from '../common/ast';
import { Container } from '../common/container';
import { Adapter, Provider } from '../common/ref/provider';
import { AttributeFactory } from './attributes';
import { InterpretableDecorator } from './decorators';
import { Dispatcher } from './dispatcher';
import { Interpretable } from './interpretable';
import { Planner } from './planner';

/**
 * Interpreter generates a new Interpretable from a checked or unchecked
 * expression.
 */
export interface Interpreter {
  /**
   * NewInterpretable creates an Interpretable from a checked expression and an  optional list of InterpretableDecorator values.
   */
  newInterpretable(
    exprAST: AST,
    ...decorators: InterpretableDecorator[]
  ): Interpretable | Error;
}

// TODO: observers and regex optimization

/**
 * NewInterpreter builds an Interpreter from a Dispatcher and TypeProvider
 * which will be used throughout the Eval of all Interpretable instances
 * generated from it.
 */
export class ExprInterpreter implements Interpreter {
  #dispatcher: Dispatcher;
  #container: Container;
  #provider: Provider;
  #adapter: Adapter;
  #attrFactory: AttributeFactory;

  constructor(
    dispatcher: Dispatcher,
    container: Container,
    provider: Provider,
    adapter: Adapter,
    attrFactory: AttributeFactory
  ) {
    this.#dispatcher = dispatcher;
    this.#container = container;
    this.#provider = provider;
    this.#adapter = adapter;
    this.#attrFactory = attrFactory;
  }

  newInterpretable(
    checked: AST,
    ...decorators: InterpretableDecorator[]
  ): Interpretable | Error {
    const p = new Planner(
      this.#dispatcher,
      this.#provider,
      this.#adapter,
      this.#attrFactory,
      this.#container,
      checked,
      decorators
    );
    return p.plan(checked.expr());
  }
}
