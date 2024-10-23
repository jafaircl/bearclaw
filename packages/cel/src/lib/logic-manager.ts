import { Expr } from '@buf/google_cel-spec.bufbuild_es/cel/expr/syntax_pb.js';
import { callExpr } from './common/types/call';

export class LogicManager {
  private function: string;
  private terms: Expr[];
  private ops: bigint[];
  private variadicASTs: boolean;

  private constructor(functionName: string, term: Expr, variadicASTs: boolean) {
    this.function = functionName;
    this.terms = [term];
    this.ops = [];
    this.variadicASTs = variadicASTs;
  }

  static newVariadicLogicManager(
    functionName: string,
    term: Expr
  ): LogicManager {
    return new LogicManager(functionName, term, true);
  }

  static newBalancingLogicManager(
    functionName: string,
    term: Expr
  ): LogicManager {
    return new LogicManager(functionName, term, false);
  }

  addTerm(op: bigint, term: Expr): void {
    this.terms.push(term);
    this.ops.push(op);
  }

  toExpr(): Expr {
    if (this.terms.length === 1) {
      return this.terms[0];
    }
    if (this.variadicASTs) {
      return callExpr(this.ops[0], {
        function: this.function,
        args: this.terms,
      });
    }
    return this.balancedTree(0, this.ops.length - 1);
  }

  private balancedTree(lo: number, hi: number): Expr {
    const mid = Math.floor((lo + hi + 1) / 2);
    let left: Expr;
    if (mid === lo) {
      left = this.terms[mid];
    } else {
      left = this.balancedTree(lo, mid - 1);
    }
    let right: Expr;
    if (mid === hi) {
      right = this.terms[mid + 1];
    } else {
      right = this.balancedTree(mid + 1, hi);
    }
    return callExpr(this.ops[mid], {
      function: this.function,
      args: [left, right],
    });
  }
}
