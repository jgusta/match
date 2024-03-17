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
