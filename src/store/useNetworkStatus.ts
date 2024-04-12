import { useEffect } from 'react';
import { singletonHook } from 'react-singleton-hook'
import { create } from 'zustand';

import { O } from '@mobily/ts-belt';

import { fetchNodeStatus } from '../api/requests/netinfo';
import { NodeStatus } from '../types/networks';
import { MINUTE } from '../utils/constants';
import { noop } from '../utils/func';

import useNetworks from './useNetworks';

type StoreState = {
  status: NodeStatus | null;
  error: Error | null;
  setStatus: (status: NodeStatus) => void;
  setError: (error: Error) => void;
};

const useNetworkStatusStore = create<StoreState>((set) => ({
  status: null,
  error: null,
  setStatus: (status: NodeStatus) => set({ status, error: null }),
  setError: (error: Error) => set({ status: null, error }),
}));

const useNetworkStatus = () => {
  const { getCurrentNetwork } = useNetworks();
  const currentNetwork = getCurrentNetwork();
  const { status, error, setStatus, setError } = useNetworkStatusStore();

  const rpc = O.mapWithDefault(currentNetwork, '', (net) => net.jsonRPC);
  useEffect(() => {
    if (!rpc) return noop;

    const fetchStatus = () => {
      fetchNodeStatus(rpc).then(setStatus).catch(setError);
    };

    fetchStatus();
    const ival = setInterval(fetchStatus, 5 * MINUTE);
    return () => clearInterval(ival);
  }, [rpc, setError, setStatus]);

  return { status, error };
};

export default singletonHook({ status: null, error: null }, useNetworkStatus);
