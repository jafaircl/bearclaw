const values = {
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
  false: false,
  generatorFunction: function* () {
    yield 'a';
  },
  infinity: Infinity,
  infinityNegative: -Infinity,
  map: new Map([['a', 'b']]),
  mapCtor: Map,
  NaN: NaN,
  null: null,
  number: 1,
  numberCtor: Number,
  numberObject: new Number(1),
  promiseCtor: Promise,
  promiseNew: new Promise((resolve) => resolve('a')),
  promiseResolve: Promise.resolve('a'),
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
  zero: 0,
};

export const testValues = (
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

describe('test-utils', () => {
  testValues(() => false, []);
});
