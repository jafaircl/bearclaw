import { defaultHash } from './defaultHash';

describe('defaultHash', () => {
  it('should exist and be a function', () => {
    expect(defaultHash).toBeTruthy();
    expect(defaultHash).toBeInstanceOf(Function);
  });

  it('should work for an empty string', () => {
    const hash1 = defaultHash('');
    const hash2 = defaultHash('');
    expect(hash1).toEqual(hash2);
  });

  it('should create the same hash for equivalent primitive types', () => {
    const hash1 = defaultHash('a');
    const hash2 = defaultHash('a');
    expect(hash1).toEqual(hash2);
  });

  it('should create a different hash for different primitive types', () => {
    const hash1 = defaultHash('a');
    const hash2 = defaultHash('b');
    expect(hash1).not.toEqual(hash2);
  });

  it('should create the same hash for equivalent array types', () => {
    const hash1 = defaultHash(['a']);
    const hash2 = defaultHash(['a']);
    expect(hash1).toEqual(hash2);
  });

  it('should create a different hash for different array types', () => {
    const hash1 = defaultHash(['a']);
    const hash2 = defaultHash(['b']);
    expect(hash1).not.toEqual(hash2);
  });

  it('should create the same hash for equivalent object types', () => {
    const hash1 = defaultHash({ a: 'b' });
    const hash2 = defaultHash({ a: 'b' });
    expect(hash1).toEqual(hash2);
  });

  it('should create a different hash for different object types', () => {
    const hash1 = defaultHash({ a: 'b' });
    const hash2 = defaultHash({ a: 'c' });
    expect(hash1).not.toEqual(hash2);
  });

  it('should create the same hash when an objects keys are in a different order', () => {
    const hash1 = defaultHash({ a: 'b', c: 'd' });
    const hash2 = defaultHash({ c: 'd', a: 'b' });
    expect(hash1).toEqual(hash2);
  });

  it(`should create the same hash when a nested object's keys are in a different order`, () => {
    const hash1 = defaultHash({ a: { b: 'c', d: 'e' }, f: 'g' });
    const hash2 = defaultHash({ f: 'g', a: { d: 'e', b: 'c' } });
    expect(hash1).toEqual(hash2);
  });

  it('should work for very large objects', () => {
    function createLargeObject(numKeys = 1000) {
      const obj = {};
      for (let i = 0; i < numKeys; i += 1) {
        if (i % 2 === 0) {
          obj[i] = Array(numKeys).map(() => createLargeObject(numKeys));
        } else {
          obj[i] = i;
        }
      }
      return obj;
    }
    const hash1 = defaultHash(createLargeObject());
    const hash2 = defaultHash(createLargeObject());
    expect(hash1).toEqual(hash2);
  });

  it('should sort a nested object', () => {
    const hash1 = defaultHash({ a: { b: 'c', d: 'e' }, f: 'g' });
    const hash2 = defaultHash({ f: 'g', a: { d: 'e', b: 'c' } });
    expect(hash1).toEqual(hash2);
  });

  it('should sort a nested array', () => {
    const hash1 = defaultHash(['a', ['b', 'c'], 'd']);
    const hash2 = defaultHash(['d', ['b', 'c'], 'a']);
    expect(hash1).toEqual(hash2);
  });

  it('should sort an oject within a nested array', () => {
    const hash1 = defaultHash(['a', { b: 'c', d: 'e' }, 'f']);
    const hash2 = defaultHash(['f', { d: 'e', b: 'c' }, 'a']);
    expect(hash1).toEqual(hash2);
  });

  it('should sort an array within a nested object', () => {
    const hash1 = defaultHash({ a: ['b', 'c', 'd'], e: 'f' });
    const hash2 = defaultHash({ e: 'f', a: ['d', 'c', 'b'] });
    expect(hash1).toEqual(hash2);
  });

  it('should sort a set', () => {
    const hash1 = defaultHash(new Set(['a', 'b', 'c']));
    const hash2 = defaultHash(new Set(['c', 'b', 'a']));
    expect(hash1).toEqual(hash2);
  });

  it('should sort a map', () => {
    const hash1 = defaultHash(
      new Map([
        ['a', 'b'],
        ['c', 'd'],
      ])
    );
    const hash2 = defaultHash(
      new Map([
        ['c', 'd'],
        ['a', 'b'],
      ])
    );
    expect(hash1).toEqual(hash2);
  });

  it('should sort a nested set', () => {
    const hash1 = defaultHash(new Set(['a', new Set(['b', 'c']), 'd']));
    const hash2 = defaultHash(new Set(['d', new Set(['c', 'b']), 'a']));
    expect(hash1).toEqual(hash2);
  });

  it('should sort a nested map', () => {
    const hash1 = defaultHash(
      new Map<string, string | Map<string, string>>([
        ['a', 'b'],
        [
          'c',
          new Map([
            ['d', 'e'],
            ['f', 'g'],
          ]),
        ],
      ])
    );
    const hash2 = defaultHash(
      new Map<string, string | Map<string, string>>([
        [
          'c',
          new Map([
            ['f', 'g'],
            ['d', 'e'],
          ]),
        ],
        ['a', 'b'],
      ])
    );
    expect(hash1).toEqual(hash2);
  });

  it('should work with a function', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const hash1 = defaultHash(() => {});
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const hash2 = defaultHash(() => {});
    expect(hash1).toEqual(hash2);
  });

  it('should work with a date', () => {
    const hash1 = defaultHash(new Date(0));
    const hash2 = defaultHash(new Date(0));
    expect(hash1).toEqual(hash2);
  });
});
