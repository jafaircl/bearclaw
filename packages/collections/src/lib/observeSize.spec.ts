import { TestScheduler } from 'rxjs/testing';
import { observeSize } from './observeSize';

describe('observeSize', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected);
    });
  });

  it('should emit the size', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a', {
        a: new Set([1, 2, 3]),
      });
      const expected = 'a';
      expectObservable(source.pipe(observeSize())).toBe(expected, {
        a: 3,
      });
    });
  });

  it('should emit the size when the set is cleared', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a--b', {
        a: new Set([1, 2, 3]),
        b: new Set(),
      });
      const expected = '   a--b';
      expectObservable(source.pipe(observeSize())).toBe(expected, {
        a: 3,
        b: 0,
      });
    });
  });

  it('should emit the size when the set is added to', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a--b', {
        a: new Set([1, 2, 3]),
        b: new Set([1, 2, 3, 4]),
      });
      const expected = '   a--b';
      expectObservable(source.pipe(observeSize())).toBe(expected, {
        a: 3,
        b: 4,
      });
    });
  });

  it('should emit the size when the set is removed from', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a--b', {
        a: new Set([1, 2, 3]),
        b: new Set([1, 2]),
      });
      const expected = '   a--b';
      expectObservable(source.pipe(observeSize())).toBe(expected, {
        a: 3,
        b: 2,
      });
    });
  });

  it('should work with a Map as well', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a', {
        a: new Map([
          [1, 1],
          [2, 2],
          [3, 3],
        ]),
      });
      const expected = 'a';
      expectObservable(source.pipe(observeSize())).toBe(expected, {
        a: 3,
      });
    });
  });

  describe('observable functionality', () => {
    it('should not complete if the source never completes', () => {
      testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold<Set<unknown>>('-');
        const e1subs = '^';
        const expected = '-';

        expectObservable(e1.pipe(observeSize())).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should complete if the source is empty', () => {
      testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold<Set<unknown>>('|');
        const e1subs = '(^!)';
        const expected = '|';

        expectObservable(e1.pipe(observeSize())).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should complete if the source never emits', () => {
      testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot<Set<unknown>>('------|');
        const e1subs = '              ^-----!';
        const expected = '            ------|';

        expectObservable(e1.pipe(observeSize())).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should raise an error if the source raises an error', () => {
      testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot<Set<unknown>>('--a-#', { a: new Set([1, 2, 3]) });
        const e1subs = '              ^---!';
        const expected = '            --a-#';

        expectObservable(e1.pipe(observeSize())).toBe(expected, { a: 3 });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should raise an error if the source throws', () => {
      testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold<Set<unknown>>('#');
        const e1subs = '(^!)';
        const expected = '#';

        expectObservable(e1.pipe(observeSize())).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should allow unsubscribing early and explicitly', () => {
      testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot<Set<unknown>>('--a---b--|', {
          a: new Set([1, 2, 3]),
          b: new Set([1, 2, 3, 4]),
        });
        const e1subs = '              ^---!-----';
        const expected = '            --a--';
        const unsub = '               ----!-----';

        const result = e1.pipe(observeSize());

        expectObservable(result, unsub).toBe(expected, { a: 3, b: 4 });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });
  });
});
