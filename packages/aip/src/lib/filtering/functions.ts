import { Decl } from '@buf/googleapis_googleapis.bufbuild_es/google/api/expr/v1alpha1/checked_pb.js';
import { newFunctionDeclaration, newFunctionOverload } from './declarations';
import {
  TypeBool,
  TypeDuration,
  TypeFloat,
  TypeInt,
  typeList,
  typeMap,
  TypeString,
  TypeTimestamp,
} from './types';

// Standard function names.
export const FunctionFuzzyAnd = 'FUZZY';
export const FunctionAnd = 'AND';
export const FunctionOr = 'OR';
export const FunctionNot = 'NOT';
export const FunctionEquals = '=';
export const FunctionNotEquals = '!=';
export const FunctionLessThan = '<';
export const FunctionLessEquals = '<=';
export const FunctionGreaterEquals = '>=';
export const FunctionGreaterThan = '>';
export const FunctionHas = ':';
export const FunctionDuration = 'duration';
export const FunctionTimestamp = 'timestamp';

/**
 * StandardFunctionDeclarations returns declarations for all standard functions
 * and their standard overloads.
 */
export function standardFunctionDeclarations(): Decl[] {
  return [
    standardFunctionTimestamp(),
    standardFunctionDuration(),
    standardFunctionHas(),
    standardFunctionAnd(),
    standardFunctionOr(),
    standardFunctionNot(),
    standardFunctionLessThan(),
    standardFunctionLessEquals(),
    standardFunctionGreaterThan(),
    standardFunctionGreaterEquals(),
    standardFunctionEquals(),
    standardFunctionNotEquals(),
  ];
}

// Timestamp overloads.
export const FunctionOverloadTimestampString = `${FunctionTimestamp}_string`;

/**
 * StandardFunctionTimestamp returns a declaration for the standard `timestamp`
 * function and all its standard overloads.
 */
export function standardFunctionTimestamp(): Decl {
  return newFunctionDeclaration(
    FunctionTimestamp,
    newFunctionOverload(
      FunctionOverloadTimestampString,
      TypeTimestamp,
      TypeString
    )
  );
}

// Duration overloads.
export const FunctionOverloadDurationString = `${FunctionDuration}_string`;

/**
 * StandardFunctionDuration returns a declaration for the standard `duration`
 * function and all its standard overloads.
 */
export function standardFunctionDuration(): Decl {
  return newFunctionDeclaration(
    FunctionDuration,
    newFunctionOverload(
      FunctionOverloadDurationString,
      TypeDuration,
      TypeString
    )
  );
}

// Has overloads.
export const FunctionOverloadHasString = `${FunctionHas}_string`;
export const FunctionOverloadHasMapStringString = `${FunctionHas}_map_string_string`;
export const FunctionOverloadHasListString = `${FunctionHas}_list_string`;

/**
 * StandardFunctionHas returns a declaration for the standard `:` function
 * and all its standard overloads.
 */
export function standardFunctionHas(): Decl {
  return newFunctionDeclaration(
    FunctionHas,
    newFunctionOverload(
      FunctionOverloadHasString,
      TypeBool,
      TypeString,
      TypeString
    ),
    // TODO: Remove this after implementing support for type parameters.
    newFunctionOverload(
      FunctionOverloadHasMapStringString,
      TypeBool,
      typeMap(TypeString, TypeString),
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadHasListString,
      TypeBool,
      typeList(TypeString),
      TypeString
    )
  );
}

// And Overloads
export const FunctionOverloadAndBool = `${FunctionAnd}_bool`;

/**
 * StandardFunctionAnd returns a declaration for the standard `AND` function
 * and all its standard overloads.
 */
export function standardFunctionAnd(): Decl {
  return newFunctionDeclaration(
    FunctionAnd,
    newFunctionOverload(FunctionOverloadAndBool, TypeBool, TypeBool, TypeBool)
  );
}

// Or overloads.
export const FunctionOverloadOrBool = `${FunctionOr}_bool`;

/**
 * StandardFunctionOr returns a declaration for the standard `OR` function
 * and all its standard overloads.
 */
export function standardFunctionOr(): Decl {
  return newFunctionDeclaration(
    FunctionOr,
    newFunctionOverload(FunctionOverloadOrBool, TypeBool, TypeBool, TypeBool)
  );
}

// Not overloads.
export const FunctionOverloadNotBool = `${FunctionNot}_bool`;

/**
 * StandardFunctionNot returns a declaration for the standard `NOT` function
 * and all its standard overloads.
 */
export function standardFunctionNot(): Decl {
  return newFunctionDeclaration(
    FunctionNot,
    newFunctionOverload(FunctionOverloadNotBool, TypeBool, TypeBool)
  );
}

// LessThan overloads.
export const FunctionOverloadLessThanInt = `${FunctionLessThan}_int`;
export const FunctionOverloadLessThanFloat = `${FunctionLessThan}_float`;
export const FunctionOverloadLessThanString = `${FunctionLessThan}_string`;
export const FunctionOverloadLessThanTimestamp = `${FunctionLessThan}_timestamp`;
export const FunctionOverloadLessThanTimestampString = `${FunctionLessThan}_timestamp_string`;
export const FunctionOverloadLessThanDuration = `${FunctionLessThan}_duration`;

/**
 * StandardFunctionLessThan returns a declaration for the standard '<' function
 * and all its standard overloads.
 */
export function standardFunctionLessThan(): Decl {
  return newFunctionDeclaration(
    FunctionLessThan,
    newFunctionOverload(
      FunctionOverloadLessThanInt,
      TypeBool,
      TypeInt,
      TypeInt
    ),
    newFunctionOverload(
      FunctionOverloadLessThanFloat,
      TypeBool,
      TypeFloat,
      TypeFloat
    ),
    newFunctionOverload(
      FunctionOverloadLessThanString,
      TypeBool,
      TypeString,
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadLessThanTimestamp,
      TypeBool,
      TypeTimestamp,
      TypeTimestamp
    ),
    newFunctionOverload(
      FunctionOverloadLessThanTimestampString,
      TypeBool,
      TypeTimestamp,
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadLessThanDuration,
      TypeBool,
      TypeDuration,
      TypeDuration
    )
  );
}

// GreaterThan overloads.
export const FunctionOverloadGreaterThanInt = `${FunctionGreaterThan}_int`;
export const FunctionOverloadGreaterThanFloat = `${FunctionGreaterThan}_float`;
export const FunctionOverloadGreaterThanString = `${FunctionGreaterThan}_string`;
export const FunctionOverloadGreaterThanTimestamp = `${FunctionGreaterThan}_timestamp`;
export const FunctionOverloadGreaterThanTimestampString = `${FunctionGreaterThan}_timestamp_string`;
export const FunctionOverloadGreaterThanDuration = `${FunctionGreaterThan}_duration`;

/**
 * StandardFunctionGreaterThan returns a declaration for the standard '>' function
 * and all its standard overloads.
 */
export function standardFunctionGreaterThan(): Decl {
  return newFunctionDeclaration(
    FunctionGreaterThan,
    newFunctionOverload(
      FunctionOverloadGreaterThanInt,
      TypeBool,
      TypeInt,
      TypeInt
    ),
    newFunctionOverload(
      FunctionOverloadGreaterThanFloat,
      TypeBool,
      TypeFloat,
      TypeFloat
    ),
    newFunctionOverload(
      FunctionOverloadGreaterThanString,
      TypeBool,
      TypeString,
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadGreaterThanTimestamp,
      TypeBool,
      TypeTimestamp,
      TypeTimestamp
    ),
    newFunctionOverload(
      FunctionOverloadGreaterThanTimestampString,
      TypeBool,
      TypeTimestamp,
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadGreaterThanDuration,
      TypeBool,
      TypeDuration,
      TypeDuration
    )
  );
}

// LessEquals overloads.
export const FunctionOverloadLessEqualsInt = `${FunctionLessEquals}_int`;
export const FunctionOverloadLessEqualsFloat = `${FunctionLessEquals}_float`;
export const FunctionOverloadLessEqualsString = `${FunctionLessEquals}_string`;
export const FunctionOverloadLessEqualsTimestamp = `${FunctionLessEquals}_timestamp`;
export const FunctionOverloadLessEqualsTimestampString = `${FunctionLessEquals}_timestamp_string`;
export const FunctionOverloadLessEqualsDuration = `${FunctionLessEquals}_duration`;

/**
 * StandardFunctionLessEquals returns a declaration for the standard '<=' function
 * and all its standard overloads.
 */
export function standardFunctionLessEquals(): Decl {
  return newFunctionDeclaration(
    FunctionLessEquals,
    newFunctionOverload(
      FunctionOverloadLessEqualsInt,
      TypeBool,
      TypeInt,
      TypeInt
    ),
    newFunctionOverload(
      FunctionOverloadLessEqualsFloat,
      TypeBool,
      TypeFloat,
      TypeFloat
    ),
    newFunctionOverload(
      FunctionOverloadLessEqualsString,
      TypeBool,
      TypeString,
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadLessEqualsTimestamp,
      TypeBool,
      TypeTimestamp,
      TypeTimestamp
    ),
    newFunctionOverload(
      FunctionOverloadLessEqualsTimestampString,
      TypeBool,
      TypeTimestamp,
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadLessEqualsDuration,
      TypeBool,
      TypeDuration,
      TypeDuration
    )
  );
}

// GreaterEquals overloads.
export const FunctionOverloadGreaterEqualsInt = `${FunctionGreaterEquals}_int`;
export const FunctionOverloadGreaterEqualsFloat = `${FunctionGreaterEquals}_float`;
export const FunctionOverloadGreaterEqualsString = `${FunctionGreaterEquals}_string`;
export const FunctionOverloadGreaterEqualsTimestamp = `${FunctionGreaterEquals}_timestamp`;
export const FunctionOverloadGreaterEqualsTimestampString = `${FunctionGreaterEquals}_timestamp_string`;
export const FunctionOverloadGreaterEqualsDuration = `${FunctionGreaterEquals}_duration`;

/**
 * StandardFunctionGreaterEquals returns a declaration for the standard '>=' function
 * and all its standard overloads.
 */
export function standardFunctionGreaterEquals(): Decl {
  return newFunctionDeclaration(
    FunctionGreaterEquals,
    newFunctionOverload(
      FunctionOverloadGreaterEqualsInt,
      TypeBool,
      TypeInt,
      TypeInt
    ),
    newFunctionOverload(
      FunctionOverloadGreaterEqualsFloat,
      TypeBool,
      TypeFloat,
      TypeFloat
    ),
    newFunctionOverload(
      FunctionOverloadGreaterEqualsString,
      TypeBool,
      TypeString,
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadGreaterEqualsTimestamp,
      TypeBool,
      TypeTimestamp,
      TypeTimestamp
    ),
    newFunctionOverload(
      FunctionOverloadGreaterEqualsTimestampString,
      TypeBool,
      TypeTimestamp,
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadGreaterEqualsDuration,
      TypeBool,
      TypeDuration,
      TypeDuration
    )
  );
}

// Equals overloads.
export const FunctionOverloadEqualsBool = `${FunctionEquals}_bool`;
export const FunctionOverloadEqualsInt = `${FunctionEquals}_int`;
export const FunctionOverloadEqualsFloat = `${FunctionEquals}_float`;
export const FunctionOverloadEqualsString = `${FunctionEquals}_string`;
export const FunctionOverloadEqualsTimestamp = `${FunctionEquals}_timestamp`;
export const FunctionOverloadEqualsTimestampString = `${FunctionEquals}_timestamp_string`;
export const FunctionOverloadEqualsDuration = `${FunctionEquals}_duration`;

/**
 * StandardFunctionEquals returns a declaration for the standard '=' function
 * and all its standard overloads.
 */
export function standardFunctionEquals(): Decl {
  return newFunctionDeclaration(
    FunctionEquals,
    newFunctionOverload(
      FunctionOverloadEqualsBool,
      TypeBool,
      TypeBool,
      TypeBool
    ),
    newFunctionOverload(FunctionOverloadEqualsInt, TypeBool, TypeInt, TypeInt),
    newFunctionOverload(
      FunctionOverloadEqualsFloat,
      TypeBool,
      TypeFloat,
      TypeFloat
    ),
    newFunctionOverload(
      FunctionOverloadEqualsString,
      TypeBool,
      TypeString,
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadEqualsTimestamp,
      TypeBool,
      TypeTimestamp,
      TypeTimestamp
    ),
    newFunctionOverload(
      FunctionOverloadEqualsTimestampString,
      TypeBool,
      TypeTimestamp,
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadEqualsDuration,
      TypeBool,
      TypeDuration,
      TypeDuration
    )
  );
}

// NotEquals overloads.
export const FunctionOverloadNotEqualsBool = `${FunctionNotEquals}_bool`;
export const FunctionOverloadNotEqualsInt = `${FunctionNotEquals}_int`;
export const FunctionOverloadNotEqualsFloat = `${FunctionNotEquals}_float`;
export const FunctionOverloadNotEqualsString = `${FunctionNotEquals}_string`;
export const FunctionOverloadNotEqualsTimestamp = `${FunctionNotEquals}_timestamp`;
export const FunctionOverloadNotEqualsTimestampString = `${FunctionNotEquals}_timestamp_string`;
export const FunctionOverloadNotEqualsDuration = `${FunctionNotEquals}_duration`;

/**
 * StandardFunctionNotEquals returns a declaration for the standard '!='
 * function and all its standard overloads.
 */
export function standardFunctionNotEquals(): Decl {
  return newFunctionDeclaration(
    FunctionNotEquals,
    newFunctionOverload(
      FunctionOverloadNotEqualsBool,
      TypeBool,
      TypeBool,
      TypeBool
    ),
    newFunctionOverload(
      FunctionOverloadNotEqualsInt,
      TypeBool,
      TypeInt,
      TypeInt
    ),
    newFunctionOverload(
      FunctionOverloadNotEqualsFloat,
      TypeBool,
      TypeFloat,
      TypeFloat
    ),
    newFunctionOverload(
      FunctionOverloadNotEqualsString,
      TypeBool,
      TypeString,
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadNotEqualsTimestamp,
      TypeBool,
      TypeTimestamp,
      TypeTimestamp
    ),
    newFunctionOverload(
      FunctionOverloadNotEqualsTimestampString,
      TypeBool,
      TypeTimestamp,
      TypeString
    ),
    newFunctionOverload(
      FunctionOverloadNotEqualsDuration,
      TypeBool,
      TypeDuration,
      TypeDuration
    )
  );
}
