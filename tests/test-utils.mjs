import { deepEqual } from "../src/utils/utils.js";

export const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

export const assertEqual = (a, b) => {
  expect(deepEqual(a, b), `'${a}' is not equal to '${b}'`);
};

export const assertNotNullOrUndefined = (a) =>
  expect(!deepEqual(a, undefined) && !deepEqual(a, null), `${a} should not be null or undefined`);

export const expectThrows = (fn, message) => {
  try {
    fn();
    throw new Error("Function should throw an error");
  } catch (e) {
    assertEqual(e.message, message);
  }
};

console.log("Testing deepEqual");
expect(!deepEqual(1, "1"), "Different types are not equal");
expect(!deepEqual({}, null), "Different types are not equal");
expect(!deepEqual({}, undefined), "Different types are not equal");
expect(deepEqual(1, 1), "Same numbers are equal");
expect(!deepEqual(2, 1), "Different numbers are not equal");
expect(deepEqual("a", "a"), "Same strings are equal");
expect(!deepEqual("a", "b"), "Different strings are not equal");
expect(deepEqual({ a: 1 }, { a: 1 }), "Same objects are equal");
expect(!deepEqual({ a: 1 }, { a: 2 }), "Different objects are not equal");
expect(!deepEqual({ a: 1 }, { b: 1 }), "Different objects are not equal");
expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } }), "Nested objects are equal");
expect(
  !deepEqual({ a: { b: 1 } }, { a: { b: 2 } }),
  "Nested objects are not equal"
);
expect(deepEqual([1, 2, 3], [1, 2, 3]), "Same arrays are equal");
expect(!deepEqual([1, 2, 3], [1, 2, 4]), "Different arrays are not equal");
expect(!deepEqual([1, 2, 3], [1, 2]), "Different arrays are not equal");
expect(!deepEqual([1, 2, 3], [1, 2, 3, 4]), "Different arrays are not equal");
expect(deepEqual([1, 2, [3, 4]], [1, 2, [3, 4]]), "Nested arrays are equal");
expect(
  !deepEqual([1, 2, [3, 4]], [1, 2, [3, 5]]),
  "Nested arrays are not equal"
);
expect(
  deepEqual([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 2 }]),
  "Array of objects are equal"
);
expect(
  !deepEqual([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 3 }]),
  "Array of objects are not equal"
);

console.log("Testing assertEqual");
try {
  assertEqual(1, 2);
  throw new Error("assertEqual should throw an error");
} catch (e) {
  assertEqual(e.message, "'1' is not equal to '2'");
}
expectThrows(() => assertEqual(1, 2), "'1' is not equal to '2'");

assertEqual(1, 1);
expectThrows(()=>assertNotNullOrUndefined(null), "null should not be null or undefined")