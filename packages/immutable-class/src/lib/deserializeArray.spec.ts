import { deserializeArray } from './deserializeArray';

class TestCls {
  readonly foo!: string;
  readonly bar?: string;
}

describe('deserializeArray', () => {
  it('should work', () => {
    const cls = deserializeArray(TestCls, `[{ "foo": "" }]`);
    expect(cls[0]).toBeInstanceOf(TestCls);
  });

  it('should be immutable', () => {
    const cls = deserializeArray(TestCls, `[{ "foo": "" }]`);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cls[0] as any).foo = 'test';
    }).toThrow();
  });

  it('should set properties on the class', () => {
    const cls = deserializeArray(TestCls, `[{ "bar": "abc" }]`);
    expect(cls[0].bar).toEqual('abc');
  });

  it('should create multiple classes', () => {
    const cls = deserializeArray(
      TestCls,
      `[{ "foo": "123" },{ "bar": "abc" }]`
    );
    expect(cls[0].foo).toEqual('123');
    expect(cls[1].bar).toEqual('abc');
  });
});
