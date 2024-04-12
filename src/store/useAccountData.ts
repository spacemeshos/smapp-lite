import { create } from 'zustand';

import { D, O, pipe } from '@mobily/ts-belt';

import { Account, AccountStates } from '../types/account';
import { Bech32Address, HexString } from '../types/common';
import { Reward } from '../types/reward';
import { Transaction, TransactionID } from '../types/tx';
import { DEFAULT_ACCOUNT_STATES } from '../utils/constants';

type AccountDataState = {
  networks: Record<HexString, NetworkState>;
};

type NetworkState = {
  states: Record<Bech32Address, AccountStates>;
  rewards: Record<Bech32Address, Reward[]>;
  txIds: Record<Bech32Address, TransactionID[]>;
  transactions: Transaction[];
};

type AccountDataActions = {
  setAccountState: (
    genesisID: HexString,
    address: Bech32Address,
    states: AccountStates
  ) => void;
  reset: () => void;
};

type AccountDataSelectors = {
  getAccountData: (
    genesisID: HexString,
    address: Bech32Address
  ) => O.Option<Account>;
};

type AccountDataStore = AccountDataState &
  AccountDataActions &
  AccountDataSelectors;

// Defaults

const DEFAULT_NETWROK_STATE: NetworkState = {
  states: {},
  rewards: {},
  txIds: {},
  transactions: [],
};

// Getters

const getAccountState = (net: NetworkState, address: Bech32Address) =>
  net.states?.[address] || DEFAULT_ACCOUNT_STATES;

const getAccountRewards = (net: NetworkState, address: Bech32Address) =>
  net.rewards?.[address] || [];

const getAccountTransactions = (net: NetworkState, address: Bech32Address) =>
  net.transactions.filter((tx) => net.txIds?.[address]?.includes(tx.id));

// Store

const useAccountData = create<AccountDataStore>((set, get) => ({
  networks: {},
  // Actions
  setAccountState: async (genesisID, address, states) => {
    set({
      networks: {
        ...get().networks,
        [genesisID]: {
          ...DEFAULT_NETWROK_STATE,
          ...get().networks[genesisID],
          states: {
            ...get().networks[genesisID]?.states,
            [address]: states,
          },
        },
      },
    });
  },
  reset: () => {
    set({ networks: {} });
  },
  // Selectors
  getAccountData: (genesisID, address) =>
    pipe(
      get().networks?.[genesisID],
      O.fromNullable,
      O.map((state) => ({
        address,
        state: getAccountState(state, address),
        rewards: getAccountRewards(state, address),
        transactions: getAccountTransactions(state, address),
      }))
    ),
}));

export default useAccountData;
