type Invalid = null | undefined;
type Scalar = string | number | boolean;
type Later = Async | ((_?: Scalar) => Scalar | Async);
type ValidArgument<T = Scalar | number> =
  | ((arg: number) => boolean)
  | ((arg?: number) => Scalar | Async)
  | Scalar
  | ((arg?: T) => Scalar | Async)
  | Promise<Scalar>
  | Promise<boolean>
  | ((x: number) => Promise<string | boolean>)
  | ((x: string) => Promise<boolean>)
  | ((x: number) => number)
  | ((x: number) => Promise<number>);
type Argument = ValidArgument | Invalid | Async;
type Async = Promise<Scalar>;

// deno-lint-ignore no-explicit-any
type VoidLater = (_?: any) => void;

// deno-lint-ignore no-explicit-any
type ActionParams = any[];
type Callable = VoidLater | ((_?: Scalar) => Scalar | Async);

type Switch = ValidArgument;
type Case = ValidArgument;
type Action = ValidArgument | VoidLater;

type CaseResolver = (caseTest: Case) => Promise<boolean>;
type CasePair = Promise<[boolean, Action]>;

type MatchChain<T extends Switch | Invalid, X> = T extends Switch
  ? MatchRecurse<X>
  : MatchSeqObject<X>;
type Match = <T extends Switch | Invalid>(
  arg?: T,
  ...actionParams: ActionParams
) => MatchChain<T, unknown>;
type FinalMatch<T> = (arg: Switch, ...actionParams: ActionParams) => Promise<T>;
type Execute<T> = () => Promise<T>;
type MatchRecurse<T> = {
  on(pred: Case, action: Action): MatchRecurse<T>;
  otherwise(action: Action): {
    exe: Execute<T>;
    match: () => Error;
  };
  exe: Execute<T>;
  match: () => Error;
};
type MatchSeqObject<T> = {
  on(pred: Case, action: Action): MatchSeqObject<T>;
  otherwise(action: Action): {
    exe: () => Error;
    match: FinalMatch<T>;
  };
  exe: () => Error;
  match: FinalMatch<T>;
};
export interface PromiseHolder {
  finished: boolean;
  finalOutcome: Scalar | null;
  defaultAction: Action | null;
  addCase: (pred: Case, action: Action) => void;
}
export type {
  Action,
  ActionParams,
  Argument,
  Async,
  Callable,
  Case,
  CasePair,
  CaseResolver,
  Invalid,
  Later,
  Match,
  MatchChain,
  MatchRecurse,
  MatchSeqObject,
  Scalar,
  Switch,
  ValidArgument,
  VoidLater,
};
