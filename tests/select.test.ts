import { assertEquals } from "@std/assert";
import match from "../src/select.ts";

Deno.test("should resolve with the correct action in post mode", async () => {
  const matchSeqObject = match();
  const pred1 = () => 1;
  const action1 = () => "Case 1";
  const pred2 = () =>  2;
  const action2 = () => "Case 2";

  const matcher = matchSeqObject.on(pred1, action1).on(pred2, action2)
    .otherwise(() => "No match");

  const result1 = await matcher.match(1);
  const result2 = await matcher.match(2);
  const result3 = await matcher.match(3);

  // Assert that the correct action is resolved
  assertEquals(result1, "Case 1");
  assertEquals(result2, "Case 2");
  assertEquals(result3, "No match");
});

Deno.test("should match in post mode where switch is passed to case and the result is a boolean", async () => {
  const matchSeqObject = match();
  const pred1 = (x:unknown) => x === 1;
  const action1 = () => "Case 1";
  const pred2 = (x: unknown) => x === 3;
  const action2 = () => "Case 2";
  const matcher = matchSeqObject.on(pred1, action1).on(pred2, action2)
    .otherwise(() => "No match");

  const result1 = await matcher.match(1);
  const result2 = await matcher.match(2);
  const result3 = await matcher.match(3);

  // Assert that the correct action is resolved
  assertEquals(result1, "Case 1");
  assertEquals(result2, "No match");
  assertEquals(result3, "Case 2");
});
