import type { Action, Case, Invalid, Rest, Switch } from "./util.ts"
import {
  isInvalid,
  isValidArgument,
  PromisePostHolder,
  PromisePreHolder
} from "./util.ts"

type PreOrPost<T extends Switch | Invalid, X> = T extends Switch
  ? MatchRecurse<X>
  : MatchSeqObject<X>

const match = function <T extends Switch | Invalid>(
  arg?: T,
  ...rest: Rest
): PreOrPost<T, unknown> {
  if (arguments.length === 0) {
    return _matchSeq() as unknown as PreOrPost<T, unknown>
  }
  if (!isInvalid(arg)) {
    return _match(arg, ...rest) as unknown as PreOrPost<T, unknown>
  } else if (typeof arg === "undefined") {
    const matchSeqObject = _matchSeq()
    return matchSeqObject as unknown as PreOrPost<T, unknown>
  }
  throw new Error("Invalid match argument")
}

type Execute<T> = () => Promise<T>

// this match function closure holds context for all the 'on' cases.
const _match = function (arg: Switch, ...rest: Rest) {
  if (!isValidArgument(arg)) {
    throw Error("Bad match argument. Must be scalar or function")
  }

  const bin = new PromisePostHolder()
  bin.loadSwitch(arg, ...rest)

  const exe = async function () {
    try {
      return await bin.resolve()
    } catch (e) {
      throw new Error(`Failed to resolve: ${e.message}`)
    }
  }

  const matchRecurse: MatchRecurse<unknown> = {
    on(pred: Case, action: Action) {
      bin.addCase(pred, action)
      return matchRecurse
    },
    otherwise(action: Action) {
      bin.defaultAction = action
      return {
        exe,
        match() {
          throw Error(`match not available`)
        }
      }
    },
    exe,
    match() {
      throw Error(`match not available`)
    }
  }

  return matchRecurse
}

type MatchRecurse<T> = {
  on(pred: Case, action: Action): MatchRecurse<T>
  otherwise(action: Action): {
    exe: Execute<T>
    match: () => Error
  }
  exe: Execute<T>
  match: () => Error
}

type MatchSeqObject<T> = {
  on(pred: Case, action: Action): MatchSeqObject<T>
  otherwise(action: Action): {
    exe: () => Error
    match: FinalMatch<T>
  }
  exe: () => Error
  match: FinalMatch<T>
}

type FinalMatch<T> = (arg: Switch, ...rest: Rest) => Promise<T>

function _matchSeq() {
  const bin = new PromisePreHolder()

  async function finalMatch(arg: Switch, ...rest: Rest) {
    return await bin.resolveWithSwitch(arg, ...rest)
  }

  const matchSeqObject: MatchSeqObject<unknown> = {
    on(pred: Case, action: Action) {
      bin.addCase(pred, action)
      return matchSeqObject
    },
    otherwise(action: Action) {
      bin.addDefault(action)
      return {
        match: finalMatch,
        exe: () => {
          throw Error(`exe not available`)
        }
      }
    },
    match: finalMatch,
    exe: () => {
      throw Error(`exe not available`)
    }
  }

  return matchSeqObject
}

export default match

