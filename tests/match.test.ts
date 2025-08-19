import { assertEquals } from "@std/assert";
import match from "../src/select.ts"

Deno.test("match sync", async () => {
  const someValue = "called"
  const oneP = match(5).on(5, someValue)
  const one = await oneP.exe()
  assertEquals(one, "called")
  const someCallback2 = () => "called"
  const two = await match(5).on(5, someCallback2).exe()
  assertEquals(two, "called")
})

Deno.test("match async", async () => {
  const matching = match(async () => await Promise.resolve("dog"))
    .on(
      async () => await Promise.resolve("dog"),
      () => "woof"
    )
    .on("cat", () => "meow")
    .on("hello", () => "world")
    .otherwise(() => "nothing")
  const res = await matching.exe()
  assertEquals(res, "woof")
})

Deno.test("match Promise", async () => {
  const matching = match(Promise.resolve("dog"))
    .on(Promise.resolve("dog"), Promise.resolve("woof"))
    .on("cat", () => "meow")
    .on("hello", () => "world")
    .otherwise(() => "nothing")
  const res = await matching.exe()
  assertEquals(res, "woof")
})

Deno.test("match function returning Promise", async () => {
  const matching = match(() => Promise.resolve("dog"))
    .on(
      () => Promise.resolve("dog"),
      () => Promise.resolve("woof")
    )
    .on("cat", () => "meow")
    .on("hello", () => "world")
    .otherwise(() => "nothing")
  const res = await matching.exe()
  assertEquals(res, "woof")
})

Deno.test("match test with actionParams params", async () => {
  const someCallback = (x: number) => `called ${x * 2}`
  const one = await match(7, 5).on(7, someCallback).exe()
  assertEquals(one, "called 10")
})

Deno.test("multi match sequence", async () => {
  const m = match()
    .on(1, (x: number) => `${x} is one`)
    .on(
      () => 2,
      (x: string) => `${x} is two`
    )
    .on(
      () => Promise.resolve(3),
      () => `is three`
    )
    .on(
      () => 4,
      (x: number) => `${x} is four`
    )
    .on(5, (x: number) => Promise.resolve(`${x} is five`))
    .otherwise((x: unknown) => `${x} is something else`)

  assertEquals(`one is one`, await m.match(1, "one"))
  assertEquals(`two is two`, await m.match(2, "two"))
  assertEquals(`is three`, await m.match(3))
  assertEquals(`4 is four`, await m.match(4, 4))
  assertEquals(`5 is five`, await m.match(5, 5))
})


Deno.test("multimatch with operations on switch", async () => {

 async function checkToken(x:number) {
    await new Promise((res) => setTimeout(res, 1000));
    return x===1337?1337:0;
  }

  const checkAccess = match()
    .on(
      (x:number) => checkToken(x),
      (x: string) => `${x} has Full access`
    )
    .on(
      () => "editor",
      (x: string) => `${x} has Limited access`
    )
    .on(
      () => "viewer",
      (x: string) => `${x} has View only`
    )
    .otherwise((x:string) => `${x} has no access`)

    assertEquals(await checkAccess.match("editor", "editor"), "editor has Limited access")
    assertEquals(await checkAccess.match(1337, "admin"), "admin has Full access")

});

Deno.test("error handling - invalid match argument", async () => {
  try {
    // @ts-ignore - testing invalid input
    match(null).on(1, "test").exe()
    assertEquals(false, true, "Should have thrown an error")
  } catch (e) {
    assertEquals((e as Error).message, "Invalid match argument")
  }
})

Deno.test("error handling - no match and no default", async () => {
  try {
    await match(5).on(1, "one").on(2, "two").exe()
    assertEquals(false, true, "Should have thrown an error")
  } catch (e) {
    assertEquals((e as Error).message.includes("No match and no default"), true)
  }
})

Deno.test("boolean predicates - direct boolean returns", async () => {
  const result1 = await match("test")
    .on((x) => x === "test", "matched")
    .on((x) => x === "other", "not matched")
    .otherwise("default")
    .exe()
  
  assertEquals(result1, "matched")
  
  const result2 = await match("other")
    .on((x) => x === "test", "not matched")
    .on((x) => x === "other", "matched")
    .otherwise("default")
    .exe()
  
  assertEquals(result2, "matched")
})

Deno.test("boolean predicates - promise returning boolean", async () => {
  const result = await match("test")
    .on((x: any) => Promise.resolve(x === "test"), "matched")
    .otherwise("default")
    .exe()
  
  assertEquals(result, "matched")
})

Deno.test("nested functions - function returning function", async () => {
  const createMatcher = (target: string) => (x: any) => x === target
  
  const result = await match("hello")
    .on(createMatcher("hello"), "found hello")
    .on(createMatcher("world"), "found world")
    .otherwise("not found")
    .exe()
  
  assertEquals(result, "found hello")
})

Deno.test("void actions - function returning void", async () => {
  let sideEffect = ""
  
  const result = await match("test")
    .on("test", () => { sideEffect = "executed"; return "done" })
    .otherwise("default")
    .exe()
  
  assertEquals(sideEffect, "executed")
  assertEquals(result, "done")
})

Deno.test("simple type matching", async () => {
  const matcher = match()
    .on(1, "number one")
    .on("hello", "string hello")
    .on(42, "number forty-two")
    .otherwise("unknown")
  
  assertEquals(await matcher.match(1), "number one")
  assertEquals(await matcher.match("hello"), "string hello") 
  assertEquals(await matcher.match(42), "number forty-two")
  assertEquals(await matcher.match("other"), "unknown")
})

Deno.test("promise chains and async actions", async () => {
  const asyncAction = async (...args: any[]) => {
    await new Promise(resolve => setTimeout(resolve, 10))
    return `async ${args[0] || 'test'}`
  }
  
  const result = await match(Promise.resolve("test"))
    .on("test", asyncAction)
    .otherwise("no match")
    .exe()
  
  assertEquals(result, "async test")
})

Deno.test("multiple action parameters", async () => {
  const result = await match("test", "param1", 42, true)
    .on("test", (...args: any[]) => `${args[0]}-${args[1]}-${args[2]}`)
    .otherwise("no match")
    .exe()
  
  assertEquals(result, "param1-42-true")
})

Deno.test("function predicates with parameters", async () => {
  const checkRange = (min: number, max: number) => (value: any) => value >= min && value <= max
  
  const result = await match(5)
    .on(checkRange(1, 3), "low")
    .on(checkRange(4, 6), "mid") 
    .on(checkRange(7, 10), "high")
    .otherwise("out of range")
    .exe()
  
  assertEquals(result, "mid")
})
