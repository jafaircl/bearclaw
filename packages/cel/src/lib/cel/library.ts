/* eslint-disable @typescript-eslint/no-explicit-any */
import { isFunction, isNil } from '@bearclaw/is';
import { stdFunctions, stdTypes } from '../common/stdlib';
import { AllMacros } from '../parser/macro';
import { EnvOption, macros } from './options';

/**
 * These enums enable optional behavior in the library.  See the documentation
 * for each constant to see its effects, compatibility restrictions, and
 * standard conformance.
 */
export enum Feature {
  /**
   * Enable the tracking of function call expressions replaced by macros.
   */
  EnableMacroCallTracking,

  /**
   * Enable the use of cross-type numeric comparisons at the type-checker.
   */
  CrossTypeNumericComparisions,

  /**
   * Enable eager validation of declarations to ensure that Env values
   * created with `Extend` inherit a validated list of declarations from the
   * parent Env.
   */
  EagerlyValidateDeclarations,

  /**
   * Enable the use of the default UTC timezone when a timezone is not
   * specified on a CEL timestamp operation. This fixes the scenario where
   * the input time is not already in UTC.
   */
  DefaultUTCTimeZone,

  /**
   * Enable the serialization of logical operator ASTs as variadic calls, thus
   * compressing the logic graph to a single call when multiple like-operator
   * expressions occur: e.g. a && b && c && d -> call(_&&_, [a, b, c, d])
   */
  VariadicLogicalASTs,

  /**
   * Enable error generation when a presence test or optional field selection
   * is performed on a primitive type.
   */
  EnableErrorOnBadPresenceTest,

  /**
   * Enable escape syntax for field identifiers (`).
   */
  IdentEscapeSyntax,
}

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
   * CompileOptions returns a collection of functional options for configuring
   * the Parse / Check environment.
   */
  compileOptions(): EnvOption[];

  /**
   * ProgramOptions returns a collection of functional options which should be
   * included in every Program generated from the Env.Program() call.
   */
  programOptions(): any[]; // TODO: need to define this type
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
 * Lib creates an EnvOption out of a Library, allowing libraries to be provided
 * as functional args, and to be linked to each other.
 */
export function lib(l: Library): EnvOption {
  return (e) => {
    if (isSingletonLibrary(l)) {
      if (e.hasLibrary(l.libraryName())) {
        return e;
      }
      e.libraries.set(l.libraryName(), true);
    }
    for (const opt of l.compileOptions()) {
      e = opt(e);
    }
    e.progOpts.push(...l.programOptions());
    return e;
  };
}

/**
 * StdLib returns an EnvOption for the standard library of CEL functions and
 * macros.
 */
export function StdLib() {
  return lib(new stdLibrary());
}

/**
 * StdLibrary implements the Library interface and provides functional options
 * for the core CEL features documented in the specification.
 */
export class stdLibrary implements SingletonLibrary {
  libraryName() {
    return 'cel.lib.std';
  }

  compileOptions(): EnvOption[] {
    return [
      // Set standard functions
      (e) => {
        for (const fn of stdFunctions) {
          const existing = e.functions.get(fn.name());
          if (!isNil(existing)) {
            existing.merge(fn);
          }
          e.functions.set(fn.name(), fn);
        }
        return e;
      },
      // Set standard types
      (e) => {
        for (const t of stdTypes) {
          e.variables.push(t);
        }
        return e;
      },
      // Set standard macros
      macros(...AllMacros),
    ];
  }

  programOptions() {
    return [];
  }
}

// TODO: optionals and time-zoned timestamps
