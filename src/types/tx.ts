import { SpawnPayload, SpendPayload } from '@spacemesh/sm-codec';

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
  parsed: T;
};

export type ParsedSpawnTransaction = Transaction<SpawnPayload['Arguments']>;

export type ParsedSpendTransaction = Transaction<SpendPayload['Arguments']>;
