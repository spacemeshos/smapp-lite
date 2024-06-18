import { bech32 } from 'bech32';

import { D } from '@mobily/ts-belt';
import { StdMethods } from '@spacemesh/sm-codec';

import { TransactionState } from '../api/schemas/tx';
import { Bech32Address } from '../types/common';
import {
  ParsedSpawnTransaction,
  ParsedSpendTransaction,
  Transaction,
  TransactionID,
} from '../types/tx';

import { MethodName, TemplateName } from './templates';

export enum TxType {
  Self,
  Received,
  Spent,
}

export const isSelfSpawnTransaction = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: Transaction<any>
): tx is ParsedSpawnTransaction =>
  tx.template.name === TemplateName.SingleSig &&
  tx.template.methodName === MethodName.SelfSpawn &&
  !!tx.parsed.publicKey;

export const isSpendTransaction = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: Transaction<any>
): tx is ParsedSpendTransaction =>
  tx.template.name === TemplateName.SingleSig &&
  tx.template.method === StdMethods.Spend &&
  Object.hasOwn(tx.parsed, 'Destination') &&
  Object.hasOwn(tx.parsed, 'Amount');

export const getDestinationAddress = <T>(
  tx: Transaction<T>,
  host: Bech32Address
) => {
  if (!isSpendTransaction(tx)) return null;
  const destination = tx.parsed?.Destination;
  const parsedHost = bech32.decode(host);
  const words = bech32.toWords(destination);
  return bech32.encode(parsedHost.prefix, words);
};

export const getTxType = <T>(tx: Transaction<T>, host: Bech32Address) => {
  const addr = getDestinationAddress(tx, host);
  if (!addr) return TxType.Self;

  if (addr === host && tx.principal === host) {
    return TxType.Self;
  }
  if (addr === host) {
    return TxType.Received;
  }

  return TxType.Spent;
};

export const collectTxIdsByAddress = (
  prevTxIds: Record<Bech32Address, TransactionID[]>,
  txs: Transaction[]
): Record<Bech32Address, TransactionID[]> => {
  const result = D.map(prevTxIds, (txIds) => new Set(txIds));
  txs.forEach((tx) => {
    const byPrincipal = result[tx.principal] || new Set<string>();
    byPrincipal.add(tx.id);
    result[tx.principal] = byPrincipal;
    const destination = getDestinationAddress(tx, tx.principal);
    if (destination && destination !== tx.principal) {
      const byDestination = result[destination] || new Set<string>();
      byDestination.add(tx.id);
      result[destination] = byDestination;
    }
  });
  return D.map(result, (txIds) => Array.from(txIds));
};

export const getTxBalance = <T>(tx: Transaction<T>, host: Bech32Address) => {
  switch (tx.template.name) {
    case TemplateName.SingleSig:
    case TemplateName.MultiSig: {
      if (isSpendTransaction(tx)) {
        const type = getTxType(tx, host);
        switch (type) {
          case TxType.Received:
            return tx.parsed.Amount;
          case TxType.Spent: {
            return -1n * tx.parsed.Amount;
          }
          case TxType.Self:
            return 0n;
          default:
            return null;
        }
      }
      return null;
    }
    default: {
      return null;
    }
  }
};

export const getStatusColor = (status: TransactionState): string => {
  switch (status) {
    case 'TRANSACTION_STATE_CONFLICTING':
    case 'TRANSACTION_STATE_INSUFFICIENT_FUNDS':
    case 'TRANSACTION_STATE_REJECTED':
      return 'red';
    case 'TRANSACTION_STATE_MEMPOOL':
    case 'TRANSACTION_STATE_MESH':
      return 'orange';
    case 'TRANSACTION_STATE_PROCESSED':
      return 'green';
    case 'TRANSACTION_STATE_UNSPECIFIED':
    default:
      return 'grey';
  }
};

export const formatTxState = (state: TransactionState) => {
  switch (state) {
    case 'TRANSACTION_STATE_CONFLICTING':
      return 'Conflicting';
    case 'TRANSACTION_STATE_INSUFFICIENT_FUNDS':
      return 'Insufficient funds';
    case 'TRANSACTION_STATE_MEMPOOL':
      return 'In mempool';
    case 'TRANSACTION_STATE_MESH':
      return 'In mesh';
    case 'TRANSACTION_STATE_PROCESSED':
      return 'Processed';
    case 'TRANSACTION_STATE_REJECTED':
      return 'Rejected';
    case 'TRANSACTION_STATE_UNSPECIFIED':
    default:
      return 'Unknown state';
  }
};
