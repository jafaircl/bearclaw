import { map, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { MapSubject } from './MapSubject';
import { entries, get, has, keys, size, values } from './operators';

describe('MapSubject', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected);
    });
  });

  it('constructor should accept a Map instance with values', () => {
    const map = new MapSubject([['foo', 'bar']]);
    expect(map.get('foo')).toEqual('bar');
  });

  it('constructor should accept a custom ctor that implements map', () => {
    class MyCustomMap extends Map {}
    const map = new MapSubject(null, MyCustomMap);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((map as any)._map).toBeInstanceOf(MyCustomMap);
  });

  it('should set values', () => {
    const map = new MapSubject();
    map.set('foo', 'bar');
    expect(map.get('foo')).toEqual('bar');
  });

  it('should delete values', () => {
    const map = new MapSubject();
    map.set('foo', 'bar');
    map.delete('foo');
    expect(map.has('foo')).toEqual(false);
  });

  it('should clear values', () => {
    const map = new MapSubject();
    map.set('foo', 'bar');
    map.clear();
    expect(map.has('foo')).toEqual(false);
  });

  it('should be iterable', () => {
    const map = new MapSubject();
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    const values = [];
    for (const value of map) {
      values.push(value);
    }
    expect(values).toEqual([
      ['foo', 'bar'],
      ['bar', 'baz'],
    ]);
  });

  it('should iterate over values', () => {
    const map = new MapSubject();
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    const values = [];
    for (const value of map.values()) {
      values.push(value);
    }
    expect(values).toEqual(['bar', 'baz']);
  });

  it('should iterate over entries', () => {
    const map = new MapSubject();
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    const entries = [];
    for (const entry of map.entries()) {
      entries.push(entry);
    }
    expect(entries).toEqual([
      ['foo', 'bar'],
      ['bar', 'baz'],
    ]);
  });

  it('should iterate over keys', () => {
    const map = new MapSubject();
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    const keys = [];
    for (const key of map.keys()) {
      keys.push(key);
    }
    expect(keys).toEqual(['foo', 'bar']);
  });

  it('should return the size', () => {
    const map = new MapSubject();
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    expect(map.size).toEqual(2);
  });

  it('should return the values', () => {
    const map = new MapSubject();
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    expect([...map.values()]).toEqual(['bar', 'baz']);
  });

  it('should return the keys', () => {
    const map = new MapSubject();
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    expect([...map.keys()]).toEqual(['foo', 'bar']);
  });

  it('should return the entries', () => {
    const map = new MapSubject();
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    expect([...map.entries()]).toEqual([
      ['foo', 'bar'],
      ['bar', 'baz'],
    ]);
  });

  it('should emit values', () => {
    testScheduler.run(({ expectObservable }) => {
      const map = new MapSubject();
      map.set('foo', 'bar');
      const expected = '(a)';
      const values = { a: new Map([['foo', 'bar']]) };
      expectObservable(map).toBe(expected, values);
    });
  });

  it('next should emit values', () => {
    testScheduler.run(({ expectObservable }) => {
      const map = new MapSubject();
      map.next(new Map([['foo', 'bar']]));
      const expected = '(a)';
      const values = { a: new Map([['foo', 'bar']]) };
      expectObservable(map).toBe(expected, values);
    });
  });

  it('next should overwrite the value from the previous next call', () => {
    const map = new MapSubject();
    const results = [];
    map.subscribe((value) => results.push(value));
    map.next(new Map([['foo', 'bar']]));
    map.next(new Map([['bar', 'baz']]));
    expect(results).toEqual([
      new Map(),
      new Map([['foo', 'bar']]),
      new Map([['bar', 'baz']]),
    ]);
  });

  it('next should overwrite the value from the constructor', () => {
    const map = new MapSubject([['foo', 'bar']]);
    const results = [];
    map.subscribe((value) => results.push(value));
    map.next(new Map([['bar', 'baz']]));
    expect(results).toEqual([
      new Map([['foo', 'bar']]),
      new Map([['bar', 'baz']]),
    ]);
  });

  it('next should re-emit the current value if called with no arguments', () => {
    const map = new MapSubject([['foo', 'bar']]);
    const results = [];
    map.subscribe((value) => results.push(value));
    map.next();
    expect(results).toEqual([
      new Map([['foo', 'bar']]),
      new Map([['foo', 'bar']]),
    ]);
  });

  it('next should retain a custom ctor', () => {
    class MyMap<K, V> extends Map<K, V> {}
    const map = new MapSubject([], MyMap);
    const results = [];
    map.subscribe((value) => results.push(value));
    map.next(new Map([['foo', 'bar']]));
    expect(results).toEqual([new MyMap(), new MyMap([['foo', 'bar']])]);
  });

  it('asObservable should return an Observable', () => {
    const map = new MapSubject();
    expect(map.asObservable()).toBeInstanceOf(Observable);
  });

  it('asObservable should emit the value on subscription', () => {
    testScheduler.run(({ expectObservable }) => {
      const map = new MapSubject([['foo', 'bar']]);
      const expected = '(a)';
      const values = { a: new Map([['foo', 'bar']]) };
      expectObservable(map.asObservable()).toBe(expected, values);
    });
  });

  it('set should cause the value to emit', () => {
    testScheduler.run(({ expectObservable }) => {
      const map = new MapSubject();
      map.set('foo', 'bar');
      const expected = '(a)';
      const values = { a: new Map([['foo', 'bar']]) };
      expectObservable(map).toBe(expected, values);
    });
  });

  it('delete should cause the value to emit', () => {
    const map = new MapSubject([['foo', 'bar']]);
    const results = [];
    map.subscribe((value) => results.push(value));
    map.delete('foo');
    expect(results).toEqual([new Map([['foo', 'bar']]), new Map()]);
  });

  it('delete should not emit if the value does not exist', () => {
    const map = new MapSubject([['foo', 'bar']]);
    const results = [];
    map.subscribe((value) => results.push(value));
    map.delete('bar');
    expect(results).toEqual([new Map([['foo', 'bar']])]);
  });

  it('clear should cause the value to emit', () => {
    const map = new MapSubject([['foo', 'bar']]);
    const results = [];
    map.subscribe((value) => results.push(value));
    map.clear();
    expect(results).toEqual([new Map([['foo', 'bar']]), new Map()]);
  });

  it('should work with has operator', () => {
    testScheduler.run(({ expectObservable }) => {
      const map = new MapSubject([['foo', 'bar']]);
      const expected = '(a)';
      const values = { a: true };
      expectObservable(map.pipe(has('foo'))).toBe(expected, values);
    });
  });

  it('should work with get operator', () => {
    testScheduler.run(({ expectObservable }) => {
      const map = new MapSubject([['foo', 'bar']]);
      const expected = '(a)';
      const values = { a: 'bar' };
      expectObservable(map.pipe(get('foo'))).toBe(expected, values);
    });
  });

  it('should work with size operator', () => {
    testScheduler.run(({ expectObservable }) => {
      const map = new MapSubject([['foo', 'bar']]);
      const expected = '(a)';
      const values = { a: 1 };
      expectObservable(map.pipe(size())).toBe(expected, values);
    });
  });

  it('should work with entries operator', () => {
    testScheduler.run(({ expectObservable }) => {
      const _map = new MapSubject([['foo', 'bar']]);
      const expected = '(a)';
      const values = { a: [['foo', 'bar']] };
      expectObservable(
        _map.pipe(
          entries(),
          map((e) => [...e])
        )
      ).toBe(expected, values);
    });
  });

  it('should work with keys operator', () => {
    testScheduler.run(({ expectObservable }) => {
      const _map = new MapSubject([['foo', 'bar']]);
      const expected = '(a)';
      const values = { a: ['foo'] };
      expectObservable(
        _map.pipe(
          keys(),
          map((k) => [...k])
        )
      ).toBe(expected, values);
    });
  });

  it('should work with value operator', () => {
    testScheduler.run(({ expectObservable }) => {
      const _map = new MapSubject([['foo', 'bar']]);
      const expected = '(a)';
      const _values = { a: ['bar'] };
      expectObservable(
        _map.pipe(
          values(),
          map((v) => [...v])
        )
      ).toBe(expected, _values);
    });
  });
});
