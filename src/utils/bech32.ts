import { bech32 } from 'bech32';

import { Bech32Address } from '../types/common';

export const generateAddress = (publicKey: Uint8Array, hrp: string) =>
  bech32.encode(hrp, bech32.toWords(publicKey));

export const parseAddress = (address: Bech32Address) => {
  const decoded = bech32.decode(address);
  return {
    hrp: decoded.prefix,
    publicKey: Uint8Array.from(bech32.fromWords(decoded.words)),
  };
};
