// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { isNil } from '@bearclaw/is';
// import { Type } from '@buf/google_cel-spec.bufbuild_es/cel/expr/checked_pb';
// import { Value } from '@buf/google_cel-spec.bufbuild_es/cel/expr/value_pb';
// import { Registry } from '@bufbuild/protobuf';
// import { CELContainer } from '../cel';
// import { Activation } from './activation';
// import { Interpretable } from './interpretable';

// // AttributeFactory provides methods creating Attribute and Qualifier values.
// export class AttributeFactory {
//   constructor(
//     protected readonly container: CELContainer,
//     protected readonly registry: Registry,
//     protected readonly errorOnBadPresenceTest: boolean
//   ) {}

//   // AbsoluteAttribute creates an attribute that refers to a top-level
//   // variable name.
//   //
//   // Checked expressions generate absolute attribute with a single name.
//   // Parse-only expressions may have more than one possible absolute
//   // identifier when the expression is created within a container, e.g.
//   // package or namespace.
//   //
//   // When there is more than one name supplied to the AbsoluteAttribute call,
//   // the names must be in CEL's namespace resolution order. The name
//   // arguments provided here are returned in the same order as they were
//   // provided by the NamespacedAttribute
//   // CandidateVariableNames method.
//   absoluteAttribute(id: bigint, ...names: string[]): NamespacedAttribute {
//     return new AbsoluteAttribute(
//       id,
//       names,
//       [],
//       this.registry,
//       this,
//       this.errorOnBadPresenceTest
//     );
//   }

//   // ConditionalAttribute creates an attribute with two Attribute branches,
//   // where the Attribute that is resolved depends on the boolean evaluation of
//   // the input 'expr'.
//   conditionalAttribute(
//     id: bigint,
//     expr: Interpretable,
//     t: Attribute,
//     f: Attribute
//   ): Attribute;

//   // MaybeAttribute creates an attribute that refers to either a field
//   // selection or a namespaced variable name.
//   //
//   // Only expressions which have not been type-checked may generate oneof
//   // attributes.
//   maybeAttribute(id: bigint, name: string): Attribute;

//   // RelativeAttribute creates an attribute whose value is a qualification of a
//   // dynamic computation rather than a static variable reference.
//   relativeAttribute(id: bigint, operand: Interpretable): Attribute;

//   // NewQualifier creates a qualifier on the target object with a given value.
//   //
//   // The 'val' may be an Attribute or any proto-supported map key type: bool,
//   // int, string, uint.
//   //
//   // The qualifier may consider the object type being qualified, if present.
//   // If absent, the qualification should be considered dynamic and the
//   // qualification should still work, though it may be sub-optimal.
//   newQualifier(
//     objType: Type,
//     qualID: bigint,
//     val: any,
//     opt: boolean
//   ): Qualifier | Error;
// }

// // Qualifier marker interface for designating different qualifier values and
// // where they appear within field selections and index call expressions \
// // (`_[_]`).
// export class Qualifier {
//   // ID where the qualifier appears within an expression.
//   id(): bigint;

//   // IsOptional specifies whether the qualifier is optional.
//   // Instead of a direct qualification, an optional qualifier will be resolved
//   // via QualifyIfPresent rather than Qualify. A non-optional qualifier may
//   // also be resolved through QualifyIfPresent if the object to qualify is
//   // itself optional.
//   isOptional(): boolean;

//   // Qualify performs a qualification, e.g. field selection, on the input
//   // object and returns the value of the access and whether the value was set.
//   // A non-nil value with a false presence test result indicates that the value
//   // being returned is the default value.
//   qualify(vars: Activation, obj: any): any | Error;

//   // QualifyIfPresent qualifies the object if the qualifier is declared or
//   // defined on the object.
//   // The 'presenceOnly' flag indicates that the value is not necessary, just a
//   // boolean status as to whether the qualifier is present.
//   qualifyIfPresent(
//     vars: Activation,
//     obj: any,
//     presenceOnly: boolean
//   ): any | boolean | Error;
// }

// // ConstantQualifier interface embeds the Qualifier interface and provides an
// // option to inspect the qualifier's constant value.
// //
// // Non-constant qualifiers are of Attribute type.
// export class ConstantQualifier extends Qualifier {
//   // Value returns the constant value associated with the qualifier.
//   value(): Value;
// }

// // Attribute values are a variable or value with an optional set of qualifiers,
// // such as field, key, or index accesses.
// export class Attribute extends Qualifier {
//   // AddQualifier adds a qualifier on the Attribute or error if the
//   // qualification is not a valid qualifier type.
//   addQualifier(qualifier: Qualifier): Attribute | Error;

//   // Resolve returns the value of the Attribute and whether it was present
//   // given an Activation.
//   // For objects which support safe traversal, the value may be non-nil and
//   // the presence flag be false.
//   //
//   // If an error is encountered during attribute resolution, it will be
//   // returned immediately.
//   // If the attribute cannot be resolved within the Activation, the result
//   // must be: `nil`, `error`
//   // with the error indicating which variable was missing.
//   resolve(activation: Activation): any | Error;
// }

// // NamespacedAttribute values are a variable within a namespace, and an optional set of qualifiers
// // such as field, key, or index accesses.
// export interface NamespacedAttribute extends Attribute {
//   // CandidateVariableNames returns the possible namespaced variable names for
//   // this Attribute in the CEL namespace resolution order.
//   candidateVariableNames(): string[];

//   // Qualifiers returns the list of qualifiers associated with the Attribute.
//   qualifiers(): Qualifier[];
// }

// export class AbsoluteAttribute {
//   constructor(
//     protected readonly _id: bigint,
//     protected readonly _namespacedNames: string[],
//     protected readonly _qualifiers: Qualifier[],
//     protected readonly _registry: Registry,
//     protected readonly _fac: AttributeFactory,
//     protected readonly _errorOnBadPresenceTest: boolean
//   ) {}

//   // ID implements the Attribute interface method.
//   id(): bigint {
//     if (this._qualifiers.length === 0) {
//       return this._id;
//     }
//     return this._qualifiers[this._qualifiers.length - 1].id();
//   }

//   // IsOptional returns trivially false for an attribute as the attribute
//   // represents a fully qualified variable name. If the attribute is used in an
//   // optional manner, then an attrQualifier is created and marks the attribute
//   // as optional.
//   isOptional(): boolean {
//     return false;
//   }

//   // AddQualifier implements the Attribute interface method.
//   addQualifier(qualifier: Qualifier): Attribute | Error {
//     this._qualifiers.push(qualifier);
//     return this;
//   }

//   // CandidateVariableNames implements the NamespaceAttribute interface method.
//   candidateVariableNames(): string[] {
//     return this._namespacedNames;
//   }

//   // Qualifiers returns the list of Qualifier instances associated with the \
//   // namespaced attribute.
//   qualifiers(): Qualifier[] {
//     return this._qualifiers;
//   }

//   // Qualify is an implementation of the Qualifier interface method.
//   qualify(vars: Activation, obj: any): any | Error {
//     // TODO: Implement
//   }

//   // QualifyIfPresent is an implementation of the Qualifier interface method.
//   qualifyIfPresent(
//     vars: Activation,
//     obj: any,
//     presenceOnly: boolean
//   ): any | boolean | Error {
//     // TODO: Implement
//   }

//   // String implements the Stringer interface method.
//   string(): string {
//     return `id: ${this.id()}, names: ${this._namespacedNames.join(', ')}`;
//   }

//   // Resolve returns the resolved Attribute value given the Activation, or
//   // error if the Attribute variable is not found, or if its Qualifiers cannot
//   // be applied successfully.
//   //
//   // If the variable name cannot be found as an Activation variable or in the
//   // TypeProvider as  a type, then the result is `nil`, `error` with the error
//   // indicating the name of the first variable searched as missing.
//   resolve(vars: Activation): any | Error {
//     for (const name of this._namespacedNames) {
//       // If the variable is found, process it. Otherwise, wait until the checks
//       // to determine whether the type is unknown before returning.
//       const obj = vars.resolveName(name);
//       if (!isNil(obj)) {
//         if (obj instanceof Error) {
//           return obj;
//         }
//       }
//     }
//   }
// }
