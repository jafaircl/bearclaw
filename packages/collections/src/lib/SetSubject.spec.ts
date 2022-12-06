import { map, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observeEntries } from './observeEntries';
import { observeHas } from './observeHas';
import { observeKeys } from './observeKeys';
import { observeSize } from './observeSize';
import { observeValues } from './observeValues';
import { SetSubject } from './SetSubject';

describe('SetSubject', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      // console.log(JSON.stringify({ actual, expected }, null, 2));
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('Set functionality', () => {
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
  });

  describe('Subject functionality', () => {
    it('should emit the value on subscription', () => {
      testScheduler.run(({ expectObservable }) => {
        const set = new SetSubject();
        set.add('foo');
        const expected = '(a)';
        const values = { a: new Set(['foo']) };
        expectObservable(set).toBe(expected, values);
      });
    });

    describe('constructor', () => {
      it('should accept a Set instance with values', () => {
        const set = new SetSubject(new Set(['foo']));
        expect(set.has('foo')).toEqual(true);
      });
    });

    describe('next', () => {
      it('should emit the value', () => {
        testScheduler.run(({ expectObservable }) => {
          const set = new SetSubject();
          set.next(new Set(['foo']));
          const expected = '(a)';
          const values = { a: new Set(['foo']) };
          expectObservable(set).toBe(expected, values);
        });
      });

      it('should overwrite the value from the previous next call', () => {
        const set = new SetSubject();
        const results = [];
        set.subscribe((value) => results.push(value));
        set.next(new Set(['foo']));
        set.next(new Set(['bar']));
        expect(results).toEqual([
          new Set(),
          new Set(['foo']),
          new Set(['bar']),
        ]);
      });

      it('should overwrite the value from the constructor', () => {
        const set = new SetSubject(new Set(['foo']));
        const results = [];
        set.subscribe((value) => results.push(value));
        set.next(new Set(['bar']));
        expect(results).toEqual([new Set(['foo']), new Set(['bar'])]);
      });

      it('should re-emit the current value if called with no arguments', () => {
        const set = new SetSubject(new Set(['foo']));
        const results = [];
        set.subscribe((value) => results.push(value));
        set.next();
        expect(results).toEqual([new Set(['foo']), new Set(['foo'])]);
      });
    });

    describe('asObservable', () => {
      it('should return an Observable', () => {
        const set = new SetSubject();
        expect(set.asObservable()).toBeInstanceOf(Observable);
      });

      it('should emit the value on subscription', () => {
        testScheduler.run(({ expectObservable }) => {
          const set = new SetSubject();
          set.add('foo');
          const expected = '(a)';
          const values = { a: new Set(['foo']) };
          expectObservable(set.asObservable()).toBe(expected, values);
        });
      });

      it('should emit the value on subscription if the value was set in the constructor', () => {
        testScheduler.run(({ expectObservable }) => {
          const set = new SetSubject(new Set(['foo']));
          const expected = '(a)';
          const values = { a: new Set(['foo']) };
          expectObservable(set.asObservable()).toBe(expected, values);
        });
      });
    });

    describe('add ', () => {
      it('should emit the value', () => {
        testScheduler.run(({ expectObservable }) => {
          const set = new SetSubject();
          set.add('foo');
          const expected = '(a)';
          const values = { a: new Set(['foo']) };
          expectObservable(set).toBe(expected, values);
        });
      });
    });

    describe('delete', () => {
      it('should emit the value', () => {
        const set = new SetSubject(new Set(['foo']));
        const results = [];
        set.subscribe((value) => results.push(value));
        expect(results).toEqual([new Set(['foo'])]);
        set.delete('foo');
        expect(results).toEqual([new Set(['foo']), new Set()]);
      });

      it('should not emit the value if the value does not exist', () => {
        const set = new SetSubject(new Set(['foo']));
        const results = [];
        set.subscribe((value) => results.push(value));
        expect(results).toEqual([new Set(['foo'])]);
        set.delete('bar');
        expect(results).toEqual([new Set(['foo'])]);
      });
    });

    describe('clear', () => {
      it('should emit the value', () => {
        const set = new SetSubject(new Set(['foo']));
        const results = [];
        set.subscribe((value) => results.push(value));
        expect(results).toEqual([new Set(['foo'])]);
        set.clear();
        expect(results).toEqual([new Set(['foo']), new Set()]);
      });
    });
  });

  describe('usage with operators', () => {
    describe('observeHas', () => {
      it('should emit the value', () => {
        testScheduler.run(({ expectObservable }) => {
          const set = new SetSubject(new Set(['foo']));
          const expected = '(a)';
          const values = { a: true };
          expectObservable(set.pipe(observeHas('foo'))).toBe(expected, values);
        });
      });
    });

    describe('observeSize', () => {
      it('should emit the value', () => {
        testScheduler.run(({ expectObservable }) => {
          const set = new SetSubject(new Set(['foo']));
          const expected = '(a)';
          const values = { a: 1 };
          expectObservable(set.pipe(observeSize())).toBe(expected, values);
        });
      });
    });

    describe('observeEntries', () => {
      it('should emit the value', () => {
        testScheduler.run(({ expectObservable }) => {
          const set = new SetSubject(new Set(['foo']));
          const expected = '(a)';
          const values = { a: [['foo', 'foo']] };
          expectObservable(
            set.pipe(
              observeEntries(),
              map((e) => [...e])
            )
          ).toBe(expected, values);
        });
      });
    });

    describe('observeKeys', () => {
      it('should emit the value', () => {
        testScheduler.run(({ expectObservable }) => {
          const set = new SetSubject(new Set(['foo']));
          const expected = '(a)';
          const values = { a: ['foo'] };
          expectObservable(
            set.pipe(
              observeKeys(),
              map((k) => [...k])
            )
          ).toBe(expected, values);
        });
      });
    });

    describe('observeValues', () => {
      it('should emit the value', () => {
        testScheduler.run(({ expectObservable }) => {
          const set = new SetSubject(new Set(['foo']));
          const expected = '(a)';
          const values = { a: ['foo'] };
          expectObservable(
            set.pipe(
              observeValues(),
              map((v) => [...v])
            )
          ).toBe(expected, values);
        });
      });
    });
  });
});
