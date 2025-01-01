import assert from "assert";
import tentacle from "../tentacle.js";
import {
  assertEqual,
  assertNotNullOrUndefined,
  expectThrows,
} from "./test-utils.mjs";

const sendPatch = (patch) => patch;

console.log("Testing tentacle");
assertEqual(typeof tentacle({}, sendPatch), "object");
expectThrows(() => tentacle(), "State must be an object");
assertNotNullOrUndefined(tentacle({}, sendPatch)._start_transaction());
assertNotNullOrUndefined(tentacle({}, sendPatch)._end_transaction());

const testState = { a: 1, b: { c: 2 }, arr: [1, 2, { d: 3 }] };

const tentacleProxy = tentacle(testState, sendPatch);

assertEqual(tentacleProxy.a, 1);
assertEqual(tentacleProxy.b.c, 2);
assertEqual(tentacleProxy.arr[0], 1);
assertEqual(tentacleProxy.arr[2].d, 3);

const transaction = tentacleProxy._start_transaction();
tentacleProxy.a = 2;

assertEqual(tentacleProxy.a, 2);
const result = tentacleProxy._end_transaction();

assertEqual(result.patch.length, 1);
assertEqual(result.patch[0].op, "replace");

const transaction2 = tentacleProxy._start_transaction();
tentacleProxy.arr[0] = 2;
const result2 = tentacleProxy._end_transaction();
assertEqual(result2.patch.length, 1);
assertEqual(result2.patch[0].op, "replace");

const transaction3 = tentacleProxy._start_transaction();
tentacleProxy.arr[2].d = 4;
const result3 = tentacleProxy._end_transaction();
assertEqual(result3.patch.length, 1);
assertEqual(result3.patch[0].op, "replace");
assertEqual(result3.patch[0].path, "/arr/2/d");
