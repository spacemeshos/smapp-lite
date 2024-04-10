import { Bech32Address, BigIntString } from './common';
import { Reward } from './reward';
import { TransactionID } from './tx';

export type AccountState = {
  balance: BigIntString;
  nonce: BigIntString;
};

export type AccountStates = {
  current: AccountState;
  projected: AccountState;
};

export type Account = {
  address: Bech32Address;
  rewards: Reward[];
  transactions: TransactionID[];
  state: {
    current: AccountState;
    projected: AccountState;
  };
};
