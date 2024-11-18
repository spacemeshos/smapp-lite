import { O } from '@mobily/ts-belt';

import { fetchEstimatedGas, fetchPublishTx } from '../api/requests/tx';
import { HexString } from '../types/common';
import { prepareTxForSign } from '../utils/tx';

import { useCurrentGenesisID, useCurrentRPC } from './useNetworkSelectors';
import { useSignMessage } from './useSigning';

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
  const genesisID = useCurrentGenesisID();
  const sign = useSignMessage();
  return async (
    encodedTx: Uint8Array,
    publicKey: HexString,
    password: string,
    isAthena?: boolean
  ) => {
    if (!genesisID) {
      throw new Error(
        'Please select the network first and then sign a transaction.'
      );
    }
    // TODO: Remove that Athena kludge
    const dataToSign = isAthena
      ? encodedTx
      : prepareTxForSign(genesisID, encodedTx);
    return sign(dataToSign, publicKey, password);
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
