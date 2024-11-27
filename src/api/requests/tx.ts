import { SpawnTransaction, SpendTransaction } from '@spacemesh/sm-codec';

import { Bech32Address } from '../../types/common';
import { Transaction } from '../../types/tx';
import { fromBase64, toBase64 } from '../../utils/base64';
import { getWords } from '../../utils/bech32';
import { toHexString } from '../../utils/hexString';
import {
  getMethodName,
  getTemplateMethod,
  getTemplateNameByAddress,
} from '../../utils/templates';
import fetch from '../fetch';
import getFetchAll from '../getFetchAll';
import { parseResponse } from '../schemas/error';
import {
  EstimateGasResponseSchema,
  SubmitTxResponseSchema,
  TransactionResponseObject,
  TransactionResponseSchema,
  TransactionResultStatus,
  TransactionState,
  WithExtraData,
} from '../schemas/tx';

const getTxState = (
  resultStatus: TransactionResultStatus | undefined,
  txState: TransactionState | undefined
): TransactionState => {
  // TODO: Remove kludges once go-sm issue solved:
  // https://github.com/spacemeshos/go-spacemesh/issues/5317
  if (resultStatus) {
    if (resultStatus === 'TRANSACTION_STATUS_SUCCESS') {
      return 'TRANSACTION_STATE_PROCESSED';
    }
    if (
      resultStatus === 'TRANSACTION_STATUS_FAILURE' ||
      resultStatus === 'TRANSACTION_STATUS_INVALID'
    ) {
      return 'TRANSACTION_STATE_REJECTED';
    }
  }
  if (txState) {
    return txState;
  }
  return 'TRANSACTION_STATE_UNSPECIFIED';
};

export const fetchTransactionsChunk = async (
  rpc: string,
  address: Bech32Address,
  limit = 100,
  offset = 0
): Promise<(TransactionResponseObject & WithExtraData)[]> =>
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
        state: getTxState(
          tx.txResult?.status,
          tx.txState || 'TRANSACTION_STATE_UNSPECIFIED'
        ),
        message: tx.txResult?.message,
        touched: tx.txResult?.touchedAddresses || [tx.tx.principal],
      }))
    );

export const fetchTransactions = getFetchAll(fetchTransactionsChunk, 100);

export const fetchTransactionsByAddress = async (
  rpc: string,
  address: Bech32Address
) => {
  const txs = await fetchTransactions(rpc, address);

  return txs.map((tx) => {
    const templateAddress = toHexString(getWords(tx.template));
    const template = getTemplateMethod(templateAddress, tx.method);
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
        message: tx.message,
        touched: tx.touched,
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
