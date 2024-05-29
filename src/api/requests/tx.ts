import {
  SpawnTransaction,
  SpendTransaction,
  StdPublicKeys,
  StdTemplates,
} from '@spacemesh/sm-codec';

import { Bech32Address } from '../../types/common';
import { Transaction } from '../../types/tx';
import { fromBase64 } from '../../utils/base64';
import { toHexString } from '../../utils/hexString';
import { getMethodName, getTemplateNameByAddress } from '../../utils/templates';
import {
  MeshTransactionsResponseSchema,
  TransactionResponse,
  TransactionStatesResponse,
  TransactionStatesResponseSchema,
  WithLayer,
  WithState,
} from '../schemas/tx';

export const fetchMeshTxs = async (
  rpc: string,
  address: Bech32Address
): Promise<(TransactionResponse & WithLayer)[]> =>
  fetch(`${rpc}/v1/mesh/accountmeshdataquery`, {
    method: 'POST',
    body: JSON.stringify({
      filter: {
        account_id: {
          address,
        },
        account_mesh_data_flags: 1,
      },
    }),
  })
    .then((r) => r.json())
    .then(MeshTransactionsResponseSchema.parse)
    .then((x) =>
      x.data.map((m) => ({
        ...m.meshTransaction.transaction,
        layer: m.meshTransaction.layerId.number,
      }))
    );

export const fetchTxStates = async <T extends TransactionResponse>(
  rpc: string,
  txs: T[]
): Promise<TransactionStatesResponse> => {
  const txIds = txs.map((t) => ({ id: t.id }));
  return fetch(`${rpc}/v1/transaction/transactionsstate`, {
    method: 'POST',
    body: JSON.stringify({
      transaction_id: txIds,
      include_transactions: false,
    }),
  })
    .then((r) => r.json())
    .then(TransactionStatesResponseSchema.parse);
};

export const fetchTransactionsByAddress = async (
  rpc: string,
  address: Bech32Address
) => {
  const meshTxs = await fetchMeshTxs(rpc, address);
  if (meshTxs.length === 0) {
    return [];
  }

  const txStates = await fetchTxStates(rpc, meshTxs);

  const txs: (TransactionResponse & WithLayer & WithState)[] = meshTxs.reduce(
    (acc, next) => [
      ...acc,
      {
        ...next,
        state:
          txStates.transactionsState.find((s) => s.id.id === next.id)?.state ??
          'TRANSACTION_STATE_UNSPECIFIED',
      },
    ],
    <(TransactionResponse & WithLayer & WithState)[]>[]
  );

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
        principal: tx.principal.address,
        nonce: {
          counter: tx.nonce.counter,
          bitfield: tx.nonce.bitfield,
        },
        gas: {
          maxGas: tx.maxGas,
          price: tx.gasPrice,
        },
        template: {
          address: tx.template.address,
          method: tx.method,
          name: getTemplateNameByAddress(tx.template.address),
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
