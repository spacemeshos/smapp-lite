// eslint-disable-next-line camelcase
import { derive_key } from '@spacemesh/ed25519-bip32';

export default class Bip32KeyDerivation {
  static COIN_TYPE = 540;

  static BIP_PROPOSAL = 44;

  static createPath(index: number) {
    // eslint-disable-next-line max-len
    return `m/${Bip32KeyDerivation.BIP_PROPOSAL}'/${Bip32KeyDerivation.COIN_TYPE}'/0'/0'/${index}'`;
  }

  static deriveFromPath = (
    path: string,
    seed: Uint8Array
  ): { secretKey: Uint8Array; publicKey: Uint8Array } => {
    const p0 = derive_key(seed, path);
    const publicKey = p0.slice(32);
    const secretKey = p0;
    const pair = {
      publicKey,
      secretKey,
    };
    return pair;
  };
}
