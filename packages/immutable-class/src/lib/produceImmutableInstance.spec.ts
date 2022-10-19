import { immerable } from 'immer';
import { plainToImmutableInstance } from './plainToImmutableInstance';
import { produceImmutableInstance } from './produceImmutableInstance';

describe('produceImmutableInstance', () => {
  it('should work with a normal class instance', () => {
    class MyClass {
      foo: string;
    }
    const existing = new MyClass();
    existing.foo = 'bar';
    const updated = produceImmutableInstance(existing, (draft) => {
      draft.foo = 'test';
    });
    expect(updated).toBeInstanceOf(MyClass);
    expect(updated.foo).toEqual('test');
  });

  it('should work with a frozen class instance', () => {
    class MyClass {
      foo: string;
    }
    const plain: MyClass = { foo: 'bar' };
    const instance = plainToImmutableInstance(MyClass, plain);
    const updated = produceImmutableInstance(instance, (draft) => {
      draft.foo = 'test';
    });
    expect(updated).toBeInstanceOf(MyClass);
    expect(updated.foo).toEqual('test');
  });

  it('should not modify the original instance', () => {
    class MyClass {
      foo: string;
    }
    const existing = new MyClass();
    existing.foo = 'bar';
    const updated = produceImmutableInstance(existing, (draft) => {
      draft.foo = 'test';
    });
    expect(updated.foo).toEqual('test');
    expect(existing.foo).toEqual('bar');
  });

  it('should produce a frozen instance', () => {
    class MyClass {
      foo: string;
    }
    const existing = new MyClass();
    existing.foo = 'bar';
    const updated = produceImmutableInstance(existing, (draft) => {
      draft.foo = 'test';
    });
    expect(Object.isFrozen(updated)).toEqual(true);
    expect(() => {
      updated.foo = 'test';
    }).toThrow(
      "Cannot assign to read only property 'foo' of object '#<MyClass>'"
    );
  });

  it('should work with an array of instances', () => {
    class MyClass {
      foo: string;
    }
    const existing = new MyClass();
    existing.foo = 'bar';
    const updates = produceImmutableInstance([existing, existing], (draft) => {
      draft.foo = 'test';
    });
    expect(updates.length).toEqual(2);
    for (const update of updates) {
      expect(update).toBeInstanceOf(MyClass);
      expect(update.foo).toEqual('test');
      expect(Object.isFrozen(update)).toEqual(true);
    }
  });

  it('should not add immerable to the original class', () => {
    class MyClass {
      foo: string;
    }
    const existing = new MyClass();
    existing.foo = 'bar';
    const updated = produceImmutableInstance(existing, (draft) => {
      draft.foo = 'test';
    });
    expect(updated.foo).toEqual('test');
    expect(existing[immerable]).toEqual(undefined);
  });
});
