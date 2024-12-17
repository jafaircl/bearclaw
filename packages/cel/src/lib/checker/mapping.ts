import { formatCELType } from '../common/format';
import { Type } from '../common/types/types';

export class Mapping {
  constructor(readonly mapping: Map<string, Type> = new Map()) {}

  add(from: Type, to: Type) {
    this.mapping.set(formatCELType(from), to);
  }

  find(from: Type) {
    return this.mapping.get(formatCELType(from)) ?? null;
  }

  copy() {
    const c = new Mapping();
    for (const [k, v] of this.mapping) {
      c.mapping.set(k, v);
    }
    return c;
  }
}
