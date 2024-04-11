import { AccountStates } from '../../types/account';
import { Bech32Address } from '../../types/common';
import { BalanceResponseSchema } from '../schemas/globalState';

// eslint-disable-next-line import/prefer-default-export
export const fetchBalanceByAddress = async (
  rpc: string,
  address: Bech32Address
): Promise<AccountStates> =>
  fetch(`${rpc}/v1/globalstate/accountdataquery`, {
    method: 'POST',
    body: JSON.stringify({
      filter: {
        account_id: {
          address,
        },
        account_data_flags: 4,
      },
    }),
  })
    .then((r) => r.json())
    .then(BalanceResponseSchema.parse)
    .then((x) => {
      const acc = x.accountItem[0].accountWrapper;
      return {
        current: {
          nonce: acc.stateCurrent.counter,
          balance: acc.stateCurrent.balance.value,
        },
        projected: {
          nonce: acc.stateProjected.counter,
          balance: acc.stateProjected.balance.value,
        },
      };
    });
