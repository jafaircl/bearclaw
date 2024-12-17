export enum Trait {
  UNSPECIFIED = 0,

  // AdderType types provide a '+' operator overload.
  ADDER_TYPE = 1,

  // ComparerType types support ordering comparisons '<', '<=', '>', '>='.
  COMPARER_TYPE = 2,

  // ContainerType types support 'in' operations.
  CONTAINER_TYPE = 3,

  // DividerType types support '/' operations.
  DIVIDER_TYPE = 4,

  // FieldTesterType types support the detection of field value presence.
  FIELD_TESTER_TYPE = 5,

  // IndexerType types support index access with dynamic values.
  INDEXER_TYPE = 6,

  // IterableType types can be iterated over in comprehensions.
  ITERABLE_TYPE = 7,

  // IteratorType types support iterator semantics.
  ITERATOR_TYPE = 8,

  // MatcherType types support pattern matching via 'matches' method.
  MATCHER_TYPE = 9,

  // ModderType types support modulus operations '%'
  MODDER_TYPE = 10,

  // MultiplierType types support '*' operations.
  MULTIPLIER_TYPE = 11,

  // NegatorType types support either negation via '!' or '-'
  NEGATER_TYPE = 12,

  // ReceiverType types support dynamic dispatch to instance methods.
  RECEIVER_TYPE = 13,

  // SizerType types support the size() method.
  SIZER_TYPE = 14,

  // SubtractorType types support '-' operations.
  SUBTRACTOR_TYPE = 15,

  // FoldableType types support comprehensions v2 macros which iterate over (key, value) pairs.
  FOLDABLE_TYPE = 16,
}

export const AllTraits = new Set<Trait>([
  Trait.ADDER_TYPE,
  Trait.COMPARER_TYPE,
  Trait.CONTAINER_TYPE,
  Trait.DIVIDER_TYPE,
  Trait.FIELD_TESTER_TYPE,
  Trait.INDEXER_TYPE,
  Trait.ITERABLE_TYPE,
  Trait.ITERATOR_TYPE,
  Trait.MATCHER_TYPE,
  Trait.MODDER_TYPE,
  Trait.MULTIPLIER_TYPE,
  Trait.NEGATER_TYPE,
  Trait.RECEIVER_TYPE,
  Trait.SIZER_TYPE,
  Trait.SUBTRACTOR_TYPE,
  Trait.FOLDABLE_TYPE,
]);
