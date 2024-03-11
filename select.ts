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
    console.log("using _match")
    return _match(arg, ...rest) as unknown as PreOrPost<T, unknown>
  } else if (typeof arg === "undefined") {
    const matchSeqObject = _matchSeq()
    return matchSeqObject as unknown as PreOrPost<T, unknown>
  }
  throw new Error("Invalid match argument")
}

type Execute<T> = () => Promise<T>

type MatchRecurse<T> = {
  on(pred: Case, action: Action): MatchRecurse<T>
  otherwise(action: Action): {
    exe: Execute<T>
  }
  exe: Execute<T>
}

// this match function closure holds context for all the 'on' cases.
const _match = function (arg: Switch, ...rest: Rest) {
  if (!isValidArgument(arg)) {
    throw Error("Bad match argument. Must be scalar or function")
  }

  const bin = new PromisePostHolder()
  bin.loadSwitch(arg, ...rest)

  const matchRecurse: MatchRecurse<unknown> = {
    on(pred: Case, action: Action) {
      bin.addCase(pred, action)
      return matchRecurse
    },
    otherwise(action: Action) {
      bin.defaultAction = action
      return { exe: matchRecurse.exe }
    },
    exe: async function () {
      try {
        return await bin.resolve()
      } catch (e) {
        throw new Error(`Failed to resolve: ${e.message}`)
      }
    }
  }

  return matchRecurse
}

type MatchSeqObject<T> = {
  on(pred: Case, action: Action): MatchSeqObject<T>
  otherwise(action: Action): {
    match: FinalMatch<T>
  }
  match: FinalMatch<T>
}

type FinalMatch<T> = (arg: Switch, ...rest: Rest) => Promise<T>

function _matchSeq() {
  const bin = new PromisePreHolder()

  async function finalMatch(arg: Switch, ...rest: Rest) {
    return await bin.resolveWithSwitch(arg, ...rest)
  }

  const matchRecurse: MatchSeqObject<unknown> = {
    on(pred: Case, action: Action) {
      bin.addCase(pred, action)
      return matchRecurse
    },
    otherwise(action: Action) {
      bin.addDefault(action)
      return {
        match: finalMatch
      }
    },
    match: finalMatch
  }

  return matchRecurse
}

export default match


const m = match<number>()
  .on(1, (x: number) => `${x} is one`)
  .on(
    (x:number) => 0.5 * x + 0.5 * x === 2,
    x => `${x} is two`
  )
  .on(
    () => returnsPromise(3),
    x => `${x} is three`
  )
  .on(
    x => x === 4,
    x => `${x} is four`
  )
  .on(5, () => Promise.resolve(`{x} is five`))
  .otherwise(`${x} is something else`)

m.match(5)
