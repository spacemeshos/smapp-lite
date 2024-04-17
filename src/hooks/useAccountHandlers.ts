import { useMemo } from 'react';

import { fetchBalanceByAddress } from '../api/requests/balance';
import { fetchRewardsByAddress } from '../api/requests/rewards';
import { fetchTransactionsByAddress } from '../api/requests/tx';
import useAccountData from '../store/useAccountData';
import useNetworks from '../store/useNetworks';
import { Bech32Address } from '../types/common';

const useAccountHandlers = () => {
  const { getCurrentNetwork } = useNetworks();
  const { setAccountState, setTransactions, setRewards } = useAccountData();

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

  const fetchTransactions = useMemo(
    () => async (address: Bech32Address) => {
      if (!currentNetwork) {
        throw new Error('Cannot fetch transactions: no network selected');
      }

      const rpc = currentNetwork.jsonRPC;
      const txs = await fetchTransactionsByAddress(rpc, address);
      setTransactions(currentNetwork.genesisID, txs);
    },
    [currentNetwork, setTransactions]
  );

  const fetchRewards = useMemo(
    () => async (address: Bech32Address) => {
      if (!currentNetwork) {
        throw new Error('Cannot fetch rewards: no network selected');
      }

      const rpc = currentNetwork.jsonRPC;
      const rewards = await fetchRewardsByAddress(rpc, address);
      setRewards(currentNetwork.genesisID, address, rewards);
    },
    [currentNetwork, setRewards]
  );

  return {
    fetchAccountState,
    fetchTransactions,
    fetchRewards,
  };
};

export default useAccountHandlers;
