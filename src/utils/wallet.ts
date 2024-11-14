import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { Athena, StdTemplateKeys, StdTemplates } from '@spacemesh/sm-codec';

import { Bech32Address } from '../types/common';
import {
  AccountWithAddress,
  KeyPair,
  Wallet,
  WalletMeta,
  WalletSecrets,
  WalletSecretsEncrypted,
} from '../types/wallet';

import {
  decrypt as decryptArgon2,
  encrypt,
  isArgon2Encrypted,
} from './aes-ctr-argon2';
import { decrypt as decryptGCM, isGCMEncrypted } from './aes-gcm';
import { generateAddress } from './bech32';
import Bip32KeyDerivation from './bip32';
import { getISODate } from './datetime';
import { fromHexString, toHexString } from './hexString';
import {
  AnySpawnArguments,
  AthenaSpawnArguments,
  convertSpawnArgumentsForEncoding,
  TemplateKey,
} from './templates';

export const createKeyPair = (
  displayName: string,
  mnemonic: string,
  index: number
): KeyPair => {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const path = Bip32KeyDerivation.createPath(index);
  const keyPair = Bip32KeyDerivation.deriveFromPath(path, seed);

  return {
    displayName,
    created: getISODate(),
    path,
    publicKey: toHexString(keyPair.publicKey),
    secretKey: toHexString(keyPair.secretKey),
  };
};

export const generateMnemonic = () => bip39.generateMnemonic(wordlist, 256);

export const createWallet = (
  existingMnemonic?: string,
  name?: string
): Wallet => {
  const timestamp = getISODate();
  const mnemonic = existingMnemonic || generateMnemonic();

  const firstKey = createKeyPair('Key 0', mnemonic, 0);
  const crypto: WalletSecrets = {
    mnemonic,
    keys: [firstKey],
    accounts: [
      {
        displayName: 'Main Account',
        templateAddress: TemplateKey.SingleSig,
        spawnArguments: {
          PublicKey: firstKey.publicKey,
        },
      },
    ],
    contacts: [],
  };
  const meta: WalletMeta = {
    displayName: name || 'My Spacemesh Wallet',
    created: timestamp,
  };
  return { meta, crypto };
};

//
// Derive Account from KeyPair
//

export const computeAddress = <
  TK extends StdTemplateKeys | Athena.TemplatePubKeys
>(
  hrp: string,
  templateKey: TK,
  spawnArguments: AnySpawnArguments,
  isAthena?: boolean
): Bech32Address => {
  if (isAthena && templateKey === Athena.Wallet.TEMPLATE_PUBKEY_HEX) {
    // TODO: Add support of other addresses
    const tpl = Athena.Templates[templateKey as Athena.TemplatePubKeys];
    const args = spawnArguments as AthenaSpawnArguments;
    const principal = tpl.principal({
      Nonce: BigInt(args.Nonce),
      Balance: BigInt(args.Balance),
      Payload: fromHexString(args.PublicKey),
    });
    return generateAddress(principal, hrp);
  }

  const tpl = StdTemplates[templateKey].methods[0];
  const args = convertSpawnArgumentsForEncoding(templateKey, spawnArguments);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const principal = tpl.principal(args);
  return generateAddress(principal, hrp);
};

//
// Encryption / decryption
//
const decryptAnyWallet = async (
  crypto: WalletSecretsEncrypted,
  password: string
): Promise<string> => {
  if (isArgon2Encrypted(crypto)) {
    return decryptArgon2(crypto, password);
  }
  if (isGCMEncrypted(crypto)) {
    return decryptGCM(crypto, password);
  }
  throw new Error('Unsupported encryption format');
};

export const decryptWallet = async (
  crypto: WalletSecretsEncrypted,
  password: string
): Promise<WalletSecrets> => {
  try {
    const decryptedRaw = await decryptAnyWallet(crypto, password);
    const decrypted = JSON.parse(decryptedRaw) as WalletSecrets;
    return decrypted;
  } catch (err) {
    throw new Error('Wrong password');
  }
};

export const encryptWallet = async (
  secrets: WalletSecrets,
  password: string
): Promise<WalletSecretsEncrypted> =>
  encrypt(JSON.stringify(secrets), password);

export const safeKeyForAccount = (acc: AccountWithAddress) =>
  `${acc.address}_${acc.displayName.replace(/\s/g, '_')}`;

export const getEmptySignature = () => new Uint8Array(64).fill(0);
