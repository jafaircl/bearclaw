import { map } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { ObservableMap } from './ObservableMap';
import { measure } from './test-utils';

function createSpeedTestMap() {
  const map = new Map<string, number>();
  for (let i = 0; i < 1000; i++) {
    map.set(i.toString(), i);
    map.delete(i.toString());
  }
  return map;
}

function createSpeedTestObservableMap() {
  const map = new ObservableMap<string, number>();
  for (let i = 0; i < 1000; i++) {
    map.set(i.toString(), i);
    map.delete(i.toString());
  }
  return map;
}

describe('ObservableMap', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('basic functionality', () => {
    it('should work as a Map', () => {
      const map = new ObservableMap();
      expect(map.has(1)).toEqual(false);
      expect(map.size).toEqual(0);
      map.set(1, 1);
      expect(map.has(1)).toEqual(true);
      expect(map.size).toEqual(1);
      map.delete(1);
      expect(map.has(1)).toEqual(false);
      expect(map.size).toEqual(0);
      map.set(1, 1);
      expect(map.has(1)).toEqual(true);
      expect(map.size).toEqual(1);
      map.clear();
      expect(map.has(1)).toEqual(false);
      expect(map.size).toEqual(0);
    });

    it('should be reasonably fast', () => {
      const mapSpeed = measure('mapSpeed', createSpeedTestMap);
      const observableMapSpeed = measure(
        'observableMapSpeed',
        createSpeedTestObservableMap
      );
      expect(
        mapSpeed.opsPerSecond / observableMapSpeed.opsPerSecond
      ).toBeLessThan(15);
    });

    it('should have the right toStringTag', () => {
      const map = new ObservableMap();
      expect(Object.prototype.toString.call(map)).toEqual(
        '[object ObservableMap]'
      );
    });
  });

  describe('size$', () => {
    it('should emit 0 for a new map', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new ObservableMap();
        const expected = '(a)';
        const values = { a: 0 };
        expectObservable(map.size$).toBe(expected, values);
      });
    });

    it('should emit the size with an initial value', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new ObservableMap([[1, 1]]);
        const expected = '(a)';
        const values = { a: 1 };
        expectObservable(map.size$).toBe(expected, values);
      });
    });

    it('should pass the current value to late subscribers', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new ObservableMap();
        map.set(1, 1);
        const expected = '(a)';
        const values = { a: 1 };
        expectObservable(map.size$).toBe(expected, values);
      });
    });

    it('should pump the size through as values are added and removed', () => {
      const map = new ObservableMap();
      const results = [];
      map.size$.subscribe((size) => results.push(size));
      expect(results).toEqual([0]);
      map.set(1, 1);
      expect(results).toEqual([0, 1]);
      map.set(2, 2);
      expect(results).toEqual([0, 1, 2]);
      map.delete(2);
      expect(results).toEqual([0, 1, 2, 1]);
    });

    it('should not emit multiple times if the size does not change', () => {
      const map = new ObservableMap();
      const results = [];
      map.size$.subscribe((size) => results.push(size));
      expect(results).toEqual([0]);
      map.set(1, 1);
      expect(results).toEqual([0, 1]);
      map.set(1, 1);
      expect(results).toEqual([0, 1]);
    });
  });

  describe('has$', () => {
    it('should emit false immediately for a new map', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new ObservableMap();
        const expected = '(a)';
        const values = { a: false };
        expectObservable(map.has$(1)).toBe(expected, values);
      });
    });

    it('should emit true with an initial value', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new ObservableMap([[1, 1]]);
        const expected = '(a)';
        const values = { a: true };
        expectObservable(map.has$(1)).toBe(expected, values);
      });
    });

    it('should pass the current value to late subscribers', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new ObservableMap();
        map.set(1, 1);
        const expected = '(a)';
        const values = { a: true };
        expectObservable(map.has$(1)).toBe(expected, values);
      });
    });

    it('should pump the has through as values are added and removed', () => {
      const map = new ObservableMap();
      const results = [];
      map.has$(1).subscribe((has) => results.push(has));
      expect(results).toEqual([false]);
      map.set(1, 1);
      expect(results).toEqual([false, true]);
      map.delete(1);
      expect(results).toEqual([false, true, false]);
    });

    it('should not emit multiple times if the has does not change', () => {
      const map = new ObservableMap();
      const results = [];
      map.has$(1).subscribe((has) => results.push(has));
      expect(results).toEqual([false]);
      map.set(1, 1);
      expect(results).toEqual([false, true]);
      map.set(1, 1);
      expect(results).toEqual([false, true]);
    });

    it('should not emit if the value changes but the has does not', () => {
      const map = new ObservableMap();
      const results = [];
      map.has$(1).subscribe((has) => results.push(has));
      expect(results).toEqual([false]);
      map.set(1, 1);
      expect(results).toEqual([false, true]);
      map.set(1, 2);
      expect(results).toEqual([false, true]);
    });

    it('should not emit for other keys', () => {
      const map = new ObservableMap();
      const results = [];
      map.has$(1).subscribe((has) => results.push(has));
      expect(results).toEqual([false]);
      map.set(2, 1);
      expect(results).toEqual([false]);
    });

    it('should not emit if a different key changes', () => {
      const map = new ObservableMap();
      const results = [];
      map.has$(1).subscribe((has) => results.push(has));
      expect(results).toEqual([false]);
      map.set(1, 1);
      expect(results).toEqual([false, true]);
      map.set(2, 1);
      expect(results).toEqual([false, true]);
    });
  });

  describe('get$', () => {
    it('should emit undefined immediately for a new map', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new ObservableMap();
        const expected = '(a)';
        const values = { a: undefined };
        expectObservable(map.get$(1)).toBe(expected, values);
      });
    });

    it('should emit the value with an initial value', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new ObservableMap([[1, 1]]);
        const expected = '(a)';
        const values = { a: 1 };
        expectObservable(map.get$(1)).toBe(expected, values);
      });
    });

    it('should pass the current value to late subscribers', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new ObservableMap();
        map.set(1, 1);
        const expected = '(a)';
        const values = { a: 1 };
        expectObservable(map.get$(1)).toBe(expected, values);
      });
    });

    it('should pump the value through as values are added and removed', () => {
      const map = new ObservableMap();
      const results = [];
      map.get$(1).subscribe((value) => results.push(value));
      expect(results).toEqual([undefined]);
      map.set(1, 1);
      expect(results).toEqual([undefined, 1]);
      map.set(1, 2);
      expect(results).toEqual([undefined, 1, 2]);
      map.delete(1);
      expect(results).toEqual([undefined, 1, 2, undefined]);
    });

    it('should not emit multiple times if the value does not change', () => {
      const map = new ObservableMap();
      const results = [];
      map.get$(1).subscribe((value) => results.push(value));
      expect(results).toEqual([undefined]);
      map.set(1, 1);
      expect(results).toEqual([undefined, 1]);
      map.set(1, 1);
      expect(results).toEqual([undefined, 1]);
    });

    it('should emit multiple times if the value is an object and the reference changes', () => {
      const map = new ObservableMap();
      const results = [];
      map.get$(1).subscribe((value) => results.push(value));
      expect(results).toEqual([undefined]);
      map.set(1, {});
      expect(results).toEqual([undefined, {}]);
      map.set(1, {});
      expect(results).toEqual([undefined, {}, {}]);
    });

    it('should not emit multiple times if the value is an object and the reference does not change', () => {
      const map = new ObservableMap();
      const results = [];
      const obj = {};
      map.get$(1).subscribe((value) => results.push(value));
      expect(results).toEqual([undefined]);
      map.set(1, obj);
      expect(results).toEqual([undefined, obj]);
      map.set(1, obj);
      expect(results).toEqual([undefined, obj]);
    });

    it('should not emit for other keys', () => {
      const map = new ObservableMap();
      const results = [];
      map.get$(1).subscribe((value) => results.push(value));
      expect(results).toEqual([undefined]);
      map.set(2, 1);
      expect(results).toEqual([undefined]);
    });

    it('should not emit if a different key changes', () => {
      const map = new ObservableMap();
      const results = [];
      map.get$(1).subscribe((value) => results.push(value));
      expect(results).toEqual([undefined]);
      map.set(1, 1);
      expect(results).toEqual([undefined, 1]);
      map.set(2, 1);
      expect(results).toEqual([undefined, 1]);
    });
  });

  describe('entries$', () => {
    it('should emit an empty iterable for a new map', () => {
      testScheduler.run(({ expectObservable }) => {
        const observableMap = new ObservableMap();
        const expected = '(a)';
        const values = { a: [] };
        expectObservable(
          observableMap.entries$().pipe(map((e) => [...e]))
        ).toBe(expected, values);
      });
    });

    it('should emit the entries with an initial value', () => {
      testScheduler.run(({ expectObservable }) => {
        const observableMap = new ObservableMap([[1, 1]]);
        const expected = '(a)';
        const values = { a: [[1, 1]] };
        expectObservable(
          observableMap.entries$().pipe(map((e) => [...e]))
        ).toBe(expected, values);
      });
    });

    it('should pass the current value to late subscribers', () => {
      testScheduler.run(({ expectObservable }) => {
        const observableMap = new ObservableMap();
        observableMap.set(1, 1);
        const expected = '(a)';
        const values = { a: [[1, 1]] };
        expectObservable(
          observableMap.entries$().pipe(map((e) => [...e]))
        ).toBe(expected, values);
      });
    });

    it('should pump the entries through as values are added and removed', () => {
      const map = new ObservableMap();
      const results = [];
      map.entries$().subscribe((entries) => results.push([...entries]));
      expect(results).toEqual([[]]);
      map.set(1, 1);
      expect(results).toEqual([[], [[1, 1]]]);
      map.set(1, 2);
      expect(results).toEqual([[], [[1, 1]], [[1, 2]]]);
      map.delete(1);
      expect(results).toEqual([[], [[1, 1]], [[1, 2]], []]);
    });
  });

  describe('keys$', () => {
    it('should emit an empty iterable for a new map', () => {
      testScheduler.run(({ expectObservable }) => {
        const observableMap = new ObservableMap();
        const expected = '(a)';
        const values = { a: [] };
        expectObservable(observableMap.keys$().pipe(map((k) => [...k]))).toBe(
          expected,
          values
        );
      });
    });

    it('should emit the keys with an initial value', () => {
      testScheduler.run(({ expectObservable }) => {
        const observableMap = new ObservableMap([[1, 1]]);
        const expected = '(a)';
        const values = { a: [1] };
        expectObservable(observableMap.keys$().pipe(map((k) => [...k]))).toBe(
          expected,
          values
        );
      });
    });

    it('should pass the current value to late subscribers', () => {
      testScheduler.run(({ expectObservable }) => {
        const observableMap = new ObservableMap();
        observableMap.set(1, 1);
        const expected = '(a)';
        const values = { a: [1] };
        expectObservable(observableMap.keys$().pipe(map((k) => [...k]))).toBe(
          expected,
          values
        );
      });
    });

    it('should pump the keys through as values are added and removed', () => {
      const map = new ObservableMap();
      const results = [];
      map.keys$().subscribe((keys) => results.push([...keys]));
      expect(results).toEqual([[]]);
      map.set(1, 1);
      expect(results).toEqual([[], [1]]);
      map.set(1, 2);
      expect(results).toEqual([[], [1], [1]]);
      map.delete(1);
      expect(results).toEqual([[], [1], [1], []]);
    });
  });

  describe('values$', () => {
    it('should emit an empty iterable for a new map', () => {
      testScheduler.run(({ expectObservable }) => {
        const observableMap = new ObservableMap();
        const expected = '(a)';
        const values = { a: [] };
        expectObservable(observableMap.values$().pipe(map((v) => [...v]))).toBe(
          expected,
          values
        );
      });
    });

    it('should emit the values with an initial value', () => {
      testScheduler.run(({ expectObservable }) => {
        const observableMap = new ObservableMap([[1, 1]]);
        const expected = '(a)';
        const values = { a: [1] };
        expectObservable(observableMap.values$().pipe(map((v) => [...v]))).toBe(
          expected,
          values
        );
      });
    });

    it('should pass the current value to late subscribers', () => {
      testScheduler.run(({ expectObservable }) => {
        const observableMap = new ObservableMap();
        observableMap.set(1, 1);
        const expected = '(a)';
        const values = { a: [1] };
        expectObservable(observableMap.values$().pipe(map((v) => [...v]))).toBe(
          expected,
          values
        );
      });
    });

    it('should pump the values through as values are added and removed', () => {
      const map = new ObservableMap();
      const results = [];
      map.values$().subscribe((values) => results.push([...values]));
      expect(results).toEqual([[]]);
      map.set(1, 1);
      expect(results).toEqual([[], [1]]);
      map.set(1, 2);
      expect(results).toEqual([[], [1], [2]]);
      map.delete(1);
      expect(results).toEqual([[], [1], [2], []]);
    });
  });

  describe('complete', () => {
    it('should complete the observable when complete is called', () => {
      testScheduler.run(({ expectObservable }) => {
        const observableMap = new ObservableMap();
        const expected = '(a|)';
        const values = { a: 0 };
        expectObservable(observableMap.size$).toBe(expected, values);
        observableMap.complete();
      });
    });

    it('should emit the last size when subscribing after complete', () => {
      const observableMap = new ObservableMap();
      observableMap.set(1, 1);
      observableMap.complete();
      const results = [];
      observableMap.size$.subscribe((size) => results.push(size));
      expect(results).toEqual([1]);
    });

    it('should keep emitting the last size when subscribing after complete', () => {
      const observableMap = new ObservableMap();
      observableMap.set(1, 1);
      observableMap.complete();
      const results1 = [];
      observableMap.size$.subscribe((size) => results1.push(size));
      expect(results1).toEqual([1]);
      const results2 = [];
      observableMap.size$.subscribe((size) => results2.push(size));
      expect(results2).toEqual([1]);
    });

    it('should not next size after complete is called', () => {
      const observableMap = new ObservableMap();
      const results = [];
      observableMap.size$.subscribe((size) => results.push(size));
      expect(results).toEqual([0]);
      observableMap.set(1, 1);
      expect(results).toEqual([0, 1]);
      observableMap.complete();
      observableMap.set(2, 2);
      expect(results).toEqual([0, 1]);
    });
  });

  describe('asObservable', () => {
    it('should emit the map instance', () => {
      testScheduler.run(({ expectObservable }) => {
        const observableMap = new ObservableMap();
        const expected = '(a)';
        const values = { a: observableMap };
        expectObservable(observableMap.asObservable()).toBe(expected, values);
      });
    });

    it('should emit the map instance to late subscribers', () => {
      const observableMap = new ObservableMap();
      observableMap.set(1, 1);
      const results = [];
      observableMap
        .asObservable()
        .subscribe((map) => results.push(map === observableMap));
      expect(results).toEqual([true]);
    });
  });
});
