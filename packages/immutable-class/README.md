# immutable-class

This library provides helper functions to extend `class-transformer` functionality to create immutable classes. It also provides helper functions to work with immutable classes using `immer`.

- [immutable-class](#immutable-class)
  - [instanceToImmutableInstance](#instancetoimmutableinstance)
  - [instanceToImmutablePlain](#instancetoimmutableplain)
  - [patchImmutableInstance](#patchimmutableinstance)
  - [plainToImmutableInstance](#plaintoimmutableinstance)
  - [produceImmutableInstance](#produceimmutableinstance)
- [Contributing](#contributing)
  - [Running unit tests](#running-unit-tests)

## instanceToImmutableInstance

Converts a class (constructor) object to a new immutable class (constructor) object. Also works with arrays.

```typescript
class MyClass {
  foo!: string
}
const existing = new MyClass();
existing.foo = 'bar'; // No errors
const instance = instanceToImmutableInstance(existing);
instance.foo = 'foo'; // throws a read only property error
```

## instanceToImmutablePlain

Converts a class (constructor) object to an immutable plain (literal) object. Also works with arrays.

```typescript
class MyClass {
  foo!: string
}
const instance = new MyClass();
instance.foo = 'bar'; // No errors
const plain = instanceToImmutablePlain(instance);
plain.foo = 'foo'; // throws a read only property error
```

## patchImmutableInstance

Produce the next immutable class (constructor) object by patching the existing class (constructor) object. Also works with arrays.

```typescript
class MyClass {
  foo!: string
}
const instance = new MyClass();
instance.foo = 'bar'; // No errors
const updated = patchImmutableInstance(instance, { foo: 'some value' });
instance.foo = 'foo'; // throws a read only property error
```

## plainToImmutableInstance

Converts a plain (literal) object to an immutable class (constructor) object. Also works with arrays.

```typescript
class MyClass {
  foo!: string
}
const plain = { foo: 'example' };
plain.foo = 'bar'; // No errors
const instance = plainToImmutableInstance(MyClass, plain);
instance.foo = 'foo'; // throws a read only property error
```

## produceImmutableInstance

Produce the next immutable class (constructor) object by modifying the current class (constructor) object with a recipe function. Also works with arrays.

```typescript
class MyClass {
  foo!: string
}
const instance = new MyClass();
instance.foo = 'bar'; // No errors
const updated = produceImmutableInstance(instance, draft => {
  draft.foo = 'some value'
});
instance.foo = 'foo'; // throws a read only property error
```

# Contributing

## Running unit tests

Run `nx test immutable-class` to execute the unit tests via
[Jest](https://jestjs.io).- [immutable-class](#immutable-class)