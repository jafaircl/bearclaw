# immutable-class

This library provides helper functions to extend `class-transformer` functionality to make the generated classes immutable. It also provides helper functions to work with immutable classes using `immer`.

- [immutable-class](#immutable-class)
  - [fromJSON](#fromjson)
  - [toJSON](#tojson)
  - [deserialize](#deserialize)
  - [serialize](#serialize)
  - [clone](#clone)
  - [update](#update)
  - [patch](#patch)
- [Contributing](#contributing)
  - [Running unit tests](#running-unit-tests)

## fromJSON

Create an immutable class from a JSON object. Note that any fields that do not have the class-transformer `@Expose` decorator will be ignored by the function. The decorator is also exported from this library for convenience.

```typescript
class Test {
  @Expose()
  readonly foo!: string;
  @Expose()
  readonly bar?: string
}

const cls = fromJSON(Test, { foo: 'asdf' });
// cls: Test {
//   foo: 'asdf',
//   bar: undefined,
// }
```

## toJSON

Convert a class to an immutable plain object. Note that any fields that do not have the class-transformer `@Expose` decorator will be ignored by the function.


```typescript
class Test {
  @Expose()
  foo!: string;
  @Expose()
  bar?: string
}

const cls = new Test();
const emptyJson = toJSON(cls);
// emptyJson: {
//   foo: undefined,
//   bar: undefined,
// }
cls.foo = 'abc'
cls.bar = '123'
const setJson = toJSON(cls)
// setJson: {
//    foo: 'abc',
//    bar: '123',
// }
```

## deserialize

Create an immutable class from a JSON string. Note that any fields that do not have the class-transformer `@Expose` decorator will be ignored by the function.

```typescript
class Test {
  @Expose()
  readonly foo!: string;
  @Expose()
  readonly bar?: string
}

const cls = fromJSON(Test, `{ "foo": "asdf" }`);
// cls: Test {
//   foo: 'asdf',
//   bar: undefined,
// }
```

## serialize

Convert a class to an immutable plain object. Note that any fields that do not have the class-transformer `@Expose` decorator will be ignored by the function.

```typescript
class Test {
  @Expose()
  foo!: string;
  @Expose()
  bar?: string
}

const cls = new Test();
const emptyJson = toJSON(cls);
// emptyJson: "{}""
cls.foo = 'abc'
cls.bar = '123'
const setJson = toJSON(cls)
// setJson: '{"foo":"abc","bar":"123"}'
```

## clone

Clone an existing immutable class. Note that any fields that do not have the class-transformer `@Expose` decorator will be ignored by the function.

```typescript
class Test {
  @Expose()
  foo!: string;
  @Expose()
  bar?: string
}

const cls = new Test();
cls.foo = 'test'
const copy = clone(cls)
// copy: Test {
//   foo: 'test',
//   bar: undefined
// }
```

## update

Update an immutable class. This function will leave the original class unmodified and return an updated copy of the class. Note that classes must be marked with "[immerable]: true" in order to use this function.

```typescript
class Test {
  [immerable] = true;
  @Expose()
  readonly foo!: string;
  @Expose()
  readonly bar?: string
}
const cls = create(Test)
const updated = update(cls, x => {
  x.foo = 'abc'
})
// updated: Test {
//   foo: 'abc',
//   bar: undefined
// }
```

## patch

Patch an immutable class with a JSON value. This function will leave the original class unmodified and return an updated copy of the class. Note that classes must be marked with "[immerable]: true" in order to use this function. Like other functions, any fields that do not have the class-transformer `@Expose` decorator will be ignored by the function.

```typescript
class Test {
  [immerable] = true;
  @Expose()
  readonly foo!: string;
  @Expose()
  readonly bar?: string
}
const cls = create(Test)
const patched = patch(cls, { foo: 'abc' })
// patched: Test {
//   foo: 'abc',
//   bar: undefined
// }
```

# Contributing

## Running unit tests

Run `nx test immutable-class` to execute the unit tests via
[Jest](https://jestjs.io).- [immutable-class](#immutable-class)