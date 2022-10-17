export class ValidationException extends Error {
  /**
   * Returns 'ValidationException'
   */
  public get name(): string {
    return this.constructor.name;
  }
}
