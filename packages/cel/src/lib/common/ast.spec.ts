import {
  newFunctionReference,
  newIdentReference,
  newSourceInfo,
  OffsetRange,
} from './ast';
import { Location } from './location';
import { ADD_BYTES_OVERLOAD, ADD_DOUBLE_OVERLOAD } from './overloads';
import { StringSource } from './source';
import { BytesRefVal } from './types/bytes';

describe('ast', () => {
  it('SourceInfo', () => {
    const src = new StringSource('a\n? b\n: c', 'custom description');
    const info = newSourceInfo(src);
    expect(info.description()).toEqual('custom description');
    expect(info.lineOffsets().length).toEqual(3);

    info.setOffsetRange(BigInt(1), new OffsetRange(0, 1)); // a
    info.setOffsetRange(BigInt(2), new OffsetRange(4, 5)); // b
    info.setOffsetRange(BigInt(3), new OffsetRange(8, 9)); // c

    expect(info.getStartLocation(BigInt(1))).toStrictEqual(new Location(1, 0));
    expect(info.getStopLocation(BigInt(1))).toStrictEqual(new Location(1, 1));
    expect(info.getStartLocation(BigInt(2))).toStrictEqual(new Location(2, 2));
    expect(info.getStopLocation(BigInt(2))).toStrictEqual(new Location(2, 3));
    expect(info.getStartLocation(BigInt(3))).toStrictEqual(new Location(3, 2));
    expect(info.getStopLocation(BigInt(3))).toStrictEqual(new Location(3, 3));

    expect(info.computeOffset(3, 2)).toEqual(8);
  });

  it('ReferenceInfo - equals', () => {
    const tests = [
      {
        a: newFunctionReference(ADD_BYTES_OVERLOAD),
        b: newFunctionReference(ADD_BYTES_OVERLOAD),
        equal: true,
      },
      {
        a: newFunctionReference(ADD_BYTES_OVERLOAD),
        b: newFunctionReference(ADD_DOUBLE_OVERLOAD),
        equal: false,
      },
      {
        a: newFunctionReference(ADD_BYTES_OVERLOAD),
        b: newFunctionReference(ADD_BYTES_OVERLOAD, ADD_DOUBLE_OVERLOAD),
        equal: false,
      },
      {
        a: newFunctionReference(ADD_DOUBLE_OVERLOAD, ADD_BYTES_OVERLOAD),
        b: newFunctionReference(ADD_BYTES_OVERLOAD, ADD_DOUBLE_OVERLOAD),
        equal: true,
      },
      {
        a: newIdentReference('BYTES'),
        b: newIdentReference('BYTES'),
        equal: true,
      },
      {
        a: newIdentReference('BYTES', new BytesRefVal(new Uint8Array([1, 2]))),
        b: newIdentReference('BYTES'),
        equal: false,
      },
      {
        a: newIdentReference('BYTES', new BytesRefVal(new Uint8Array([1, 2]))),
        b: newIdentReference('BYTES', new BytesRefVal(new Uint8Array([1, 2]))),
        equal: true,
      },
      {
        a: newIdentReference('BYTES', new BytesRefVal(new Uint8Array([1, 2]))),
        b: newIdentReference('BYTES', new BytesRefVal(new Uint8Array([3, 4]))),
        equal: false,
      },
      {
        a: newIdentReference('BYTES', new BytesRefVal(new Uint8Array([1, 2]))),
        b: newFunctionReference(ADD_BYTES_OVERLOAD, ADD_DOUBLE_OVERLOAD),
        equal: false,
      },
    ];
    for (const test of tests) {
      expect(test.a.equals(test.b)).toEqual(test.equal);
    }
  });
});
