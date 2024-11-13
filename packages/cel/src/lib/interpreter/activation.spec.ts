/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { timestampNow } from '@bufbuild/protobuf/wkt';
import { BoolRefVal } from '../common/types/bool';
import { IntRefVal } from '../common/types/int';
import { StringRefVal } from '../common/types/string';
import { TimestampRefVal } from '../common/types/timestamp';
import { HierarchicalActivation, newActivation } from './activation';
import { ResolvedValue } from './resolved-value';

describe('Activation', () => {
  it('newActivation', () => {
    expect(() => {
      newActivation({ a: BoolRefVal.True });
    }).not.toThrow();
    expect(() => {
      const act = newActivation({ a: BoolRefVal.True });
      newActivation(act);
    }).not.toThrow();
    expect(() => {
      newActivation('');
    }).toThrow();
    expect(() => {
      newActivation(null);
    }).toThrow();
  });

  it('resolve', () => {
    const act = newActivation({ a: BoolRefVal.True });
    const resolved = act.resolveName<BoolRefVal>('a');
    expect(resolved).not.toBeNull();
    expect(resolved?.present).toEqual(true);
    expect(resolved?.value).toStrictEqual(BoolRefVal.True);
  });

  it('resolve absent', () => {
    const act = newActivation({ a: BoolRefVal.True });
    const resolved = act.resolveName<BoolRefVal>('b');
    expect(resolved).not.toBeNull();
    expect(resolved).toStrictEqual(ResolvedValue.ABSENT);
  });

  it('resolve null', () => {
    const act = newActivation({ a: null });
    const resolved = act.resolveName('a');
    expect(resolved).not.toBeNull();
    expect(resolved).toStrictEqual(ResolvedValue.NULL_VALUE);
  });

  it('resolve lazy', async () => {
    const act = newActivation({
      now: () => new TimestampRefVal(timestampNow()),
    });
    const first = act.resolveName<TimestampRefVal>('now');
    // Wait a tick to ensure the timestamps would be different if the value was
    // not cached after the first call
    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = act.resolveName<TimestampRefVal>('now');
    expect(first.value.equal(second.value).value()).toEqual(true);
  });

  it('hierarchical', () => {
    const parent = newActivation({
      a: new StringRefVal('world'),
      b: new IntRefVal(BigInt(-42)),
    });
    const child = newActivation({
      a: BoolRefVal.True,
      c: new StringRefVal('universe'),
    });
    const combined = new HierarchicalActivation(parent, child);
    // Resolve the shadowed child value.
    expect(combined.resolveName<BoolRefVal>('a').value.value()).toEqual(true);
    // Resolve the parent only value.
    expect(combined.resolveName<IntRefVal>('b').value.value()).toEqual(
      BigInt(-42)
    );
    // Resolve the child only value.
    expect(combined.resolveName<StringRefVal>('c').value.value()).toEqual(
      'universe'
    );
  });
});
