import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { O, D, A, pipe } from '@mobily/ts-belt';

import { Network } from '../types/networks';

type NetworkState = {
  selectedIndex: null | number;
  networks: Network[];
};

type NetworkActions = {
  addNetwork: (net: Network) => void;
  switchNetwork: (idx: number) => void;
};

type NetworkSelectors = {
  hasCurrentNetwork: () => boolean;
  getCurrentNetwork: () => O.Option<Network>;
};

const NETWORKS_STORE_KEY = 'networks';

const useNetworks = create(
  persist<NetworkState & NetworkActions & NetworkSelectors>(
    (set, get) => ({
      selectedIndex: null,
      networks: [],
      // Actions
      addNetwork: (net: Network) => {
        const state = get();
        const newState: NetworkState = {
          selectedIndex: state.selectedIndex,
          networks: [...state.networks, net],
        };
        set(newState);
        if (state.selectedIndex === null) {
          set({ selectedIndex: 0 });
        }
      },
      switchNetwork: (idx: number) => {
        const state = get();
        if (!state.networks[idx]) {
          throw new Error(`Cannot switch to network with index ${idx}`);
        }
        set({
          selectedIndex: idx,
        });
      },
      // Selectors
      getCurrentNetwork: () => {
        const state = get();
        return pipe(
          state.selectedIndex,
          O.fromNullable,
          O.flatMap((idx) => A.get(state.networks, idx))
        );
      },
      hasCurrentNetwork: () => O.isSome(get().getCurrentNetwork()),
    }),
    {
      name: NETWORKS_STORE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useNetworks;
