import { classToPlain, Expose, Type } from 'class-transformer';
import 'reflect-metadata';
import { fromJSON } from './fromJSON';

class TestCls {
  @Expose()
  readonly foo!: string;

  @Expose()
  readonly bar?: string;
}

describe('fromJSON', () => {
  it('should work', () => {
    const cls = fromJSON(TestCls, { foo: '' });
    expect(cls).toBeInstanceOf(TestCls);
  });

  it('should be immutable', () => {
    const cls = fromJSON(TestCls, { foo: '' });
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cls as any).foo = 'test';
    }).toThrow();
  });

  it('should set properties on the class', () => {
    const cls = fromJSON(TestCls, { bar: 'abc' });
    expect(cls.bar).toEqual('abc');
  });

  it('should not set properties that are not on the class', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cls = fromJSON(TestCls, { test: '' } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((cls as any).test).toBeUndefined();
  });

  it('should work with a nested class', () => {
    class Child {
      @Expose()
      foo!: string;
    }

    class Parent {
      @Expose()
      @Type(() => Child)
      child!: Child;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cls = fromJSON(Parent, { child: { foo: 'abc', bar: 1 } } as any);
    expect(classToPlain(cls)).toStrictEqual({ child: { foo: 'abc' } });
  });
});
