/**
 * Location interface to represent a location within Source.
 */
export class Location {
  constructor(public readonly line: number, public readonly column: number) {}
}

/**
 * NoLocation is a particular illegal location.
 */
export const NoLocation = new Location(-1, -1);
