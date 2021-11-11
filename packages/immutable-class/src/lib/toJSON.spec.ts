import { Expose, Type } from 'class-transformer';
import 'reflect-metadata';
import { toJSON } from './toJSON';

class TestCls {
  @Expose()
  foo!: string;

  @Expose()
  bar?: string;
}

describe('toJSON', () => {
  it('should work', () => {
    const cls = new TestCls();
    cls.foo = 'testing';
    expect(toJSON(cls)).toStrictEqual({ foo: 'testing', bar: undefined });
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
    expect(toJSON(cls)).toStrictEqual({ child: { foo: '' } });
  });

  it('should take options', () => {
    const cls = new TestCls();
    cls.foo = 'testing';
    expect(toJSON(cls, { exposeUnsetFields: false })).toStrictEqual({
      foo: 'testing',
    });
  });

  it('should produce a frozen object', () => {
    const cls = new TestCls();
    const json = toJSON(cls);
    expect(() => {
      json.foo = 'abc';
    }).toThrow();
  });
});
