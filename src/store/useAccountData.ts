import { create } from 'zustand';

import { fetchBalanceByAddress } from '../api/requests/balance';
import { Account, AccountStates } from '../types/account';
import { Bech32Address, HexString } from '../types/common';
import { Reward } from '../types/reward';
import { Transaction } from '../types/tx';

import useNetworks from './useNetworks';

type AccountDataState = {
  states: Record<Bech32Address, AccountStates>;
  rewards: Record<Bech32Address, Reward[]>;
  transactions: Transaction[];
};

type AccountDataActions = {
  fetchAccountState: (address: Bech32Address) => void;
  fetchRewards: (address: Bech32Address) => void;
  fetchTransactionsByAddress: (address: Bech32Address) => void;
  fetchTransactionsById: (txId: HexString) => void;
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
  fetchAccountState: async (address) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { getCurrentRPC } = useNetworks();
    const rpc = getCurrentRPC();
    if (!rpc) {
      throw new Error('Cannot fetch account state without an RPC endpoint');
    }

    set({
      states: {
        ...get().states,
        [address]: await fetchBalanceByAddress(rpc, address),
      },
    });
  },
  fetchRewards: (address) => {},
  fetchTransactionsByAddress: (address) => {},
  fetchTransactionsById: (txId) => {},
  // Selectors
  getAccount: (address) => undefined,
}));

export default useAccountData;
