import { classToPlain, Expose, Type } from 'class-transformer';
import 'reflect-metadata';
import { fromJSON } from './fromJSON';

class TestCls {
  readonly foo!: string;
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

  it('should work with a nested class', () => {
    class Child {
      foo!: string;
    }

    class Parent {
      @Type(() => Child)
      child!: Child;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cls = fromJSON(Parent, { child: { foo: 'abc' } });
    expect(classToPlain(cls)).toStrictEqual({ child: { foo: 'abc' } });
  });

  it('should take options', () => {
    class OptionsCls {
      @Expose()
      readonly foo!: string;

      @Expose()
      readonly bar?: string;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cls = fromJSON(OptionsCls, { abc: '123' } as any, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
      exposeUnsetFields: true,
    });
    expect(Object.keys(cls)).toStrictEqual(['foo', 'bar']);
  });
});
