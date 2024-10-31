/* eslint-disable @typescript-eslint/no-explicit-any */
import { dequal } from 'dequal';

export class ResolvedValue<T = any> {
  public static readonly NULL_VALUE = new ResolvedValue(null, true);
  public static readonly ABSENT = new ResolvedValue(null, false);

  constructor(public readonly value: T, public readonly present: boolean) {}

  equals(other: ResolvedValue<T>): boolean {
    return this.present === other.present && dequal(this.value, other.value);
  }
}
