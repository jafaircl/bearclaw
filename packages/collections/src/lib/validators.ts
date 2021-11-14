export const isPlainObject = (
  value: unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): value is Record<string | number, any> => {
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
};

export const isArray = (value: unknown): value is [] => {
  return Array.isArray(value);
};
