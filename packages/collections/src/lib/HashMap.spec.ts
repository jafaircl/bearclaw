import { HashMap } from './HashMap';
import { measure } from './test-utils';

function createSpeedTestMap() {
  const map = new Map<string, number>();
  for (let i = 0; i < 1000; i++) {
    map.set(i.toString(), i);
    map.delete(i.toString());
  }
  return map;
}

function createSpeedTestHashMap() {
  const map = new HashMap<string, number>();
  for (let i = 0; i < 1000; i++) {
    map.set(i.toString(), i);
    map.delete(i.toString());
  }
  return map;
}

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

  it('should let you specify a custom hashing function', () => {
    const hash = () => 'a';
    const map = new HashMap(null, hash);
    map.set({}, 1);
    map.set({}, 2);
    expect(map.has({})).toEqual(true);
    expect(map.size).toEqual(1);
  });

  it('should treat 2 instances of {} as equal keys', () => {
    const map = new HashMap();
    map.set({}, 'a');
    map.set({}, 'a');
    expect(map.size).toEqual(1);
  });

  it('iterator should work', () => {
    const map = new HashMap([[{}, 'a']]);
    for (const [key, value] of map) {
      expect(key).toEqual({});
      expect(value).toEqual('a');
    }
  });

  it('clear should work', () => {
    const map = new HashMap([[{}, 'a']]);
    expect(map.size).toEqual(1);
    expect(map.has({})).toEqual(true);
    map.clear();
    expect(map.size).toEqual(0);
    expect(map.has({})).toEqual(false);
  });

  it('delete should work', () => {
    const map = new HashMap([[{}, 'a']]);
    expect(map.size).toEqual(1);
    expect(map.has({})).toEqual(true);
    map.delete({});
    expect(map.size).toEqual(0);
    expect(map.has({})).toEqual(false);
  });

  it('entries should work', () => {
    const set = new HashMap([[{}, 'a']]);
    for (const [key, value] of set.entries()) {
      expect(key).toEqual({});
      expect(value).toEqual('a');
    }
  });

  it('forEach should work', () => {
    const map = new HashMap([[{}, 'a']]);
    map.forEach((value, key, _map) => {
      expect(value).toEqual('a');
      expect(key).toEqual(1);
      expect(_map === map).toEqual(true);
    });
  });

  it('forEach should bind the thisArg', () => {
    const map = new HashMap([[{}, 'a']]);
    map.forEach(
      () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((this as any).a).toEqual('b');
      },
      { a: 'b' }
    );
  });

  it('get should work', () => {
    const map = new HashMap([[{}, 'a']]);
    expect(map.get({})).toEqual('a');
    expect(map.get([])).toEqual(undefined);
  });

  it('has should work', () => {
    const map = new HashMap([[{}, 'a']]);
    expect(map.has({})).toEqual(true);
    expect(map.has([])).toEqual(false);
  });

  it('keys should work', () => {
    const map = new HashMap([[{}, 'a']]);
    for (const key of map.keys()) {
      expect(key).toEqual({});
    }
  });

  it('set should work', () => {
    const map = new HashMap();
    expect(map.has({})).toEqual(false);
    map.set({}, 'a');
    expect(map.has({})).toEqual(true);
  });

  it('toStringTag should work', () => {
    const map = new HashMap();
    expect(Object.prototype.toString.call(map)).toEqual('[object HashMap]');
  });

  it('values should work', () => {
    const map = new HashMap([[{}, 'a']]);
    for (const value of map.values()) {
      expect(value).toEqual('a');
    }
  });

  it('speed should be within an order of magnitude of native map', () => {
    const mapSpeed = measure('mapSpeed', createSpeedTestMap);
    const hashMapSpeed = measure('hashMapSpeed', createSpeedTestHashMap);
    expect(mapSpeed.opsPerSecond / hashMapSpeed.opsPerSecond).toBeLessThan(10);
  });
});
