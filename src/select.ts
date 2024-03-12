import { PromisePostHolder, PromisePreHolder } from "./promiseHolder.ts";
import type { Action, Case, Invalid, ActionParams, Switch, Match, MatchChain, MatchRecurse, MatchSeqObject } from "./types.ts"
import { isInvalid, isValidArgument } from "./util.ts";



/**
 * Matches the given argument against a set of cases and executes the corresponding action.
 * 
 * @template T - The type of the argument to match.
 * @param {T} arg - The argument to match.
 * @param {...ActionParams} actionParams - Additional parameters for the action.
 * @returns {MatchChain<T, unknown>} - The match chain object.
 * @throws {Error} - If the match argument is invalid.
 */
const match:Match = function <T extends Switch | Invalid>(
  arg?: T,
  ...actionParams: ActionParams
): MatchChain<T, unknown> {
  if (arguments.length === 0) {
    return _matchSeq() as unknown as MatchChain<T, unknown>
  }
  if (!isInvalid(arg)) {
    return _match(arg, ...actionParams) as unknown as MatchChain<T, unknown>
  } else if (typeof arg === "undefined") {
    const matchSeqObject = _matchSeq()
    return matchSeqObject as unknown as MatchChain<T, unknown>
  }
  throw new Error("Invalid match argument")
}

/**
 * Matches a given argument against a set of cases and executes the corresponding action.
 *
 * @param arg - The argument to be matched against the cases.
 * @param actionParams - Additional parameters to be passed to the actions.
 * @returns A `MatchChain` object that allows chaining of cases and execution of the match.
 * @throws {Error} If the match argument is not a scalar or a function.
 */
const _match = function (arg: Switch, ...actionParams: ActionParams): MatchChain<Switch, unknown>{
  if (!isValidArgument(arg)) {
    throw Error("Bad match argument. Must be scalar or function")
  }

  const bin = new PromisePostHolder()
  bin.loadSwitch(arg, ...actionParams)

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


/**
 * Creates a MatchSeqObject that allows chaining of case conditions and actions.
 * @returns The MatchSeqObject.
 */
function _matchSeq(): MatchSeqObject<unknown>{
  const bin = new PromisePreHolder()

  async function finalMatch(arg: Switch, ...actionParams: ActionParams) {
    return await bin.resolveWithSwitch(arg, ...actionParams)
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

