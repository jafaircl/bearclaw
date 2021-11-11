import { Expose } from 'class-transformer';
import { immerable } from 'immer';
import 'reflect-metadata';
import { patch } from './patch';

class TestCls {
  [immerable] = true;

  @Expose()
  readonly foo!: string;

  @Expose()
  readonly bar?: string;
}

describe('patch', () => {
  it('should work', () => {
    const cls = new TestCls();
    const patched = patch(cls, { foo: 'abc' });
    expect(patched).toBeInstanceOf(TestCls);
    expect(patched.foo).toEqual('abc');
  });

  it('should create a frozen class instance', () => {
    const cls = new TestCls();
    const patched = patch(cls, { foo: 'abc' });
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patched as any).foo = '123';
    }).toThrow();
  });

  it('should leave the original class intact', () => {
    const cls = new TestCls();
    const patchd = patch(cls, { foo: 'abc' });
    expect(cls.foo).toEqual(undefined);
    expect(patchd.foo).toEqual('abc');
  });
});
