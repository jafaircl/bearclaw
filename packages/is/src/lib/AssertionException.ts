export class AssertionException extends Error {
  /**
   * Returns 'AssertionException'
   */
  public get name(): string {
    return this.constructor.name;
  }
}
