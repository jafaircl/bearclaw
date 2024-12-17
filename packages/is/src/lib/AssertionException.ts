export class AssertionException extends Error {
  /**
   * Returns 'AssertionException'
   */
  override get name(): string {
    return this.constructor.name;
  }
}
