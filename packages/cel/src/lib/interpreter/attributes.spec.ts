/* eslint-disable @typescript-eslint/no-explicit-any */
import { Container } from '../common/container';
import { BoolRefVal } from '../common/types/bool';
import { ErrorRefVal } from '../common/types/error';
import { IntRefVal } from '../common/types/int';
import { Registry } from '../common/types/provider';
import { IntType, Type } from '../common/types/types';
import { EmptyActivation, MapActivation } from './activation';
import { AttrFactory, AttributeFactory, Qualifier } from './attributes';
import { ConstValue } from './interpretable';

describe('attributes', () => {
  it('AbsoluteAttribute', () => {
    const reg = new Registry();
    const container = new Container('acme.ns');
    const attrs = new AttrFactory(container, reg, reg);
    const vars = new MapActivation({
      'acme.a': {
        b: {
          4: new Map([[false, 'success']]),
        },
      },
    });
    // acme.a.b[4][false]
    const attr = attrs.absoluteAttribute(BigInt(1), 'acme.a');
    const qualB = makeQualifier(attrs, null, BigInt(2), 'b');
    const qual4 = makeQualifier(attrs, null, BigInt(3), BigInt(4));
    const qualFalse = makeQualifier(attrs, null, BigInt(4), false);
    attr.addQualifier(qualB);
    attr.addQualifier(qual4);
    attr.addQualifier(qualFalse);
    const out = attr.resolve(vars);
    expect(out).toStrictEqual('success');
    expect(true).toBeTruthy();
  });

  it('AbsoluteAttribute - type', () => {
    const reg = new Registry();
    const attrs = new AttrFactory(new Container(), reg, reg);

    // int
    const attr = attrs.absoluteAttribute(BigInt(1), 'int');
    const out = attr.resolve(new EmptyActivation());
    expect(out).toStrictEqual(IntType);
  });

  it('AbsoluteAttribute - error', () => {
    const reg = new Registry();
    const attrs = new AttrFactory(new Container(), reg, reg);
    const vars = new MapActivation({
      err: new ErrorRefVal('invalid variable computation'),
    });

    // acme.a.b[4][false]
    const attr = attrs.absoluteAttribute(BigInt(1), 'err');
    const qualMsg = makeQualifier(attrs, null, BigInt(2), 'message');
    attr.addQualifier(qualMsg);
    const out = attr.resolve(vars);
    expect(out).toStrictEqual(new Error('invalid variable computation'));
  });

  // TODO: this test needs things from interpretable to work
  it('RelativeAttribute', () => {
    const reg = new Registry();
    const attrs = new AttrFactory(new Container(), reg, reg);
    const data = {
      a: new Map([[BigInt(-1), [BigInt(2), BigInt(42)]]]),
      b: BigInt(1),
    };
    const vars = new MapActivation(data);

    // The relative attribute under test is applied to a map literal:
    // {
    //   a: {-1: [2, 42], b: 1}
    //   b: 1
    // }
    //
    // The expression being evaluated is: <map-literal>.a[-1][b] -> 42
    const op = new ConstValue(BigInt(1), reg.nativeToValue(data));
    const attr = attrs.relativeAttribute(BigInt(1), op);
    const qualA = makeQualifier(attrs, null, BigInt(2), 'a');
    const qualNegOne = makeQualifier(attrs, null, BigInt(3), BigInt(-1));
    attr.addQualifier(qualA);
    attr.addQualifier(qualNegOne);
    attr.addQualifier(attrs.absoluteAttribute(BigInt(4), 'b'));
    const out = attr.resolve(vars);
    expect(out).toStrictEqual(new IntRefVal(BigInt(42)));
  });

  it('RelativeAttribute - oneof', () => {
    const reg = new Registry();
    const attrs = new AttrFactory(new Container('acme.ns'), reg, reg);
    const data = {
      a: new Map([[BigInt(-1), [BigInt(2), BigInt(42)]]]),
      ['acme.b']: BigInt(1),
    };
    const vars = new MapActivation(data);
    // The relative attribute under test is applied to a map literal:
    // {
    //   a: {-1: [2, 42], b: 1}
    //   b: 1
    // }
    //
    // The expression being evaluated is: <map-literal>.a[-1][b] -> 42
    //
    // However, since the test is validating what happens with maybe attributes
    // the attribute resolution must also consider the following variations:
    // - <map-literal>.a[-1][acme.ns.b]
    // - <map-literal>.a[-1][acme.b]
    //
    // The correct behavior should yield the value of the last alternative.
    const op = new ConstValue(BigInt(1), reg.nativeToValue(data));
    const attr = attrs.relativeAttribute(BigInt(1), op);
    const qualA = makeQualifier(attrs, null, BigInt(2), 'a');
    const qualNeg1 = makeQualifier(attrs, null, BigInt(3), BigInt(-1));
    attr.addQualifier(qualA);
    attr.addQualifier(qualNeg1);
    attr.addQualifier(attrs.maybeAttribute(BigInt(4), 'b'));
    const out = attr.resolve(vars);
    expect(out).toStrictEqual(new IntRefVal(BigInt(42)));
  });

  it('RelativeAttributeConditional', () => {
    const reg = new Registry();
    const attrs = new AttrFactory(new Container(), reg, reg);
    const data = {
      a: new Map([[BigInt(-1), [BigInt(2), BigInt(42)]]]),
      b: [BigInt(0), BigInt(1)],
      c: [BigInt(1), BigInt(0)],
    };
    const vars = new MapActivation(data);

    // The relative attribute under test is applied to a map literal:
    // {
    //   a: {-1: [2, 42], b: 1}
    //   b: [0, 1],
    //   c: {1, 0},
    // }
    //
    // The expression being evaluated is:
    // <map-literal>.a[-1][(false ? b : c)[0]] -> 42
    //
    // Effectively the same as saying <map-literal>.a[-1][c[0]]
    const cond = new ConstValue(BigInt(2), BoolRefVal.False);
    const condAttr = attrs.conditionalAttribute(
      BigInt(4),
      cond,
      attrs.absoluteAttribute(BigInt(5), 'b'),
      attrs.absoluteAttribute(BigInt(6), 'c')
    );
    const qual0 = makeQualifier(attrs, null, BigInt(7), BigInt(0));
    condAttr.addQualifier(qual0);

    const obj = new ConstValue(BigInt(1), reg.nativeToValue(data));
    const attr = attrs.relativeAttribute(BigInt(1), obj);
    const qualA = makeQualifier(attrs, null, BigInt(2), 'a');
    const qualNeg1 = makeQualifier(attrs, null, BigInt(3), BigInt(-1));
    attr.addQualifier(qualA);
    attr.addQualifier(qualNeg1);
    attr.addQualifier(condAttr);
    const out = attr.resolve(vars);
    expect(out).toStrictEqual(new IntRefVal(BigInt(42)));
  });

  it('RelativeAttributeRelativeQualifier', () => {
    // In the cel-go implementation, the out type is a Uint. But, since javascript does not have a Uint type, it is a BigInt.
    const reg = new Registry();
    const attrs = new AttrFactory(new Container('acme.ns'), reg, reg);
    const data = {
      a: new Map([
        [
          BigInt(-1),
          {
            first: BigInt(1),
            second: BigInt(2),
            third: BigInt(3),
          },
        ],
      ]),
      b: BigInt(2),
    };
    const vars = new MapActivation(data);

    // The environment declares the following variables:
    // {
    //   a: {
    //     -1: {
    //       "first": 1u,
    //       "second": 2u,
    //       "third": 3u,
    //     }
    //   },
    //   b: 2u,
    // }
    //
    // The map of input variables is also re-used as a map-literal <obj> in the expression.
    //
    // The relative object under test is the following map literal.
    // <mp> {
    //   1u: "first",
    //   2u: "second",
    //   3u: "third",
    // }
    //
    // The expression under test is:
    //   <obj>.a[-1][<mp>[b]]
    //
    // This is equivalent to:
    //   <obj>.a[-1]["second"] -> 2u
    const obj = new ConstValue(BigInt(1), reg.nativeToValue(data));
    const mp = new ConstValue(
      BigInt(1),
      reg.nativeToValue(
        new Map([
          [BigInt(1), 'first'],
          [BigInt(2), 'second'],
          [BigInt(3), 'third'],
        ])
      )
    );
    const relAttr = attrs.relativeAttribute(BigInt(4), mp);
    const qualB = makeQualifier(
      attrs,
      null,
      BigInt(5),
      attrs.absoluteAttribute(BigInt(5), 'b')
    );
    relAttr.addQualifier(qualB);
    const attr = attrs.relativeAttribute(BigInt(1), obj);
    const qualA = makeQualifier(attrs, null, BigInt(2), 'a');
    const qualNeg1 = makeQualifier(attrs, null, BigInt(3), BigInt(-1));
    attr.addQualifier(qualA);
    attr.addQualifier(qualNeg1);
    attr.addQualifier(relAttr);

    const out = attr.resolve(vars);
    expect(out).toStrictEqual(new IntRefVal(BigInt(2)));
  });

  it('OneofAttribute', () => {
    const reg = new Registry();
    const attrs = new AttrFactory(new Container('acme.ns'), reg, reg);
    const data = {
      a: {
        b: [BigInt(2), BigInt(42)],
      },
      'acme.a.b': BigInt(1),
      'acme.ns.a.b': 'found',
    };
    const vars = new MapActivation(data);

    // a.b -> should resolve to acme.ns.a.b per namespace resolution rules.
    const attr = attrs.maybeAttribute(BigInt(1), 'a');
    const qualB = makeQualifier(attrs, null, BigInt(2), 'b');
    attr.addQualifier(qualB);
    const out = attr.resolve(vars);
    expect(out).toStrictEqual('found');
  });

  it('ConditionalAttr - true branch', () => {
    const reg = new Registry();
    const attrs = new AttrFactory(new Container(), reg, reg);
    const data = {
      a: new Map([[BigInt(-1), [BigInt(2), BigInt(42)]]]),
      b: {
        c: new Map([[BigInt(-1), [BigInt(2), BigInt(42)]]]),
      },
    };
    const vars = new MapActivation(data);

    // (true ? a : b.c)[-1][1]
    const tv = attrs.absoluteAttribute(BigInt(2), 'a');
    const fv = attrs.maybeAttribute(BigInt(3), 'b');
    const qualC = makeQualifier(attrs, null, BigInt(4), 'c');
    fv.addQualifier(qualC);
    const cond = attrs.conditionalAttribute(
      BigInt(1),
      new ConstValue(BigInt(0), BoolRefVal.True),
      tv,
      fv
    );
    const qualNeg1 = makeQualifier(attrs, null, BigInt(5), BigInt(-1));
    const qual1 = makeQualifier(attrs, null, BigInt(6), BigInt(1));
    cond.addQualifier(qualNeg1);
    cond.addQualifier(qual1);
    const out = cond.resolve(vars);
    expect(out).toStrictEqual(BigInt(42));
  });
});

function makeQualifier(
  attrs: AttributeFactory,
  fieldType: Type | null,
  qualID: bigint,
  val: any
): Qualifier {
  const qual = attrs.newQualifier(fieldType, qualID, val, false);
  if (qual instanceof Error) {
    throw new Error(`attrs.NewQualifier() failed: ${qual.message}`);
  }
  return qual;
}
