import { HashSet } from './HashSet';

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

  it('should treat 2 objects with keys in different orders as equal', () => {
    const set = new HashSet();
    set.add({ a: 'a', b: 'b' });
    set.add({ b: 'b', a: 'a' });
    expect(set.size).toEqual(1);
  });

  it('should allow passing values in the constructor', () => {
    const set = new HashSet([1]);
    expect(set.has(1)).toEqual(true);
  });

  it('should let you specify a custom hashing function', () => {
    const hash = () => 'a';
    const set = new HashSet(null, hash);
    set.add({});
    set.add({});
    expect(set.has({})).toEqual(true);
    expect(set.size).toEqual(1);
  });

  it('iterator should work', () => {
    const set = new HashSet([{}]);
    for (const value of set) {
      expect(value).toEqual({});
    }
  });

  it('clear should work', () => {
    const set = new HashSet([{}]);
    expect(set.size).toEqual(1);
    expect(set.has({})).toEqual(true);
    set.clear();
    expect(set.size).toEqual(0);
    expect(set.has({})).toEqual(false);
  });

  it('delete should work', () => {
    const set = new HashSet([{}]);
    expect(set.size).toEqual(1);
    expect(set.has({})).toEqual(true);
    set.delete({});
    expect(set.size).toEqual(0);
    expect(set.has({})).toEqual(false);
  });

  it('forEach should work', () => {
    const set = new HashSet([{}]);
    set.forEach((value1, value2, _set) => {
      expect(value1).toEqual({});
      expect(value2).toEqual({});
      expect(_set === set).toEqual(true);
    });
  });

  it('entries should work', () => {
    const set = new HashSet([{}]);
    for (const [key, value] of set.entries()) {
      expect(key).toEqual({});
      expect(value).toEqual({});
    }
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

  it('has should work', () => {
    const set = new HashSet([{}]);
    expect(set.has({})).toEqual(true);
    expect(set.has([])).toEqual(false);
  });

  it('keys should work', () => {
    const set = new HashSet([{}]);
    for (const key of set.keys()) {
      expect(key).toEqual({});
    }
  });

  it('size should work', () => {
    const set = new HashSet();
    expect(set.size).toEqual(0);
    set.add({});
    expect(set.size).toEqual(1);
    set.add({});
    expect(set.size).toEqual(1);
  });

  it('toStringTag should work', () => {
    const set = new HashSet();
    expect(Object.prototype.toString.call(set)).toEqual('[object HashSet]');
  });

  it('values should work', () => {
    const set = new HashSet([{}]);
    for (const value of set.values()) {
      expect(value).toEqual({});
    }
  });
});
