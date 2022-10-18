import { arrayValues } from './isArray.spec';
import { asyncFunctionValues } from './isAsyncFunction.spec';
import { bigIntValues } from './isBigInt.spec';
import { booleanValues } from './isBoolean.spec';
import { dateObjectValues } from './isDateObject.spec';
import { functionValues } from './isFunction.spec';
import { generatorFunctionValues } from './isGeneratorFunction.spec';
import { mapValues } from './isMap.spec';
import { nullValues } from './isNull.spec';
import { numberValues } from './isNumber.spec';
import { plainObjectValues } from './isPlainObject.spec';
import { promiseValues } from './isPromise.spec';
import { setValues } from './isSet.spec';
import { stringValues } from './isString.spec';
import { symbolValues } from './isSymbol.spec';
import { assertType, isType, validateType } from './isType';
import { undefinedValues } from './isUndefined.spec';
import { weakMapValues } from './isWeakMap.spec';
import { weakSetValues } from './isWeakSet.spec';
import { values } from './test-utils.spec';

describe('isType', () => {
  it('should work with a custom class with a toStringTag defined', () => {
    class MyCustomClass {
      get [Symbol.toStringTag](): string {
        return 'MyCustomClass';
      }
    }
    expect(isType('MyCustomClass', new MyCustomClass())).toEqual(true);
  });

  for (const key of arrayValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('Array', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('Array', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('Array', values[key]);
      }).not.toThrow();
    });
  }

  // ArrowFunction is not a type

  for (const key of asyncFunctionValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('AsyncFunction', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('AsyncFunction', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('AsyncFunction', values[key]);
      }).not.toThrow();
    });
  }

  for (const key of bigIntValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('BigInt', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('BigInt', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('BigInt', values[key]);
      }).not.toThrow();
    });
  }

  // Bindable is not a type

  for (const key of booleanValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('Boolean', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('Boolean', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('Boolean', values[key]);
      }).not.toThrow();
    });
  }

  // BoundFunction is not a type

  // BrowserContext is not a type

  // ClassCtor is not a type

  for (const key of dateObjectValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('Date', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('Date', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('Date', values[key]);
      }).not.toThrow();
    });
  }

  // DenoContext is not a type

  // EmptyArray is not a type

  // EmptyMap is not a type

  // EmptyObject is not a type

  // EmptySet is not a type

  // Falsy is not a type

  for (const key of functionValues) {
    if (key.startsWith('async')) {
      // AsyncFunction is its own type
      continue;
    }
    if (key.startsWith('generator')) {
      // GeneratorFunction is its own type
      continue;
    }
    it(`should return "true" for ${key} values`, () => {
      expect(isType('Function', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('Function', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('Function', values[key]);
      }).not.toThrow();
    });
  }

  for (const key of generatorFunctionValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('GeneratorFunction', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('GeneratorFunction', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('GeneratorFunction', values[key]);
      }).not.toThrow();
    });
  }

  // Immutable is not a type

  // Json is not a type

  for (const key of mapValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('Map', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('Map', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('Map', values[key]);
      }).not.toThrow();
    });
  }

  // Nil is not a type

  // NodeContext is not a type

  for (const key of nullValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('Null', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('Null', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('Null', values[key]);
      }).not.toThrow();
    });
  }

  for (const key of numberValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('Number', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('Number', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('Number', values[key]);
      }).not.toThrow();
    });
  }

  // Objects have more specific types

  for (const key of plainObjectValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('Object', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('Object', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('Object', values[key]);
      }).not.toThrow();
    });
  }

  // Primitive is not a type

  for (const key of promiseValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('Promise', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('Promise', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('Promise', values[key]);
      }).not.toThrow();
    });
  }

  for (const key of setValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('Set', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('Set', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('Set', values[key]);
      }).not.toThrow();
    });
  }

  for (const key of stringValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('String', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('String', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('String', values[key]);
      }).not.toThrow();
    });
  }

  // Structural is not a type

  for (const key of symbolValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('Symbol', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('Symbol', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('Symbol', values[key]);
      }).not.toThrow();
    });
  }

  // Truthy is not a type

  for (const key of undefinedValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('Undefined', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('Undefined', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('Undefined', values[key]);
      }).not.toThrow();
    });
  }

  for (const key of weakMapValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('WeakMap', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('WeakMap', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('WeakMap', values[key]);
      }).not.toThrow();
    });
  }

  for (const key of weakSetValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isType('WeakSet', values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateType('WeakSet', values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertType('WeakSet', values[key]);
      }).not.toThrow();
    });
  }

  // WebWorker context is not a type
});
