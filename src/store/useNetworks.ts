import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { A, O, pipe } from '@mobily/ts-belt';

import { Network } from '../types/networks';
import DEFAULT_NETWORKS from '../utils/defaultNetworks';

type NetworkState = {
  selectedIndex: null | number;
  networks: Network[];
};

type NetworkActions = {
  addNetwork: (net: Network) => void;
  editNetwork: (idx: number, net: Network) => void;
  deleteNetwork: (idx: number) => void;
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
      selectedIndex: 0,
      networks: [...DEFAULT_NETWORKS],
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
        } else {
          const i = newState.networks.findIndex((n) => n === net);
          set({ selectedIndex: i });
        }
      },
      editNetwork: (idx: number, net: Network) => {
        const state = get();
        if (!state.networks[idx]) {
          throw new Error(`Cannot edit network with index ${idx}`);
        }
        set({
          networks: [...A.updateAt(state.networks, idx, () => net)],
        });
      },
      deleteNetwork: (idx: number) => {
        const state = get();
        if (!state.networks[idx]) {
          throw new Error(`Cannot delete network with index ${idx}`);
        }
        set({
          networks: [...A.removeAt(state.networks, idx)],
          selectedIndex: idx === state.selectedIndex ? 0 : state.selectedIndex,
        });
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
      partialize: (state) => ({
        ...state,
        networks: state.networks.filter((n) => !DEFAULT_NETWORKS.includes(n)),
      }),
      merge: (persisted, current) => {
        const persistedNetworks =
          persisted &&
          Object.hasOwn(persisted, 'networks') &&
          (persisted as NetworkState).networks instanceof Array
            ? (persisted as NetworkState).networks
            : <Network[]>[];
        return {
          ...current,
          ...(persisted || {}),
          networks: [
            ...DEFAULT_NETWORKS,
            ...persistedNetworks.filter((n) => !DEFAULT_NETWORKS.includes(n)),
          ],
        };
      },
    }
  )
);

export default useNetworks;
