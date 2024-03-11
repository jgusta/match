type Invalid = null | undefined
type Scalar = string | number | boolean
type Later = Async | ((_?: Scalar) => Scalar | Async)
type ValidArgument<T = Scalar> = Scalar | ((arg?: T) => Scalar | Async)
type Argument = ValidArgument | Invalid | Async
type Async = Promise<Scalar>

// deno-lint-ignore no-explicit-any
type VoidLater = (_?: any) => void

// deno-lint-ignore no-explicit-any
type Rest = any[]
type Callable = VoidLater | ((_?: Scalar) => Scalar | Async)

type Switch = ValidArgument
type Case = ValidArgument | boolean |( ()=>boolean) | Promise<boolean>
type Action = ValidArgument | VoidLater

// running instanceof on an undefined var will throw, but typeof will not.
// run this check before any 'instanceof' check
const isInvalid = (check: Argument | VoidLater): check is Invalid =>
  typeof check !== "boolean" && (typeof check === "undefined" || check === null)

const isCallable = (check: Callable | Invalid | Async): check is Callable =>
  !isInvalid(check) && typeof check === "function"

const isLater = (check: Argument | Later | Action): check is Later =>
  !isInvalid(check) && (typeof check === "function" || check instanceof Promise)

const isScalar = (check: Argument | VoidLater): check is Scalar =>
  !isInvalid(check) &&
  typeof check !== "function" &&
  (typeof check === "string" ||
    typeof check === "number" ||
    typeof check === "boolean")

const isAsync = (check: Argument | Action): check is Async =>
  !isInvalid(check) && check instanceof Promise

const isValidArgument = (check: Argument | Action): check is ValidArgument =>
  isScalar(check) || isLater(check) || isAsync(check)

const startSwitch = async function (arg: Switch): Async {
  let result
  if (isLater(arg)) {
    if (isAsync(arg)) {
      result = await arg
    } else if (isLater(arg)) {
      result = arg()
      if (isAsync(result)) {
        result = await result
      }
    }
  } else if (isScalar(arg)) result = arg
  result = isAsync(result)
    ? result
    : isScalar(result)
    ? Promise.resolve(result)
    : null
  if (null === result) {
    throw new Error("Invalid result for switch argument")
  }
  return result
}

type CaseResolver = ReturnType<typeof getCaseResolver>
type CasePair = Promise<[boolean, Action]>
type ReturnsCasePair = (resolver: CaseResolver) => CasePair

interface PromiseHolder {
  finished: boolean
  finalOutcome: Scalar | null
  defaultAction: Action | null
  addCase: (pred: Case, action: Action) => void
}

class PromisePreHolder implements PromiseHolder {
  bin: [ValidArgument, Action][] = []
  finished = false
  finalOutcome: Scalar | null = null
  defaultAction: Action = () => {
    throw new Error("No match and no default")
  }
  constructor() {}
  getCases() {
    return this.bin
  }
  addDefault(action: Action) {
    this.defaultAction = action
  }
  addCase(pred: Case, action: Action) {
    this.bin.push([pred, action])
  }
  async resolveWithSwitch(switchPromise: Switch, ...rest: Rest) {
    const switchResolved = await startSwitch(switchPromise)
    for (const [pred, action] of this.getCases()) {
      const caseResolve = await resolveCase(switchResolved, pred)
      const isMatch = await comparer(switchResolved, caseResolve)
      if (isMatch) {
        this.finalOutcome = await actionResolver(action, ...rest)
        this.finished = true
        return this.finalOutcome
      }
    }
    if (this.defaultAction) {
      this.finalOutcome = await actionResolver(this.defaultAction, ...rest)
      this.finished = true
      return this.finalOutcome
    }
    throw new Error("No match and no default")
  }
}

class PromisePostHolder implements PromiseHolder {
  bin: [ValidArgument, Action][] = []
  finished = false
  finalOutcome: Scalar | null = null
  switchPromise: Switch | null = null
  rest: Rest = []
  defaultAction: Action = () => {
    throw new Error("No match and no default")
  }
  constructor() {}
  getCases() {
    return this.bin
  }
  addDefault(action: Action) {
    this.defaultAction = action
  }
  addCase(pred: Case, action: Action) {
    this.bin.push([pred, action])
  }
  loadSwitch(switchPromise: Switch, ...rest: Rest) {
    this.rest = rest
    this.switchPromise = switchPromise
  }
  async resolve() {
    if (isInvalid(this.switchPromise)) {
      throw new Error("matching against null value")
    }
    const switchResolved = await startSwitch(this.switchPromise)
    for (const [pred, action] of this.getCases()) {
      const caseResolve = await resolveCase(switchResolved, pred)
      const isMatch = await comparer(switchResolved, caseResolve)
      if (isMatch) {
        this.finalOutcome = await actionResolver(action, ...this.rest)
        this.finished = true
        return this.finalOutcome
      }
    }
    if (this.defaultAction) {
      this.finalOutcome = await actionResolver(this.defaultAction)
      this.finished = true
      return this.finalOutcome
    }
    throw new Error("No match and no default")
  }
}

// exe result. It can be a value or a function or promise.
async function actionResolver(action: Action, ...rest: Rest) {
  let _return = null
  if (!isValidArgument(action)) {
    throw new Error("invalid action")
  }

  if (isScalar(action)) {
    return action
  }

  if (isAsync(action)) {
    _return = await action
  } else if (isCallable(action)) {
    _return = action(...rest)
    if (isAsync(_return)) {
      _return = await _return
    }
  }

  return _return
}

const resolveCase = async function (
  switchResolved: Scalar,
  caser: Case
): Async {
  let result
  if (isLater(caser)) {
    if (isAsync(caser)) {
      result = await caser
    } else if (isLater(caser)) {
      result = caser(switchResolved)
      if (isAsync(result)) {
        result = await result
      }
    }
  } else if (isScalar(caser)) result = caser
  result = isAsync(result)
    ? result
    : isScalar(result)
    ? Promise.resolve(result)
    : null
  if (null === result) {
    throw new Error("Invalid result for switch argument")
  }
  return result
}

// Compare the switch expression to the case expression
const comparer = async (switchResult: Scalar, result: Async | Scalar) => {
  const caseResult = isAsync(result) ? await result : result
  return switchResult === caseResult
}

// create a function using a switchresult that resolves cases
const getCaseResolver = (switchPromise: Async) => async (caseTest: Case) => {
  const switchResolved = await switchPromise
  const caseResolve = await resolveCase(switchResolved, caseTest)
  const isMatch = await comparer(switchResolved, caseResolve)
  return isMatch
}

export {
  actionResolver,
  getCaseResolver,
  isAsync,
  isCallable,
  isInvalid,
  isLater,
  isScalar,
  isValidArgument,
  PromisePreHolder,
  PromisePostHolder,
  resolveCase,
  startSwitch
}
export type {
  Action,
  Argument,
  Callable,
  Case,
  CasePair,
  CaseResolver,
  Invalid,
  Rest,
  Scalar,
  Switch,
  ValidArgument,
  Async
}
