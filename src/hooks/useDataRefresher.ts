import { useEffect, useMemo, useState } from 'react';

import useNetworks from '../store/useNetworks';
import useWallet from '../store/useWallet';
import { Bech32Address } from '../types/common';

import useAccountHandlers from './useAccountHandlers';
import { useCurrentHRP } from './useNetworkSelectors';
import { useAccountsList } from './useWalletSelectors';

// This hook is used to automatically re-fetch all the required
// data once the account or network changes.
const useDataRefresher = () => {
  const { fetchAccountState, fetchTransactions, fetchRewards } =
    useAccountHandlers();
  const { getCurrentNetwork } = useNetworks();
  const [isLoading, setIsLoading] = useState(false);

  const hrp = useCurrentHRP();
  const accounts = useAccountsList(hrp);
  const { selectedAccount } = useWallet();
  const currentNetwork = getCurrentNetwork();
  const addresses = useMemo(
    () => accounts.map((acc) => acc.address),
    [accounts]
  );
  const curAddress = accounts[selectedAccount]?.address;
  const rpc = currentNetwork?.jsonRPC;

  const doRequests = useMemo(
    () => (addrs: Bech32Address[], addr: Bech32Address) => {
      setIsLoading(true);
      return Promise.all([
        fetchAccountState(addrs),
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
    if (curAddress && rpc) {
      doRequests(addresses, curAddress);
    }
  }, [addresses, curAddress, rpc, doRequests]);

  return {
    isLoading,
    refreshData: () => {
      if (curAddress && rpc) {
        doRequests(addresses, curAddress);
      }
    },
  };
};

export default useDataRefresher;
