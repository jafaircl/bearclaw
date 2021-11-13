import { Expose, Type } from 'class-transformer';
import 'reflect-metadata';
import { serialize } from './serialize';

class TestCls {
  foo!: string;
  bar?: string;
}

describe('serialize', () => {
  it('should work', () => {
    const cls = new TestCls();
    cls.foo = 'testing';
    expect(typeof serialize(cls)).toEqual('string');
    expect(serialize(cls)).toEqual('{"foo":"testing"}');
  });

  it('should work with nested classes', () => {
    class Child {
      @Expose()
      foo!: string;
    }

    class Parent {
      @Expose()
      @Type(() => Child)
      child!: Child;
    }

    const cls = new Parent();
    cls.child = { foo: '' };
    expect(serialize(cls)).toEqual('{"child":{"foo":""}}');
  });
});
