import { immerable } from 'immer';
import { clone } from './clone';
import { patch } from './patch';

class TestCls {
  [immerable] = true;
  foo!: string;
  bar?: string;
}

describe('clone', () => {
  it('should work', () => {
    const cls = new TestCls();
    const copy = clone(cls);
    expect(copy).toBeInstanceOf(TestCls);
  });

  it('should copy values', () => {
    const cls = new TestCls();
    cls.foo = 'test';
    const copy = clone(cls);
    expect(copy.foo).toEqual('test');
  });

  it('should not modify the original class if it is modified', () => {
    const cls = new TestCls();
    cls.foo = 'test';
    const copy = clone(cls);
    const patched = patch(copy, { bar: 'abc' });
    expect(patched.bar).toEqual('abc');
    expect(copy.bar).toBeUndefined();
  });
});
