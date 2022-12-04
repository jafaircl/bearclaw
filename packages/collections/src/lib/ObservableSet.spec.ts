import { map } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { ObservableSet } from './ObservableSet';
import { measure } from './test-utils';

function createSpeedTestSet() {
  const set = new Set<number>();
  for (let i = 0; i < 1000; i++) {
    set.add(i);
    set.delete(i);
  }
  return set;
}

function createSpeedTestObservableSet() {
  const set = new ObservableSet<number>();
  for (let i = 0; i < 1000; i++) {
    set.add(i);
    set.delete(i);
  }
  return set;
}

describe('ObservableSet', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('basic functionality', () => {
    it('should work as a Set', () => {
      const set = new ObservableSet<number>();
      expect(set.has(1)).toEqual(false);
      expect(set.size).toEqual(0);
      set.add(1);
      expect(set.has(1)).toEqual(true);
      expect(set.size).toEqual(1);
      set.delete(1);
      expect(set.has(1)).toEqual(false);
      expect(set.size).toEqual(0);
      set.add(1);
      expect(set.has(1)).toEqual(true);
      expect(set.size).toEqual(1);
      set.clear();
      expect(set.has(1)).toEqual(false);
      expect(set.size).toEqual(0);
    });

    it('should be reasonably fast', () => {
      const setSpeed = measure('setSpeed', createSpeedTestSet);
      const observableSetSpeed = measure(
        'observableSetSpeed',
        createSpeedTestObservableSet
      );
      expect(
        setSpeed.opsPerSecond / observableSetSpeed.opsPerSecond
      ).toBeLessThan(15);
    });

    it('should have the right toStringTag', () => {
      const set = new ObservableSet<number>();
      expect(Object.prototype.toString.call(set)).toEqual(
        '[object ObservableSet]'
      );
    });
  });

  describe('size$', () => {
    it('should emit 0 for a new set', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>();
        const expected = '(a)';
        const values = { a: 0 };
        expectObservable(set.size$).toBe(expected, values);
      });
    });

    it('should emit the size with an initial value', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>([1]);
        const expected = '(a)';
        const values = { a: 1 };
        expectObservable(set.size$).toBe(expected, values);
      });
    });

    it('should pass the current value to late subscribers', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>();
        set.add(1);
        const expected = '(a)';
        const values = { a: 1 };
        expectObservable(set.size$).toBe(expected, values);
      });
    });

    it('should pump the size when items are added and removed', () => {
      const set = new ObservableSet<number>();
      const results = [];
      set.size$.subscribe((size) => results.push(size));
      expect(results).toEqual([0]);
      set.add(1);
      expect(results).toEqual([0, 1]);
      set.add(2);
      expect(results).toEqual([0, 1, 2]);
      set.delete(1);
      expect(results).toEqual([0, 1, 2, 1]);
    });

    it('should not emit multiple times for the same size', () => {
      const set = new ObservableSet<number>();
      const results = [];
      set.size$.subscribe((size) => results.push(size));
      expect(results).toEqual([0]);
      set.add(1);
      expect(results).toEqual([0, 1]);
      set.add(1);
      expect(results).toEqual([0, 1]);
      set.delete(1);
      expect(results).toEqual([0, 1, 0]);
      set.delete(1);
      expect(results).toEqual([0, 1, 0]);
    });
  });

  describe('has$', () => {
    it('should emit false for a new set', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>();
        const expected = '(a)';
        const values = { a: false };
        expectObservable(set.has$(1)).toBe(expected, values);
      });
    });

    it('should emit the has with an initial value', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>([1]);
        const expected = '(a)';
        const values = { a: true };
        expectObservable(set.has$(1)).toBe(expected, values);
      });
    });

    it('should pass the current value to late subscribers', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>();
        set.add(1);
        const expected = '(a)';
        const values = { a: true };
        expectObservable(set.has$(1)).toBe(expected, values);
      });
    });

    it('should pump the has when items are added and removed', () => {
      const set = new ObservableSet<number>();
      const results = [];
      set.has$(1).subscribe((has) => results.push(has));
      expect(results).toEqual([false]);
      set.add(1);
      expect(results).toEqual([false, true]);
      set.delete(1);
      expect(results).toEqual([false, true, false]);
    });

    it('should not emit multiple times for the same has', () => {
      const set = new ObservableSet<number>();
      const results = [];
      set.has$(1).subscribe((has) => results.push(has));
      expect(results).toEqual([false]);
      set.add(1);
      expect(results).toEqual([false, true]);
      set.add(1);
      expect(results).toEqual([false, true]);
      set.delete(1);
      expect(results).toEqual([false, true, false]);
      set.delete(1);
      expect(results).toEqual([false, true, false]);
    });

    it('should not emit for other items', () => {
      const set = new ObservableSet<number>();
      const results = [];
      set.has$(1).subscribe((has) => results.push(has));
      expect(results).toEqual([false]);
      set.add(2);
      expect(results).toEqual([false]);
    });

    it('should not emit if a different item is added', () => {
      const set = new ObservableSet<number>();
      const results = [];
      set.has$(1).subscribe((has) => results.push(has));
      expect(results).toEqual([false]);
      set.add(1);
      expect(results).toEqual([false, true]);
      set.add(2);
      expect(results).toEqual([false, true]);
    });
  });

  describe('entries$', () => {
    it('should emit an empty iterable for a new set', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>();
        const expected = '(a)';
        const values = { a: [] };
        expectObservable(set.entries$().pipe(map((e) => [...e]))).toBe(
          expected,
          values
        );
      });
    });

    it('should emit the entries with an initial value', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>([1]);
        const expected = '(a)';
        const values = { a: [[1, 1]] };
        expectObservable(set.entries$().pipe(map((e) => [...e]))).toBe(
          expected,
          values
        );
      });
    });

    it('should pass the current value to late subscribers', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>();
        set.add(1);
        const expected = '(a)';
        const values = { a: [[1, 1]] };
        expectObservable(set.entries$().pipe(map((e) => [...e]))).toBe(
          expected,
          values
        );
      });
    });

    it('should pump the entries when items are added and removed', () => {
      const set = new ObservableSet<number>();
      const results = [];
      set
        .entries$()
        .pipe(map((e) => [...e]))
        .subscribe((entries) => results.push(entries));
      expect(results).toEqual([[]]);
      set.add(1);
      expect(results).toEqual([[], [[1, 1]]]);
      set.delete(1);
      expect(results).toEqual([[], [[1, 1]], []]);
    });
  });

  describe('keys$', () => {
    it('should emit an empty iterable for a new set', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>();
        const expected = '(a)';
        const values = { a: [] };
        expectObservable(set.keys$().pipe(map((k) => [...k]))).toBe(
          expected,
          values
        );
      });
    });

    it('should emit the keys with an initial value', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>([1]);
        const expected = '(a)';
        const values = { a: [1] };
        expectObservable(set.keys$().pipe(map((k) => [...k]))).toBe(
          expected,
          values
        );
      });
    });

    it('should pass the current value to late subscribers', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>();
        set.add(1);
        const expected = '(a)';
        const values = { a: [1] };
        expectObservable(set.keys$().pipe(map((k) => [...k]))).toBe(
          expected,
          values
        );
      });
    });

    it('should pump the keys when items are added and removed', () => {
      const set = new ObservableSet<number>();
      const results = [];
      set
        .keys$()
        .pipe(map((k) => [...k]))
        .subscribe((keys) => results.push(keys));
      expect(results).toEqual([[]]);
      set.add(1);
      expect(results).toEqual([[], [1]]);
      set.delete(1);
      expect(results).toEqual([[], [1], []]);
    });
  });

  describe('values$', () => {
    it('should emit an empty iterable for a new set', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>();
        const expected = '(a)';
        const values = { a: [] };
        expectObservable(set.values$().pipe(map((v) => [...v]))).toBe(
          expected,
          values
        );
      });
    });

    it('should emit the values with an initial value', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>([1]);
        const expected = '(a)';
        const values = { a: [1] };
        expectObservable(set.values$().pipe(map((v) => [...v]))).toBe(
          expected,
          values
        );
      });
    });

    it('should pass the current value to late subscribers', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet<number>();
        set.add(1);
        const expected = '(a)';
        const values = { a: [1] };
        expectObservable(set.values$().pipe(map((v) => [...v]))).toBe(
          expected,
          values
        );
      });
    });

    it('should pump the values when items are added and removed', () => {
      const set = new ObservableSet<number>();
      const results = [];
      set
        .values$()
        .pipe(map((v) => [...v]))
        .subscribe((values) => results.push(values));
      expect(results).toEqual([[]]);
      set.add(1);
      expect(results).toEqual([[], [1]]);
      set.delete(1);
      expect(results).toEqual([[], [1], []]);
    });
  });

  describe('complete', () => {
    it('should complete the observable when complete is called', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet();
        const expected = '(a|)';
        const values = { a: 0 };
        expectObservable(set.size$).toBe(expected, values);
        set.complete();
      });
    });

    it('should emit the last size when subscribing after complete', () => {
      const observableSet = new ObservableSet();
      observableSet.add(1);
      observableSet.complete();
      const results = [];
      observableSet.size$.subscribe((size) => results.push(size));
      expect(results).toEqual([1]);
    });

    it('should keep emitting the last size when subscribing after complete', () => {
      const observableSet = new ObservableSet();
      observableSet.add(1);
      observableSet.complete();
      const results1 = [];
      observableSet.size$.subscribe((size) => results1.push(size));
      expect(results1).toEqual([1]);
      const results2 = [];
      observableSet.size$.subscribe((size) => results2.push(size));
      expect(results2).toEqual([1]);
    });

    it('should not emit any more values after complete', () => {
      const obsrvableSet = new ObservableSet();
      const results = [];
      obsrvableSet.size$.subscribe((size) => results.push(size));
      expect(results).toEqual([0]);
      obsrvableSet.add(1);
      expect(results).toEqual([0, 1]);
      obsrvableSet.complete();
      obsrvableSet.add(2);
      expect(results).toEqual([0, 1]);
    });
  });

  describe('asObservable', () => {
    it('should emit the set instance', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new ObservableSet();
        const expected = '(a)';
        const values = { a: set };
        expectObservable(set.asObservable()).toBe(expected, values);
      });
    });

    it('should emit the set instance to late subscribers', () => {
      const observableSet = new ObservableSet();
      observableSet.add(1);
      const results = [];
      observableSet
        .asObservable()
        .subscribe((set) => results.push(set === observableSet));
      expect(results).toEqual([true]);
    });
  });
});
