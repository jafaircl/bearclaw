import { Expose } from 'class-transformer';
import { deserialize } from './deserialize';

class TestCls {
  @Expose()
  readonly foo!: string;

  @Expose()
  readonly bar?: string;
}

describe('deserialize', () => {
  it('should work', () => {
    const cls = deserialize(TestCls, `{ "foo": "" }`);
    expect(cls).toBeInstanceOf(TestCls);
  });

  it('should be immutable', () => {
    const cls = deserialize(TestCls, `{ "foo": "" }`);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cls as any).foo = 'test';
    }).toThrow();
  });

  it('should set properties on the class', () => {
    const cls = deserialize(TestCls, `{ "bar": "abc" }`);
    expect(cls.bar).toEqual('abc');
  });

  it('should not set properties that are not on the class', () => {
    const cls = deserialize(TestCls, `{ "test": "" }`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((cls as any).test).toBeUndefined();
  });
});
