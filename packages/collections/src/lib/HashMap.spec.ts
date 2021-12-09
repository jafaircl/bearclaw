import { HashMap } from './HashMap';
import { measure } from './test-utils';

describe('HashMap', () => {
  it('set should work', () => {
    const map = new HashMap();
    map.set(1, 1);
    expect(map.has(1)).toEqual(true);
  });

  it('should allow passing entries in the constructor', () => {
    const map = new HashMap([[1, 2]]);
    expect(map.has(1)).toEqual(true);
  });

  it('should treat 2 instances of {} as equal keys', () => {
    const map = new HashMap();
    map.set({}, 'a');
    map.set({}, 'a');
    expect(map.size).toEqual(1);
  });

  it('forEach should work', () => {
    const map = new HashMap([[1, 'a']]);
    map.forEach((value, key, _map) => {
      expect(value).toEqual('a');
      expect(key).toEqual(1);
      expect(_map === map).toEqual(true);
    });
  });

  it('forEach should bind the thisArg', () => {
    const map = new HashMap([[1, 'a']]);
    map.forEach(
      () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((this as any).a).toEqual('b');
      },
      { a: 'b' }
    );
  });

  it('toStringTag should work', () => {
    const map = new HashMap();
    expect(Object.prototype.toString.call(map)).toEqual('[object HashMap]');
  });

  it('should be within an order of magnitude as fast as native Map', () => {
    const measureMap = measure('Native Map', () => {
      const map = new Map();
      for (let i = 0; i < 100; i++) {
        map.set(i, i);
        map.has(i);
        map.delete(i);
      }
    });
    const measureHashMap = measure('HashMap', () => {
      const map = new HashMap();
      for (let i = 0; i < 100; i++) {
        map.set(i, '');
        map.has(i);
        map.delete(i);
      }
    });
    console.log(measureHashMap.opsPerSecond);
    expect(measureMap.opsPerSecond / measureHashMap.opsPerSecond).toBeLessThan(
      10
    );
  });
});
