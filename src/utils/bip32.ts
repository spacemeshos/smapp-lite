// eslint-disable-next-line camelcase
import { derive_key } from '@spacemesh/ed25519-bip32';

import isJest from './isJest';

(async function initBip32() {
  if (typeof window !== 'undefined' && !isJest()) {
    // Web
    const init = (await import('@spacemesh/ed25519-bip32/web')).default;
    const wasmUrl = // eslint-disable-next-line import/no-unresolved
      (await import('@spacemesh/ed25519-bip32/web/index_bg.wasm?url')).default;
    const buf = await (await fetch(wasmUrl)).arrayBuffer();
    await init(buf);
    // eslint-disable-next-line no-console
    console.log('BIP32 is ready!');
  }
})();

export default class Bip32KeyDerivation {
  static COIN_TYPE = 540;

  static BIP_PROPOSAL = 44;

  static createPath(index: number) {
    // eslint-disable-next-line max-len
    return `m/${Bip32KeyDerivation.BIP_PROPOSAL}'/${Bip32KeyDerivation.COIN_TYPE}'/0'/0'/${index}'`;
  }

  static isValidPath(path: string) {
    return new RegExp(
      // eslint-disable-next-line max-len
      `^m/${Bip32KeyDerivation.BIP_PROPOSAL}'/${Bip32KeyDerivation.COIN_TYPE}'/\\d{0,3}'/\\d{0,3}'/\\d{0,3}'$`
    ).test(path);
  }

  static getPublicKeyFromSecret = (secretKey: Uint8Array): Uint8Array =>
    secretKey.slice(32);

  static deriveFromPath = (
    path: string,
    seed: Uint8Array
  ): { secretKey: Uint8Array; publicKey: Uint8Array } => {
    const p0 = derive_key(seed, path);
    const publicKey = Bip32KeyDerivation.getPublicKeyFromSecret(p0);
    const secretKey = p0;
    const pair = {
      publicKey,
      secretKey,
    };
    return pair;
  };
}
