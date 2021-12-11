# collections

This library is a set of TypeScript classes and functions for working with collections of data.

## HashMap

An extension of the built-in `Map` object that uses a hashing function for key equality. Unlike the built-in `Map` object, it will treat objects with identical values as equal. To illustrate this difference, this is how the built-in `Map` treats objects:

```typescript
const map = new Map()
map.set({}, 'abc')
map.get({}) // Will return undefined
map.has({}) // Will return false
```

In contrast, `HashMap` will treat them like so:

```typescript
const map = new HashMap()
map.set({}, 'abc')
map.get({}) // Will return `'abc'`
map.has({}) // Will return true
```

## HashSet

An extension of the built-in `Set` object that uses a hashing function for value equality. Unlike the built-in `Set` object, it will treat identical object values as equal. To illustrate this difference, this is how the built-in `Set` treats objects:

```typescript
const set = new Set()
map.add({})
map.has({}) // Will return false
```

In contrast, `HashSet` will treat them like so:

```typescript
const set = new HashSet()
map.add({})
map.has({}) // Will return true
```

## Running unit tests

Run `nx test collections` to execute the unit tests via [Jest](https://jestjs.io).
