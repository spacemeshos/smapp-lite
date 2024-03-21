import { StoreApi, UseBoundStore } from 'zustand';

export type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  const store = _store as WithSelectors<typeof _store>;

  const use = Object.fromEntries(
    Object.keys(store.getState()).map((k) => [
      k,
      () => store((state) => state[k as keyof typeof state]),
    ])
  );

  store.use = use;
  return store;
};
