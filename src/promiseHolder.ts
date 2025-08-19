import type {
  Action,
  ActionParams,
  PromiseHolder,
  Scalar,
  ValidArgument,
} from "./types.ts";
import {
  actionResolver,
  comparer,
  isInvalid,
  resolveCase,
  startSwitch,
} from "./util.ts";

class PromisePreHolder implements PromiseHolder {
  bin: [ValidArgument, Action][] = [];
  finished = false;
  finalOutcome: Scalar | null = null;
  defaultAction: Action = () => {
    throw new Error("No match and no default");
  };
  constructor() {}
  getCases() {
    return this.bin;
  }
  addDefault(action: Action) {
    this.defaultAction = action;
  }
  addCase(pred: ValidArgument, action: Action) {
    this.bin.push([pred, action]);
  }
  async resolveWithSwitch(
    switchPromise: ValidArgument,
    ...actionParams: ActionParams
  ) {
    const switchResolved = await startSwitch(switchPromise);
    for (const [pred, action] of this.getCases()) {
      const caseResolve = await resolveCase(switchResolved, pred);
      // if case is a boolean, we can skip the comparer
      let isBooleanTrue = false;
      let isMatch = false;
      if (caseResolve === true) {
        isBooleanTrue = true;
      }
      if (!isBooleanTrue) {
        isMatch = await comparer(switchResolved, caseResolve);
      }
      if (isBooleanTrue || isMatch) {
        this.finalOutcome = await actionResolver(action, ...actionParams);
        this.finished = true;
        return this.finalOutcome;
      }
    }
    if (this.defaultAction) {
      this.finalOutcome = await actionResolver(
        this.defaultAction,
        ...actionParams,
      );
      this.finished = true;
      return this.finalOutcome;
    }
    throw new Error("No match and no default");
  }
}

class PromisePostHolder implements PromiseHolder {
  bin: [ValidArgument, Action][] = [];
  finished = false;
  finalOutcome: Scalar | null = null;
  switchPromise: ValidArgument | null = null;
  actionParams: ActionParams = [];
  defaultAction: Action = () => {
    throw new Error("No match and no default");
  };
  constructor() {}
  getCases() {
    return this.bin;
  }
  addDefault(action: Action) {
    this.defaultAction = action;
  }
  addCase(pred: ValidArgument, action: Action) {
    this.bin.push([pred, action]);
  }
  loadSwitch(switchPromise: ValidArgument, ...actionParams: ActionParams) {
    this.actionParams = actionParams;
    this.switchPromise = switchPromise;
  }
  async resolve() {
    if (isInvalid(this.switchPromise)) {
      throw new Error("matching against null value");
    }
    const switchResolved = await startSwitch(this.switchPromise);
    for (const [pred, action] of this.getCases()) {
      const caseResolve = await resolveCase(switchResolved, pred);
      // if case is a boolean, we can skip the comparer
      let isBooleanTrue = false;
      let isMatch = false;
      if (caseResolve === true) {
        isBooleanTrue = true;
      }
      if (!isBooleanTrue) {
        isMatch = await comparer(switchResolved, caseResolve);
      }
      if (isBooleanTrue || isMatch) {
        this.finalOutcome = await actionResolver(action, ...this.actionParams);
        this.finished = true;
        return this.finalOutcome;
      }
    }
    if (this.defaultAction) {
      this.finalOutcome = await actionResolver(this.defaultAction);
      this.finished = true;
      return this.finalOutcome;
    }
    throw new Error("No match and no default");
  }
}

export { PromisePostHolder, PromisePreHolder };
