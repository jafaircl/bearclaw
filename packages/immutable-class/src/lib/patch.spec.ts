import { immerable } from 'immer';
import 'reflect-metadata';
import { create } from './create';
import { patch } from './patch';

class TestCls {
  readonly foo!: string;
  readonly bar?: string;
}

describe('patch', () => {
  it('should work', () => {
    const cls = create(TestCls);
    const patched = patch(cls, { foo: 'abc' });
    expect(patched).toBeInstanceOf(TestCls);
    expect(patched.foo).toEqual('abc');
  });

  it('should create a frozen class instance', () => {
    const cls = create(TestCls);
    const patched = patch(cls, { foo: 'abc' });
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patched as any).foo = '123';
    }).toThrow();
  });

  it('should leave the original class intact', () => {
    const cls = create(TestCls);
    const patched = patch(cls, { foo: 'abc' });
    expect(cls.foo).toEqual(undefined);
    expect(patched.foo).toEqual('abc');
  });

  it('should not add [immerable]=true to the original class', () => {
    const cls = create(TestCls);
    const patched = patch(cls, { foo: 'abc' });
    expect(cls[immerable]).toEqual(undefined);
    expect(patched.foo).toEqual('abc');
  });
});
