import { Type } from 'class-transformer';
import 'reflect-metadata';
import { toJSON } from './toJSON';

class TestCls {
  foo!: string;
  bar?: string;
}

describe('toJSON', () => {
  it('should work', () => {
    const cls = new TestCls();
    cls.foo = 'testing';
    expect(toJSON(cls)).toStrictEqual({ foo: 'testing' });
  });

  it('should work with nested classes', () => {
    class Child {
      foo!: string;
    }

    class Parent {
      @Type(() => Child)
      child!: Child;
    }

    const cls = new Parent();
    cls.child = { foo: '' };
    expect(toJSON(cls)).toStrictEqual({ child: { foo: '' } });
  });

  it('should produce a frozen object', () => {
    const cls = new TestCls();
    const json = toJSON(cls);
    expect(() => {
      json.foo = 'abc';
    }).toThrow();
  });
});
