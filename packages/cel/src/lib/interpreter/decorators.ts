import {
  EvalWatch,
  EvalWatchAttr,
  EvalWatchConst,
  EvalWatchConstructor,
  Interpretable,
  isInterpretableAttribute,
  isInterpretableConst,
  isInterpretableConstructor,
} from './interpretable';
import { EvalObserver } from './interpreter';

/**
 * InterpretableDecorator is a functional interface for decorating or replacing
 * Interpretable expression nodes at construction time.
 */
export type InterpretableDecorator = (
  int: Interpretable
) => Interpretable | Error;

/**
 * decObserveEval records evaluation state into an EvalState object.
 */
export function decObserveEval(observer: EvalObserver): InterpretableDecorator {
  return (int: Interpretable) => {
    if (
      int instanceof EvalWatch ||
      int instanceof EvalWatchAttr ||
      int instanceof EvalWatchConst ||
      int instanceof EvalWatchConstructor
    ) {
      // these instruction are already watching, return straight-away.
      return int;
    } else if (isInterpretableAttribute(int)) {
      return new EvalWatchAttr(int, observer);
    } else if (isInterpretableConst(int)) {
      return new EvalWatchConst(int, observer);
    } else if (isInterpretableConstructor(int)) {
      return new EvalWatchConstructor(int, observer);
    } else {
      return new EvalWatch(int, observer);
    }
  };
}
