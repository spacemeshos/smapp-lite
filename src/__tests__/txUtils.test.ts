import { bech32 } from 'bech32';

import { StdMethods } from '@spacemesh/sm-codec';

import { Transaction } from '../types/tx';
import { MethodName, TemplateName } from '../utils/templates';
import { collectTxIdsByAddress } from '../utils/tx';

describe('collectTxIdsByAddress', () => {
  const spawn = (id: string, principal: string) =>
    ({
      id,
      principal,
      template: {
        name: TemplateName.SingleSig,
        methodName: MethodName.Spawn,
      },
    } as Transaction);
  const spend = (id: string, principal: string, destination: string) =>
    ({
      id,
      principal,
      template: {
        name: TemplateName.SingleSig,
        methodName: MethodName.Spend,
        method: StdMethods.Spend,
      },
      parsed: {
        Destination: bech32.fromWords(bech32.decode(destination).words),
        Amount: 100,
      },
    } as unknown as Transaction);

  it('should return an empty array if no transactions are provided', () => {
    const txIds = collectTxIdsByAddress({}, []);
    expect(txIds).toEqual({});
  });
  it('should return an array of transaction IDs grouped by address', () => {
    const txs = [
      spawn('1', 'sm1qqhjvprk'),
      spawn('2', 'sm1qqhjvprk'),
      spawn('3', 'sm1qyccw8vv'),
    ] as Transaction[];
    const txIds = collectTxIdsByAddress({}, txs);
    expect(txIds).toEqual({
      sm1qqhjvprk: ['1', '2'],
      sm1qyccw8vv: ['3'],
    });
  });
  it('should append new transaction IDs to existing ones', () => {
    const txs = [
      spawn('1', 'sm1qqhjvprk'),
      spawn('2', 'sm1qyccw8vv'),
    ] as Transaction[];
    const txIds = collectTxIdsByAddress({ sm1qqhjvprk: ['3'] }, txs);
    expect(txIds).toEqual({
      sm1qqhjvprk: ['3', '1'],
      sm1qyccw8vv: ['2'],
    });
  });
  it('should not add duplicate transaction IDs', () => {
    const txs = [
      spawn('1', 'sm1qqhjvprk'),
      spawn('1', 'sm1qqhjvprk'),
    ] as Transaction[];
    const txIds = collectTxIdsByAddress({}, txs);
    expect(txIds).toEqual({
      sm1qqhjvprk: ['1'],
    });
  });
  it('should add transaction IDs for destination addresses', () => {
    const txs = [
      spend('1', 'sm1qqhjvprk', 'sm1qyccw8vv'),
      spend('2', 'sm1qyccw8vv', 'sm1qqhjvprk'),
    ] as unknown as Transaction[];
    const txIds = collectTxIdsByAddress({}, txs);
    expect(txIds).toEqual({
      sm1qqhjvprk: ['1', '2'],
      sm1qyccw8vv: ['1', '2'],
    });
  });
});
