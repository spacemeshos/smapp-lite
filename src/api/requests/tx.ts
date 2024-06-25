import {
  SpawnTransaction,
  SpendTransaction,
  StdPublicKeys,
  StdTemplates,
} from '@spacemesh/sm-codec';

import { Bech32Address } from '../../types/common';
import { Transaction } from '../../types/tx';
import { fromBase64, toBase64 } from '../../utils/base64';
import { toHexString } from '../../utils/hexString';
import { getMethodName, getTemplateNameByAddress } from '../../utils/templates';
import { parseResponse } from '../schemas/error';
import {
  EstimateGasResponseSchema,
  SubmitTxResponseSchema,
  TransactionResponseObject,
  TransactionResponseSchema,
  WithLayer,
  WithState,
} from '../schemas/tx';

import getFetchAll from './getFetchAll';

export const fetchTransactionsChunk = async (
  rpc: string,
  address: Bech32Address,
  limit = 100,
  offset = 0
): Promise<(TransactionResponseObject & WithLayer & WithState)[]> =>
  fetch(`${rpc}/spacemesh.v2alpha1.TransactionService/List`, {
    method: 'POST',
    body: JSON.stringify({
      address,
      include_state: true,
      include_result: true,
      limit,
      offset,
    }),
  })
    .then((r) => r.json())
    .then(parseResponse(TransactionResponseSchema))
    .then(({ transactions }) =>
      transactions.map((tx) => ({
        ...tx.tx,
        layer: tx.txResult?.layer || 0,
        state: tx.txState ?? 'TRANSACTION_STATE_UNSPECIFIED',
      }))
    );

export const fetchTransactions = getFetchAll(fetchTransactionsChunk, 100);

export const fetchTransactionsByAddress = async (
  rpc: string,
  address: Bech32Address
) => {
  const txs = await fetchTransactions(rpc, address);

  return txs.map((tx) => {
    // TODO: Support other templates
    const template =
      StdTemplates[StdPublicKeys.SingleSig].methods[tx.method as 0 | 16];
    try {
      const parsedRaw = template.decode(fromBase64(tx.raw));
      const parsed =
        tx.method === 0
          ? (parsedRaw as SpawnTransaction)
          : (parsedRaw as SpendTransaction);
      return {
        id: toHexString(fromBase64(tx.id), true),
        principal: tx.principal,
        nonce: {
          counter: tx.nonce.counter,
          bitfield: tx.nonce.bitfield || 0,
        },
        gas: {
          maxGas: tx.maxGas,
          price: tx.gasPrice,
        },
        template: {
          address: tx.template,
          method: tx.method,
          name: getTemplateNameByAddress(tx.template),
          methodName: getMethodName(tx.method),
        },
        layer: tx.layer,
        parsed: parsed.Payload.Arguments,
        state: tx.state,
      } satisfies Transaction<(typeof parsed)['Payload']['Arguments']>;
    } catch (err) {
      /* eslint-disable no-console */
      console.log('Error parsing Transaction', tx);
      console.error(err);
      /* eslint-enable no-console */
      throw err;
    }
  });
};

export const fetchEstimatedGas = async (rpc: string, encodedTx: Uint8Array) =>
  fetch(`${rpc}/spacemesh.v2alpha1.TransactionService/EstimateGas`, {
    method: 'POST',
    body: JSON.stringify({
      transaction: toBase64(encodedTx),
    }),
  })
    .then((r) => r.json())
    .then(parseResponse(EstimateGasResponseSchema))
    .then(({ recommendedMaxGas }) => recommendedMaxGas);

export const fetchPublishTx = async (rpc: string, encodedTx: Uint8Array) =>
  fetch(`${rpc}/spacemesh.v2alpha1.TransactionService/SubmitTransaction`, {
    method: 'POST',
    body: JSON.stringify({
      transaction: toBase64(encodedTx),
    }),
  })
    .then((r) => r.json())
    .then(parseResponse(SubmitTxResponseSchema))
    .then(({ txId }) => txId);
