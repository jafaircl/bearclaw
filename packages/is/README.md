# is

`@bearclaw/is` is a set of runtime type-checking and environment-detecting functions.

## Validation & Assertion

### validate

Check that some assertion is true and return a `ValidationException` (or some provided custom error) if it is not.

```typescript
function validateIsNotNil(value: unknown) {
  return validate(!isNil(value), 'isNotNil')
}
validateIsNotNil({}) // null
validateIsNotNil(null) // returns ValidationException
```

### assert

Check that some assertion is true and throw an `AssertionException` (or some provided custom error) if it is not.

```typescript
function assertIsNotNil(value: unknown) {
  return assert(!isNil(value), 'isNotNil')
}
assertIsNotNil({}) // void
assertIsNotNil(null) // throws AssertionException
```

## Type Checking

### isArray

Is the value an [Array](https://developer.mozilla.org/en-US/docs/Glossary/array)?

```typescript
isArray([1]) // true
isArray(1) // false
validateArray([1]) // null
validateArray(1) // ValidationException
assertArray([1]) // void
assertArray(1) // throws AssertionException
```

### isArrowFunction

Is the value an [arrow function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)?

```typescript
isArrowFunction(() => 'a') // true
isArrowFunction(function () {}) // false
validateArrowFunction(() => 'a') // null
validateArrowFunction(function () {}) // ValidationException
assertArrowFunction(() => 'a') // void
assertArrowFunction(function () {}) // throws AssertionException
```

### isAsyncFunction

Is the value an [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction)?

```typescript
isAsyncFunction(async () => 'a') // true
isAsyncFunction(() => 'a') // false
validateAsyncFunction(async () => 'a') // null
validateAsyncFunction(() => 'a') // ValidationException
assertAsyncFunction(async () => 'a') // void
assertAsyncFunction(() => 'a') // throws AssertionException
```

### isBigInt

Is the value a [BigInt](https://developer.mozilla.org/en-US/docs/Glossary/BigInt)?

```typescript
isBigInt(BigInt(1)) // true
isBigInt(1) // false
validateBigInt(BigInt(1)) // null
validateBigInt(1) // ValidationException
assertBigInt(BigInt(1)) // void
assertBigInt(1) // throws AssertionException
```

### isBindable

Is the value [bindable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind)? Arrow functions, constructors and functions that are already bound will not be bindable.

```typescript
isBindable(function () {}) // true
isBindable(function () { return 'a'; }.bind(this)) // false
isBindable(() => 'a') // false
validateBindable(function () {}) // null
validateBindable(function () { return 'a'; }.bind(this)) // ValidationException
validateBindable(() => 'a') // ValidationException
assertBindable(function () {}) // void
assertBindable(function () { return 'a'; }.bind(this)) // throws AssertionException
assertBindable(() => 'a') // throws AssertionException
```

### isBoolean

Is the value a [boolean](https://developer.mozilla.org/en-US/docs/Glossary/Boolean)?

```typescript
isBoolean(true) // true
isBoolean(1) // false
validateBoolean(true) // null
validateBoolean(1) // ValidationException
assertBoolean(true) // void
assertBoolean(1) // throws AssertionException
```

### isBoundFunction

Is the value a [bound](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind) function?

```typescript
isBoundFunction(function () { return 'a'; }.bind(this)) // true
isBoundFunction(function () {}) // false
validateBoundFunction(function () { return 'a'; }.bind(this)) // null
validateBoundFunction(function () {}) // ValidationException
assertBoundFunction(function () { return 'a'; }.bind(this)) // void
assertBoundFunction(function () {}) // throws AssertionException
```

### isClassCtor

Is the values a [class constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)?

```typescript
isClassCtor(class Person {}) // true
isClassCtor(new Person()) // false
validateClassCtor(class Person {}) // null
validateClassCtor(new Person()) // ValidationException
assertClassCtor(class Person {}) // void
assertClassCtor(new Person()) // throws AssertionException
```

### isDateObject

Is the value a [Date object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)?

```typescript
isDateObject(new Date()) // true
isDateObject(1) // false
validateDateObject(new Date()) // null
validateDateObject(1) // ValidationException
assertDateObject(new Date()) // void
assertDateObject(1) // throws AssertionException
```

### isEmptyArray

Is the value an [array](https://developer.mozilla.org/en-US/docs/Glossary/array) with no values?

```typescript
isEmptyArray([]) // true
isEmptyArray(['1']) // false
validateEmptyArray([]) // null
validateEmptyArray(['1']) // ValidationException
assertEmptyArray([]) // void
assertEmptyArray(['1']) // throws AssertionException
```

### isEmptyMap

Is the value a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) with no entries?

```typescript
isEmptyMap(new Map()) // true
isEmptyMap(new Map([['foo', 'bar']])) // false
validateEmptyMap(new Map()) // null
validateEmptyMap(new Map([['foo', 'bar']])) // ValidationException
assertEmptyMap(new Map()) // void
assertEmptyMap(new Map([['foo', 'bar']])) // throws AssertionException
```

### isEmptyObject

Is the value a [plain object](https://masteringjs.io/tutorials/fundamentals/pojo) with no entries?

```typescript
isEmptyObject({}) // true
isEmptyObject({ foo: 'bar' }) // false
validateEmptyObject({}) // null
validateEmptyObject({ foo: 'bar' }) // ValidationException
assertEmptyObject({}) // void
assertEmptyObject({ foo: 'bar' }) // throws AssertionException
```

### isEmptySet

Is the value a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) with no values?

```typescript
isEmptySet(new Set()) // true
isEmptySet(new Set([1])) // false
validateEmptySet(new Set()) // null
validateEmptySet(new Set([1])) // ValidationException
assertEmptySet(new Set()) // void
assertEmptySet(new Set([1])) // throws AssertionException
```

### isEmptyString

Is the value a [string](https://developer.mozilla.org/en-US/docs/Glossary/String) with no characters?

```typescript
isEmptyString('') // true
isEmptyString('1') // false
validateEmptyString('') // null
validateEmptyString('1') // ValidationException
assertEmptyString('') // void
assertEmptyString('1') // throws AssertionException
```

### isFalsy

Is the value [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)?

```typescript
isFalsy(0) // true
isFalsy(1) // false
validateFalsy(0) // null
validateFalsy(1) // ValidationException
assertFalsy(0) // void
assertFalsy(1) // throws AssertionException
```

### isFunction

Is the value a [function](https://developer.mozilla.org/en-US/docs/Glossary/Function)?

```typescript
isFunction(() => {}) // true
isFunction(1) // false
validateFunction(() => {}) // null
validateFunction(1) // ValidationException
assertFunction(() => {}) // void
assertFunction(1) // throws AssertionException
```

### isGeneratorFunction

Is the value a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorFunction)?

```typescript
isGeneratorFunction(function* () { yield 'a' }) // true
isGeneratorFunction(() => 'a') // false
validateGeneratorFunction(function* () { yield 'a' }) // null
validateGeneratorFunction(() => 'a') // ValidationException
assertGeneratorFunction(function* () { yield 'a' }) // void
assertGeneratorFunction(() => 'a') // throws AssertionException
```

### isImmutable

Is the value [immutable](https://developer.mozilla.org/en-US/docs/Glossary/Mutable)?

```typescript
isImmutable(1) // true
isImmutable(Object.freeze({})) // true
isImmutable({}) // false
validateImmutable(1) // null
validateImmutable(Object.freeze({})) // null
validateImmutable({}) // ValidationException
assertImmutable(1) // void
assertImmutable(Object.freeze({})) // void
assertImmutable({}) // throws AssertionException
```

### isJSON

Is the value a [valid JSON value](https://www.ecma-international.org/publications-and-standards/standards/ecma-404/)?

```typescript
isJSON({ 'foo': 'bar' }) // true
isJSON(new Map()) // false
validateJSON({ 'foo': 'bar' }) // null
validateJSON(new Map()) // ValidationException
assertJSON({ 'foo': 'bar' }) // void
assertJSON(new Map()) // throws AssertionException
```

### isMap

Is the value a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)?

```typescript
isMap(new Map()) // true
isMap({}) // false
validateMap(new Map()) // null
validateMap({}) // ValidationException
assertMap(new Map()) // void
assertMap({}) // throws AssertionException
```

### isNull

Is the value [null](https://developer.mozilla.org/en-US/docs/Glossary/Null)?

```typescript
isNull(null) // true
isNull(1) // false
validateNull(null) // null
validateNull(1) // ValidationException
assertNull(null) // void
assertNull(1) // throws AssertionException
```

### isNil

Is the value [null](https://developer.mozilla.org/en-US/docs/Glossary/Null) or [undefined](https://developer.mozilla.org/en-US/docs/Glossary/undefined)?

```typescript
isNil(null) // true
isNil(undefined) // true
isNil(1) // false
validateNil(null) // null
validateNil(undefined) // null
validateNil(1) // ValidationException
assertNil(null) // void
assertNil(undefined) // void
assertNil(1) // throws AssertionException
```

### isNumber

Is the value a [number](https://developer.mozilla.org/en-US/docs/Glossary/Number)?

```typescript
isNumber(1) // true
isNumber('') // false
validateNumber(1) // null
validateNumber('') // ValidationException
assertNumber(1) // void
assertNumber('') // throws AssertionException
```

### isObject

Is the value a non-null [object](https://developer.mozilla.org/en-US/docs/Glossary/Object)?

```typescript
isObject({}) // true
isObject(1) // false
validateObject({}) // null
validateObject(1) // ValidationException
assertObject({}) // void
assertObject(1) // throws AssertionException
```

### isPlainObject

Is the value a [plain object](https://masteringjs.io/tutorials/fundamentals/pojo)?

```typescript
isPlainObject({}) // true
isPlainObject(new Person()) // false
validatePlainObject({}) // null
validatePlainObject(new Person()) // ValidationException
assertPlainObject({}) // void
assertPlainObject(new Person()) // throws AssertionException
```

### isPrimitive

Is the value one of the [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) types?

```typescript
isPrimitive(1) // true
isPrimitive({}) // false
validatePrimitive(1) // null
validatePrimitive({}) // ValidationException
assertPrimitive(1) // void
assertPrimitive({}) // throws AssertionException
```

### isPromise

Is the value a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)?

```typescript
isPromise(Promise.resolve(a)) // true
isPromise(() => 'a') // false
validatePromise(Promise.resolve(a)) // null
validatePromise(() => 'a') // ValidationException
assertPromise(Promise.resolve(a)) // void
assertPromise(() => 'a') // throws AssertionException
```

### isSet

Is the value a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)?

```typescript
isSet(new Set()) // true
isSet([]) // false
validateSet(new Set()) // null
validateSet([]) // ValidationException
assertSet(new Set()) // void
assertSet([]) // throws AssertionException
```

### isString

Is the value a [string](https://developer.mozilla.org/en-US/docs/Glossary/String)?

```typescript
isString('') // true
isString(1) // false
validateString('') // null
validateString(1) // ValidationException
assertString('') // void
assertString(1) // throws AssertionException
```

### isStructural

Is the value a [structural type (object)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects)?

```typescript
isStructural({}) // true
isStructural(1) // false
validateStructural({}) // null
validateStructural(1) // ValidationException
assertStructural({}) // void
assertStructural(1) // throws AssertionException
```

### isSymbol

Is the value a [Symbol](https://developer.mozilla.org/en-US/docs/Glossary/Symbol)?

```typescript
isSymbol(Symbol('')) // true
isSymbol('') // false
validateSymbol(Symbol('')) // null
validateSymbol('') // ValidationException
assertSymbol(Symbol('')) // void
assertSymbol('') // throws AssertionException
```

### isTruthy

Is the value [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)?

```typescript
isTruthy(1) // true
isTruthy(0) // false
validateTruthy(1) // null
validateTruthy(0) // ValidationException
assertTruthy(1) // void
assertTruthy(0) // throws AssertionException
```

### isUndefined

Is the value [undefined](https://developer.mozilla.org/en-US/docs/Glossary/undefined)?

```typescript
isUndefined(undefined) // true
isUndefined(1) // false
validateUndefined(undefined) // null
validateUndefined(1) // ValidationException
assertUndefined(undefined) // void
assertUndefined(1) // throws AssertionException
```

### isWeakMap

Is the value a [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)?

```typescript
isWeakMap(new WeakMap()) // true
isWeakMap({}) // false
validateWeakMap(new WeakMap()) // null
validateWeakMap({}) // ValidationException
assertWeakMap(new WeakMap()) // void
assertWeakMap({}) // throws AssertionException
```

### isWeakSet

Is the value a [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)?

```typescript
isWeakSet(new WeakSet()) // true
isWeakSet([]) // false
validateWeakSet(new WeakSet()) // null
validateWeakSet([]) // ValidationException
assertWeakSet(new WeakSet()) // void
assertWeakSet([]) // throws AssertionException
```

## Environment Detection

### isBrowserContext

Is this function being invoked in a browser context?

```typescript
isBrowserContext() // true in a browser, false everywhere else
validateBrowserContext() // null in a browser, ValidationException everywhere else
assertBrowserContext() // void in a browser, throws AssertionException everywhere else
```

### isDenoContext

Is this function being invoked in a Deno context?

```typescript
isDenoContext() // true in Deno, false everywhere else
validateDenoContext() // null in Deno, ValidationException everywhere else
assertDenoContext() // void in Deno, throws AssertionException everywhere else
```

### isNodeContext

Is this function being invoked in a Node.js context?

```typescript
isNodeContext() // true in Node, false everywhere else
validateNodeContext() // null in Node, ValidationException everywhere else
assertNodeContext() // void in Node, throws AssertionException everywhere else
```

### isWebWorkerContext

Is this function being invoked in a WebWorker context?

```typescript
isWebWorkerContext() // true in a WebWorker, false everywhere else
validateWebWorkerContext() // null in a WebWorker, ValidationException everywhere else
assertWebWorkerContext() // void in a WebWorker, throws AssertionException everywhere else
```

# Contributing

## Running unit tests

Run `nx test is` to execute the unit tests via [Jest](https://jestjs.io).
