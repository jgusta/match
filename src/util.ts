import type {
  Action,
  ActionParams,
  Argument,
  Async,
  Callable,
  Invalid,
  Later,
  Scalar,
  ValidArgument,
  VoidLater,
} from "./types.ts";

// running instanceof on an undefined var will throw, but typeof will not.
const isInvalid = (check: unknown): check is Invalid =>
  typeof check !== "boolean" &&
  (typeof check === "undefined" || check === null);

const isCallable = (
  check: unknown,
): check is Callable => !isInvalid(check) && typeof check === "function";

const isLater = (check: unknown): check is Later =>
  !isInvalid(check) &&
  (typeof check === "function" || check instanceof Promise);

const isScalar = (check: unknown): check is Scalar =>
  !isInvalid(check) &&
  typeof check !== "function" &&
  (typeof check === "string" ||
    typeof check === "number" ||
    typeof check === "boolean");

const isAsync = (check: unknown): check is Async =>
  !isInvalid(check) && check instanceof Promise;

const isValidArgument = (check: unknown): check is ValidArgument =>
  isScalar(check) || isLater(check) || isAsync(check);

const startSwitch = async function (arg: ValidArgument): Async {
  let result;
  if (isLater(arg)) {
    if (isAsync(arg)) {
      result = await arg;
    } else if (isCallable(arg)) {
      result = (arg as Function)();
      if (isAsync(result)) {
        result = await result;
      }
    }
  } else if (isScalar(arg)) result = arg;
  result = isAsync(result)
    ? result
    : isScalar(result)
    ? Promise.resolve(result)
    : null;
  if (null === result) {
    throw new Error("Invalid result for switch argument");
  }
  return result;
};

async function actionResolver(action: Action, ...actionParams: ActionParams) {
  let result: Scalar | Async | null = null;

  if (isScalar(action)) {
    return action; // Directly return the scalar value
  }

  if (isCallable(action)) {
    const actionResult = (action as Function)(...actionParams) as
      | void
      | Scalar
      | Async;
    if (actionResult === undefined) {
      result = null;
    } else if (isAsync(actionResult)) {
      result = actionResult;
    } else if (isScalar(actionResult)) {
      result = actionResult;
    }
  } else if (isAsync(action)) {
    result = await action;
  }

  if (result === undefined) {
    return null; // Convert void to null or another appropriate value
  }

  if (isScalar(result) || isAsync(result)) {
    return result; // Ensure result is Scalar or Async
  }

  throw new Error("Action did not resolve to a valid Scalar or Async value.");
}

const resolveCase = async function (
  switchResolved: Scalar,
  predicate: ValidArgument,
): Async {
  let result: any;
  if (isCallable(predicate)) {
    const callResult = predicate(switchResolved);
    if (callResult === undefined) {
      result = null;
    } else if (isAsync(callResult)) {
      result = await callResult;
    } else {
      result = callResult;
    }
  } else if (isLater(predicate)) {
    if (isAsync(predicate)) {
      result = await predicate;
    }
  } else {
    result = predicate;
  }

  if (isScalar(result)) {
    result = Promise.resolve(result) as Promise<Scalar>;
  }

  if (null === result || isInvalid(result)) {
    throw new Error("Invalid result for switch argument");
  }
  return result as Promise<Scalar>;
};

// Compare the switch expression to the case expression
export const comparer = async (
  switchResult: Scalar,
  result: Async | Scalar,
):Promise<boolean> => {
  const caseResult = isAsync(result) ? await result : result;
  return switchResult === caseResult;
};

export {
  actionResolver,
  isAsync,
  isCallable,
  isInvalid,
  isLater,
  isScalar,
  isValidArgument,
  resolveCase,
  startSwitch,
};
