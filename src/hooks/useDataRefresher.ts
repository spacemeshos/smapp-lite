import { useEffect, useMemo, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';

import { O } from '@mobily/ts-belt';

import useNetworks from '../store/useNetworks';
import useNetworkStatus from '../store/useNetworkStatus';
import useWallet from '../store/useWallet';
import { Bech32Address } from '../types/common';
import { API_MIN_FETCH_INTERVAL } from '../utils/constants';
import { noop } from '../utils/func';

import useAccountHandlers from './useAccountHandlers';
import { useCurrentHRP, useLayerDuration } from './useNetworkSelectors';
import { useAccountsList } from './useWalletSelectors';

// This hook is used to automatically re-fetch all the required
// data once the account or network changes.
const useDataRefresher = () => {
  const { fetchAccountState, fetchTransactions, fetchRewards } =
    useAccountHandlers();
  const { getCurrentNetwork } = useNetworks();
  const [isLoading, setIsLoading] = useState(false);

  const hrp = useCurrentHRP();
  const layerDur = useLayerDuration();
  const accounts = useAccountsList(hrp);
  const { selectedAccount } = useWallet();
  const currentNetwork = getCurrentNetwork();
  const { status } = useNetworkStatus();
  const addresses = useMemo(
    () => accounts.map((acc) => acc.address),
    [accounts]
  );
  const curAddress = accounts[selectedAccount]?.address;
  const rpc = currentNetwork?.jsonRPC;

  const cannotDoRequest = !status || !rpc;
  const doRequests = useMemo(
    () => (addrs: Bech32Address[], addr: Bech32Address) => {
      if (cannotDoRequest) {
        return Promise.resolve();
      }
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
    [cannotDoRequest, fetchAccountState, fetchTransactions, fetchRewards]
  );

  useEffect(() => {
    let ival: ReturnType<typeof setInterval>;
    if (curAddress && rpc) {
      doRequests(addresses, curAddress);
      ival = setInterval(
        () => doRequests(addresses, curAddress),
        O.mapWithDefault(layerDur, 300, (val) =>
          val < API_MIN_FETCH_INTERVAL ? API_MIN_FETCH_INTERVAL : val
        ) * 1000
      );
    }
    return () => clearInterval(ival);
  }, [addresses, curAddress, rpc, doRequests, layerDur]);

  return {
    isLoading,
    refreshData: () => {
      if (curAddress && rpc) {
        doRequests(addresses, curAddress);
      }
    },
  };
};

export default singletonHook(
  {
    isLoading: false,
    refreshData: noop,
  },
  useDataRefresher
);
