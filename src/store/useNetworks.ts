import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
  getCurrentNetwork: () => Network | null;
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
        return state.selectedIndex !== null &&
          state.selectedIndex >= 0 &&
          state.selectedIndex < state.networks.length
          ? state.networks[state.selectedIndex]
          : null;
      },
    }),
    {
      name: NETWORKS_STORE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useNetworks;
