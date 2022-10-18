import { getType } from './getType';
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
import { undefinedValues } from './isUndefined.spec';
import { weakMapValues } from './isWeakMap.spec';
import { weakSetValues } from './isWeakSet.spec';
import { values } from './test-utils.spec';

describe('getType', () => {
  it('should work with a custom class with a toStringTag defined', () => {
    class MyCustomClass {
      get [Symbol.toStringTag](): string {
        return 'MyCustomClass';
      }
    }
    expect(getType(new MyCustomClass())).toEqual('MyCustomClass');
  });

  for (const key of arrayValues) {
    it(`should return "Array" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('Array');
    });
  }

  // ArrowFunction is not a type

  for (const key of asyncFunctionValues) {
    it(`should return "AsyncFunction" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('AsyncFunction');
    });
  }

  for (const key of bigIntValues) {
    it(`should return "BigInt" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('BigInt');
    });
  }

  // Bindable is not a type

  for (const key of booleanValues) {
    it(`should return "Boolean" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('Boolean');
    });
  }

  // BoundFunction is not a type

  // BrowserContext is not a type

  // ClassCtor is not a type

  for (const key of dateObjectValues) {
    it(`should return "Date" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('Date');
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
    it(`should return "Function" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('Function');
    });
  }

  for (const key of generatorFunctionValues) {
    it(`should return "GeneratorFunction" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('GeneratorFunction');
    });
  }

  // Immutable is not a type

  // Json is not a type

  for (const key of mapValues) {
    it(`should return "Map" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('Map');
    });
  }

  // Nil is not a type

  // NodeContext is not a type

  for (const key of nullValues) {
    it(`should return "Null" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('Null');
    });
  }

  for (const key of numberValues) {
    it(`should return "Number" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('Number');
    });
  }

  // Objects have more specific types

  for (const key of plainObjectValues) {
    it(`should return "Object" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('Object');
    });
  }

  // Primitive is not a type

  for (const key of promiseValues) {
    it(`should return "Promise" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('Promise');
    });
  }

  for (const key of setValues) {
    it(`should return "Set" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('Set');
    });
  }

  for (const key of stringValues) {
    it(`should return "String" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('String');
    });
  }

  // Structural is not a type

  for (const key of symbolValues) {
    it(`should return "Symbol" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('Symbol');
    });
  }

  // Truthy is not a type

  for (const key of undefinedValues) {
    it(`should return "Undefined" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('Undefined');
    });
  }

  for (const key of weakMapValues) {
    it(`should return "WeakMap" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('WeakMap');
    });
  }

  for (const key of weakSetValues) {
    it(`should return "WeakSet" for ${key} values`, () => {
      expect(getType(values[key])).toEqual('WeakSet');
    });
  }

  // WebWorker context is not a type
});
