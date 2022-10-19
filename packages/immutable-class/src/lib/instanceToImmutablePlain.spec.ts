import { instanceToImmutablePlain } from './instanceToImmutablePlain';

describe('instanceToImmutablePlain', () => {
  it('should produce a plain object', () => {
    class MyClass {
      foo: string;
    }
    const existing = new MyClass();
    existing.foo = 'bar';
    const plain = instanceToImmutablePlain(existing);
    expect(plain).not.toBeInstanceOf(MyClass);
    expect(plain).toBeInstanceOf(Object);
    expect(plain).toStrictEqual({ foo: 'bar' });
  });

  it('should produce a frozen object', () => {
    class MyClass {
      foo: string;
    }
    const existing = new MyClass();
    existing.foo = 'bar';
    const plain = instanceToImmutablePlain(existing);
    expect(Object.isFrozen(plain)).toEqual(true);
    expect(() => {
      plain.foo = 'test';
    }).toThrow(
      "Cannot assign to read only property 'foo' of object '#<Object>'"
    );
  });

  it('should not freeze the returned array if used with an array', () => {
    class MyClass {
      foo: string;
    }
    const existing = new MyClass();
    const objects = instanceToImmutablePlain([existing]);
    expect(Object.isFrozen(objects)).toEqual(false);
    expect(Object.isFrozen(objects[0])).toEqual(true);
  });
});
