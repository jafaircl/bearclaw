import { HashSet } from './HashSet';
import { measure } from './test-utils';

describe('HashSet', () => {
  it('add should work', () => {
    const set = new HashSet();
    set.add(1);
    expect(set.has(1)).toEqual(true);
  });

  it('should treat 2 instances of {} as equal keys', () => {
    const set = new HashSet();
    set.add({});
    set.add({});
    expect(set.size).toEqual(1);
  });

  it('should allow passing values in the constructor', () => {
    const set = new HashSet([1]);
    expect(set.has(1)).toEqual(true);
  });

  it('should let you specify a custom hashing function', () => {
    const hash = () => 'a';
    const set = new HashSet(null, hash);
    set.add(1);
    set.add(2);
    expect(set.has(1)).toEqual(true);
    expect(set.size).toEqual(1);
  });

  it('clear should work', () => {
    const set = new HashSet(['a']);
    set.clear();
    expect(set.size).toEqual(0);
    expect(set.has('a')).toEqual(false);
  });

  it('delete should work', () => {
    const set = new HashSet(['a']);
    set.delete('a');
    expect(set.size).toEqual(0);
    expect(set.has('a')).toEqual(false);
  });

  it('forEach should work', () => {
    const set = new HashSet(['a']);
    set.forEach((value1, value2, _set) => {
      expect(value1).toEqual('a');
      expect(value2).toEqual('a');
      expect(_set === set).toEqual(true);
    });
  });

  it('forEach should bind the thisArg', () => {
    const set = new HashSet(['a']);
    set.forEach(
      () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((this as any).a).toEqual('b');
      },
      { a: 'b' }
    );
  });

  it('toStringTag should work', () => {
    const set = new HashSet();
    expect(Object.prototype.toString.call(set)).toEqual('[object HashSet]');
  });

  it('should be within an order of magnitude as fast as native Set', () => {
    const measureSet = measure('Native Set', () => {
      const set = new Set();
      for (let i = 0; i < 100; i++) {
        set.add(i);
        set.has(i);
        set.delete(i);
      }
    });
    const measureHashSet = measure('HashSet', () => {
      const set = new HashSet();
      for (let i = 0; i < 100; i++) {
        set.add(i);
        set.has(i);
        set.delete(i);
      }
    });
    console.log(measureHashSet.opsPerSecond);
    expect(measureSet.opsPerSecond / measureHashSet.opsPerSecond).toBeLessThan(
      10
    );
  });
});
