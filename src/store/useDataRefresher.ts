import { useEffect } from 'react';

import useAccountHandlers from './useAccountHandlers';
import useNetworks from './useNetworks';
import useWallet from './useWallet';

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
      // TODO
    }
  }, [address, rpc, fetchAccountState]);
};

export default useDataRefresher;
