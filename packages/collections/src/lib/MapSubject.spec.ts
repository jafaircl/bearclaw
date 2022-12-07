import { map, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { MapSubject } from './MapSubject';
import { observeEntries } from './observeEntries';
import { observeGet } from './observeGet';
import { observeHas } from './observeHas';
import { observeKeys } from './observeKeys';
import { observeSize } from './observeSize';
import { observeValues } from './observeValues';

describe('MapSubject', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('Map functionality', () => {
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
  });

  describe('Subject functionality', () => {
    it('should emit values', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new MapSubject();
        map.set('foo', 'bar');
        const expected = '(a)';
        const values = { a: new Map([['foo', 'bar']]) };
        expectObservable(map).toBe(expected, values);
      });
    });

    describe('next', () => {
      it('should emit values', () => {
        testScheduler.run(({ expectObservable }) => {
          const map = new MapSubject();
          map.next(new Map([['foo', 'bar']]));
          const expected = '(a)';
          const values = { a: new Map([['foo', 'bar']]) };
          expectObservable(map).toBe(expected, values);
        });
      });

      it('should overwrite the value from the previous next call', () => {
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

      it('should overwrite the value from the constructor', () => {
        const map = new MapSubject(new Map([['foo', 'bar']]));
        const results = [];
        map.subscribe((value) => results.push(value));
        map.next(new Map([['bar', 'baz']]));
        expect(results).toEqual([
          new Map([['foo', 'bar']]),
          new Map([['bar', 'baz']]),
        ]);
      });

      it('should re-emit the current value if called with no arguments', () => {
        const map = new MapSubject(new Map([['foo', 'bar']]));
        const results = [];
        map.subscribe((value) => results.push(value));
        map.next();
        expect(results).toEqual([
          new Map([['foo', 'bar']]),
          new Map([['foo', 'bar']]),
        ]);
      });

      it('should throw an error if the value is not a Map', () => {
        const map = new MapSubject();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => map.next('foo' as any)).toThrowError(
          'The value passed to MapSubject.next() must be a Map instance.'
        );
      });
    });

    describe('asObservable', () => {
      it('should return an Observable', () => {
        const map = new MapSubject();
        expect(map.asObservable()).toBeInstanceOf(Observable);
      });

      it('should emit the value on subscription', () => {
        testScheduler.run(({ expectObservable }) => {
          const map = new MapSubject(new Map([['foo', 'bar']]));
          const expected = '(a)';
          const values = { a: new Map([['foo', 'bar']]) };
          expectObservable(map.asObservable()).toBe(expected, values);
        });
      });
    });

    describe('set', () => {
      it('should emit the value', () => {
        testScheduler.run(({ expectObservable }) => {
          const map = new MapSubject();
          map.set('foo', 'bar');
          const expected = '(a)';
          const values = { a: new Map([['foo', 'bar']]) };
          expectObservable(map).toBe(expected, values);
        });
      });
    });

    describe('delete', () => {
      it('should emit the value', () => {
        const map = new MapSubject(new Map([['foo', 'bar']]));
        const results = [];
        map.subscribe((value) => results.push(value));
        map.delete('foo');
        expect(results).toEqual([new Map([['foo', 'bar']]), new Map()]);
      });

      it('should not emit if the value does not exist', () => {
        const map = new MapSubject(new Map([['foo', 'bar']]));
        const results = [];
        map.subscribe((value) => results.push(value));
        map.delete('bar');
        expect(results).toEqual([new Map([['foo', 'bar']])]);
      });
    });

    describe('clear', () => {
      it('should emit the value', () => {
        const map = new MapSubject(new Map([['foo', 'bar']]));
        const results = [];
        map.subscribe((value) => results.push(value));
        map.clear();
        expect(results).toEqual([new Map([['foo', 'bar']]), new Map()]);
      });
    });
  });

  describe('consructor', () => {
    it('should accept a Map instance with values', () => {
      const map = new MapSubject(new Map([['foo', 'bar']]));
      expect(map.get('foo')).toEqual('bar');
    });

    it('should throw an error if the value is not a Map', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => new MapSubject('foo' as any)).toThrowError(
        'The value passed to MapSubject constructor must be a Map instance.'
      );
    });
  });

  describe('usage with operators', () => {
    it('should work with observeHas', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new MapSubject(new Map([['foo', 'bar']]));
        const expected = '(a)';
        const values = { a: true };
        expectObservable(map.pipe(observeHas('foo'))).toBe(expected, values);
      });
    });

    it('should work with observeGet', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new MapSubject(new Map([['foo', 'bar']]));
        const expected = '(a)';
        const values = { a: 'bar' };
        expectObservable(map.pipe(observeGet('foo'))).toBe(expected, values);
      });
    });

    it('should work with observeSize', () => {
      testScheduler.run(({ expectObservable }) => {
        const map = new MapSubject(new Map([['foo', 'bar']]));
        const expected = '(a)';
        const values = { a: 1 };
        expectObservable(map.pipe(observeSize())).toBe(expected, values);
      });
    });

    it('should work with observeEntries', () => {
      testScheduler.run(({ expectObservable }) => {
        const _map = new MapSubject(new Map([['foo', 'bar']]));
        const expected = '(a)';
        const values = { a: [['foo', 'bar']] };
        expectObservable(
          _map.pipe(
            observeEntries(),
            map((e) => [...e])
          )
        ).toBe(expected, values);
      });
    });

    it('should work with observeKeys', () => {
      testScheduler.run(({ expectObservable }) => {
        const _map = new MapSubject(new Map([['foo', 'bar']]));
        const expected = '(a)';
        const values = { a: ['foo'] };
        expectObservable(
          _map.pipe(
            observeKeys(),
            map((k) => [...k])
          )
        ).toBe(expected, values);
      });
    });

    it('should work with observeValues', () => {
      testScheduler.run(({ expectObservable }) => {
        const _map = new MapSubject(new Map([['foo', 'bar']]));
        const expected = '(a)';
        const values = { a: ['bar'] };
        expectObservable(
          _map.pipe(
            observeValues(),
            map((v) => [...v])
          )
        ).toBe(expected, values);
      });
    });
  });
});
