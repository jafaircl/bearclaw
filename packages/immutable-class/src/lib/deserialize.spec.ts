import { deserialize } from './deserialize';

class TestCls {
  readonly foo!: string;
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

  it('should set properties on the class ', () => {
    const cls = deserialize(TestCls, `{ "bar": "abc" }`);
    expect(cls.bar).toEqual('abc');
  });
});
