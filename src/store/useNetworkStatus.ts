import { useEffect, useState } from 'react';
import { singletonHook } from 'react-singleton-hook';
import { create } from 'zustand';

import { O } from '@mobily/ts-belt';

import { fetchNodeStatus } from '../api/requests/netinfo';
import { NodeStatus } from '../types/networks';
import {
  FETCH_NODE_STATUS_INTERVAL,
  FETCH_NODE_STATUS_RETRY,
} from '../utils/constants';
import { noop } from '../utils/func';

import useNetworks from './useNetworks';

type StoreState = {
  status: NodeStatus | null;
  error: Error | null;
  lastUpdate: number;
  setStatus: (status: NodeStatus) => void;
  setError: (error: Error) => void;
};

const useNetworkStatusStore = create<StoreState>((set) => ({
  status: null,
  error: null,
  lastUpdate: 0,
  setStatus: (status: NodeStatus) =>
    set({ status, error: null, lastUpdate: Date.now() }),
  setError: (error: Error) =>
    set({ status: null, error, lastUpdate: Date.now() }),
}));

const useNetworkStatus = () => {
  const { getCurrentNetwork } = useNetworks();
  const currentNetwork = getCurrentNetwork();
  const { status, error, lastUpdate, setStatus, setError } =
    useNetworkStatusStore();
  const rpc = O.mapWithDefault(currentNetwork, '', (net) => net.jsonRPC);

  const [prevNet, setPrevNet] = useState(currentNetwork);
  const isNewNetwork = prevNet !== currentNetwork;

  useEffect(() => {
    setPrevNet(currentNetwork);
  }, [currentNetwork, setPrevNet]);

  useEffect(() => {
    if (!rpc) return noop;

    const fetchStatus = () => {
      if (
        isNewNetwork ||
        !lastUpdate ||
        Date.now() - lastUpdate > FETCH_NODE_STATUS_INTERVAL
      ) {
        fetchNodeStatus(rpc).then(setStatus).catch(setError);
      }
    };

    fetchStatus();
    const ival = setInterval(
      fetchStatus,
      status ? FETCH_NODE_STATUS_INTERVAL : FETCH_NODE_STATUS_RETRY
    );
    return () => clearInterval(ival);
  }, [lastUpdate, rpc, setError, setStatus, status, isNewNetwork]);

  return { status, error };
};

export default singletonHook({ status: null, error: null }, useNetworkStatus);
