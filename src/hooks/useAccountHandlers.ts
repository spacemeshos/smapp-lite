import { useMemo } from 'react';

import { fetchBalanceByAddress } from '../api/requests/balance';
import { Bech32Address } from '../types/common';

import useAccountData from '../store/useAccountData';
import useNetworks from '../store/useNetworks';

const useAccountHandlers = () => {
  const { getCurrentNetwork } = useNetworks();
  const { setAccountState } = useAccountData();

  const currentNetwork = getCurrentNetwork();

  const fetchAccountState = useMemo(
    () => async (address: Bech32Address) => {
      if (!currentNetwork) {
        throw new Error('Cannot fetch account state: no network selected');
      }

      const rpc = currentNetwork.jsonRPC;
      const states = await fetchBalanceByAddress(rpc, address);
      setAccountState(currentNetwork.genesisID, address, states);
    },
    [currentNetwork, setAccountState]
  );

  return {
    fetchAccountState,
  };
};

export default useAccountHandlers;
