import { Interpretable } from './interpretable';

/**
 * InterpretableDecorator is a functional interface for decorating or replacing
 * Interpretable expression nodes at construction time.
 */
export type InterpretableDecorator = (
  int: Interpretable
) => Interpretable | Error;
