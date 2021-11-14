import { HashSet } from './HashSet';

describe('HashSet', () => {
  it('add should work', () => {
    const set = new HashSet();
    set.add(1);
    expect(set.has(1)).toEqual(true);
  });

  it('should allow passing values in the constructor', () => {
    const set = new HashSet([1]);
    expect(set.has(1)).toEqual(true);
  });

  it('should treat 2 instances of {} as equal keys', () => {
    const set = new HashSet();
    set.add({});
    set.add({});
    expect(set.size).toEqual(1);
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
});
