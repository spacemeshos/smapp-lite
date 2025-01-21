import {
  Athena,
  SpawnTransaction,
  SpendTransaction,
} from '@spacemesh/sm-codec';
import { DeployArguments } from '@spacemesh/sm-codec/lib/athena/wallet';
import {
  SpawnArguments,
  SpendArguments,
} from '@spacemesh/sm-codec/lib/std/singlesig';

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
        type: tx.tx.type,
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

type ParseErr = {
  error: string;
  bytes: Uint8Array;
};

export const fetchTransactionsByAddress = async (
  rpc: string,
  address: Bech32Address,
  isAthena: boolean
) => {
  const txs = await fetchTransactions(rpc, address);

  if (isAthena) {
    return txs.map((tx) => {
      try {
        const parse = () => {
          const txBytes = fromBase64(tx.raw);
          switch (tx.type) {
            case 'TRANSACTION_TYPE_SINGLE_SIG_SPAWN':
              return Athena.Templates[
                '000000000000000000000000000000000000000000000001'
              ].methods[Athena.Wallet.METHODS_HEX.SPAWN].dec(
                txBytes
              ) as Athena.TypedTx<Athena.Wallet.SpawnArguments>;
            case 'TRANSACTION_TYPE_SINGLE_SIG_SEND':
              return Athena.Templates[
                '000000000000000000000000000000000000000000000001'
              ].methods[Athena.Wallet.METHODS_HEX.SPEND].dec(
                txBytes
              ) as Athena.TypedTx<Athena.Wallet.SpendArguments>;
            case 'TRANSACTION_TYPE_DEPLOY':
              return Athena.Templates[
                '000000000000000000000000000000000000000000000001'
              ].methods[Athena.Wallet.METHODS_HEX.DEPLOY].dec(
                txBytes
              ) as Athena.TypedTx<Athena.Wallet.DeployArguments>;
            default: {
              // eslint-disable-next-line max-len
              const errMessage = `Unknown Athnea's transaction type: ${tx.type}`;
              // eslint-disable-next-line no-console
              console.log(new Error(errMessage));
              return {
                error: errMessage,
                bytes: txBytes,
              } as ParseErr;
            }
          }
        };
        const getParsedPayload = (
          parsed: ReturnType<typeof parse>
        ): SpawnArguments | SpendArguments | DeployArguments | ParseErr => {
          switch (tx.type) {
            case 'TRANSACTION_TYPE_SINGLE_SIG_SPAWN':
              return {
                PublicKey: (
                  parsed as Athena.TypedTx<Athena.Wallet.SpawnArguments>
                ).Payload.PubKey,
              };
            case 'TRANSACTION_TYPE_SINGLE_SIG_SEND':
              return {
                Destination: (
                  parsed as Athena.TypedTx<Athena.Wallet.SpendArguments>
                ).Payload.Recipient,
                Amount: (parsed as Athena.TypedTx<Athena.Wallet.SpendArguments>)
                  .Payload.Amount,
              };
            case 'TRANSACTION_TYPE_DEPLOY':
              return (parsed as Athena.TypedTx<Athena.Wallet.DeployArguments>)
                .Payload;
            default: {
              if (
                !(
                  Object.hasOwn(parsed, 'error') &&
                  Object.hasOwn(parsed, 'bytes')
                )
              ) {
                throw new Error(`Unknown Athnea transaction type ${tx.type}`);
              }
              // eslint-disable-next-line max-len
              const errMessage = `Unknown Athnea's transaction type: ${tx.type}`;
              return {
                error: errMessage,
                bytes: (parsed as ParseErr).bytes,
              };
            }
          }
        };

        const parsed = parse();
        const { method } = tx;
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
            method,
            name: getTemplateNameByAddress(tx.template, true),
            methodName: getMethodName(method),
          },
          layer: tx.layer,
          parsed: getParsedPayload(parsed),
          state: tx.state,
          message: tx.message,
          touched: tx.touched,
        };
      } catch (err) {
        /* eslint-disable no-console */
        console.log('Error parsing Athena Transaction', tx);
        console.error(err);
        /* eslint-enable no-console */
        throw err;
      }
    });
  }

  return txs.map((tx) => {
    const templateAddress = toHexString(getWords(tx.template));
    try {
      const template = getTemplateMethod(templateAddress, String(tx.method));
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
