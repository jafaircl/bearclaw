import {
  Activation,
  HierarchicalActivation,
  MapActivation,
  PartialActivation,
} from './../interpreter/activation';
import {
  EvalObserver,
  ExprInterpreter,
  Interpreter,
  observe,
} from './../interpreter/interpreter';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from '@bearclaw/is';
import { AST } from '../common/ast';
import { RefVal } from '../common/ref/reference';
import { isErrorRefVal } from '../common/types/error';
import { reflectNativeType } from '../common/types/native';
import { EmptyActivation } from '../interpreter/activation';
import {
  AttrFactory,
  AttrFactoryOptions,
  AttributeFactory,
} from '../interpreter/attributes';
import { InterpretableDecorator } from '../interpreter/decorators';
import { DefaultDispatcher, Dispatcher } from '../interpreter/dispatcher';
import { EvalState } from '../interpreter/evalstate';
import { Interpretable } from '../interpreter/interpretable';
import {
  ActualCostEstimator,
  costObserver,
  CostTracker,
  CostTrackerOption,
} from '../interpreter/runtimecost';
import { Env } from './env';
import { Feature } from './library';
import { EvalOption, ProgramOption } from './options';

/**
 * Program is an evaluable view of an Ast.
 */
export interface Program {
  /**
   * Eval returns the result of an evaluation of the Ast and environment
   * against the input vars.
   *
   * The vars value may either be an `interpreter.Activation` or a
   * `map[string]any`.
   *
   * If the `OptTrackState`, `OptTrackCost` or `OptExhaustiveEval` flags are used, the `details` response will be non-nil. Given this caveat on `details`, the return state from evaluation will be:
   *
   * *  `val`, `details`, `nil` - Successful evaluation of a non-error result.
   * *  `val`, `details`, `err` - Successful evaluation to an error result.
   * *  `nil`, `details`, `err` - Unsuccessful evaluation.
   *
   * An unsuccessful evaluation is typically the result of a series of
   * incompatible `EnvOption` or `ProgramOption` values used in the creation
   * of the evaluation environment or executable program.
   */
  eval(
    input: Activation | Record<string, any> | Map<string, any>
  ): [RefVal | null, EvalDetails | null, Error | null];
}

/**
 * prog is the internal implementation of the Program interface.
 */
export class prog implements Program {
  env: Env;
  evalOpts: EvalOption[];
  defaultVars: Activation;
  dispatcher: Dispatcher;
  interpreter: Interpreter | null;
  interruptCheckFrequency: number;

  // Intermediate state used to configure the InterpretableDecorator set provided
  // to the initInterpretable call.
  decorators: InterpretableDecorator[];
  // TODO: regex optimizations
  // regexOptimizations []*interpreter.RegexOptimization

  // Interpretable configured from an Ast and aggregate decorator set based on program options.
  interpretable: Interpretable | null;
  callCostEstimator: ActualCostEstimator | null;
  costOptions: CostTrackerOption[];
  costLimit: bigint | null;

  constructor(
    env: Env,
    evalOpts: EvalOption[],
    defaultVars: Activation,
    dispatcher: Dispatcher,
    interpreter?: Interpreter | null,
    interruptCheckFrequency?: number | null,
    decorators?: InterpretableDecorator[] | null,
    // regexOptimizations: []*interpreter.RegexOptimization,
    interpretable?: Interpretable | null,
    callCostEstimator?: ActualCostEstimator | null,
    costOptions?: CostTrackerOption[] | null,
    costLimit?: bigint | null
  ) {
    this.env = env;
    this.evalOpts = evalOpts || [];
    this.defaultVars = defaultVars || new EmptyActivation();
    this.dispatcher = dispatcher;
    this.interpreter = interpreter || null;
    this.interruptCheckFrequency = interruptCheckFrequency || 0;
    this.decorators = decorators || [];
    // this.regexOptimizations = regexOptimizations;
    this.interpretable = interpretable || null;
    this.callCostEstimator = callCostEstimator || null;
    this.costOptions = costOptions || [];
    this.costLimit = costLimit ?? null;
  }

  clone() {
    const costOptsCopy = [...this.costOptions];

    return new prog(
      this.env,
      this.evalOpts,
      this.defaultVars,
      this.dispatcher,
      this.interpreter,
      this.interruptCheckFrequency,
      null,
      null,
      null,
      costOptsCopy
    );
  }

  initInterpretable(a: AST, decs: InterpretableDecorator[]): prog | Error {
    // When the AST has been exprAST it contains metadata that can be used to
    // speed up program execution.
    const interpretable = this.interpreter?.newInterpretable(a, ...decs);
    if (isNil(interpretable)) {
      return new Error('failed to create interpretable');
    }
    if (interpretable instanceof Error) {
      return interpretable;
    }
    this.interpretable = interpretable;
    return this;
  }

  eval(
    input: Activation | Record<string, any> | Map<string, any>
  ): [RefVal | null, EvalDetails | null, Error | null] {
    if (isNil(this.interpretable)) {
      return [null, null, new Error('program not initialized')];
    }
    // Build a hierarchical activation if there are default vars set.
    let vars: Activation;
    switch (reflectNativeType(input)) {
      case EmptyActivation:
      case MapActivation:
      case HierarchicalActivation:
      case PartialActivation:
        vars = input as Activation;
        break;
      case Object:
      case Map:
        vars = new MapActivation(
          input as Map<string, any> | Record<string, any>
        );
        break;
      default:
        return [
          null,
          null,
          new Error(
            `invalid input, wanted Activation or map[string]any, got: (${input})${input}`
          ),
        ];
    }
    if (!isNil(this.defaultVars)) {
      vars = new HierarchicalActivation(this.defaultVars, vars);
    }
    const v = this.interpretable.eval(vars);
    // The output of an internal Eval may have a value (`v`) that is a types.Err. This step translates the CEL value to a JS error response. This interface does not quite match the RPC signature which allows for multiple errors to be returned, but should be sufficient
    if (isErrorRefVal(v)) {
      return [null, null, v.value()];
    }
    return [v, null, null];
  }
}

/**
 * newProgram creates a program instance with an environment, an ast, and an
 * optional list of ProgramOption values.
 *
 * If the program cannot be configured the prog will be nil, with a non-nil
 * error response.
 */
export function newProgram(
  e: Env,
  a: AST,
  opts: ProgramOption[]
): Program | Error {
  // Build the dispatcher, interpreter, and default program value.
  const disp = new DefaultDispatcher();

  // Ensure the default attribute factory is set after the adapter and provider
  // are configured.
  const p = new prog(e, [], new EmptyActivation(), disp);

  // Configure the program via the ProgramOption values.
  for (const opt of opts) {
    const maybeErr = opt(p);
    if (maybeErr instanceof Error) {
      return maybeErr;
    }
  }

  // Add the function bindings created via Function() options.
  for (const fn of e.functions.values()) {
    const bindings = fn.bindings();
    const err = disp.add(...bindings);
    if (err instanceof Error) {
      return err;
    }
  }

  // Set the attribute factory after the options have been set.
  let attrFactory: AttributeFactory;
  const attrFactorOpts: AttrFactoryOptions = {
    enableErrorOnBadPresenceTest: p.env.hasFeature(
      Feature.EnableErrorOnBadPresenceTest
    ),
  };
  // TODO: partial eval
  // if p.evalOpts&OptPartialEval == OptPartialEval {
  // 	attrFactory = interpreter.NewPartialAttributeFactory(e.Container, e.adapter, e.provider, attrFactorOpts...)
  // } else {
  // 	attrFactory = interpreter.NewAttributeFactory(e.Container, e.adapter, e.provider, attrFactorOpts...)
  // }
  // eslint-disable-next-line prefer-const
  attrFactory = new AttrFactory(
    e.container,
    e.adapter,
    e.provider,
    attrFactorOpts
  );
  const interp = new ExprInterpreter(
    disp,
    e.container,
    e.provider,
    e.adapter,
    attrFactory
  );
  p.interpreter = interp;

  // Translate the EvalOption flags into InterpretableDecorator instances.
  const decorators: InterpretableDecorator[] = [...p.decorators];

  // TODO: observers and regex optimization
  //   // Enable interrupt checking if there's a non-zero check frequency
  // 	if p.interruptCheckFrequency > 0 {
  // 		decorators = append(decorators, interpreter.InterruptableEval())
  // 	}
  // 	// Enable constant folding first.
  // 	if p.evalOpts&OptOptimize == OptOptimize {
  // 		decorators = append(decorators, interpreter.Optimize())
  // 		p.regexOptimizations = append(p.regexOptimizations, interpreter.MatchesRegexOptimization)
  // 	}
  // 	// Enable regex compilation of constants immediately after folding constants.
  // 	if len(p.regexOptimizations) > 0 {
  // 		decorators = append(decorators, interpreter.CompileRegexConstants(p.regexOptimizations...))
  // 	}

  // TODO: exhaustive eval
  // Enable exhaustive eval, state tracking and cost tracking last since they
  // require a factory.
  if (
    p.evalOpts.includes(EvalOption.ExhaustiveEval) ||
    p.evalOpts.includes(EvalOption.TrackState) ||
    p.evalOpts.includes(EvalOption.TrackCost)
  ) {
    const factory = (state: EvalState, costTracker: CostTracker) => {
      costTracker.estimator = p.callCostEstimator;
      costTracker.limit = p.costLimit;
      for (const costOpt of p.costOptions) {
        costOpt(costTracker);
      }
      // Limit capacity to guarantee a reallocation when calling 'append(decs, ...)' below. This
      // prevents the underlying memory from being shared between factory function calls causing
      // undesired mutations.
      const decs = decorators.slice(0, decorators.length);
      const observers: EvalObserver[] = [];

      if (
        p.evalOpts.includes(EvalOption.ExhaustiveEval) ||
        p.evalOpts.includes(EvalOption.TrackState)
      ) {
        // TODO: evalStateObserver
        // // EvalStateObserver is required for OptExhaustiveEval.
        // observers.push(evalStateObserver(state))
      }
      if (p.evalOpts.includes(EvalOption.TrackCost)) {
        observers.push(costObserver(costTracker));
      }

      // Enable exhaustive eval over a basic observer since it offers a superset of features.
      if (p.evalOpts.includes(EvalOption.ExhaustiveEval)) {
        // TODO: exhaustive eval
        // decs = append(decs, interpreter.ExhaustiveEval(), interpreter.Observe(observers...))
      } else if (observers.length > 0) {
        decs.push(observe(...observers));
      }

      return p.clone().initInterpretable(a, decs);
    };
    return new progGen(factory);
  }
  return p.initInterpretable(a, decorators);
}

// progFactory is a helper alias for marking a program creation factory function.
type progFactory = (state: EvalState, tracker: CostTracker) => prog | Error;

/**
 * progGen holds a reference to a progFactory instance and implements the
 * Program interface.
 */
class progGen implements Program {
  factory: progFactory;

  constructor(factory: progFactory) {
    // Test the factory to make sure that configuration errors are spotted at config
    const tracker = new CostTracker(null);
    const maybeErr = factory(new EvalState(), tracker);
    if (maybeErr instanceof Error) {
      throw maybeErr;
    }
    this.factory = factory;
  }

  eval(
    input: Activation | Record<string, any> | Map<string, any>
  ): [RefVal | null, EvalDetails | null, Error | null] {
    // The factory based Eval() differs from the standard evaluation model in
    // that it generates a new EvalState instance for each call to ensure that
    // unique evaluations yield unique stateful results.
    const state = new EvalState();
    const costTracker = new CostTracker(null);

    const det = new EvalDetails(state, costTracker);

    // Generate a new instance of the interpretable using the factory
    // configured during the call to newProgram(). It is incredibly unlikely
    // that the factory call will generate an error given the factory test
    // performed within the Program() call.
    const p = this.factory(state, costTracker);
    if (p instanceof Error) {
      return [null, det, p];
    }

    // Evaluate the input, returning the result and the 'state' within
    // EvalDetails.
    const [v, _, err] = p.eval(input);
    return [v, det, err];
  }
}

/**
 * EvalDetails holds additional information observed during the Eval() call.
 */
export class EvalDetails {
  #state: EvalState;
  #costTracker: CostTracker;

  constructor(state: EvalState, costTracker: CostTracker) {
    this.#state = state;
    this.#costTracker = costTracker;
  }

  /**
   * State of the evaluation, non-nil if the OptTrackState or OptExhaustiveEval
   * is specified within EvalOptions.
   */
  state() {
    return this.#state;
  }

  /**
   * ActualCost returns the tracked cost through the course of execution when
   * `CostTracking` is enabled. Otherwise, returns nil if the cost was not
   * enabled.
   */
  actualCost() {
    return this.#costTracker.actualCost();
  }
}
