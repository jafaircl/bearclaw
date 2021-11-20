# is

`@bearclaw/is` is a set of runtime type-checking and environment-detecting functions.

## Type Checking

### isArray

Is the value an [Array](https://developer.mozilla.org/en-US/docs/Glossary/array)?

```typescript
isArray([1]) // true
isArray(1) // false
```

### isArrowFunction

Is the value an [arrow function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)?

```typescript
isArrowFunction(() => 'a') // true
isArrowFunction(function () {}) // false
```

### isAsyncFunction

Is the value an [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction)?

```typescript
isAsyncFunction(async () => 'a') // true
isAsyncFunction(() => 'a') // false
```

### isBigInt

Is the value a [BigInt](https://developer.mozilla.org/en-US/docs/Glossary/BigInt)?

```typescript
isBigInt(BigInt(1)) // true
isBigInt(1) // false
```

### isBindable

Is the value [bindable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind)? Arrow functions, constructors and functions that are already bound will not be bindable.

```typescript
isBindable(function () {}) // true
isBindable(function () { return 'a'; }.bind(this)) // false
isBindable(() => 'a') // false
```

### isBoolean

Is the value a [boolean](https://developer.mozilla.org/en-US/docs/Glossary/Boolean)?

```typescript
isBoolean(true) // true
isBoolean(1) // false
```

### isBoundFunction

Is the value a [bound](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind) function?

```typescript
isBoundFunction(function () { return 'a'; }.bind(this)) // true
isBoundFunction(function () {}) // false
```

### isClassCtor

Is the values a [class constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)?

```typescript
isClassCtor(class Person {}) // true
isClassCtor(new Person()) // false
```

### isDateObject

Is the value a [Date object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)?

```typescript
isDateObject(new Date()) // true
isDateObject(1) // false
```

### isEmptyArray

Is the value an [array](https://developer.mozilla.org/en-US/docs/Glossary/array) with no values?

```typescript
isEmptyArray([]) // true
isEmptyArray(['1']) // false
```

### isEmptyMap

Is the value a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) with no entries?

```typescript
isEmptyMap(new Map()) // true
isEmptyMap(new Map([['foo', 'bar']])) // false
```

### isEmptyObject

Is the value a [plain object](https://masteringjs.io/tutorials/fundamentals/pojo) with no entries?

```typescript
isEmptyObject({}) // true
isEmptyObject({ foo: 'bar' }) // false
```

### isEmptySet

Is the value a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) with no values?

```typescript
isEmptySet(new Set()) // true
isEmptySet(new Set([1])) // false
```

### isEmptyString

Is the value a [string](https://developer.mozilla.org/en-US/docs/Glossary/String) with no characters?

```typescript
isEmptyString('') // true
isDateObject('1') // false
```

### isFalsy

Is the value [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)?

```typescript
isFalsy(0) // true
isFalsy(1) // false
```

### isFunction

Is the value a [function](https://developer.mozilla.org/en-US/docs/Glossary/Function)?

```typescript
isFunction(() => {}) // true
isFunction(1) // false
```

### isGeneratorFunction

Is the value a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/GeneratorFunction)?

```typescript
isGeneratorFunction(function* () { yield 'a' }) // true
isGeneratorFunction(() => 'a') // false
```

### isImmutable

Is the value [immutable](https://developer.mozilla.org/en-US/docs/Glossary/Mutable)?

```typescript
isImmutable(Object.freeze({})) // true
isImmutable({}) // false
```

### isJSON

Is the value a [valid JSON value](https://www.ecma-international.org/publications-and-standards/standards/ecma-404/)?

```typescript
isJSON({ 'foo': 'bar' }) // true
isJSON(new Map()) // false
```

### isMap

Is the value a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)?

```typescript
isMap(new Map()) // true
isMap({}) // false
```

### isNull

Is the value [null](https://developer.mozilla.org/en-US/docs/Glossary/Null)?

```typescript
isNull(null) // true
isNull(1) // false
```

### isNullOrUndefined

Is the value [null](https://developer.mozilla.org/en-US/docs/Glossary/Null) or [undefined](https://developer.mozilla.org/en-US/docs/Glossary/undefined)?

```typescript
isNullOrUndefined(null) // true
isNullOrUndefined(undefined) // true
isNullOrUndefined(1) // false
```

### isNumber

Is the value a [number](https://developer.mozilla.org/en-US/docs/Glossary/Number)?

```typescript
isNumber(1) // true
isNumber('') // false
```

### isObject

Is the value a non-null [object](https://developer.mozilla.org/en-US/docs/Glossary/Object)?

```typescript
isObject({}) // true
isObject(1) // false
```

### isPlainObject

Is the value a [plain object](https://masteringjs.io/tutorials/fundamentals/pojo)?

```typescript
isPlainObject({}) // true
isPlainObject(new Person()) // false
```

### isPrimitive

Is the value one of the [primitive](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) types?

```typescript
isPrimitive(1) // true
isPrimitive({}) // false
```

### isPromise

Is the value a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)?

```typescript
isPromise(Promise.resolve(a)) // true
isPromise(() => 'a') // false
```

### isSet

Is the value a [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)?

```typescript
isSet(new Set()) // true
isSet([]) // false
```

### isString

Is the value a [string](https://developer.mozilla.org/en-US/docs/Glossary/String)?

```typescript
isString('') // true
isString(1) // false
```

### isStructural

Is the value a [structural type (object)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#objects)?

```typescript
isStructural({}) // true
isStructural(1) // false
```

### isSymbol

Is the value a [Symbol](https://developer.mozilla.org/en-US/docs/Glossary/Symbol)?

```typescript
isSymbol(Symbol('')) // true
isSymbol('') // false
```

### isTruthy

Is the value [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)?

```typescript
isTruthy(1) // true
isTruthy(0) // false
```

### isUndefined

Is the value [undefined](https://developer.mozilla.org/en-US/docs/Glossary/undefined)?

```typescript
isUndefined(undefined) // true
isUndefined(1) // false
```

### isWeakMap

Is the value a [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)?

```typescript
isWeakMap(new WeakMap()) // true
isWeakMap({}) // false
```

### isWeakSet

Is the value a [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)?

```typescript
isWeakSet(new WeakSet()) // true
isWeakSet([]) // false
```

## Environment Detection

### isBrowserContext

Is this function being invoked in a browser context?

```typescript
isBrowserContext() // true in a browser, false everywhere else
```

### isDenoContext

Is this function being invoked in a Deno context?

```typescript
isDenoContext() // true in Deno, false everywhere else
```

### isNodeContext

Is this function being invoked in a Node.js context?

```typescript
isNodeContext() // true in Node, false everywhere else
```

### isWebWorkerContext

Is this function being invoked in a WebWorker context?

```typescript
isWebWorkerContext() // true in a WebWorker, false everywhere else
```

# Contributing

## Running unit tests

Run `nx test is` to execute the unit tests via [Jest](https://jestjs.io).
