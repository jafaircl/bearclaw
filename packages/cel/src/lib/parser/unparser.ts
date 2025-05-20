import { toJsonString } from '@bufbuild/protobuf';
import { DurationSchema, TimestampSchema } from '@bufbuild/protobuf/wkt';
import { AST } from '../common/ast.js';
import {
  ADD_OPERATOR,
  arity,
  CONDITIONAL_OPERATOR,
  DIVIDE_OPERATOR,
  EQUALS_OPERATOR,
  findReverse,
  findReverseBinaryOperator,
  GREATER_EQUALS_OPERATOR,
  GREATER_OPERATOR,
  IN_OPERATOR,
  INDEX_OPERATOR,
  LESS_EQUALS_OPERATOR,
  LESS_OPERATOR,
  LOGICAL_AND_OPERATOR,
  LOGICAL_NOT_OPERATOR,
  LOGICAL_OR_OPERATOR,
  MODULO_OPERATOR,
  MULTIPLY_OPERATOR,
  NEGATE_OPERATOR,
  NOT_EQUALS_OPERATOR,
  OPT_INDEX_OPERATOR,
  OPT_SELECT_OPERATOR,
  precedence,
  SUBTRACT_OPERATOR,
} from '../common/operators.js';
import { Constant, Expr, Expr_Call } from '../protogen/cel/expr/syntax_pb.js';

/**
 * UnparserOption is a functional option for configuring the output formatting
 * of the Unparse function.
 */
export type UnparserOption = (unparser: Unparser) => Unparser;

interface UnparserOptions {
  wrapOnColumn: number;
  operatorsToWrapOn: Set<string>;
  wrapAfterColumnLimit: boolean;
}

/**
 * Unparse takes an input expression and source position information and
 * generates a human-readable expression.
 *
 * Note, unparsing an AST will often generate the same expression as was
 * originally parsed, but some formatting may be lost in translation, notably:
 *
 * - All quoted literals are doubled quoted.
 * - Byte literals are represented as octal escapes (same as Google SQL).
 * - Floating point values are converted to the small number of digits needed to represent the value.
 * - Spacing around punctuation marks may be lost.
 * - Parentheses will only be applied when they affect operator precedence.
 *
 * This function optionally takes in one or more UnparserOption to alter the
 * unparsing behavior, such as performing word wrapping on expressions.
 */
export function unparse(expr: AST, ...opts: UnparserOption[]) {
  const unparser = new Unparser(expr, ...opts);
  return unparser.unparse();
}

/**
 * unparser visits an expression to reconstruct a human-readable string from an AST.
 */
class Unparser {
  private _str = '';
  private _lastWrappedIndex = 0;
  private _expr: AST;
  options: UnparserOptions = {
    wrapOnColumn: 80,
    operatorsToWrapOn: new Set([LOGICAL_AND_OPERATOR, LOGICAL_OR_OPERATOR]),
    wrapAfterColumnLimit: true,
  };

  constructor(expr: AST, ...opts: UnparserOption[]) {
    this._expr = expr;
    for (const opt of opts) {
      opt(this);
    }
  }

  unparse() {
    const expr = this._expr.expr();
    if (!expr) {
      return '';
    }
    this._visit(expr);
    return this._str;
  }

  private _visit(expr: Expr) {
    const visited = this._visitMaybeMacroCall(expr);
    if (visited) {
      return;
    }
    switch (expr.exprKind.case) {
      case 'callExpr':
        return this._visitCall(expr);
      case 'constExpr':
        return this._visitConst(expr);
      case 'identExpr':
        return this._visitIdent(expr);
      case 'listExpr':
        return this._visitList(expr);
      case 'selectExpr':
        return this._visitSelect(expr);
      case 'structExpr':
        return this._visitStruct(expr);
      default:
        throw new Error(`Unsupported expression: ${expr.exprKind.case}`);
    }
  }

  private _visitCall(expr: Expr) {
    if (expr.exprKind.case !== 'callExpr') {
      throw new Error('Expected callExpr');
    }
    const c = expr.exprKind.value;
    const fun = c.function;
    switch (fun) {
      // ternary operator
      case CONDITIONAL_OPERATOR:
        return this._visitCallConditional(expr);
      // optional select operator
      case OPT_SELECT_OPERATOR:
        return this._visitOptSelect(expr);
      // index operator
      case INDEX_OPERATOR:
        return this._visitCallIndex(expr);
      // optional index operator
      case OPT_INDEX_OPERATOR:
        return this._visitCallOptIndex(expr);
      // unary operators
      case LOGICAL_NOT_OPERATOR:
      case NEGATE_OPERATOR:
        return this._visitCallUnary(expr);
      // binary operators
      case ADD_OPERATOR:
      case DIVIDE_OPERATOR:
      case EQUALS_OPERATOR:
      case GREATER_OPERATOR:
      case GREATER_EQUALS_OPERATOR:
      case IN_OPERATOR:
      case LESS_OPERATOR:
      case LESS_EQUALS_OPERATOR:
      case LOGICAL_AND_OPERATOR:
      case LOGICAL_OR_OPERATOR:
      case MODULO_OPERATOR:
      case MULTIPLY_OPERATOR:
      case NOT_EQUALS_OPERATOR:
      case SUBTRACT_OPERATOR:
        return this._visitCallBinary(expr);
      // standard function calls.
      default:
        return this._visitCallFunc(expr);
    }
  }

  private _visitCallBinary(expr: Expr) {
    if (expr.exprKind.case !== 'callExpr') {
      throw new Error('Expected callExpr');
    }
    const c = expr.exprKind.value;
    const fun = c.function;
    const args = c.args;
    const lhs = args[0];
    // add parens if the current operator is lower precedence than the lhs expr operator.
    const lhsParen = isComplexOperatorWithRespectTo(fun, lhs);
    const rhs = args[1];
    // add parens if the current operator is lower precedence than the rhs expr operator,
    // or the same precedence and the operator is left recursive.
    let rhsParen = isComplexOperatorWithRespectTo(fun, rhs);
    if (!rhsParen && isLeftRecursive(fun)) {
      rhsParen = isSamePrecedence(fun, rhs);
    }
    this._visitMaybeNested(lhs, lhsParen);
    const unmangled = findReverseBinaryOperator(fun);
    if (!unmangled) {
      throw new Error(`Cannot unmangle operator: ${fun}`);
    }

    this._writeOperatorWithWrapping(fun, unmangled);
    return this._visitMaybeNested(rhs, rhsParen);
  }

  private _visitCallConditional(expr: Expr) {
    if (expr.exprKind.case !== 'callExpr') {
      throw new Error('Expected callExpr');
    }
    const c = expr.exprKind.value;
    const args = c.args;
    // add parens if operand is a conditional itself.
    let nested =
      isSamePrecedence(CONDITIONAL_OPERATOR, args[0]) ||
      isComplexOperator(args[0]);
    this._visitMaybeNested(args[0], nested);
    this._writeOperatorWithWrapping(CONDITIONAL_OPERATOR, '?');

    // add parens if operand is a conditional itself.
    nested =
      isSamePrecedence(CONDITIONAL_OPERATOR, args[1]) ||
      isComplexOperator(args[1]);
    this._visitMaybeNested(args[1], nested);

    this._str += ' : ';

    // add parens if operand is a conditional itself.
    nested =
      isSamePrecedence(CONDITIONAL_OPERATOR, args[2]) ||
      isComplexOperator(args[2]);

    return this._visitMaybeNested(args[2], nested);
  }

  private _visitCallFunc(expr: Expr) {
    if (expr.exprKind.case !== 'callExpr') {
      throw new Error('Expected callExpr');
    }
    const c = expr.exprKind.value;
    const fun = c.function;
    const args = c.args;
    if (c.target) {
      const nested = isBinaryOrTernaryOperator(c.target);
      this._visitMaybeNested(c.target, nested);
      this._str += '.';
    }
    this._str += fun;
    this._str += '(';
    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      this._visit(arg);
      if (i < args.length - 1) {
        this._str += ', ';
      }
    }
    this._str += ')';
  }

  private _visitCallIndex(expr: Expr) {
    return this._visitCallIndexInternal(expr, '[');
  }

  private _visitCallOptIndex(expr: Expr) {
    return this._visitCallIndexInternal(expr, '[?');
  }

  private _visitCallIndexInternal(expr: Expr, op: string) {
    if (expr.exprKind.case !== 'callExpr') {
      throw new Error('Expected callExpr');
    }
    const c = expr.exprKind.value;
    const args = c.args;
    const nested = isBinaryOrTernaryOperator(args[0]);
    this._visitMaybeNested(args[0], nested);
    this._str += op;
    this._visit(args[1]);
    this._str += ']';
  }

  private _visitCallUnary(expr: Expr) {
    if (expr.exprKind.case !== 'callExpr') {
      throw new Error('Expected callExpr');
    }
    const c = expr.exprKind.value;
    const fun = c.function;
    const args = c.args;
    const unmangled = findReverse(fun);
    if (!unmangled) {
      throw new Error(`Cannot unmangle operator: ${fun}`);
    }
    this._str += unmangled;
    const nested = isComplexOperator(args[0]);
    return this._visitMaybeNested(args[0], nested);
  }

  private _visitConst(expr: Expr) {
    if (expr.exprKind.case !== 'constExpr') {
      throw new Error('Expected constExpr');
    }
    const val = expr.exprKind.value;
    this._visitConstVal(val);
  }

  private _visitConstVal(val: Constant) {
    switch (val.constantKind.case) {
      case 'boolValue':
        this._str += val.constantKind.value ? 'true' : 'false';
        break;
      case 'bytesValue':
        this._str += `b"${bytesToOctets(val.constantKind.value)}"`;
        break;
      case 'doubleValue':
        // Make sure double values are printed with a decimal point.
        if (val.constantKind.value % 1 === 0) {
          this._str += val.constantKind.value.toString() + '.0';
        } else {
          this._str += val.constantKind.value.toString();
        }
        break;
      case 'int64Value':
        this._str += val.constantKind.value.toString();
        break;
      case 'uint64Value':
        this._str += val.constantKind.value.toString() + 'u';
        break;
      case 'nullValue':
        this._str += 'null';
        break;
      case 'stringValue':
        this._str += `"${val.constantKind.value}"`;
        break;
      case 'durationValue':
        this._str += `duration("${toJsonString(
          DurationSchema,
          val.constantKind.value
        )}")`;
        break;
      case 'timestampValue':
        this._str += `timestamp("${toJsonString(
          TimestampSchema,
          val.constantKind.value
        )}")`;
        break;
      default:
        throw new Error('Unsupported constant type');
    }
  }

  private _visitIdent(expr: Expr) {
    if (expr.exprKind.case !== 'identExpr') {
      throw new Error('Expected identExpr');
    }
    const id = expr.exprKind.value;
    this._str += id.name;
  }

  private _visitList(expr: Expr) {
    if (expr.exprKind.case !== 'listExpr') {
      throw new Error('Expected listExpr');
    }
    const l = expr.exprKind.value;
    const elems = l.elements;
    const optIndicies = l.optionalIndices;
    this._str += '[';
    for (let i = 0; i < elems.length; i += 1) {
      const elem = elems[i];
      if (optIndicies.indexOf(i) !== -1) {
        this._str += '?';
      }
      this._visit(elem);
      if (i < elems.length - 1) {
        this._str += ', ';
      }
    }
    this._str += ']';
  }

  private _visitOptSelect(expr: Expr) {
    if (expr.exprKind.case !== 'callExpr') {
      throw new Error('Expected callExpr');
    }
    const c = expr.exprKind.value;
    const args = c.args;
    const operand = args[0];
    const field = exprAsLiteral(args[1]) as string;
    return this._visitSelectInternal(operand, false, '.?', field);
  }

  private _visitSelect(expr: Expr) {
    if (expr.exprKind.case !== 'selectExpr') {
      throw new Error('Expected selectExpr');
    }
    const sel = expr.exprKind.value;
    return this._visitSelectInternal(
      sel.operand as Expr,
      sel.testOnly,
      '.',
      sel.field
    );
  }

  private _visitSelectInternal(
    operand: Expr,
    testOnly: boolean,
    op: string,
    field: string
  ) {
    // handle the case when the select expression was generated by the has() macro.
    if (testOnly) {
      this._str += 'has(';
    }
    const nested = !testOnly && isBinaryOrTernaryOperator(operand);
    this._visitMaybeNested(operand, nested);
    this._str += op;
    this._str += maybeQuoteField(field);
    if (testOnly) {
      this._str += ')';
    }
  }

  private _visitStruct(expr: Expr) {
    if (expr.exprKind.case !== 'structExpr') {
      throw new Error('Expected structExpr');
    }
    if (expr.exprKind.value.messageName !== '') {
      return this._visitStructMsg(expr);
    }
    return this._visitStructMap(expr);
  }

  private _visitStructMsg(expr: Expr) {
    if (expr.exprKind.case !== 'structExpr') {
      throw new Error('Expected structExpr');
    }
    const m = expr.exprKind.value;
    const fields = m.entries;
    this._str += m.messageName;
    this._str += '{';
    for (let i = 0; i < fields.length; i += 1) {
      const field = fields[i];
      const f = field.keyKind.value as string;
      if (field.optionalEntry) {
        this._str += '?';
      }
      this._str += maybeQuoteField(f);
      this._str += ': ';
      const v = field.value as Expr;
      this._visit(v);
      if (i < fields.length - 1) {
        this._str += ', ';
      }
    }
    this._str += '}';
  }

  private _visitStructMap(expr: Expr) {
    if (expr.exprKind.case !== 'structExpr') {
      throw new Error('Expected structExpr');
    }
    const m = expr.exprKind.value;
    const entries = m.entries;
    this._str += '{';
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      const k = entry.keyKind.value as Expr;
      if (entry.optionalEntry) {
        this._str += '?';
      }
      this._visit(k);
      this._str += ': ';
      const v = entry.value as Expr;
      this._visit(v);
      if (i < entries.length - 1) {
        this._str += ', ';
      }
    }
    this._str += '}';
  }

  private _visitMaybeMacroCall(expr: Expr) {
    const call = this._expr.sourceInfo().getMacroCall(expr.id);
    if (!call) {
      return false;
    }
    this._visit(call);
    return true;
  }

  private _visitMaybeNested(expr: Expr, nested: boolean) {
    if (nested) {
      this._str += '(';
    }
    this._visit(expr);
    if (nested) {
      this._str += ')';
    }
  }

  /**
   * writeOperatorWithWrapping outputs the operator and inserts a newline for operators configured
   * in the unparser options.
   */
  private _writeOperatorWithWrapping(fun: string, unmangled: string) {
    const wrapOperatorExists = this.options.operatorsToWrapOn.has(fun);
    const lineLength = this._str.length - this._lastWrappedIndex + fun.length;

    if (wrapOperatorExists && lineLength >= this.options.wrapOnColumn) {
      this._lastWrappedIndex = this._str.length;
      // wrapAfterColumnLimit flag dictates whether the newline is placed
      // before or after the operator
      if (this.options.wrapAfterColumnLimit) {
        this._str += ` ${unmangled}\n`;
      } else {
        this._str += `\n${unmangled} `;
      }
      return true;
    }
    this._str += ` ${unmangled} `;
    return false;
  }
}

/**
 * isLeftRecursive indicates whether the parser resolves the call in a
 * left-recursive manner as this can have an effect of how parentheses affect
 * the order of operations in the AST.
 */
function isLeftRecursive(op: string) {
  return op !== LOGICAL_OR_OPERATOR && op !== LOGICAL_AND_OPERATOR;
}

/**
 * isSamePrecedence indicates whether the precedence of the input operator is
 * the same as the precedence of the (possible) operation represented in the
 * input Expr.
 *
 * If the expr is not a Call, the result is false.
 */
function isSamePrecedence(op: string, expr: Expr) {
  if (expr.exprKind.case !== 'callExpr') {
    return false;
  }
  return precedence(op) === precedence(expr.exprKind.value.function);
}

/**
 * isLowerPrecedence indicates whether the precedence of the input operator is
 * lower precedence than the (possible) operation represented in the input Expr.
 *
 * If the expr is not a Call, the result is false.
 */
function isLowerPrecedence(op: string, expr: Expr) {
  return (
    precedence(op) < precedence((expr.exprKind.value as Expr_Call).function)
  );
}

/**
 * Indicates whether the expr is a complex operator, i.e., a call expression
 * with 2 or more arguments.
 */
function isComplexOperator(expr: Expr) {
  if (
    expr.exprKind.case == 'callExpr' &&
    expr.exprKind.value.args.length >= 2
  ) {
    return true;
  }
  return false;
}

/**
 * Indicates whether it is a complex operation compared to another.
 * expr is *not* considered complex if it is not a call expression or has
 * less than two arguments, or if it has a higher precedence than op.
 */
function isComplexOperatorWithRespectTo(op: string, expr: Expr) {
  if (
    expr.exprKind.case !== 'callExpr' ||
    expr.exprKind.value.args.length < 2
  ) {
    return false;
  }
  return isLowerPrecedence(op, expr);
}

/**
 * Indicate whether this is a binary or ternary operator.
 */
function isBinaryOrTernaryOperator(expr: Expr) {
  if (
    expr.exprKind.case !== 'callExpr' ||
    expr.exprKind.value.args.length < 2
  ) {
    return false;
  }
  const isBinaryOp =
    findReverseBinaryOperator(expr.exprKind.value.function) !== '';
  return isBinaryOp || isSamePrecedence(CONDITIONAL_OPERATOR, expr);
}

/**
 * bytesToOctets converts byte sequences to a string using a three digit octal
 * encoded value per byte.
 */
function bytesToOctets(bytes: Uint8Array): string {
  let result = '';
  for (const byte of bytes) {
    result += `\\${byte.toString(8).padStart(3, '0')}`;
  }
  return result;
}

function maybeQuoteField(field: string) {
  // Field names can only be alphanumeric, underscore, and cannot be
  // a reserved keyword.
  if (/^[A-Za-z_][0-9A-Za-z_]*$/.test(field) && field !== 'in') {
    return field;
  }
  return '`' + field + '`';
}

function exprAsLiteral(expr: Expr) {
  if (expr.exprKind.case !== 'constExpr') {
    return null;
  }
  return expr.exprKind.value.constantKind.value ?? null;
}

/**
 * WrapOnColumn wraps the output expression when its string length exceeds a
 * specified limit for operators set by WrapOnOperators function or by default,
 * "&&" and "||" will be wrapped.
 *
 * Example usage:
 *
 * unparse(expr, wrapOnColumn(40), wrapOnOperators(LOGICAL_AND_OPERATOR))
 *
 * This will insert a newline immediately after the logical AND operator for
 * the below example input:
 *
 * Input:
 * 'my-principal-group' in request.auth.claims && request.auth.claims.iat > now - duration('5m')
 *
 * Output:
 * 'my-principal-group' in request.auth.claims &&
 *  request.auth.claims.iat > now - duration('5m')
 */
export function wrapOnColumn(col: number): UnparserOption {
  return (unparser) => {
    if (col < 1) {
      throw new Error(
        `Invalid unparser option. Wrap column value must be greater than or equal to 1. Got ${col} instead`
      );
    }
    unparser.options.wrapOnColumn = col;
    return unparser;
  };
}

/**
 * WrapOnOperators specifies which operators to perform word wrapping on an
 * output expression when its string length exceeds the column limit set by
 * WrapOnColumn function.
 *
 * Word wrapping is supported on non-unary symbolic operators. Refer to
 * operators.go for the full list
 *
 * This will replace any previously supplied operators instead of merging them.
 */
export function wrapOnOperators(...symbols: string[]): UnparserOption {
  return (unparser) => {
    unparser.options.operatorsToWrapOn = new Set();
    for (const _symbol of symbols) {
      const found = findReverse(_symbol);
      // The display name for the conditional operator is empty, so we need to
      // check for it separately.
      if (!found && _symbol !== CONDITIONAL_OPERATOR) {
        throw new Error(
          `Invalid unparser option. Unsupported operator: ${_symbol}`
        );
      }
      const _arity = arity(_symbol);
      if (_arity < 2) {
        throw new Error(
          `Invalid unparser option. Unary operators are unsupported: ${_symbol}`
        );
      }

      unparser.options.operatorsToWrapOn.add(_symbol);
    }

    return unparser;
  };
}

/**
 * WrapAfterColumnLimit dictates whether to insert a newline before or after
 * the specified operator when word wrapping is performed.
 *
 * Example usage:
 *
 * unparse(expr, wrapOnColumn(40), wrapOnOperators(LOGICAL_AND_OPERATOR), wrapAfterColumnLimit(false))
 *
 * This will insert a newline immediately before the logical AND operator for
 * the below example input, ensuring that the length of a line never exceeds
 * the specified column limit:
 *
 * Input:
 * 'my-principal-group' in request.auth.claims && request.auth.claims.iat > now - duration('5m')
 *
 * Output:
 * 'my-principal-group' in request.auth.claims
 * && request.auth.claims.iat > now - duration('5m')
 */
export function wrapAfterColumnLimit(wrapAfter: boolean): UnparserOption {
  return (unparser) => {
    unparser.options.wrapAfterColumnLimit = wrapAfter;
    return unparser;
  };
}
