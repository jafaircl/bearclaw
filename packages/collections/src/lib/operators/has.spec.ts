import { TestScheduler } from 'rxjs/testing';
import { has } from './has';

describe('has', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected);
    });
  });

  it('should emit true when the key is present', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a', {
        a: new Set([1, 2, 3]),
      });
      const expected = 'a';
      expectObservable(source.pipe(has(2))).toBe(expected, {
        a: true,
      });
    });
  });

  it('should emit false when the key is not present', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a', {
        a: new Set([1, 2, 3]),
      });
      const expected = 'a';
      expectObservable(source.pipe(has(4))).toBe(expected, {
        a: false,
      });
    });
  });

  it('should emit true when the key is added', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a--b', {
        a: new Set([1, 2, 3]),
        b: new Set([1, 2, 3, 4]),
      });
      const expected = '   a--b';
      expectObservable(source.pipe(has(4))).toBe(expected, {
        a: false,
        b: true,
      });
    });
  });

  it('should emit false when the key is removed', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a--b', {
        a: new Set([1, 2, 3]),
        b: new Set([1, 2]),
      });
      const expected = '   a--b';
      expectObservable(source.pipe(has(3))).toBe(expected, {
        a: true,
        b: false,
      });
    });
  });

  it('should work with a map as well', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a--b', {
        a: new Map([
          [1, 'foo'],
          [2, 'bar'],
          [3, 'baz'],
        ]),
        b: new Map([
          [1, 'foo'],
          [2, 'bar'],
        ]),
      });
      const expected = '   a--b';
      expectObservable(source.pipe(has(3))).toBe(expected, {
        a: true,
        b: false,
      });
    });
  });

  describe('observable functionality', () => {
    it('should not complete if the source never completes', () => {
      testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold<Set<number>>('-');
        const e1subs = '^';
        const expected = '-';

        expectObservable(e1.pipe(has(0))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should complete if the source is empty', () => {
      testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold<Set<number>>('|');
        const e1subs = '(^!)';
        const expected = '|';

        expectObservable(e1.pipe(has(0))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should complete if the source never emits', () => {
      testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot<Set<number>>('------|');
        const e1subs = '             ^-----!';
        const expected = '           ------|';

        expectObservable(e1.pipe(has(0))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should raise an error if the source raises an error', () => {
      testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot<Set<number>>('--a-#', { a: new Set([1, 2, 3]) });
        const e1subs = '             ^---!';
        const expected = '           --a-#';

        expectObservable(e1.pipe(has(0))).toBe(expected, { a: false });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should raise an error if the source throws', () => {
      testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold<Set<number>>('#');
        const e1subs = '(^!)';
        const expected = '#';

        expectObservable(e1.pipe(has(0))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should allow unsubscribing early and explicitly', () => {
      testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot<Set<number>>('--a---b--|', {
          a: new Set([1, 2, 3]),
          b: new Set([1, 2, 3, 4]),
        });
        const e1subs = '             ^---!-----';
        const expected = '           --a--';
        const unsub = '              ----!-----';

        const result = e1.pipe(has(4));

        expectObservable(result, unsub).toBe(expected, { a: false, b: true });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });
  });
});
