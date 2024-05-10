import { SingleSigSpawnArguments, SpendArguments } from '@spacemesh/sm-codec';

import { TransactionState } from '../api/schemas/tx';

import { Bech32Address, BigIntString, HexString } from './common';

export type TransactionID = HexString;

export type Transaction<T = Record<string, unknown>> = {
  id: TransactionID;
  principal: Bech32Address;
  nonce: {
    counter: BigIntString;
    bitfield: number;
  };
  gas: {
    maxGas: BigIntString;
    price: BigIntString;
  };
  template: {
    address: Bech32Address;
    method: number;
    name: string;
    methodName: string;
  };
  layer: number;
  parsed: T;
  state: TransactionState;
};

// TODO: Support other transaction types
export type ParsedSpawnTransaction = Transaction<SingleSigSpawnArguments>;

export type ParsedSpendTransaction = Transaction<SpendArguments>;
