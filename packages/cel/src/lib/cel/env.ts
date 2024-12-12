/* eslint-disable @typescript-eslint/no-empty-interface */
import { isNil } from '@bearclaw/is';
import { Checker } from '../checker/checker';
import { Coster, CosterOptions, CostEstimator } from '../checker/cost';
import { Env as CheckerEnv, CheckerEnvOptions } from '../checker/env';
import { SourceInfo, AST as œAST } from '../common/ast';
import { Container } from '../common/container';
import { sourceInfoToProto } from '../common/conversion';
import { FunctionDecl, VariableDecl } from '../common/decls';
import { Errors } from '../common/errors';
import { formatCELType as œformatCELType } from '../common/format';
import { NoLocation } from '../common/location';
import { Adapter, isRegistry, Provider } from '../common/ref/provider';
import { TextSource, Source as œSource } from '../common/source';
import { Registry } from '../common/types/provider';
import { Macro } from '../parser/macro';
import { Parser, ParserOptions } from '../parser/parser';
import { Type, unwrapDeclaration } from './decls';
import { isSingletonLibrary, StdLibrary } from './library';
import { EnvOptions, fieldToVariable, ProgramOptions } from './options';

/**
 * Source interface representing a user-provided expression.
 */
export interface Source extends œSource {}

/**
 * Ast representing the checked or unchecked expression, its source, and
 * related metadata such as source position information.
 */
export class Ast {
  #source: Source;
  #impl: œAST;

  constructor(source: Source, impl: œAST) {
    this.#source = source;
    this.#impl = impl;
  }

  /**
   * NativeRep converts the AST to a JS-native representation.
   */
  nativeRep() {
    return this.#impl;
  }

  /**
   * IsChecked returns whether the Ast value has been successfully type-checked.
   */
  isChecked() {
    return this.nativeRep().isChecked();
  }

  /**
   * SourceInfo returns character offset and newline position information about
   * expression elements.
   */
  sourceInfo() {
    return sourceInfoToProto(this.nativeRep().sourceInfo());
  }

  /**
   * OutputType returns the output type of the expression if the Ast has been
   * type-checked, else returns cel.DynType as the parse step cannot infer
   * types.
   */
  outputType() {
    return this.nativeRep().getType(this.nativeRep().expr().id);
  }

  /**
   * Source returns a view of the input used to create the Ast. This source may
   * be complete or constructed from the SourceInfo.
   */
  source() {
    return this.#source;
  }
}

/**
 * FormatCELType formats a cel.Type value to a string representation.
 *
 * The type formatting is identical to FormatType.
 */
export function formatCELType(t: Type) {
  return œformatCELType(t);
}

interface EnvBaseOptions {
  container: Container;
  variables: VariableDecl[];
  functions: Map<string, FunctionDecl>;
  macros: Macro[];
  adapter: Adapter;
  provider: Provider;
  features: Map<number, boolean>;
  appliedFeatures: Map<number, boolean>;
  libraries: Map<string, boolean>;
  // #validators      []ASTValidator
  costOptions: CosterOptions;

  // Internal parser representation
  prsrOpts: ParserOptions;

  // Internal checker representation
  // #chkMutex sync.Mutex
  // #chkOnce  sync.Once
  chkOpts: CheckerEnvOptions;

  // Program options tied to the environment
  progOpts: ProgramOptions;
}

class EnvBase {
  #container: Container;
  #variables: VariableDecl[];
  #functions: Map<string, FunctionDecl>;
  #macros: Macro[];
  #adapter: Adapter;
  #provider: Provider;
  #features: Map<number, boolean>;
  #appliedFeatures: Map<number, boolean>;
  #libraries: Map<string, boolean>;
  // #validators      []ASTValidator
  #costOptions: CosterOptions;

  // Internal parser representation
  #prsr!: Parser;
  #prsrOpts!: ParserOptions;

  // Internal checker representation
  // #chkMutex sync.Mutex
  #chk!: CheckerEnv | Error;
  // #chkOnce  sync.Once
  #chkOpts!: CheckerEnvOptions;

  // Program options tied to the environment
  #progOpts!: ProgramOptions;

  constructor(opts: EnvBaseOptions) {
    this.#container = opts.container;
    this.#variables = opts.variables;
    this.#functions = opts.functions;
    this.#macros = opts.macros;
    this.#adapter = opts.adapter;
    this.#provider = opts.provider;
    this.#features = opts.features;
    this.#appliedFeatures = opts.appliedFeatures;
    this.#libraries = opts.libraries;
    // validators:      []ASTValidator{},
    this.#costOptions = opts.costOptions;
    this.#prsrOpts = opts.prsrOpts;
    this.#chkOpts = opts.chkOpts;
    this.#progOpts = opts.progOpts;
  }

  configure(opts?: EnvOptions) {
    this.#variables = [];
    this.#functions = new Map();
    if (opts?.declarations) {
      for (let decl of opts.declarations) {
        decl = unwrapDeclaration(decl);
        if (decl instanceof VariableDecl) {
          this.#variables.push(decl);
        } else if (decl instanceof FunctionDecl) {
          this.#functions.set(decl.name(), decl);
        }
      }
    }
    if (opts?.declareContextProto) {
      for (const field of opts.declareContextProto.fields) {
        const decl = fieldToVariable(field);
        if (decl) {
          this.#variables.push(decl);
        }
      }
    }
    this.#macros = [];
    if (!opts?.clearMacros) {
      this.#macros = opts?.macros || [];
    }
    this.#container = new Container(opts?.container);
    if (!isNil(opts?.abbrevs)) {
      this.#container.addAbbrevs(...opts.abbrevs);
    }
    const registry = new Registry();
    this.#adapter = opts?.customTypeAdapter ?? registry;
    this.#provider = opts?.customTypeProvider ?? registry;
    // TODO: features
    this.#features = new Map();
    this.#appliedFeatures = new Map();
    this.#libraries = new Map();
    // validators:      []ASTValidator{},
    this.#progOpts = {};
    this.#costOptions = opts?.costEstimatorOptions || {};

    // Configure the parser.
    this._initParser(opts);

    // Ensure that the checker init happens eagerly rather than lazily.
    if (opts?.eagerlyValidateDeclarations === true) {
      this._initChecker(opts);
      if (this.#chk instanceof Error) {
        throw this.#chk;
      }
    }
  }

  /**
   * Check performs type-checking on the input Ast and yields a checked Ast and
   * or set of Issues. If any `ASTValidators` are configured on the
   * environment, they will be applied after a valid type-check result. If any
   * issues are detected, the validators will provide them on the output Issues
   * object.
   *
   * Either checking or validation has failed if the returned Issues value and
   * its Issues.Err() value are non-nil. Issues should be inspected if they are
   * non-nil, but may not represent a fatal error.
   *
   * It is possible to have both non-nil Ast and Issues values returned from
   * this call: however, the mere presence of an Ast does not imply that it is
   * valid for use.
   */
  check(ast: Ast) {
    // Construct the internal checker env, erroring if there is an issue adding
    // the declarations.
    this._initChecker();
    if (this.#chk instanceof Error) {
      const errs = new Errors(ast.source());
      errs.reportError(NoLocation, this.#chk.message);
      return new Issues(errs, ast.nativeRep().sourceInfo());
    }
    const checker = new Checker(this.#chk);
    const checked = checker.check(ast.nativeRep());
    if (checker.errors.length() > 0) {
      return new Issues(checker.errors, ast.nativeRep().sourceInfo());
    }
    // Manually create the Ast to ensure that the Ast source information (which
    // may be more detailed than the information provided by Check), is
    // returned to the caller.
    ast = new Ast(ast.source(), checked);

    // TODO: validators
    // // Avoid creating a validator config if it's not needed.
    // if len(e.validators) == 0 {
    // 	return ast, nil
    // }

    // // Generate a validator configuration from the set of configured validators.
    // vConfig := newValidatorConfig()
    // for _, v := range e.validators {
    // 	if cv, ok := v.(ASTValidatorConfigurer); ok {
    // 		cv.Configure(vConfig)
    // 	}
    // }
    // // Apply additional validators on the type-checked result.
    // iss := NewIssuesWithSourceInfo(errs, ast.NativeRep().SourceInfo())
    // for _, v := range e.validators {
    // 	v.Validate(e, vConfig, checked, iss)
    // }
    // if iss.Err() != nil {
    // 	return nil, iss
    // }
    return ast;
  }

  /**
   * Compile combines the Parse and Check phases CEL program compilation to
   * produce an Ast and associated issues.
   *
   * If an error is encountered during parsing the Compile step will not
   * continue with the Check phase. If non-error issues are encountered during
   * Parse, they may be combined with any issues discovered during Check.
   *
   * Note, for parse-only uses of CEL use Parse.
   */
  compile(txt: string) {
    const src = new TextSource(txt);
    return this.compileSource(src);
  }

  /**
   * CompileSource combines the Parse and Check phases CEL program compilation
   * to produce an Ast and associated issues.
   *
   * If an error is encountered during parsing the CompileSource step will not
   * continue with the Check phase. If non-error issues are encountered during
   * Parse, they may be combined with any issues discovered during Check.
   *
   * Note, for parse-only uses of CEL use Parse.
   */
  compileSource(src: Source) {
    const ast = this.parseSource(src);
    if (ast instanceof Issues) {
      return ast;
    }
    const checked = this.check(ast);
    if (checked instanceof Issues) {
      return checked;
    }
    return checked;
  }

  /**
   * Extend the current environment with additional options to produce a new
   * Env.
   *
   * Note, the extended Env value should not share memory with the original. It
   * is possible, however, that a CustomTypeAdapter or CustomTypeProvider
   * options could provide values which are mutable. To ensure separation of
   * state between extended environments either make sure the TypeAdapter and
   * TypeProvider are immutable, or that their underlying implementations are
   * based on the ref.TypeRegistry which provides a Copy method which will be
   * invoked by this method.
   */
  extend(opts: EnvOptions) {
    if (this.#chk instanceof Error) {
      return this.#chk;
    }

    const prsrOptsCopy = { ...this.#prsrOpts };

    // The type-checker is configured with Declarations. The declarations may either be provided
    // as options which have not yet been validated, or may come from a previous checker instance
    // whose types have already been validated.
    const chkOptsCopy = { ...this.#chkOpts };

    // Copy the declarations if needed.
    if (!isNil(this.#chk)) {
      // If the type-checker has already been instantiated, then the e.declarations have been
      // validated within the chk instance.
      chkOptsCopy.validatedDeclarations = this.#chk.validatedDeclarations();
    }
    const varsCopy = [...this.#variables];

    // Copy macros and program options
    const macsCopy = [...this.#macros];
    const progOptsCopy = { ...this.#progOpts };

    // Copy the adapter / provider if they appear to be mutable.
    let adapter = this.#adapter;
    let provider = this.#provider;
    // In most cases the provider and adapter will be a ref.TypeRegistry;
    // however, in the rare cases where they are not, they are assumed to
    // be immutable. Since it is possible to set the TypeProvider separately
    // from the TypeAdapter, the possible configurations which could use a
    // TypeRegistry as the base implementation are captured below.
    if (isRegistry(adapter) && isRegistry(provider)) {
      const reg = adapter.copy();
      provider = reg;
      // If the adapter and provider are the same object, set the adapter
      // to the same ref.TypeRegistry as the provider.
      if (adapter == provider) {
        adapter = reg;
      } else {
        // Otherwise, make a copy of the adapter.
        adapter = adapter.copy();
      }
    } else if (isRegistry(provider)) {
      provider = provider.copy();
    } else if (isRegistry(adapter)) {
      adapter = adapter.copy();
    }

    const featuresCopy = new Map(this.#features);
    const appliedFeaturesCopy = new Map(this.#appliedFeatures);
    const funcsCopy = new Map(this.#functions);
    const libsCopy = new Map(this.#libraries);
    // validatorsCopy := make([]ASTValidator, len(e.validators))
    // copy(validatorsCopy, e.validators)
    const costOptsCopy = { ...this.#costOptions };

    const ext = new EnvBase({
      container: this.#container,
      variables: varsCopy,
      functions: funcsCopy,
      macros: macsCopy,
      progOpts: progOptsCopy,
      adapter: adapter,
      features: featuresCopy,
      appliedFeatures: appliedFeaturesCopy,
      libraries: libsCopy,
      // validators:      validatorsCopy,
      provider: provider,
      chkOpts: chkOptsCopy,
      prsrOpts: prsrOptsCopy,
      costOptions: costOptsCopy,
    });
    ext.configure(opts);
    return ext;
  }

  /**
   * HasFunction returns whether a specific function has been configured in the
   * environment
   */
  hasFunction(name: string) {
    return this.#functions.has(name);
  }

  /**
   * Functions returns map of Functions, keyed by function name, that have been
   * configured in the environment.
   */
  functions() {
    return this.#functions;
  }

  /**
   * Parse parses the input expression value `txt` to a Ast and/or a set of
   * Issues.
   *
   * This form of Parse creates a Source value for the input `txt` and forwards
   * to the ParseSource method.
   */
  parse(txt: string) {
    const src = new TextSource(txt);
    return this.parseSource(src);
  }

  /**
   * ParseSource parses the input source to an Ast and/or set of Issues.
   *
   * Parsing has failed if the returned Issues value and its Issues.Err() value
   * is non-nil. Issues should be inspected if they are non-nil, but may not
   * represent a fatal error.
   *
   * It is possible to have both non-nil Ast and Issues values returned from
   * this call; however, the mere presence of an Ast does not imply that it is
   * valid for use.
   */
  parseSource(src: Source): Ast | Issues {
    const parsed = this.#prsr.parse(src);
    if (this.#prsr.errors.length() > 0) {
      return new Issues(this.#prsr.errors);
    }
    return new Ast(src, parsed);
  }

  /**
   * CELTypeAdapter returns the `types.Adapter` configured for the environment.
   */
  CELTypeAdapter() {
    return this.#adapter;
  }

  /**
   * CELTypeProvider returns the `types.Provider` configured for the
   * environment.
   */
  CELTypeProvider() {
    return this.#provider;
  }

  /**
   * EstimateCost estimates the cost of a type checked CEL expression using the
   * length estimates of input data and extension functions provided by
   * estimator.
   */
  estimateCost(ast: Ast, estimator: CostEstimator, opts?: CosterOptions) {
    const extendedOptions = { ...this.#costOptions, ...opts };
    return new Coster(ast.nativeRep(), estimator, extendedOptions).cost();
  }

  private _initParser(opts?: EnvOptions) {
    if (!isNil(this.#prsr)) {
      return;
    }
    this.#prsrOpts = {};
    if (!isNil(opts?.macros)) {
      this.#prsrOpts.macros = opts.macros;
    }
    if (opts?.enableMacroCallTracking === true) {
      this.#prsrOpts.populateMacroCalls = true;
    }
    if (opts?.variadicLogicalOperatorASTs === true) {
      this.#prsrOpts.enableVariadicOperatorASTs = true;
    }
    this.#prsr = new Parser(this.#prsrOpts);
  }

  private _initChecker(opts?: EnvOptions) {
    if (!isNil(this.#chk)) {
      return;
    }
    this.#chkOpts = {};
    if (opts?.homogeneousAggregateLiterals === true) {
      this.#chkOpts.homogeneousAggregateLiterals = true;
    }
    if (opts?.crossTypeNumericComparisons === true) {
      this.#chkOpts.crossTypeNumericComparisons = true;
    }

    const chk = new CheckerEnv(this.#container, this.#provider, this.#chkOpts);
    // Add the statically configured declarations.
    let err = chk.addIdents(...this.#variables);
    if (!isNil(err)) {
      this.#chk = err;
      return;
    }
    // Add the function declarations which are derived from the FunctionDecl instances.
    for (const fn of this.#functions.values()) {
      if (fn.isDeclarationDisabled() === true) {
        continue;
      }
      err = chk.addFunctions(fn);
      if (!isNil(err)) {
        this.#chk = err;
        return;
      }
    }
    this.#chk = chk;
  }
}

/**
 * CustomEnv creates a custom program environment which is not automatically
 * configured with the standard library of functions and macros documented in
 * the CEL spec.
 *
 * The purpose for using a custom environment might be for subsetting the
 * standard library produced by the cel.StdLib() function. Subsetting CEL is a
 * core aspect of its design that allows users to limit the compute and memory
 * impact of a CEL program by controlling the functions and macros that may
 * appear in a given expression.
 *
 * See the EnvOption helper functions for the options that can be used to
 * configure the environment.
 */
export class CustomEnv extends EnvBase {
  constructor(opts?: EnvOptions) {
    const libraries = new Map<string, boolean>();
    if (opts?.libraries) {
      const libs = [...opts.libraries];
      for (let i = 0; i < libs.length; i++) {
        const lib = libs[i];
        libraries.set(
          isSingletonLibrary(lib) ? lib.libraryName() : i.toString(),
          true
        );
        opts = lib.compileOptions(opts);
      }
    }
    const registry = new Registry();
    super({
      container: new Container(),
      variables: [],
      functions: new Map(),
      macros: [],
      adapter: registry,
      provider: registry,
      features: new Map(),
      appliedFeatures: new Map(),
      libraries,
      costOptions: {},
      prsrOpts: {},
      chkOpts: {},
      progOpts: {},
    });
    this.configure(opts);
  }
}

const stdLib = new StdLibrary();
let stdEnv: CustomEnv | null = null;

/**
 * getStdEnv lazy initializes the CEL standard environment.
 */
function getStdEnv() {
  if (isNil(stdEnv)) {
    stdEnv = new CustomEnv({
      eagerlyValidateDeclarations: true,
      libraries: [stdLib],
    });
  }
  return stdEnv;
}

/**
 * Env creates a program environment configured with the standard library of
 * CEL functions and macros. The Env value returned can parse and check any CEL
 * program which builds upon the core features documented in the CEL
 * specification.
 *
 * See the EnvOption helper functions for the options that can be used to
 * configure the environment.
 */
export class Env extends CustomEnv {
  constructor(opts?: EnvOptions) {
    super();
    // Extend the statically configured standard environment, disabling eager
    // validation to ensure the cost of setup for the environment is still just
    // as cheap as it is in v0.11.x and earlier releases. The user provided
    // options can easily re-enable the eager validation as they are processed
    // after this default option.
    const stdOpts: EnvOptions = { eagerlyValidateDeclarations: false, ...opts };
    const env = getStdEnv();
    const extended = env.extend(stdOpts);
    if (extended instanceof Error) {
      throw extended;
    }
    return extended;
  }
}

/**
 * Issues defines methods for inspecting the error details of parse and check
 * calls.
 *
 * Note: in the future, non-fatal warnings and notices may be inspectable via
 * the Issues struct.
 */
export class Issues {
  #errs: Errors;
  #info?: SourceInfo;

  constructor(errs: Errors, info?: SourceInfo) {
    this.#errs = errs;
    this.#info = info;
  }

  /**
   * Err returns an error value if the issues list contains one or more errors.
   */
  err() {
    if (this.#errs.getErrors().length === 0) {
      return null;
    }
    return new Error(this.toString());
  }

  /**
   * Errors returns the collection of errors encountered in more granular
   * detail.
   */
  errors() {
    return this.#errs.getErrors();
  }

  /**
   * Append collects the issues from another Issues struct into a new Issues
   * object.
   */
  append(other: Issues) {
    return new Issues(this.#errs.append(other.errors()), this.#info);
  }

  toString() {
    return this.#errs.toDisplayString();
  }
}
