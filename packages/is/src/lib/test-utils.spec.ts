import { AssertionException } from './AssertionException';
import { ValidationException } from './ValidationException';

const objRef = {};

export const values = {
  arrayCtor: Array,
  arrayOfObjects: [{}],
  arrayOfPrimitives: [1],
  arrowFunction: () => 'a',
  asyncArrowFunction: async () => 'a',
  asyncTraditionalFunction: async function () {
    return 'a';
  },
  // BigInt literals are not avaliable when targeting less than ES2020
  bigIntObject: BigInt(1),
  bigIntCtor: BigInt,
  booleanCtor: Boolean,
  booleanObject: Boolean(true),
  boundFunction: function () {
    return 'a';
  }.bind(this),
  classCtor: class Person {},
  dateCtor: Date,
  dateNow: Date.now(),
  dateObject: new Date(),
  emptyArray: [],
  emptyMap: new Map(),
  emptyObject: {},
  emptySet: new Set(),
  emptyString: '',
  emptyWeakMap: new WeakMap(),
  emptyWeakSet: new WeakSet(),
  false: false,
  frozenEmptyObject: Object.freeze({}),
  frozenObject: Object.freeze({ foo: 'bar' }),
  generatorFunction: function* () {
    yield 'a';
  },
  infinity: Infinity,
  infinityNegative: -Infinity,
  map: new Map([['a', 'b']]),
  mapCtor: Map,
  NaN: NaN,
  negativeZero: -0,
  nonEmptyObject: { foo: 'bar' },
  null: null,
  number: 1,
  numberCtor: Number,
  numberObject: new Number(1),
  promiseCtor: Promise,
  promiseNew: new Promise((resolve) => resolve('a')),
  promiseResolve: Promise.resolve('a'),
  sealedEmptyObject: Object.seal({}),
  sealedObject: Object.seal({ foo: 'bar' }),
  set: new Set(['a']),
  setCtor: Set,
  string: 'abc',
  stringCtor: String,
  stringObject: new String('abc'),
  symbol: Symbol('abc'),
  symbolCtor: Symbol,
  traditionalFunction: function () {
    return 'a';
  },
  true: true,
  undefined: undefined,
  void0: void 0,
  weakMapCtor: WeakMap,
  weakMap: new WeakMap([[objRef, 1]]),
  weakSetCtor: WeakSet,
  weakSet: new WeakSet([]),
  zero: 0,
  zeroBigInt: BigInt(0),
};

export const testIsAgainstValues = (
  fnToTest: (v: unknown) => boolean,
  shouldBeTrue: (keyof typeof values)[]
) => {
  for (const [key, value] of Object.entries(values)) {
    if (shouldBeTrue.includes(key as keyof typeof values)) {
      it(`should return true for ${key} values`, () => {
        expect(fnToTest(value)).toEqual(true);
      });
    } else {
      it(`should return false for ${key} values`, () => {
        expect(fnToTest(value)).toEqual(false);
      });
    }
  }
};

export const testValidateAgainstValues = (
  fnToTest: (v: unknown) => ValidationException | null,
  shouldBeTrue: (keyof typeof values)[]
) => {
  for (const [key, value] of Object.entries(values)) {
    if (shouldBeTrue.includes(key as keyof typeof values)) {
      it(`should return null for ${key} values`, () => {
        expect(fnToTest(value)).toEqual(null);
      });
    } else {
      it(`should return a ValidationException for ${key} values`, () => {
        const err = fnToTest(value);
        expect(err).toBeInstanceOf(ValidationException);
        expect(err.message).toEqual(fnToTest.name.replace('validate', 'is'));
      });
    }
  }
};

export const testAssertAgainstValues = (
  fnToTest: (v: unknown) => void,
  shouldBeTrue: (keyof typeof values)[]
) => {
  for (const [key, value] of Object.entries(values)) {
    if (shouldBeTrue.includes(key as keyof typeof values)) {
      it(`should not throw for ${key} values`, () => {
        expect(() => {
          fnToTest(value);
        }).not.toThrow();
      });
    } else {
      it(`should throw for ${key} values`, () => {
        try {
          fnToTest(value);
          // Make sure to fail the test if we reach here
          expect(true).toEqual(false);
        } catch (err) {
          expect(err).toBeInstanceOf(AssertionException);
          expect(err.message).toEqual(fnToTest.name.replace('assert', 'is'));
        }
      });
    }
  }
};

describe('test-utils', () => {
  testIsAgainstValues(() => false, []);
});
