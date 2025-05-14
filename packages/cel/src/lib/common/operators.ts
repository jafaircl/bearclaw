// Symbolic operators.
export const CONDITIONAL_OPERATOR = '_?_:_';
export const LOGICAL_AND_OPERATOR = '_&&_';
export const LOGICAL_OR_OPERATOR = '_||_';
export const LOGICAL_NOT_OPERATOR = '!_';
export const EQUALS_OPERATOR = '_==_';
export const NOT_EQUALS_OPERATOR = '_!=_';
export const LESS_OPERATOR = '_<_';
export const LESS_EQUALS_OPERATOR = '_<=_';
export const GREATER_OPERATOR = '_>_';
export const GREATER_EQUALS_OPERATOR = '_>=_';
export const ADD_OPERATOR = '_+_';
export const SUBTRACT_OPERATOR = '_-_';
export const MULTIPLY_OPERATOR = '_*_';
export const DIVIDE_OPERATOR = '_/_';
export const MODULO_OPERATOR = '_%_';
export const NEGATE_OPERATOR = '-_';
export const INDEX_OPERATOR = '_[_]';
export const OPT_INDEX_OPERATOR = '_[?_]';
export const OPT_SELECT_OPERATOR = '_?._';

// Macros, must have a valid identifier.
export const HAS_MACRO = 'has';
export const ALL_MACRO = 'all';
export const EXISTS_MACRO = 'exists';
export const EXISTS_ONE_MACRO = 'exists_one';
export const MAP_MACRO = 'map';
export const FILTER_MACRO = 'filter';

// Named operators, must not have be valid identifiers.
export const NOT_STRICTLY_FALSE_OPERATOR = '@not_strictly_false';
export const IN_OPERATOR = '@in';

export function getOperatorFromText(text: string): string | undefined {
  switch (text) {
    case '?':
      return CONDITIONAL_OPERATOR;
    case '&&':
      return LOGICAL_AND_OPERATOR;
    case '||':
      return LOGICAL_OR_OPERATOR;
    case '!':
      return LOGICAL_NOT_OPERATOR;
    case '==':
      return EQUALS_OPERATOR;
    case '!=':
      return NOT_EQUALS_OPERATOR;
    case '<':
      return LESS_OPERATOR;
    case '<=':
      return LESS_EQUALS_OPERATOR;
    case '>':
      return GREATER_OPERATOR;
    case '>=':
      return GREATER_EQUALS_OPERATOR;
    case '+':
      return ADD_OPERATOR;
    case '-':
      return SUBTRACT_OPERATOR;
    case '*':
      return MULTIPLY_OPERATOR;
    case '/':
      return DIVIDE_OPERATOR;
    case '%':
      return MODULO_OPERATOR;
    case '[':
      return INDEX_OPERATOR;
    case 'has':
      return HAS_MACRO;
    case 'all':
      return ALL_MACRO;
    case 'exists':
      return EXISTS_MACRO;
    case 'exists_one':
      return EXISTS_ONE_MACRO;
    case 'map':
      return MAP_MACRO;
    case 'filter':
      return FILTER_MACRO;
    case '@not_strictly_false':
      return NOT_STRICTLY_FALSE_OPERATOR;
    case 'in':
      return IN_OPERATOR;
    case '[?':
      return OPT_INDEX_OPERATOR;
    case '?.':
      return OPT_SELECT_OPERATOR;
    default:
      return undefined;
  }
}

const operatorMap = new Map<
  string,
  { displayName: string; precedence: number; arity: number }
>([
  [CONDITIONAL_OPERATOR, { displayName: '', precedence: 8, arity: 3 }],
  [LOGICAL_OR_OPERATOR, { displayName: '||', precedence: 7, arity: 2 }],
  [LOGICAL_AND_OPERATOR, { displayName: '&&', precedence: 6, arity: 2 }],
  [EQUALS_OPERATOR, { displayName: '==', precedence: 5, arity: 2 }],
  [GREATER_OPERATOR, { displayName: '>', precedence: 5, arity: 2 }],
  [GREATER_EQUALS_OPERATOR, { displayName: '>=', precedence: 5, arity: 2 }],
  [LESS_OPERATOR, { displayName: '<', precedence: 5, arity: 2 }],
  [LESS_EQUALS_OPERATOR, { displayName: '<=', precedence: 5, arity: 2 }],
  [NOT_EQUALS_OPERATOR, { displayName: '!=', precedence: 5, arity: 2 }],
  [IN_OPERATOR, { displayName: 'in', precedence: 5, arity: 2 }],
  [ADD_OPERATOR, { displayName: '+', precedence: 4, arity: 2 }],
  [SUBTRACT_OPERATOR, { displayName: '-', precedence: 4, arity: 2 }],
  [DIVIDE_OPERATOR, { displayName: '/', precedence: 3, arity: 2 }],
  [MODULO_OPERATOR, { displayName: '%', precedence: 3, arity: 2 }],
  [MULTIPLY_OPERATOR, { displayName: '*', precedence: 3, arity: 2 }],
  [LOGICAL_NOT_OPERATOR, { displayName: '!', precedence: 2, arity: 1 }],
  [NEGATE_OPERATOR, { displayName: '-', precedence: 2, arity: 1 }],
  [INDEX_OPERATOR, { displayName: '', precedence: 1, arity: 2 }],
  [OPT_INDEX_OPERATOR, { displayName: '', precedence: 1, arity: 2 }],
  [OPT_SELECT_OPERATOR, { displayName: '', precedence: 1, arity: 2 }],
]);

export function findReverse(operator: string) {
  const op = operatorMap.get(operator);
  if (!op) {
    return '';
  }
  return op.displayName;
}

export function findReverseBinaryOperator(symbol: string) {
  const op = operatorMap.get(symbol);
  if (!op || op.arity !== 2) {
    return '';
  }
  if (op.displayName === '') {
    return '';
  }
  return op.displayName;
}

export function precedence(symbol: string) {
  const op = operatorMap.get(symbol);
  if (!op) {
    return 0;
  }
  return op.precedence;
}

export function arity(symbol: string) {
  const op = operatorMap.get(symbol);
  if (!op) {
    return -1;
  }
  return op.arity;
}
