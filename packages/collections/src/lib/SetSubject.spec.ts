import { map, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { entries, has, keys, size, values } from './operators';
import { SetSubject } from './SetSubject';

describe('SetSubject', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected);
    });
  });

  it('constructor should accept an array of values', () => {
    const set = new SetSubject(['foo']);
    expect(set.has('foo')).toEqual(true);
  });

  it('constructor should accept a custom ctor that implements set', () => {
    class MyCustomSet extends Set {}
    function setFactory<T>(values: T[]) {
      return new MyCustomSet(values);
    }
    const set = new SetSubject(null, setFactory);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((set as any)._set).toBeInstanceOf(MyCustomSet);
  });

  it('should add values', () => {
    const set = new SetSubject();
    set.add('foo');
    expect(set.has('foo')).toEqual(true);
  });

  it('should delete values', () => {
    const set = new SetSubject();
    set.add('foo');
    set.delete('foo');
    expect(set.has('foo')).toEqual(false);
  });

  it('should clear values', () => {
    const set = new SetSubject();
    set.add('foo');
    set.clear();
    expect(set.has('foo')).toEqual(false);
  });

  it('should iterate over values', () => {
    const set = new SetSubject();
    set.add('foo');
    set.add('bar');
    const values = [];
    for (const value of set) {
      values.push(value);
    }
    expect(values).toEqual(['foo', 'bar']);
  });

  it('should return the size', () => {
    const set = new SetSubject();
    set.add('foo');
    set.add('bar');
    expect(set.size).toEqual(2);
  });

  it('should return the values', () => {
    const set = new SetSubject();
    set.add('foo');
    set.add('bar');
    expect([...set.values()]).toEqual(['foo', 'bar']);
  });

  it('should return the keys', () => {
    const set = new SetSubject();
    set.add('foo');
    set.add('bar');
    expect([...set.keys()]).toEqual(['foo', 'bar']);
  });

  it('should return the entries', () => {
    const set = new SetSubject();
    set.add('foo');
    set.add('bar');
    expect([...set.entries()]).toEqual([
      ['foo', 'foo'],
      ['bar', 'bar'],
    ]);
  });

  it('should emit the value on subscription', () => {
    testScheduler.run(({ expectObservable }) => {
      const set = new SetSubject();
      set.add('foo');
      const expected = '(a)';
      const values = { a: new Set(['foo']) };
      expectObservable(set).toBe(expected, values);
    });
  });

  it('next should emit the value', () => {
    testScheduler.run(({ expectObservable }) => {
      const set = new SetSubject();
      set.next(new Set(['foo']));
      const expected = '(a)';
      const values = { a: new Set(['foo']) };
      expectObservable(set).toBe(expected, values);
    });
  });

  it('next should overwrite the value from the previous next call', () => {
    const set = new SetSubject();
    const results = [];
    set.subscribe((value) => results.push(value));
    set.next(new Set(['foo']));
    set.next(new Set(['bar']));
    expect(results).toEqual([new Set(), new Set(['foo']), new Set(['bar'])]);
  });

  it('next should overwrite the value from the constructor', () => {
    const set = new SetSubject(['foo']);
    const results = [];
    set.subscribe((value) => results.push(value));
    set.next(new Set(['bar']));
    expect(results).toEqual([new Set(['foo']), new Set(['bar'])]);
  });

  it('next should re-emit the current value if called with no arguments', () => {
    const set = new SetSubject(['foo']);
    const results = [];
    set.subscribe((value) => results.push(value));
    set.next();
    expect(results).toEqual([new Set(['foo']), new Set(['foo'])]);
  });

  it('next should retain the custom ctor', () => {
    class MyCustomSet extends Set {}
    function setFactory<T>(values: T[]) {
      return new MyCustomSet(values);
    }
    const set = new SetSubject(null, setFactory);
    const results = [];
    set.subscribe((value) => results.push(value));
    set.next(new Set(['foo']));
    expect(results).toEqual([new MyCustomSet(), new MyCustomSet(['foo'])]);
  });

  it('asObservable should return an Observable', () => {
    const set = new SetSubject();
    expect(set.asObservable()).toBeInstanceOf(Observable);
  });

  it('asObservable should emit the value on subscription', () => {
    testScheduler.run(({ expectObservable }) => {
      const set = new SetSubject();
      set.add('foo');
      const expected = '(a)';
      const values = { a: new Set(['foo']) };
      expectObservable(set.asObservable()).toBe(expected, values);
    });
  });

  it('asObservable should emit the value on subscription if the value was set in the constructor', () => {
    testScheduler.run(({ expectObservable }) => {
      const set = new SetSubject(['foo']);
      const expected = '(a)';
      const values = { a: new Set(['foo']) };
      expectObservable(set.asObservable()).toBe(expected, values);
    });
  });

  it('add should cause the value to emit', () => {
    testScheduler.run(({ expectObservable }) => {
      const set = new SetSubject();
      set.add('foo');
      const expected = '(a)';
      const values = { a: new Set(['foo']) };
      expectObservable(set).toBe(expected, values);
    });
  });

  it('delete should cause an emission without the value', () => {
    const set = new SetSubject(['foo']);
    const results = [];
    set.subscribe((value) => results.push(value));
    expect(results).toEqual([new Set(['foo'])]);
    set.delete('foo');
    expect(results).toEqual([new Set(['foo']), new Set()]);
  });

  it('delete should not emit if the value does not exist', () => {
    const set = new SetSubject(['foo']);
    const results = [];
    set.subscribe((value) => results.push(value));
    expect(results).toEqual([new Set(['foo'])]);
    set.delete('bar');
    expect(results).toEqual([new Set(['foo'])]);
  });

  it('clear should emit the set value', () => {
    const set = new SetSubject(['foo']);
    const results = [];
    set.subscribe((value) => results.push(value));
    expect(results).toEqual([new Set(['foo'])]);
    set.clear();
    expect(results).toEqual([new Set(['foo']), new Set()]);
  });

  it('has operator should emit ', () => {
    testScheduler.run(({ expectObservable }) => {
      const set = new SetSubject(['foo']);
      const expected = '(a)';
      const values = { a: true };
      expectObservable(set.pipe(has('foo'))).toBe(expected, values);
    });
  });

  it('size operator should emit', () => {
    testScheduler.run(({ expectObservable }) => {
      const set = new SetSubject(['foo']);
      const expected = '(a)';
      const values = { a: 1 };
      expectObservable(set.pipe(size())).toBe(expected, values);
    });
  });

  it('entries operator should emit', () => {
    testScheduler.run(({ expectObservable }) => {
      const set = new SetSubject(['foo']);
      const expected = '(a)';
      const values = { a: [['foo', 'foo']] };
      expectObservable(
        set.pipe(
          entries(),
          map((e) => [...e])
        )
      ).toBe(expected, values);
    });
  });

  it('keys operator should emit', () => {
    testScheduler.run(({ expectObservable }) => {
      const set = new SetSubject(['foo']);
      const expected = '(a)';
      const values = { a: ['foo'] };
      expectObservable(
        set.pipe(
          keys(),
          map((k) => [...k])
        )
      ).toBe(expected, values);
    });
  });

  it('values operator should emit', () => {
    testScheduler.run(({ expectObservable }) => {
      const set = new SetSubject(['foo']);
      const expected = '(a)';
      const _values = { a: ['foo'] };
      expectObservable(
        set.pipe(
          values(),
          map((v) => [...v])
        )
      ).toBe(expected, _values);
    });
  });
});
