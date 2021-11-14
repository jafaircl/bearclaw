import { deepSortObject } from './deepSortObject';

describe('utilities/deepSortObject', () => {
  it('should exist and be a function', () => {
    expect(deepSortObject).toBeTruthy();
    expect(deepSortObject).toBeInstanceOf(Function);
  });

  it('should sort object keys recursively', function () {
    const src = {
      z: 'foo',
      b: 'bar',
      a: [
        {
          z: 'foo',
          b: 'bar',
        },
      ],
    };

    const out = deepSortObject(src);

    expect(out).toStrictEqual(src);
    expect(Object.keys(out)).toStrictEqual(['a', 'b', 'z']);
    expect(Object.keys(out.a[0])).toStrictEqual(['b', 'z']);
  });

  it('should use a custom comparator', function () {
    const src = {
      b: 'bar',
      z: 'foo',
      a: [
        {
          b: 'bar',
          z: 'foo',
        },
      ],
    };

    const out = deepSortObject(src, (a, b) => -1 * a.localeCompare(b));

    expect(out).toStrictEqual(src);
    expect(Object.keys(out)).toStrictEqual(['z', 'b', 'a']);
    expect(Object.keys(out.a[0])).toStrictEqual(['z', 'b']);
  });

  it('should not try to sort with other types', function () {
    class Person {
      bar = 'foo';
      walk = {};
    }

    const src = {
      date: new Date(),
      regExp: /foo/,
      string: 'foo',
      number: 27,
      bool: true,
      constr: Person,
      instance: new Person(),
      map: new Map(),
      set: new Set(),
    };

    const out = deepSortObject(src);

    for (const key of Object.keys(out)) {
      expect(out[key]).toEqual(src[key]);
    }
  });
});
