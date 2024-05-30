import { Bech32Address, BigIntString } from './common';
import { Reward } from './reward';
import { Transaction } from './tx';

export type AccountState = {
  balance: BigIntString;
  nonce: BigIntString;
};

export type AccountStates = {
  current: AccountState;
  projected: AccountState;
};

export type AccountStatesWithAddress = {
  address: Bech32Address;
} & AccountStates;

export type Account = {
  address: Bech32Address;
  rewards: Reward[];
  transactions: Transaction[];
  state: {
    current: AccountState;
    projected: AccountState;
  };
};
