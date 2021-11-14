import { immerable } from 'immer';
import 'reflect-metadata';
import { create } from './create';
import { update } from './update';

class TestCls {
  readonly foo!: string;
  readonly bar?: string;
}

describe('update', () => {
  it('should work', () => {
    const cls = create(TestCls);
    const updated = update(cls, (x) => {
      x.foo = 'abc';
    });
    expect(updated).toBeInstanceOf(TestCls);
    expect(updated.foo).toEqual('abc');
  });

  it('should create a frozen class instance', () => {
    const cls = create(TestCls);
    const updated = update(cls, (x) => {
      x.foo = 'abc';
    });
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updated as any).foo = '123';
    }).toThrow();
  });

  it('should leave the original class intact', () => {
    const cls = create(TestCls);
    const updated = update(cls, (x) => {
      x.foo = 'abc';
    });
    expect(cls.foo).toEqual(undefined);
    expect(updated.foo).toEqual('abc');
  });

  it('should not add [immerable]=true to the original class', () => {
    const cls = create(TestCls);
    const updated = update(cls, (x) => {
      x.foo = 'abc';
    });
    expect(cls[immerable]).toEqual(undefined);
    expect(updated.foo).toEqual('abc');
  });
});
