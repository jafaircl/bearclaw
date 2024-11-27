import { isNil } from '@bearclaw/is';
import { RefVal } from '../common/ref/reference';

/**
 * EvalState tracks the values associated with expression ids during execution.
 */
export class EvalState {
  #values = new Map<bigint, RefVal>();

  /**
   * IDs returns the list of ids with recorded values.
   */
  ids(): bigint[] {
    return [...this.#values.keys()];
  }

  /**
   * Value returns the observed value of the given expression id if found, and
   * a nil false result if not.
   */
  value(id: bigint): RefVal | null {
    return this.#values.get(id) ?? null;
  }

  /**
   * SetValue sets the observed value of the expression id.
   */
  setValue(id: bigint, value: RefVal) {
    if (isNil(value)) {
      this.#values.delete(id);
      return;
    }
    this.#values.set(id, value);
  }

  /**
   * Reset clears the previously recorded expression values.
   */
  reset() {
    this.#values.clear();
  }
}
