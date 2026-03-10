import { useSyncExternalStore } from "react";

type Listener = () => void;

type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean,
) => void;

type GetState<T> = () => T;

export type StateCreator<T> = (set: SetState<T>, get: GetState<T>) => T;

export type UseStore<T> = {
  (): T;
  <U>(selector: (state: T) => U): U;
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: (listener: Listener) => () => void;
};

export function create<T>(createState: StateCreator<T>): UseStore<T> {
  const listeners = new Set<Listener>();
  let state: T;

  const setState: SetState<T> = (partial, replace = false) => {
    const nextState = typeof partial === "function" ? (partial as (state: T) => T | Partial<T>)(state) : partial;
    state = (replace ? nextState : { ...state, ...nextState }) as T;
    listeners.forEach((listener) => listener());
  };

  const getState: GetState<T> = () => state;

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = createState(setState, getState);

  function useStore<U>(selector?: (state: T) => U) {
    return useSyncExternalStore(
      subscribe,
      () => (selector ? selector(state) : (state as unknown as U)),
      () => (selector ? selector(state) : (state as unknown as U)),
    );
  }

  useStore.getState = getState;
  useStore.setState = setState;
  useStore.subscribe = subscribe;

  return useStore as UseStore<T>;
}
