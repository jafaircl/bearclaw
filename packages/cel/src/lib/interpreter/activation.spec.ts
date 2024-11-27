/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { timestampNow } from '@bufbuild/protobuf/wkt';
import { RefVal } from '../common/ref/reference';
import { BoolRefVal } from '../common/types/bool';
import { IntRefVal } from '../common/types/int';
import { StringRefVal } from '../common/types/string';
import { TimestampRefVal } from '../common/types/timestamp';
import { HierarchicalActivation, newActivation } from './activation';

describe('Activation', () => {
  it('newActivation', () => {
    expect(() => {
      newActivation(new Map([['a', BoolRefVal.True]]));
    }).not.toThrow();
    expect(() => {
      const act = newActivation(new Map([['a', BoolRefVal.True]]));
      newActivation(act);
    }).not.toThrow();
    expect(() => {
      newActivation('' as any);
    }).toThrow();
    expect(() => {
      newActivation(null as any);
    }).toThrow();
  });

  it('resolve', () => {
    const act = newActivation(new Map([['a', BoolRefVal.True]]));
    const resolved = act.resolveName('a');
    expect(resolved).not.toBeNull();
    expect(resolved).toStrictEqual(BoolRefVal.True);
  });

  it('resolve', () => {
    const act = newActivation(new Map([['a', BoolRefVal.True]]));
    const resolved = act.resolveName('a');
    expect(resolved).not.toBeNull();
    expect(resolved).toStrictEqual(BoolRefVal.True);
  });

  it('resolve absent', () => {
    const act = newActivation(new Map([['a', null]]));
    const resolved = act.resolveName('b');
    expect(resolved).toBeNull();
  });

  it('resolve null', () => {
    const act = newActivation(new Map([['a', null]]));
    const resolved = act.resolveName('a');
    expect(resolved).toBeNull();
  });

  it('resolve lazy', async () => {
    const act = newActivation(
      new Map([['now', () => new TimestampRefVal(timestampNow())]])
    );
    const first = act.resolveName<TimestampRefVal>('now');
    // Wait a tick to ensure the timestamps would be different if the value was
    // not cached after the first call
    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = act.resolveName<TimestampRefVal>('now');
    expect(first?.equal(second!).value()).toEqual(true);
  });

  it('hierarchical', () => {
    const parent = newActivation(
      new Map<string, RefVal>([
        ['a', new StringRefVal('world')],
        ['b', new IntRefVal(BigInt(-42))],
      ])
    );
    const child = newActivation(
      new Map<string, RefVal>([
        ['a', BoolRefVal.True],
        ['c', new StringRefVal('universe')],
      ])
    );
    const combined = new HierarchicalActivation(parent, child);
    // Resolve the shadowed child value.
    expect(combined.resolveName<StringRefVal>('a')?.value()).toEqual(true);
    // Resolve the parent only value.
    expect(combined.resolveName<IntRefVal>('b')?.value()).toEqual(BigInt(-42));
    // Resolve the child only value.
    expect(combined.resolveName<StringRefVal>('c')?.value()).toEqual(
      'universe'
    );
  });
});
