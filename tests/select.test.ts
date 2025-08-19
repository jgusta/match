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

Deno.test("sequence mode - error handling with no default", async () => {
  try {
    const matcher = match()
      .on(1, "one")
      .on(2, "two");
    await matcher.match(3);
    assertEquals(false, true, "Should have thrown an error");
  } catch (e) {
    assertEquals((e as Error).message, "No match and no default");
  }
});

Deno.test("sequence mode - promise predicates", async () => {
  const matcher = match()
    .on(Promise.resolve("async"), "async matched")
    .on("sync", "sync matched")
    .otherwise("no match");
  
  const result1 = await matcher.match("async");
  const result2 = await matcher.match("sync");
  const result3 = await matcher.match("other");
  
  assertEquals(result1, "async matched");
  assertEquals(result2, "sync matched");
  assertEquals(result3, "no match");
});

Deno.test("sequence mode - complex boolean logic", async () => {
  const matcher = match()
    .on((x: any) => typeof x === "string" && x.startsWith("test"), "string test")
    .on((x: any) => typeof x === "number" && x > 10, "big number")
    .otherwise("unknown type");
  
  assertEquals(await matcher.match("testing"), "string test");
  assertEquals(await matcher.match(15), "big number");
  assertEquals(await matcher.match(5), "unknown type");
});

Deno.test("sequence mode - simple async predicates", async () => {
  const matcher = match()
    .on((x: any) => Promise.resolve(x === "delayed"), "found delayed")
    .otherwise("not delayed");
  
  const result1 = await matcher.match("delayed");
  const result2 = await matcher.match("immediate");
  
  assertEquals(result1, "found delayed");
  assertEquals(result2, "not delayed");
});

Deno.test("post mode - error handling invalid switch", async () => {
  try {
    // @ts-ignore - testing invalid input
    await match(null).on(1, "test").exe();
    assertEquals(false, true, "Should have thrown an error");
  } catch (e) {
    assertEquals((e as Error).message, "Invalid match argument");
  }
});

Deno.test("post mode - chaining with mixed types", async () => {
  const result = await match(Promise.resolve("hello"))
    .on("hello", "matched string")
    .on(42, "matched number")
    .on(() => false, "matched function")
    .otherwise("no match")
    .exe();
  
  assertEquals(result, "matched string");
});

Deno.test("integration - combining both modes", async () => {
  // Create a sequence matcher for simple types
  const sequence = match()
    .on("user", "User type")
    .on("admin", "Admin type")
    .otherwise("Unknown type");
  
  // Test the sequence
  assertEquals(await sequence.match("user"), "User type");
  assertEquals(await sequence.match("admin"), "Admin type");
  
  // Use post mode for immediate matching
  const post = await match("admin")
    .on("admin", "Admin matched")
    .otherwise("not admin")
    .exe();
  
  assertEquals(post, "Admin matched");
});
