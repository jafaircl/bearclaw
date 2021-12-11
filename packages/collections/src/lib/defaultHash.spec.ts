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
});
