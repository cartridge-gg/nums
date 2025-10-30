export function deepEqual(a: any, b: any): boolean {
  // If the values are strictly equal, return true
  if (a === b) return true;

  // If either value is null or not an object, they're not equal
  if (
    a === null ||
    b === null ||
    typeof a !== "object" ||
    typeof b !== "object"
  ) {
    return false;
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle regular expressions
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }

  // Get all keys from both objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  // If number of keys is different, objects are not equal
  if (keysA.length !== keysB.length) {
    return false;
  }

  // Check if every key in a exists in b and has the same value
  return keysA.every((key) => key in b && deepEqual(a[key], b[key]));
}
