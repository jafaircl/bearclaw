import { isArray, isPlainObject } from './validators';

export const deepSortObject = (
  source: unknown,
  comparator = (a: string, b: string) => a.localeCompare(b)
) => {
  if (isArray(source)) {
    return (source as unknown[]).map((item) =>
      deepSortObject(item, comparator)
    );
  }
  if (isPlainObject(source)) {
    const obj = {};
    for (const key of Object.keys(source).sort(comparator)) {
      obj[key] = deepSortObject(source[key], comparator);
    }
    return obj;
  }
  return source;
};
