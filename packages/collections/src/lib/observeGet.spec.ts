import { TestScheduler } from 'rxjs/testing';
import { observeGet } from './observeGet';

describe('observeGet', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected);
    });
  });

  it('should emit the value when the key is present', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a', {
        a: new Map([
          [1, 'a'],
          [2, 'b'],
          [3, 'c'],
        ]),
      });
      const expected = 'a';
      expectObservable(source.pipe(observeGet(2))).toBe(expected, {
        a: 'b',
      });
    });
  });

  it('should emit undefined when the key is not present', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a', {
        a: new Map([
          [1, 'a'],
          [2, 'b'],
          [3, 'c'],
        ]),
      });
      const expected = 'a';
      expectObservable(source.pipe(observeGet(4))).toBe(expected, {
        a: undefined,
      });
    });
  });

  it('should emit the value when the key is added', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a--b', {
        a: new Map([
          [1, 'a'],
          [2, 'b'],
          [3, 'c'],
        ]),
        b: new Map([
          [1, 'a'],
          [2, 'b'],
          [3, 'c'],
          [4, 'd'],
        ]),
      });
      const expected = '   a--b';
      expectObservable(source.pipe(observeGet(4))).toBe(expected, {
        a: undefined,
        b: 'd',
      });
    });
  });

  it('should emit undefined when the key is removed', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source = cold('a--b', {
        a: new Map([
          [1, 'a'],
          [2, 'b'],
          [3, 'c'],
        ]),
        b: new Map([
          [1, 'a'],
          [2, 'b'],
        ]),
      });
      const expected = '   a--b';
      expectObservable(source.pipe(observeGet(3))).toBe(expected, {
        a: 'c',
        b: undefined,
      });
    });
  });

  describe('observable functionality', () => {
    it('should not complete if the source never completes', () => {
      testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold<Map<number, number>>('-');
        const e1subs = '^';
        const expected = '-';

        expectObservable(e1.pipe(observeGet(0))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should complete if the source is empty', () => {
      testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold<Map<number, number>>('|');
        const e1subs = '(^!)';
        const expected = '|';

        expectObservable(e1.pipe(observeGet(0))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should complete if the source never emits', () => {
      testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot<Map<number, number>>('------|');
        const e1subs = '                     ^-----!';
        const expected = '                   ------|';

        expectObservable(e1.pipe(observeGet(0))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should raise an error if the source raises an error', () => {
      testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot<Map<number, string>>('--a-#', {
          a: new Map([
            [1, 'a'],
            [2, 'b'],
            [3, 'c'],
          ]),
        });
        const e1subs = '                     ^---!';
        const expected = '                   --a-#';

        expectObservable(e1.pipe(observeGet(1))).toBe(expected, {
          a: 'a',
        });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should raise an error if the source throws', () => {
      testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
        const e1 = cold<Map<number, string>>('#');
        const e1subs = '(^!)';
        const expected = '#';

        expectObservable(e1.pipe(observeGet(0))).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });

    it('should allow unsubscribing early and explicitly', () => {
      testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot<Map<number, string>>('--a---b--|', {
          a: new Map([
            [1, 'a'],
            [2, 'b'],
            [3, 'c'],
          ]),
          b: new Map([
            [1, 'a'],
            [2, 'b'],
            [3, 'c'],
            [4, 'd'],
          ]),
        });
        const e1subs = '                     ^---!-----';
        const expected = '                   --a--';
        const unsub = '                      ----!-----';

        const result = e1.pipe(observeGet(4));

        expectObservable(result, unsub).toBe(expected, {
          a: undefined,
          b: 'd',
        });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
      });
    });
  });
});
