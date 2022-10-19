import { instanceToImmutableInstance } from './instanceToImmutableInstance';

describe('instanceToImmutableInstance', () => {
  it('should produce a copy of an instance', () => {
    class MyClass {
      foo: string;
    }
    const existing = new MyClass();
    existing.foo = 'bar';
    const clone = instanceToImmutableInstance(existing);
    expect(clone).toBeInstanceOf(MyClass);
    expect(existing === clone).toEqual(false);
    expect(clone.foo).toEqual('bar');
  });

  it('should produce a frozen copy', () => {
    class MyClass {
      foo: string;
    }
    const existing = new MyClass();
    existing.foo = 'bar';
    const clone = instanceToImmutableInstance(existing);
    expect(Object.isFrozen(clone)).toEqual(true);
    expect(() => {
      clone.foo = 'test';
    }).toThrow(
      "Cannot assign to read only property 'foo' of object '#<MyClass>'"
    );
  });

  it('should not freeze the returned array if used with an array', () => {
    class MyClass {
      foo: string;
    }
    const existing = new MyClass();
    const clones = instanceToImmutableInstance([existing]);
    expect(Object.isFrozen(clones)).toEqual(false);
    expect(Object.isFrozen(clones[0])).toEqual(true);
  });
});
