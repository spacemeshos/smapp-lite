import { useEffect } from 'react';

import useNetworks from '../store/useNetworks';
import useWallet from '../store/useWallet';

import useAccountHandlers from './useAccountHandlers';

// This hook is used to automatically re-fetch all the required
// data once the account or network changes.
const useDataRefresher = () => {
  const { fetchAccountState } = useAccountHandlers();
  const { getCurrentAccount } = useWallet();
  const { getCurrentNetwork } = useNetworks();

  const currentAccount = getCurrentAccount();
  const currentNetwork = getCurrentNetwork();

  const address = currentAccount?.address;
  const rpc = currentNetwork?.jsonRPC;

  useEffect(() => {
    if (address && rpc) {
      fetchAccountState(address);
      // TODO: Update other data
      // TODO: Call it after being idle/blurred for a while
      //       e.g. blurred more than for 5 minutes
    }
  }, [address, rpc, fetchAccountState]);
};

export default useDataRefresher;
