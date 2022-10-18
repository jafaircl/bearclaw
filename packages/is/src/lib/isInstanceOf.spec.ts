import { arrayValues } from './isArray.spec';
import { booleanValues } from './isBoolean.spec';
import { dateObjectValues } from './isDateObject.spec';
import { functionValues } from './isFunction.spec';
import {
  assertInstanceOf,
  isInstanceOf,
  validateInstanceOf,
} from './isInstanceOf';
import { mapValues } from './isMap.spec';
import { numberValues } from './isNumber.spec';
import { plainObjectValues } from './isPlainObject.spec';
import { promiseValues } from './isPromise.spec';
import { setValues } from './isSet.spec';
import { stringValues } from './isString.spec';
import { weakMapValues } from './isWeakMap.spec';
import { weakSetValues } from './isWeakSet.spec';
import { values } from './test-utils.spec';

describe('isInstanceOf', () => {
  it('should work with a custom class', () => {
    class MyCustomClass {}
    expect(isInstanceOf(MyCustomClass, new MyCustomClass())).toEqual(true);
    expect(validateInstanceOf(MyCustomClass, new MyCustomClass())).toEqual(
      null
    );
    expect(() =>
      assertInstanceOf(MyCustomClass, new MyCustomClass())
    ).not.toThrow();
  });

  for (const key of arrayValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isInstanceOf(Array, values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateInstanceOf(Array, values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertInstanceOf(Array, values[key]);
      }).not.toThrow();
    });
  }

  for (const key of booleanValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isInstanceOf(Boolean, values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateInstanceOf(Boolean, values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertInstanceOf(Boolean, values[key]);
      }).not.toThrow();
    });
  }

  for (const key of dateObjectValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isInstanceOf(Date, values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateInstanceOf(Date, values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertInstanceOf(Date, values[key]);
      }).not.toThrow();
    });
  }

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
      expect(isInstanceOf(Function, values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateInstanceOf(Function, values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertInstanceOf(Function, values[key]);
      }).not.toThrow();
    });
  }

  for (const key of mapValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isInstanceOf(Map, values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateInstanceOf(Map, values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertInstanceOf(Map, values[key]);
      }).not.toThrow();
    });
  }

  for (const key of numberValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isInstanceOf(Number, values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateInstanceOf(Number, values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertInstanceOf(Number, values[key]);
      }).not.toThrow();
    });
  }

  for (const key of plainObjectValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isInstanceOf(Object, values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateInstanceOf(Object, values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertInstanceOf(Object, values[key]);
      }).not.toThrow();
    });
  }

  for (const key of promiseValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isInstanceOf(Promise, values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateInstanceOf(Promise, values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertInstanceOf(Promise, values[key]);
      }).not.toThrow();
    });
  }

  for (const key of setValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isInstanceOf(Set, values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateInstanceOf(Set, values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertInstanceOf(Set, values[key]);
      }).not.toThrow();
    });
  }

  for (const key of stringValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isInstanceOf(String, values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateInstanceOf(String, values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertInstanceOf(String, values[key]);
      }).not.toThrow();
    });
  }

  for (const key of weakMapValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isInstanceOf(WeakMap, values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateInstanceOf(WeakMap, values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertInstanceOf(WeakMap, values[key]);
      }).not.toThrow();
    });
  }

  for (const key of weakSetValues) {
    it(`should return "true" for ${key} values`, () => {
      expect(isInstanceOf(WeakSet, values[key])).toEqual(true);
    });

    it(`should return "null" for ${key} values`, () => {
      expect(validateInstanceOf(WeakSet, values[key])).toEqual(null);
    });

    it(`should not throw for ${key} values`, () => {
      expect(() => {
        assertInstanceOf(WeakSet, values[key]);
      }).not.toThrow();
    });
  }
});
