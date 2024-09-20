import { signAsync, verifyAsync } from '@noble/ed25519';

import useWallet from '../store/useWallet';
import { HexString } from '../types/common';

export const useSignMessage = () => {
  const { revealSecretKey } = useWallet();

  return async (
    message: Uint8Array | string,
    publicKey: HexString,
    password: string
  ) => {
    const data =
      typeof message === 'string' ? new TextEncoder().encode(message) : message;
    const secret = await revealSecretKey(publicKey, password);
    return signAsync(data, secret.slice(0, 64));
  };
};

export const useVerifyMessage =
  () =>
  async (
    signature: HexString,
    message: Uint8Array | string,
    publicKey: HexString
  ) => {
    const data =
      typeof message === 'string' ? new TextEncoder().encode(message) : message;
    return verifyAsync(signature, data, publicKey);
  };
