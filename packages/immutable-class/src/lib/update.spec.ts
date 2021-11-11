import { Expose } from 'class-transformer';
import { immerable } from 'immer';
import 'reflect-metadata';
import { update } from './update';

class TestCls {
  [immerable] = true;

  @Expose()
  readonly foo!: string;

  @Expose()
  readonly bar?: string;
}

describe('update', () => {
  it('should work', () => {
    const cls = new TestCls();
    const updated = update(cls, (x) => {
      x.foo = 'abc';
    });
    expect(updated).toBeInstanceOf(TestCls);
    expect(updated.foo).toEqual('abc');
  });

  it('should create a frozen class instance', () => {
    const cls = new TestCls();
    const updated = update(cls, (x) => {
      x.foo = 'abc';
    });
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updated as any).foo = '123';
    }).toThrow();
  });

  it('should leave the original class intact', () => {
    const cls = new TestCls();
    const updated = update(cls, (x) => {
      x.foo = 'abc';
    });
    expect(cls.foo).toEqual(undefined);
    expect(updated.foo).toEqual('abc');
  });
});
