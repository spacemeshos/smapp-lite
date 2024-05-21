import { useEffect, useMemo, useState } from 'react';

import useNetworks from '../store/useNetworks';
import { Bech32Address } from '../types/common';

import useAccountHandlers from './useAccountHandlers';
import { useCurrentHRP } from './useNetworkSelectors';
import { useCurrentAccount } from './useWalletSelectors';

// This hook is used to automatically re-fetch all the required
// data once the account or network changes.
const useDataRefresher = () => {
  const { fetchAccountState, fetchTransactions, fetchRewards } =
    useAccountHandlers();
  const { getCurrentNetwork } = useNetworks();
  const [isLoading, setIsLoading] = useState(false);

  const hrp = useCurrentHRP();
  const currentAccount = useCurrentAccount(hrp);
  const currentNetwork = getCurrentNetwork();

  const address = currentAccount?.address;
  const rpc = currentNetwork?.jsonRPC;

  const doRequests = useMemo(
    () => (addr: Bech32Address) => {
      setIsLoading(true);
      return Promise.all([
        fetchAccountState(addr),
        fetchTransactions(addr),
        fetchRewards(addr),
      ])
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Cannot refresh data: ', err);
        })
        .then(() => {
          setIsLoading(false);
        });
    },
    [fetchAccountState, fetchTransactions, fetchRewards]
  );

  useEffect(() => {
    if (address && rpc) {
      doRequests(address);
    }
  }, [address, rpc, doRequests]);

  return {
    isLoading,
    refreshData: () => {
      if (address && rpc) {
        doRequests(address);
      }
    },
  };
};

export default useDataRefresher;
