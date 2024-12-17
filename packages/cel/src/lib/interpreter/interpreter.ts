/* eslint-disable @typescript-eslint/no-explicit-any */
import { AST } from '../common/ast';
import { Container } from '../common/container';
import { Adapter, Provider } from '../common/ref/provider';
import { RefVal } from '../common/ref/reference';
import { AttributeFactory } from './attributes';
import { decObserveEval, InterpretableDecorator } from './decorators';
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

/**
 * EvalObserver is a functional interface that accepts an expression id and an
 * observed value. The id identifies the expression that was evaluated, the
 * programStep is the Interpretable or Qualifier that was evaluated and value
 * is the result of the evaluation.
 */
export type EvalObserver = (
  id: bigint,
  programStep: any,
  value: RefVal
) => void;

/**
 * Observe constructs a decorator that calls all the provided observers in
 * order after evaluating each Interpretable or Qualifier during program
 * evaluation.
 */
export function observe(...observers: EvalObserver[]): InterpretableDecorator {
  if (observers.length === 1) {
    return decObserveEval(observers[0]);
  }
  return decObserveEval((id, programStep, value) => {
    for (const observer of observers) {
      observer(id, programStep, value);
    }
  });
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
