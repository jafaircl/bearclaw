export class ValidationException extends Error {
  /**
   * Returns 'ValidationException'
   */
  override get name(): string {
    return this.constructor.name;
  }
}
