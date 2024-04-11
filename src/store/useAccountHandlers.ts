import useRPC from '../utils/useRPC';

import useAccountData from './useAccountData';
import useNetworks from './useNetworks';

const useAccountHandlers = () => {
  const { getCurrentNetwork } = useNetworks();
  const { fetchAccountState } = useAccountData();

  const currentNetwork = getCurrentNetwork();

  return {
    fetchAccountState: useRPC(fetchAccountState, currentNetwork?.jsonRPC),
  };
};

export default useAccountHandlers;
