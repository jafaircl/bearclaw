import { BoolRefVal } from './bool';
import {
  AttributeTrail,
  isUnknownRefVal,
  mergeUnknowns,
  qualifyAttribute,
  UnknownRefVal,
  unspecifiedAttribute,
} from './unknown';

describe('Unknown', () => {
  it('isUnknownRefVal', () => {
    expect(isUnknownRefVal(new UnknownRefVal(BigInt(0)))).toBe(true);
    expect(isUnknownRefVal(BoolRefVal.True)).toBe(false);
  });

  it('AttributeTrail equals', () => {
    const tests = [
      { a: unspecifiedAttribute, b: new AttributeTrail(''), equal: true },
      { a: new AttributeTrail('a'), b: new AttributeTrail(''), equal: false },
      { a: new AttributeTrail('a'), b: new AttributeTrail('a'), equal: true },
      {
        a: qualifyAttribute(new AttributeTrail('a'), 'b'),
        b: new AttributeTrail('b'),
        equal: false,
      },
      {
        a: qualifyAttribute(new AttributeTrail('a'), 'b'),
        b: qualifyAttribute(new AttributeTrail('a'), 1),
        equal: false,
      },
      {
        a: qualifyAttribute(new AttributeTrail('a'), 'b'),
        b: qualifyAttribute(new AttributeTrail('a'), BigInt(1)),
        equal: false,
      },
      {
        a: qualifyAttribute(new AttributeTrail('a'), 1),
        b: qualifyAttribute(new AttributeTrail('a'), '1'),
        equal: false,
      },
      {
        a: qualifyAttribute(new AttributeTrail('a'), BigInt(1)),
        b: qualifyAttribute(new AttributeTrail('a'), '1'),
        equal: false,
      },
      {
        a: qualifyAttribute(new AttributeTrail('a'), 'b'),
        b: qualifyAttribute(new AttributeTrail('a'), 'b'),
        equal: true,
      },
      {
        a: qualifyAttribute(new AttributeTrail('a'), BigInt(20)),
        b: qualifyAttribute(new AttributeTrail('a'), BigInt(20)),
        equal: true,
      },
      {
        a: qualifyAttribute(new AttributeTrail('a'), BigInt(20)),
        b: qualifyAttribute(new AttributeTrail('a'), BigInt(21)),
        equal: false,
      },
      {
        a: qualifyAttribute(new AttributeTrail('a'), BigInt(20)),
        b: qualifyAttribute(new AttributeTrail('a'), 20),
        equal: true,
      },
    ];
    for (const test of tests) {
      expect(test.a.equal(test.b)).toBe(test.equal);
    }
  });

  it('AttributeTrail toString', () => {
    const tests = [
      {
        attr: unspecifiedAttribute,
        out: '<unspecified>',
      },
      {
        attr: new AttributeTrail('a'),
        out: 'a',
      },
      {
        attr: qualifyAttribute(new AttributeTrail('a'), false),
        out: 'a[false]',
      },
      {
        attr: qualifyAttribute(new AttributeTrail('a'), 'b'),
        out: 'a.b',
      },
      {
        attr: qualifyAttribute(
          qualifyAttribute(new AttributeTrail('a'), 'b'),
          '$this'
        ),
        out: 'a.b["$this"]',
      },
      {
        attr: qualifyAttribute(new AttributeTrail('a'), 12),
        out: 'a[12]',
      },
    ];
    for (const test of tests) {
      expect(test.attr.toString()).toEqual(test.out);
    }
  });

  it('Unknown contains', () => {
    const tests = [
      {
        unk: new UnknownRefVal(BigInt(1)),
        other: new UnknownRefVal(BigInt(1), unspecifiedAttribute),
        out: true,
      },
      {
        unk: new UnknownRefVal(
          BigInt(3),
          qualifyAttribute(new AttributeTrail('a'), true)
        ),
        other: new UnknownRefVal(
          BigInt(4),
          qualifyAttribute(new AttributeTrail('a'), 'b')
        ),
        out: false,
      },
      {
        unk: new UnknownRefVal(
          BigInt(3),
          qualifyAttribute(new AttributeTrail('a'), 'b')
        ),
        other: new UnknownRefVal(
          BigInt(4),
          qualifyAttribute(new AttributeTrail('a'), 'b')
        ),
        out: false,
      },
      {
        unk: new UnknownRefVal(
          BigInt(3),
          qualifyAttribute(new AttributeTrail('a'), 'c')
        ),
        other: new UnknownRefVal(
          BigInt(3),
          qualifyAttribute(new AttributeTrail('a'), 'b')
        ),
        out: false,
      },
      {
        unk: mergeUnknowns(
          new UnknownRefVal(
            BigInt(3),
            qualifyAttribute(new AttributeTrail('a'), true)
          ),
          new UnknownRefVal(
            BigInt(4),
            qualifyAttribute(new AttributeTrail('a'), 'b')
          )
        ),
        other: new UnknownRefVal(
          BigInt(3),
          qualifyAttribute(new AttributeTrail('a'), true)
        ),
        out: true,
      },
      {
        unk: new UnknownRefVal(
          BigInt(3),
          qualifyAttribute(new AttributeTrail('a'), true)
        ),
        other: mergeUnknowns(
          new UnknownRefVal(
            BigInt(3),
            qualifyAttribute(new AttributeTrail('a'), true)
          ),
          new UnknownRefVal(
            BigInt(4),
            qualifyAttribute(new AttributeTrail('a'), 'b')
          )
        ),
        out: false,
      },
    ];
    for (const test of tests) {
      expect(test.unk.contains(test.other)).toEqual(test.out);
    }
  });

  it('Unknown ids', () => {
    const tests = [
      {
        unk: new UnknownRefVal(BigInt(1)),
        ids: [BigInt(1)],
        attrs: ['<unspecified>'],
      },
      {
        unk: new UnknownRefVal(
          BigInt(2),
          qualifyAttribute(new AttributeTrail('a'), true)
        ),
        ids: [BigInt(2)],
        attrs: ['a[true]'],
      },
      {
        unk: new UnknownRefVal(
          BigInt(3),
          qualifyAttribute(new AttributeTrail('a'), 'b')
        ),
        ids: [BigInt(3)],
        attrs: ['a.b'],
      },
      {
        unk: new UnknownRefVal(
          BigInt(4),
          qualifyAttribute(new AttributeTrail('a'), 'c')
        ),
        ids: [BigInt(4)],
        attrs: ['a.c'],
      },
      {
        unk: mergeUnknowns(
          new UnknownRefVal(
            BigInt(4),
            qualifyAttribute(new AttributeTrail('a'), 'b')
          ),
          new UnknownRefVal(
            BigInt(3),
            qualifyAttribute(new AttributeTrail('a'), true)
          )
        ),
        ids: [BigInt(4), BigInt(3)],
        attrs: ['a.b', 'a[true]'],
      },
    ];
    for (const test of tests) {
      expect(test.unk.ids()).toEqual(test.ids);
      expect(
        test.unk.attributeTrails().flatMap((e) => e[1].map((v) => v.toString()))
      ).toEqual(test.attrs);
    }
  });

  it('Unknown string', () => {
    const tests = [
      {
        unk: new UnknownRefVal(BigInt(1)),
        out: '<unspecified> (1)',
      },
      {
        unk: new UnknownRefVal(BigInt(1), unspecifiedAttribute),
        out: '<unspecified> (1)',
      },
      {
        unk: new UnknownRefVal(BigInt(2), new AttributeTrail('a')),
        out: 'a (2)',
      },
      {
        unk: new UnknownRefVal(
          BigInt(3),
          qualifyAttribute(new AttributeTrail('a'), false)
        ),
        out: 'a[false] (3)',
      },
      {
        unk: mergeUnknowns(
          new UnknownRefVal(
            BigInt(3),
            qualifyAttribute(new AttributeTrail('a'), true)
          ),
          new UnknownRefVal(
            BigInt(4),
            qualifyAttribute(new AttributeTrail('a'), 'b')
          )
        ),
        out: 'a[true] (3), a.b (4)',
      },
      {
        // this case might occur in a logical condition where the attributes are equal.
        unk: mergeUnknowns(
          new UnknownRefVal(
            BigInt(3),
            qualifyAttribute(new AttributeTrail('a'), 0)
          ),
          new UnknownRefVal(
            BigInt(3),
            qualifyAttribute(new AttributeTrail('a'), 0)
          )
        ),
        out: 'a[0] (3)',
      },
      {
        // this case might occur if attribute tracking through comprehensions is supported
        unk: mergeUnknowns(
          new UnknownRefVal(
            BigInt(3),
            qualifyAttribute(new AttributeTrail('a'), 0)
          ),
          new UnknownRefVal(
            BigInt(3),
            qualifyAttribute(new AttributeTrail('a'), 1)
          )
        ),
        out: '[a[0] a[1]] (3)',
      },
    ];
    for (const test of tests) {
      expect(test.unk.toString()).toEqual(test.out);
    }
  });
});
