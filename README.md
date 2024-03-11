# @jgusta/match

Provides a powerful and flexible pattern matching utility for Deno, inspired by functional programming paradigms.

## Features

- Versatile Pattern Matching: Match values, functions, and even promises against patterns.

- Asynchronous Support: Seamlessly handle asynchronous conditions and actions.

- Fluent API: Chainable methods for intuitive and linear code flow.

- Default Fallbacks: Specify default actions with .otherwise() for unmatched cases.

- Reusable Predicate Chains: 

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


```
import match from "@jgusta/match";

// Define reusable conditional chain
const checkAccess = match()
  .on(() => "admin", (x) => "${x} has Full access")
  .on(() => "editor", (x) => "${x} has Limited access")
  .on(() => "viewer", (x) => "${x} has View only")
  .otherwise((x) => "${x} has no access");


// Example usage
await checkAccess.match("admin", 'Joe');  // Outputs: "Joe has Full access"
await checkAccess.match("editor", 'Barry'); // Outputs: "Barry has Limited access"
await checkAccess.match("viewer", 'Morsk'); // Outputs: "Morsk has View only"
await checkAccess.match("guest", 'Shlub');  // Outputs: "Shlub has No access"
```
