/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction } from '@bearclaw/is';
import { stdFunctions, stdTypes } from '../common/stdlib';
import { AllMacros } from '../parser/macro';
import { Declaration } from './decls';
import { EnvOptions, ProgramOptions } from './options';

/**
 * Library provides a collection of EnvOption and ProgramOption values used to
 * configure a CEL environment for a particular use case or with a related set
 * of functionality.
 *
 * Note, the ProgramOption values provided by a library are expected to be
 * static and not vary between calls to Env.Program(). If there is a need for
 * such dynamic configuration, prefer to configure these options outside the
 * Library and within the Env.Program() call directly.
 */
export interface Library {
  /**
   * CompileOptions returns a collection of options for configuring the Parse /
   * Check environment.
   */
  compileOptions(opts?: EnvOptions): EnvOptions;

  /**
   * ProgramOptions returns a collection of options which should be included in
   * every Program generated from the Env.Program() call.
   */
  programOptions(opts?: ProgramOptions): ProgramOptions;
}

export function isLibrary(value: any): value is Library {
  return (
    value &&
    isFunction(value['compileOptions']) &&
    isFunction(value['programOptions'])
  );
}

/**
 * SingletonLibrary refines the Library interface to ensure that libraries in
 * this format are only configured once within the environment.
 */
export interface SingletonLibrary extends Library {
  /**
   * LibraryName provides a namespaced name which is used to check whether the
   * library has already
   */
  libraryName(): string;
}

export function isSingletonLibrary(value: any): value is SingletonLibrary {
  return value && isFunction(value['libraryName']) && isLibrary(value);
}

/**
 * StdLibrary implements the Library interface and provides functional options
 * for the core CEL features documented in the specification.
 */
export class StdLibrary implements SingletonLibrary {
  libraryName(): string {
    return 'cel.lib.std';
  }

  compileOptions(opts: EnvOptions = {}): EnvOptions {
    const declarations: Declaration[] = opts.declarations || [];
    for (const fn of stdFunctions) {
      declarations.push(fn);
    }
    for (const type of stdTypes) {
      declarations.push(type);
    }
    const macros = new Set(opts.macros || []);
    for (const macro of AllMacros) {
      // TODO: need a better check here
      if (!macros.has(macro)) {
        macros.add(macro);
      }
    }
    return {
      ...opts,
      declarations,
      macros: [...macros],
    };
  }

  programOptions(): ProgramOptions {
    return {};
  }
}
