type Invalid = null | undefined;
type Scalar = string | number | boolean;
type Later = Async | ((_?: Scalar) => Scalar | Async);
type ValidArgument = 
  | Scalar 
  | Promise<Scalar | boolean>
  | ((...args: any[]) => Scalar | boolean | Promise<Scalar | boolean> | void);
type Argument = ValidArgument | Invalid | Async;
type Async = Promise<Scalar>;

// deno-lint-ignore no-explicit-any
type VoidLater = (_?: any) => void;

// deno-lint-ignore no-explicit-any
type ActionParams = any[];
type Callable = VoidLater | ((_?: Scalar) => Scalar | Async);

type Action = ValidArgument | VoidLater;

type CaseResolver = (caseTest: ValidArgument) => Promise<boolean>;
type CasePair = Promise<[boolean, Action]>;

type MatchChain<T extends ValidArgument | Invalid, X> = T extends ValidArgument
  ? MatchRecurse<X>
  : MatchSeqObject<X>;
type Match = <T extends ValidArgument | Invalid>(
  arg?: T,
  ...actionParams: ActionParams
) => MatchChain<T, unknown>;
type FinalMatch<T> = (arg: ValidArgument, ...actionParams: ActionParams) => Promise<T>;
type Execute<T> = () => Promise<T>;
type MatchRecurse<T> = {
  on(pred: ValidArgument, action: Action): MatchRecurse<T>;
  otherwise(action: Action): {
    exe: Execute<T>;
    match: () => Error;
  };
  exe: Execute<T>;
  match: () => Error;
};
type MatchSeqObject<T> = {
  on(pred: ValidArgument, action: Action): MatchSeqObject<T>;
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
  addCase: (pred: ValidArgument, action: Action) => void;
}
export type {
  Action,
  ActionParams,
  Argument,
  Async,
  Callable,
  CasePair,
  CaseResolver,
  Invalid,
  Later,
  Match,
  MatchChain,
  MatchRecurse,
  MatchSeqObject,
  Scalar,
  ValidArgument,
  VoidLater,
};
