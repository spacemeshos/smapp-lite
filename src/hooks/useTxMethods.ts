import { O } from '@mobily/ts-belt';
import { signAsync } from '@noble/ed25519';

import { fetchEstimatedGas, fetchPublishTx } from '../api/requests/tx';
import useWallet from '../store/useWallet';
import { HexString } from '../types/common';
import { prepareTxForSign } from '../utils/tx';

import { useCurrentGenesisID, useCurrentRPC } from './useNetworkSelectors';

export const useEstimateGas = () => {
  const rpc = useCurrentRPC();
  return (encodedTx: Uint8Array) => {
    if (O.isNone(rpc)) {
      throw new Error('Cannot find JSON RPC API for the selected network');
    }
    return fetchEstimatedGas(rpc, encodedTx);
  };
};

export const useSignTx = () => {
  const { revealSecretKey } = useWallet();
  const genesisID = useCurrentGenesisID();
  return async (
    encodedTx: Uint8Array,
    publicKey: HexString,
    password: string
  ) => {
    if (!genesisID) {
      throw new Error(
        'Please select the network first and then sign a transaction.'
      );
    }
    const secret = await revealSecretKey(publicKey, password);
    return signAsync(
      prepareTxForSign(genesisID, encodedTx),
      secret.slice(0, 64)
    );
  };
};

export const useSubmitTx = () => {
  const rpc = useCurrentRPC();
  return (encodedTx: Uint8Array) => {
    if (O.isNone(rpc)) {
      throw new Error('Cannot find JSON RPC API for the selected network');
    }
    return fetchPublishTx(rpc, encodedTx);
  };
};
