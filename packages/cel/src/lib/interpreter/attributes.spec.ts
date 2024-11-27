/* eslint-disable @typescript-eslint/no-explicit-any */
import { Container } from '../common/container';
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
