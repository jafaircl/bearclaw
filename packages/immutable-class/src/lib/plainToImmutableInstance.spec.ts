import { plainToImmutableInstance } from './plainToImmutableInstance';

describe('plainToImmutableInstance', () => {
  it('should create a class instance', () => {
    class MyClass {
      foo: string;
    }
    const plain: MyClass = { foo: 'bar' };
    const instance = plainToImmutableInstance(MyClass, plain);
    expect(instance).toBeInstanceOf(MyClass);
    expect(instance.foo).toEqual('bar');
  });

  it('should create a frozen instance', () => {
    class MyClass {
      foo: string;
    }
    const plain: MyClass = { foo: 'bar' };
    const instance = plainToImmutableInstance(MyClass, plain);
    expect(Object.isFrozen(instance)).toEqual(true);
    expect(() => {
      instance.foo = 'test';
    }).toThrow(
      "Cannot assign to read only property 'foo' of object '#<MyClass>'"
    );
  });

  it('should not freeze the returned array if used with an array', () => {
    class MyClass {
      foo: string;
    }
    const plain: MyClass = { foo: 'bar' };
    const instances = plainToImmutableInstance(MyClass, [plain]);
    expect(Object.isFrozen(instances)).toEqual(false);
    expect(Object.isFrozen(instances[0])).toEqual(true);
  });
});
