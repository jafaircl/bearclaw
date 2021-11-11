import { Expose } from 'class-transformer';
import { create } from './create';

class TestCls {
  @Expose()
  readonly foo!: string;

  @Expose()
  readonly bar?: string;
}

describe('create', () => {
  it('should work', () => {
    const cls = create(TestCls);
    expect(cls).toBeInstanceOf(TestCls);
  });

  it('should be immutable', () => {
    const cls = create(TestCls);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cls as any).foo = 'test';
    }).toThrow();
  });

  it('should pass options', () => {
    const cls = create(TestCls, { exposeUnsetFields: false });
    expect(Object.keys(cls)).toStrictEqual([]);
  });
});
