/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestAllTypesSchema } from '@buf/cel_spec.bufbuild_es/proto/test/v1/proto3/test_all_types_pb.js';
import { create, createRegistry } from '@bufbuild/protobuf';
import { Container } from '../common/container';
import { BoolRefVal } from '../common/types/bool';
import { ErrorRefVal } from '../common/types/error';
import { IntRefVal } from '../common/types/int';
import { OptionalNone, OptionalRefVal } from '../common/types/optional';
import { Registry } from '../common/types/provider';
import { IntType, newObjectType, Type } from '../common/types/types';
import { objectToMap } from '../common/utils';
import { EmptyActivation, MapActivation } from './activation';
import { AttrFactory, AttributeFactory, Qualifier } from './attributes';
import { ConstValue } from './interpretable';

describe('attributes', () => {
  it('TestAttributesAbsoluteAttr', () => {
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

  it('TestAttributesAbsoluteAttrType', () => {
    const reg = new Registry();
    const attrs = new AttrFactory(new Container(), reg, reg);

    // int
    const attr = attrs.absoluteAttribute(BigInt(1), 'int');
    const out = attr.resolve(new EmptyActivation());
    expect(out).toStrictEqual(IntType);
  });

  it('TestAttributesAbsoluteAttrError', () => {
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

  it('TestAttributesRelativeAttr', () => {
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

  it('TestAttributesRelativeAttrOneOf', () => {
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

  it('TestAttributesRelativeAttrConditional', () => {
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

  it('TestAttributesRelativeAttrRelativeQualifier', () => {
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

  it('TestAttributesOneofAttr', () => {
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

  it('TestAttributesConditionalAttrTrueBranch', () => {
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

  it('TestAttributesConditionalAttrFalseBranch', () => {
    const reg = new Registry();
    const attrs = new AttrFactory(new Container(), reg, reg);
    const data = {
      a: new Map([[BigInt(-1), [BigInt(2), BigInt(42)]]]),
      b: {
        c: new Map([[BigInt(-1), [BigInt(2), BigInt(42)]]]),
      },
    };
    const vars = new MapActivation(data);

    // (false ? a : b.c)[-1][1]
    const tv = attrs.absoluteAttribute(BigInt(2), 'a');
    const fv = attrs.maybeAttribute(BigInt(3), 'b');
    const qualC = makeQualifier(attrs, null, BigInt(4), 'c');
    fv.addQualifier(qualC);
    const cond = attrs.conditionalAttribute(
      BigInt(1),
      new ConstValue(BigInt(0), BoolRefVal.False),
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

  it('TestAttributesOptional', () => {
    const reg = new Registry(undefined, createRegistry(TestAllTypesSchema));
    const attrs = new AttrFactory(new Container('ns'), reg, reg);
    interface Test {
      varName: string;
      quals?: any[];
      optQuals?: any[];
      vars: Map<string, any>;
      out?: any;
      err?: Error;
    }
    const tests: Test[] = [
      {
        // a.?b[0][false]
        varName: 'a',
        optQuals: ['b', BigInt(0), false],
        vars: objectToMap({
          a: {
            b: {
              0: new Map([[false, 'success']]),
            },
          },
        }),
        out: new OptionalRefVal(reg.nativeToValue('success')),
      },
      // TODO; there is functionally no difference between int/uint in the javascript implementation. Should we fix that? common/numbers.ts has helpers that could do it but would require a large effort.
      //   {
      //     // a.?b[0][false]
      //     varName: 'a',
      //     optQuals: ['b', BigInt(0), false],
      //     vars: objectToMap({
      //       a: {
      //         b: {
      //           0: new Map([[false, 'success']]),
      //         },
      //       },
      //     }),
      //     out: new OptionalRefVal(reg.nativeToValue('success')),
      //   },
      {
        // a.?b[0][false]
        varName: 'a',
        optQuals: ['b', 0, false],
        vars: objectToMap({
          a: {
            b: new Map([[0, new Map([[false, 'success']])]]),
          },
        }),
        out: new OptionalRefVal(reg.nativeToValue('success')),
      },
      {
        // a.?b[1] with no value
        varName: 'a',
        optQuals: ['b', BigInt(1)],
        vars: objectToMap({
          a: {
            b: {},
          },
        }),
        out: OptionalNone,
      },
      {
        // a.b[1] with no value where b is a map[uint]
        varName: 'a',
        quals: ['b', BigInt(1)],
        vars: objectToMap({
          a: {
            b: {},
          },
        }),
        err: new Error('no such key: 1'),
      },
      {
        // a.b[?1] with no value where 'b' is a []int
        varName: 'a',
        quals: ['b'],
        optQuals: [BigInt(1)],
        vars: objectToMap({
          a: {
            b: [],
          },
        }),
        out: OptionalNone,
      },
      {
        // a.b[1] with no value where 'b' is a map[int]any
        varName: 'a',
        quals: ['b', BigInt(1)],
        vars: objectToMap({
          a: {
            b: {},
          },
        }),
        err: new Error('no such key: 1'),
      },
      {
        // a.b[?1] with no value where 'b' is a []int
        varName: 'a',
        quals: ['b', BigInt(1), false],
        vars: objectToMap({
          a: {
            b: [],
          },
        }),
        err: new Error('index out of bounds: 1'),
      },
      {
        // a.?b[0][true] with no value
        varName: 'a',
        optQuals: ['b', BigInt(0), true],
        vars: objectToMap({
          a: {
            b: new Map([[BigInt(0), {}]]),
          },
        }),
        out: OptionalNone,
      },
      {
        // a.b[0][?true] with no value
        varName: 'a',
        quals: ['b', BigInt(0)],
        optQuals: [true],
        vars: objectToMap({
          a: {
            b: new Map([[BigInt(0), {}]]),
          },
        }),
        out: OptionalNone,
      },
      {
        // a.b[0][true] with no value
        varName: 'a',
        quals: ['b', BigInt(0), true],
        vars: objectToMap({
          a: {
            b: new Map([[BigInt(0), {}]]),
          },
        }),
        err: new Error('no such key: true'),
      },
      {
        // a.b[0][false] where 'a' is optional
        varName: 'a',
        quals: ['b', BigInt(0), false],
        vars: objectToMap({
          a: new OptionalRefVal(
            reg.nativeToValue({
              b: new Map([[0, new Map([[false, 'success']])]]),
            })
          ),
        }),
        out: new OptionalRefVal(reg.nativeToValue('success')),
      },
      {
        // a.b[0][false] where 'a' is optional none.
        varName: 'a',
        quals: ['b', BigInt(0), false],
        vars: objectToMap({
          a: OptionalNone,
        }),
        out: OptionalNone,
      },
      {
        // a.?c[1][true]
        varName: 'a',
        optQuals: ['c', BigInt(1), true],
        vars: objectToMap({
          a: {},
        }),
        out: OptionalNone,
      },
      {
        // a[?b] where 'b' is dynamically computed.
        varName: 'a',
        optQuals: [attrs.absoluteAttribute(BigInt(0), 'b')],
        vars: objectToMap({
          a: {
            hello: 'world',
          },
          b: 'hello',
        }),
        out: new OptionalRefVal(reg.nativeToValue('world')),
      },
      {
        // a[?(false ? : b : c.d.e)]
        varName: 'a',
        optQuals: [
          attrs.conditionalAttribute(
            BigInt(0),
            new ConstValue(BigInt(100), BoolRefVal.False),
            attrs.absoluteAttribute(BigInt(101), 'b'),
            attrs.absoluteAttribute(BigInt(102), 'c.d.e')
          ),
        ],
        vars: objectToMap({
          a: {
            hello: 'world',
            goodbye: 'universe',
          },
          b: 'hello',
          'c.d.e': 'goodbye',
        }),
        out: new OptionalRefVal(reg.nativeToValue('universe')),
      },
      {
        // a[?c.d.e]
        varName: 'a',
        optQuals: [attrs.maybeAttribute(BigInt(101), 'c.d.e')],
        vars: objectToMap({
          a: {
            hello: 'world',
            goodbye: 'universe',
          },
          'c.d.e': 'goodbye',
        }),
        out: new OptionalRefVal(reg.nativeToValue('universe')),
      },
      {
        // a[c.d.e] where the c.d.e errors
        varName: 'a',
        quals: [
          attrs
            .maybeAttribute(BigInt(102), 'c.d')
            .addQualifier(makeQualifier(attrs, null, BigInt(103), 'e')),
        ],
        vars: objectToMap({
          a: {
            goodbye: 'universe',
          },
          'c.d': {},
        }),
        err: new Error('no such key: e'),
      },
      {
        // a[?c.d.e] where the c.d.e errors
        varName: 'a',
        optQuals: [
          attrs
            .maybeAttribute(BigInt(102), 'c.d')
            .addQualifier(makeQualifier(attrs, null, BigInt(103), 'e')),
        ],
        vars: objectToMap({
          a: {
            goodbye: 'universe',
          },
          'c.d': {},
        }),
        err: new Error('no such key: e'),
      },
      {
        // a.?single_int32 with a value.
        varName: 'a',
        optQuals: ['single_int32'],
        vars: objectToMap({
          a: reg.nativeToValue(create(TestAllTypesSchema, { singleInt32: 1 })),
        }),
        out: new OptionalRefVal(reg.nativeToValue(1)),
      },
      {
        // a.?single_int32 where the field is not set.
        varName: 'a',
        optQuals: ['single_int32'],
        vars: objectToMap({
          a: reg.nativeToValue(create(TestAllTypesSchema)),
        }),
        out: OptionalNone,
      },
      {
        // a.?single_int32 where the field is set (uses more optimal selection logic)
        varName: 'a',
        optQuals: [
          makeOptQualifier(
            attrs,
            newObjectType('google.api.expr.test.v1.proto3.TestAllTypes'),
            BigInt(103),
            'single_int32'
          ),
        ],
        vars: objectToMap({
          a: reg.nativeToValue(create(TestAllTypesSchema, { singleInt32: 1 })),
        }),
        out: new OptionalRefVal(reg.nativeToValue(1)),
      },
      {
        // a.c[1][true]
        varName: 'a',
        quals: ['c', 1, true],
        vars: objectToMap({
          a: {},
        }),
        err: new Error('no such key: c'),
      },
      {
        // a, no bindings
        varName: 'a',
        quals: [],
        vars: new Map(),
        err: new Error('no such attribute(s): a'),
      },
    ];
    for (let i = 0; i < tests.length; i += 1) {
      const tc = tests[i];
      let j = BigInt(0);
      const attr = attrs.absoluteAttribute(j, tc.varName);
      for (const q of tc.quals || []) {
        j += BigInt(1);
        attr.addQualifier(makeQualifier(attrs, null, j, q));
      }
      for (const oq of tc.optQuals || []) {
        j += BigInt(1);
        attr.addQualifier(makeOptQualifier(attrs, null, j, oq));
      }
      const vars = new MapActivation(tc.vars);
      const out = attr.resolve(vars);
      if (tc.err) {
        expect(out).toBeInstanceOf(Error);
        expect(out.message).toStrictEqual(tc.err.message);
      }
      if (tc.out) {
        expect(out).toStrictEqual(tc.out);
      }
    }
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

function makeOptQualifier(
  attrs: AttributeFactory,
  fieldType: Type | null,
  qualID: bigint,
  val: any
): Qualifier {
  const qual = attrs.newQualifier(fieldType, qualID, val, true);
  if (qual instanceof Error) {
    throw new Error(`attrs.NewQualifier() failed: ${qual.message}`);
  }
  return qual;
}
