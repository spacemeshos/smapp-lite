import { AccountStatesWithAddress } from '../../types/account';
import { Bech32Address } from '../../types/common';
import { BalanceResponseSchema } from '../schemas/account';
import { parseResponse } from '../schemas/error';

const DEFAULT_STATE = {
  nonce: '0',
  balance: '0',
};

// eslint-disable-next-line import/prefer-default-export
export const fetchBalances = async (rpc: string, addresses: Bech32Address[]) =>
  fetch(`${rpc}/spacemesh.v2alpha1.AccountService/List`, {
    method: 'POST',
    body: JSON.stringify({
      addresses,
      limit: 100,
    }),
  })
    .then((r) => r.json())
    .then(parseResponse(BalanceResponseSchema))
    .then(({ accounts }) =>
      addresses.reduce((acc, nextAddress) => {
        const states = accounts.find((s) => s.address === nextAddress);
        const next = states
          ? {
              address: states.address,
              current: {
                nonce: states.current.counter,
                balance: states.current.balance,
              },
              projected: {
                nonce: states.projected.counter,
                balance: states.projected.balance,
              },
            }
          : {
              address: nextAddress,
              current: { ...DEFAULT_STATE },
              projected: { ...DEFAULT_STATE },
            };
        return [...acc, next];
      }, <AccountStatesWithAddress[]>[])
    );
