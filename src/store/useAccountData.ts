import { create } from 'zustand';

import { fetchBalanceByAddress } from '../api/requests/balance';
import { Account, AccountStates } from '../types/account';
import { Bech32Address, HexString } from '../types/common';
import { Reward } from '../types/reward';
import { Transaction } from '../types/tx';

type AccountDataState = {
  states: Record<Bech32Address, AccountStates>;
  rewards: Record<Bech32Address, Reward[]>;
  transactions: Transaction[];
};

type AccountDataActions = {
  fetchAccountState: (rpc: string) => (address: Bech32Address) => void;
  fetchRewards: (rpc: string) => (address: Bech32Address) => void;
  fetchTransactionsByAddress: (rpc: string) => (address: Bech32Address) => void;
  fetchTransactionsById: (rpc: string) => (txId: HexString) => void;
  reset: () => void;
};

type AccountDataSelectors = {
  getAccount: (address: Bech32Address) => Account | undefined;
};

type AccountDataStore = AccountDataState &
  AccountDataActions &
  AccountDataSelectors;

const useAccountData = create<AccountDataStore>((set, get) => ({
  states: {},
  rewards: {},
  transactions: [],
  // Actions
  fetchAccountState: (rpc) => async (address) => {
    console.log('fetchAccountState', address);
    set({
      states: {
        ...get().states,
        [address]: await fetchBalanceByAddress(rpc, address),
      },
    });
  },
  fetchRewards: (rpc) => (address) => {},
  fetchTransactionsByAddress: (rpc) => (address) => {},
  fetchTransactionsById: (rpc) => (txId) => {},
  reset: () => {
    set({
      states: {},
      rewards: {},
      transactions: [],
    });
  },
  // Selectors
  getAccount: (address) => undefined,
}));

export default useAccountData;
