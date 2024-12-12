/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { isNil } from '@bearclaw/is';
import { DescEnum, DescField, DescMessage } from '@bufbuild/protobuf';
import { CosterOptions } from '../checker/cost';
import { Adapter, Provider } from '../common/ref/provider';
import { RefType } from '../common/ref/reference';
import { fieldDescToCELType } from '../common/types/provider';
import { Activation } from '../interpreter/activation';
import { InterpretableDecorator } from '../interpreter/decorators';
import { Macro } from '../parser/macro';
import { Declaration, variable } from './decls';
import { Library } from './library';

export interface EnvOptions {
  /**
   * ClearMacros options clears all parser macros.
   *
   * Clearing macros will ensure CEL expressions can only contain linear
   * evaluation paths, as comprehensions such as `all` and `exists` are enabled
   * only via macros.
   */
  clearMacros?: boolean;

  /**
   * CustomTypeAdapter swaps the default types.Adapter implementation with a
   * custom one.
   *
   * Note: This option must be specified before the Types and TypeDescs options
   * when used together.
   * // TODO: remove this note after implementing its usage
   */
  customTypeAdapter?: Adapter;

  /**
   * CustomTypeProvider replaces the types.Provider implementation with a
   * custom one.
   *
   * The `provider` variable type may either be types.Provider or ref
   * TypeProvider (deprecated)
   *
   * Note: This option must be specified before the Types and TypeDescs options
   * when used together.
   * // TODO: remove this note after implementing its usage
   */
  customTypeProvider?: Provider;

  /**
   * Declarations option extends the declaration set configured in the
   * environment.
   *
   * Note: Declarations will by default be appended to the pre-existing
   * declaration set configured for the environment. The NewEnv call builds on
   * top of the standard CEL declarations. For a purely custom set of
   * declarations use NewCustomEnv.
   * // TODO: remove this note after implementing its usage
   */
  declarations?: Declaration[];

  /**
   * EagerlyValidateDeclarations ensures that any collisions between configured
   * declarations are caught at the time of the `NewEnv` call.
   *
   * Eagerly validating declarations is also useful for bootstrapping a base
   * `cel.Env` value. Calls to base `Env.Extend()` will be significantly faster
   * when declarations are eagerly validated as declarations will be
   * collision-checked at most once and only incrementally by way of `Extend`
   *
   * Disabled by default as not all environments are used for type-checking.
   */
  eagerlyValidateDeclarations?: boolean;

  /**
   * HomogeneousAggregateLiterals disables mixed type list and map literal
   * values.
   *
   * Note, it is still possible to have heterogeneous aggregates when provided
   * as variables to the expression, as well as via conversion of well-known
   * dynamic types, or with unchecked expressions.
   */
  homogeneousAggregateLiterals?: boolean;

  /**
   * variadicLogicalOperatorASTs flatten like-operator chained logical expressions into a single variadic call with N-terms. This behavior is useful when serializing to a protocol buffer as it will reduce the number of recursive calls needed to deserialize the AST later.
   *
   * For example, given the following expression the call graph will be rendered accordingly:
   * ```
   * expression: a && b && c && (d || e)
   * ast: call(_&&_, [a, b, c, call(_||_, [d, e])])
   * ```
   */
  variadicLogicalOperatorASTs?: boolean;

  /**
   * Macros option extends the macro set configured in the environment.
   *
   * Note: This option must be specified after ClearMacros if used together.
   * // TODO: remove this note after implementing its usage
   */
  macros?: Macro[];

  /**
   * Container sets the container for resolving variable names. Defaults to an
   * empty container.
   *
   * If all references within an expression are relative to a protocol buffer
   * package, then specifying a container of `google.type` would make it
   * possible to write expressions such as `Expr{expression: 'a < b'}` instead
   * of having to write `google.type.Expr{...}`.
   */
  container?: string;

  /**
   * Abbrevs configures a set of simple names as abbreviations for
   * fully-qualified names. An abbreviation (abbrev for short) is a simple name
   * that expands to a fully-qualified name. Abbreviations can be useful when
   * working with variables, functions, and especially types from multiple
   * namespaces:
   * ```
   * // CEL object construction
   * qual.pkg.version.ObjTypeName{
   *    field: alt.container.ver.FieldTypeName{value: ...}
   * }
   * ```
   *
   * Only one the qualified names above may be used as the CEL container, so at
   * least one of these references must be a long qualified name within an
   * otherwise short CEL program. Using the following abbreviations, the
   * program becomes much simpler:
   * ```
   * // CEL Go option
   * Abbrevs("qual.pkg.version.ObjTypeName", "alt.container.ver.FieldTypeName")
   * // Simplified Object construction
   * ObjTypeName{field: FieldTypeName{value: ...}}
   * ```
   *
   * There are a few rules for the qualified names and the simple abbreviations
   * generated from them:
   * - Qualified names must be dot-delimited, e.g. `package.subpkg.name`.
   * - The last element in the qualified name is the abbreviation.
   * - Abbreviations must not collide with each other.
   * - The abbreviation must not collide with unqualified names in use.
   *
   * Abbreviations are distinct from container-based references in the
   * following important ways:
   * - Abbreviations must expand to a fully-qualified name.
   * - Expanded abbreviations do not participate in namespace resolution.
   * - Abbreviation expansion is done instead of the container search for a
   * matching identifier.
   * - Containers follow C++ namespace resolution rules with searches from the
   * most qualified name to the least qualified name.
   * - Container references within the CEL program may be relative, and are
   * resolved to fully qualified names at either type-check time or program
   * plan time, whichever comes first.
   *
   * If there is ever a case where an identifier could be in both the container
   * and as an abbreviation, the abbreviation wins as this will ensure that the
   * meaning of a program is preserved between compilations even as the
   * container evolves.
   */
  abbrevs?: string[];

  /**
   * Types adds one or more type declarations to the environment, allowing for
   * construction of type-literals whose definitions are included in the common
   * expression built-in set. The input types may either be instances of
   * protobuf-es `DescMessage` or `DescEnum`, or `ref.Type`. Any other type
   * provided to this option will result in an error.
   *
   * Well-known protobuf types within the `google.protobuf.*` package are
   * included in the standard environment by default.
   *
   * Note: This option must be specified after the CustomTypeProvider option
   * when used together.
   * // TODO: remove this note after implementing its usage
   */
  types?: (DescMessage | DescEnum | RefType)[];

  /**
   * CostEstimatorOptions configure type-check time options for estimating
   * expression cost.
   */
  costEstimatorOptions?: CosterOptions;

  /**
   * DeclareContextProto returns an option to extend CEL environment with
   * declarations from the given context proto. Each field of the proto defines
   * a variable of the same name in the environment.
   *
   * https://github.com/google/cel-spec/blob/master/doc/langdef.md#evaluation-environment
   */
  declareContextProto?: DescMessage;

  /**
   * EnableMacroCallTracking ensures that call expressions which are replaced
   * by macros are tracked in the `SourceInfo` of parsed and checked
   * expressions.
   */
  enableMacroCallTracking?: boolean;

  /**
   * CrossTypeNumericComparisons makes it possible to compare across numeric
   * types, e.g. double < int
   */
  crossTypeNumericComparisons?: boolean;

  /**
   * DefaultUTCTimeZone ensures that time-based operations use the UTC timezone
   * rather than the input time's local timezone.
   */
  defaultUTCTimeZone?: boolean;

  /**
   * ParserRecursionLimit adjusts the AST depth the parser will tolerate.
   * Defaults defined in the parser package.
   */
  parserRecursionLimit?: number;

  /**
   * ParserExpressionSizeLimit adjusts the number of code points the expression
   * parser is allowed to parse. Defaults defined in the parser package.
   */
  parserExpressionSizeLimit?: number;

  /**
   * Enable error generation when a presence test or optional field selection
   * is performed on a primitive type.
   */
  enableErrorOnBadPresenceTest?: boolean;

  /**
   * Libraries extend the environment with library options.
   */
  libraries?: Library[];
}

export function fieldToVariable(field: DescField) {
  const type = fieldDescToCELType(field);
  if (isNil(type)) {
    throw new Error(
      `field ${field.name} type ${field.fieldKind} not implemented`
    );
  }
  return variable(field.name, type);
}

export interface ProgramOptions {
  /**
   * CustomDecorators appends InterpreterDecorators to the program.
   *
   * InterpretableDecorators can be used to inspect, alter, or replace the
   * Program plan.
   */
  customDecorators?: InterpretableDecorator[];

  /**
   * Globals sets the global variable values for a given program. These values
   * may be shadowed by variables with the same name provided to the Eval()
   * call. If Globals is used in a Library with a Lib EnvOption, vars may
   * shadow variables provided by previously added libraries.
   *
   * The vars value may either be an `interpreter.Activation` instance or a `map
   * [string]any`.
   */
  globals?: Activation | Map<string, any>;

  //   /**
  //    * OptimizeRegex provides a way to replace the InterpretableCall for regex
  //    * functions. This can be used to compile regex string constants at program
  //    * creation time and report any errors and then use the compiled regex for
  //    * all regex function invocations.
  //    */
  //   // TODO: implement this option
  //   optimizeRegex?: any[];

  //   /**
  //    * TrackState will cause the runtime to return an immutable EvalState value
  //    * in the Result.
  //    */
  //   // TODO: implement this option
  //   trackState?: boolean;

  //   /**
  //    * ExhaustiveEval causes the runtime to disable short-circuits and track
  //    * state.
  //    */
  //   // TODO: implement this option
  //   exhaustiveEval?: boolean;

  //   /**
  //    * Optimize precomputes functions and operators with constants as arguments
  //    * at program creation time. It also pre-compiles regex pattern constants
  //    * passed to 'matches', reports any compilation errors at program creation
  //    * and uses the compiled regex pattern for all 'matches' function
  //    * invocations. This flag is useful when the expression will be evaluated
  //    * repeatedly against a series of different inputs.
  //    */
  //   // TODO: implement this option
  //   optimize?: boolean;

  //   /**
  //    * PartialEval enables the evaluation of a partial state where the input data
  //    * that may be known to be missing, either as top-level variables, or
  //    * somewhere within a variable's object member graph.
  //    *
  //    * By itself, OptPartialEval does not change evaluation behavior unless the
  //    * input to the Program Eval() call is created via PartialVars().
  //    */
  //   // TODO: implement this option
  //   partialEval?: boolean;

  //   /**
  //    * TrackCost enables the runtime cost calculation while validation and return
  //    * cost within evalDetails cost calculation is available via func ActualCost()
  //    */
  //   // TODO: implement this option
  //   trackCost?: boolean;

  //   /**
  //    * InterruptCheckFrequency configures the number of iterations within a
  //    * comprehension to evaluate before checking whether the function evaluation
  //    * has been interrupted.
  //    */
  //   // TODO: implement this option
  //   interruptCheckFrequency?: number;

  //   /**
  //    * CostTrackerOptions configures a set of options for cost-tracking.
  //    *
  //    * Note, CostTrackerOptions is a no-op unless CostTracking is also enabled.
  //    */
  //   // TODO: implement this option
  //   costTrackerOptions?: any;

  //   /**
  //    * CostTracking enables cost tracking and registers a ActualCostEstimator
  //    * that can optionally provide a runtime cost estimate for any function calls.
  //    */
  //   // TODO: implement this option
  //   constTracking?: any;

  //   /**
  //    * CostLimit enables cost tracking and sets configures program evaluation to
  //    * exit early with a "runtime cost limit exceeded" error if the runtime cost
  //    * exceeds the costLimit. The CostLimit is a metric that corresponds to the
  //    * number and estimated expense of operations performed while evaluating an
  //    * expression. It is indicative of CPU usage, not memory usage.
  //    */
  //   // TODO: implement this option
  //   costLimit?: number;
}
