export function isNumeric(num) {
  // No arrays, bool etc
  if (typeof num !== "string" && typeof num !== "number") {
    return false;
  }
  // coerce num to be a string
  num = "" + num;
  return !isNaN(num) && !isNaN(parseFloat(num));
};

export function isObject(target) {
  // Exclude dates, null, arrays
  return (target !== undefined) && (target !== null) && (typeof target === "object") && (Object.prototype.toString.call(target) === "[object Object]");
};
