/* eslint-disable @typescript-eslint/no-explicit-any */
export class Cost {
  public static Unknown: Cost = new Cost(0, Number.MAX_VALUE);
  public static None: Cost = new Cost(0, 0);
  public static OneOne: Cost = new Cost(1, 1);
  public readonly min: number;
  public readonly max: number;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }

  /**
   * estimateCost returns the heuristic cost interval for the program.
   */
  public estimateCost(obj: any): Cost {
    if (obj instanceof Coster) {
      return obj.cost();
    }
    return Cost.Unknown;
  }

  equals(other: Cost): boolean {
    return this.min === other.min && this.max === other.max;
  }

  add(other: Cost): Cost {
    return new Cost(this.min + other.min, this.max + other.max);
  }

  multiply(multiplier: number): Cost {
    return new Cost(this.min * multiplier, this.max * multiplier);
  }
}

/**
 * Coster calculates the heuristic cost incurred during evaluation.
 */
export class Coster {
  constructor(private readonly _cost: Cost = Cost.Unknown) {}

  cost(): Cost {
    return this._cost;
  }
}
