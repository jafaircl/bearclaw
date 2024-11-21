import { isNil } from '@bearclaw/is';
import { DoubleRefVal } from './double';
import { ErrorRefVal } from './error';
import { IntRefVal } from './int';
import { DynamicList, StringList } from './list';
import { Registry } from './provider';

describe('list', () => {
  it('add empty', () => {
    const reg = new Registry();
    const list = new DynamicList(reg, [true]);
    expect(list.add(new DynamicList(reg, [])) === list).toEqual(true);
    expect(new DynamicList(reg, []).add(list) === list).toEqual(true);
  });

  it('add error', () => {
    const reg = new Registry();
    const list = new DynamicList(reg, [true]);
    expect(list.add(new DoubleRefVal(3.14))).toStrictEqual(
      new ErrorRefVal('no such overload')
    );
  });

  it('base contains', () => {
    const reg = new Registry();
    const list = new DynamicList(reg, [1.0, 2.0, 3.0]);
    const tests = [
      {
        in: new DoubleRefVal(NaN),
        out: false,
      },
    ];
    for (const test of tests) {
      expect(list.contains(test.in).value()).toEqual(test.out);
    }
  });

  it('convertToNative', () => {
    const registry = new Registry();
    const doubleList = new DynamicList(registry, [1.0, 2.0]);
    expect(doubleList.convertToNative(Array)).toStrictEqual([1.0, 2.0]);
    const stringList = new StringList(registry, ['hello', 'world']);
    expect(stringList.convertToNative(Array)).toStrictEqual(['hello', 'world']);
  });

  it('iterator', () => {
    const registry = new Registry();
    const list = new DynamicList(registry, [1.0, 2.0]);
    const iter = list.iterator();
    let i = 0;
    while (iter.hasNext().value() === true) {
      const val = iter.next();
      if (isNil(val)) {
        expect(false).toEqual(true);
        return;
      }
      expect(val.value()).toEqual(list.get(new IntRefVal(BigInt(i))).value());
      i++;
    }
    expect(i).toEqual(2);
  });

  // TODO: more list tests
});
