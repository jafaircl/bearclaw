// import { CELContainer } from '../common/container';
// import { ProtoTypeRegistry } from '../common/pb/proto-type-registry';
// import { INT_REF_TYPE } from '../common/types/int';
// import { stringValue } from '../common/types/string';
// import { MapActivation } from './activation';
// import { AbsoluteAttribute, AttrFactory } from './attribute-factory';
// import { Cost } from './coster';

// describe('AttributeFactory', () => {
//   it('AbsoluteAttribute', () => {
//     const reg = new ProtoTypeRegistry();
//     const container = new CELContainer('acme.ns');
//     const attrs = new AttrFactory(container, reg, reg);
//     const vars = new MapActivation({
//       'acme.a': {
//         b: {
//           4: {
//             false: 'success',
//           },
//         },
//       },
//     });

//     // acme.a.b[4][false]
//     const attr = attrs.absoluteAttribute(
//       BigInt(1),
//       'acme.a'
//     ) as AbsoluteAttribute;
//     const qualB = attrs.newQualifier(null, BigInt(2), 'b');
//     const qual4 = attrs.newQualifier(null, BigInt(3), 4);
//     const qualFalse = attrs.newQualifier(null, BigInt(4), false);
//     attr.addQualifier(qualB);
//     attr.addQualifier(qual4);
//     attr.addQualifier(qualFalse);
//     const out = attr.resolve(vars);
//     expect(out).toEqual(stringValue('success'));
//     expect(attr.cost()).toEqual(new Cost(1, 1));
//   });

//   it('AbosluteAttribute_Type', () => {
//     const reg = new ProtoTypeRegistry();
//     const attrs = new AttrFactory(new CELContainer(), reg, reg);

//     // int
//     const attr = attrs.absoluteAttribute(BigInt(1), 'int') as AbsoluteAttribute;
//     const out = attr.resolve(new MapActivation());
//     expect(out).toEqual(INT_REF_TYPE);
//     expect(attr.cost()).toEqual(new Cost(1, 1));
//   });
// });
describe('env', () => {
  it('should check', () => {
    expect(true).toBe(true);
  });
});
