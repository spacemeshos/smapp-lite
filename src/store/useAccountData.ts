import { create } from 'zustand';

import { O, pipe } from '@mobily/ts-belt';

import { Account, AccountStates } from '../types/account';
import { Bech32Address, HexString } from '../types/common';
import { Reward } from '../types/reward';
import { Transaction, TransactionID } from '../types/tx';
import { DEFAULT_ACCOUNT_STATES } from '../utils/constants';
import { MethodSelectors } from '../utils/templates';
import { collectTxIdsByAddress } from '../utils/tx';

type AccountDataState = {
  networks: Record<HexString, NetworkState>;
};

type NetworkState = {
  states: Record<Bech32Address, AccountStates>;
  rewards: Record<Bech32Address, Reward[]>;
  txIds: Record<Bech32Address, TransactionID[]>;
  transactions: Record<TransactionID, Transaction>;
};

type AccountDataActions = {
  setAccountState: (
    genesisID: HexString,
    address: Bech32Address,
    states: AccountStates
  ) => void;
  setTransactions: (genesisID: HexString, txs: Transaction[]) => void;
  setRewards: (
    genesisID: HexString,
    address: Bech32Address,
    rewards: Reward[]
  ) => void;
  reset: () => void;
};

type AccountDataSelectors = {
  getAccountData: (
    genesisID: HexString,
    address: Bech32Address
  ) => O.Option<Account>;
  isSpawnedAccount: (genesisID: HexString, address: Bech32Address) => boolean;
};

type AccountDataStore = AccountDataState &
  AccountDataActions &
  AccountDataSelectors;

// Defaults

const DEFAULT_NETWROK_STATE: NetworkState = {
  states: {},
  rewards: {},
  txIds: {},
  transactions: {},
};

// Getters

const getAccountState = (net: NetworkState, address: Bech32Address) =>
  net.states?.[address] || DEFAULT_ACCOUNT_STATES;

const getAccountRewards = (net: NetworkState, address: Bech32Address) =>
  net.rewards?.[address] || [];

const getAccountTransactions = (net: NetworkState, address: Bech32Address) =>
  (net.txIds?.[address] || [])
    .map((txId) => net.transactions?.[txId])
    .filter(Boolean) as Transaction[];

// Store

const useAccountData = create<AccountDataStore>((set, get) => ({
  networks: {},
  // Actions
  setAccountState: (genesisID, address, states) => {
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
  setTransactions: (genesisID, txs) => {
    set({
      networks: {
        ...get().networks,
        [genesisID]: {
          ...DEFAULT_NETWROK_STATE,
          ...get().networks[genesisID],
          transactions: {
            ...get().networks[genesisID]?.transactions,
            ...txs.reduce((acc, tx) => ({ ...acc, [tx.id]: tx }), {}),
          },
          txIds: collectTxIdsByAddress(
            get().networks[genesisID]?.txIds || {},
            txs
          ),
        },
      },
    });
  },
  setRewards: (genesisID, address, rewards) => {
    set({
      networks: {
        ...get().networks,
        [genesisID]: {
          ...DEFAULT_NETWROK_STATE,
          ...get().networks[genesisID],
          rewards: {
            ...get().networks[genesisID]?.rewards,
            [address]: rewards,
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
  isSpawnedAccount: (genesisID, address) =>
    pipe(
      get().getAccountData(genesisID, address),
      O.mapWithDefault(
        false,
        (acc) =>
          !!acc.transactions.find(
            (tx) =>
              tx.template.method === MethodSelectors.Spawn &&
              tx.state === 'TRANSACTION_STATE_PROCESSED'
          )
      )
    ),
}));

export default useAccountData;
