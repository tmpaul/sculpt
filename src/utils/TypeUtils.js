export function isNumeric(num) {
  // No arrays, bool etc
  if (typeof num !== "string" && typeof num !== "number") {
    return false;
  }
  // coerce num to be a string
  num = "" + num;
  return !isNaN(num) && !isNaN(parseFloat(num));
};
