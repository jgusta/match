# @jgusta/match

Provides a powerful and flexible pattern matching utility for Deno, inspired by functional programming paradigms.

## Features

- Versatile Pattern Matching: Match values, functions, and even promises against patterns.

- Asynchronous Support: Seamlessly handle asynchronous conditions and actions.

- Fluent API: Chainable methods for intuitive and linear code flow.

- Default Fallbacks: Specify default actions with .otherwise() for unmatched cases.

- Reusable Predicate Chains: Match after cases are defined. Like a reverse switch statement.

## Installation

```
# from the terminal
deno add @jgusta/match

# then import the function
import match from "@jgusta/match";
```

## Quick Start

Here's an example of how to get started:

```
import match from "@jgusta/match";

const result = await match("dog")
  .on("cat", () => "meow")
  .on("dog", () => "woof")
  .otherwise(() => "unknown animal")
  .exe();

console.log(result); // Outputs: "woof"
```

The syntax for standard one-shot mode:

```
match(switch).on(case, action).otherwise(defaultAction).exe()
```

Where `switch` is what will be matched against each `case`. When a match is made, `action` will be called. If nothing matches, `defaultAction` is called.

With no parameters to the `match` function, you start a chain of conditions and actions:

```
match().on(case, action).otherwise(defaultAction).match(switch, extra)
```

Where `switch` is what will be matched against each `case`. When a match is made, `action` will be called with `extra` as a parameter. If nothing matches, `defaultAction` is called with `extra`.

Example:

```
import match from "@jgusta/match";

async function checkToken(x:number) {
  await new Promise((res) => setTimeout(res, 1000));
  return x===1337?1337:0;
}

// reusable chain
const checkAccess = match()
  .on((x:number) => checkToken(x),(x: string) => `${x} has Full access`)
  .on(() => "editor",(x: string) => `${x} has Limited access`)
  .on(() => "viewer", (x: string) => `${x} has View only`)
  .otherwise((x:string) => `${x} has no access`)


// Example usage
await checkAccess.match("editor", "editor") //"editor has Limited access"
await checkAccess.match(1337, "admin") // "admin has Full access"
```

## How It Works / What's the point
This library was a personal challenge to see if such a pattern matching function could be made in Typescript. It is not for everyone. It is not ready for production. It may add unnecessary complexity to your code.
 
## Contributing
Contributions are welcome, if you are inteactionParamsed. I think this is of limited use and almost a 'code golf' sort of endeavor. It mostly works, but there is a lot of room for improvement.
