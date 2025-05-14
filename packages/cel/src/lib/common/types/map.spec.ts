import { TestAllTypesSchema } from '../../protogen/cel/expr/conformance/proto3/test_all_types_pb.js';
import { Registry } from './provider';
import { Mapper } from './traits/mapper';

describe('map', () => {
  it('contains', () => {
    const registry = new Registry();
    registry.registerDescriptor(TestAllTypesSchema);

    const reflectMap = registry.nativeToValue(
      new Map([
        [BigInt(1), 'hello'],
        [BigInt(2), 'world'],
      ])
    ) as Mapper;

    // TODO: protomap and refvalmap
    const tests = [
      {
        in: BigInt(1),
        out: true,
      },
      {
        in: 1,
        out: true,
      },
      {
        in: BigInt(2),
        out: true,
      },
      {
        in: 2,
        out: true,
      },
      {
        in: BigInt(3),
        out: false,
      },
      {
        in: 3,
        out: false,
      },
      {
        in: '1',
        out: false,
      },
      {
        in: 1.1,
        out: false,
      },
    ];
    for (const test of tests) {
      expect(
        reflectMap.contains(registry.nativeToValue(test.in)).value()
      ).toEqual(test.out);
    }
  });

  // TODO: more map tests
});
