import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import {
  StdTemplateKeys,
  StdTemplates,
  TemeplateArgumentsMap,
} from '@spacemesh/sm-codec';

import { Bech32Address } from '../types/common';
import {
  AccountWithAddress,
  Contact,
  KeyPair,
  Wallet,
  WalletMeta,
  WalletSecrets,
  WalletSecretsEncrypted,
} from '../types/wallet';

import {
  constructAesGcmIv,
  decrypt,
  encrypt,
  KDF_DKLEN,
  KDF_ITERATIONS,
  pbkdf2Key,
} from './aes-gcm';
import { generateAddress } from './bech32';
import Bip32KeyDerivation from './bip32';
import { getISODate } from './datetime';
import { fromHexString, toHexString } from './hexString';
import {
  AnySpawnArguments,
  convertSpawnArgumentsForEncoding,
  MultiSigSpawnArguments,
  SingleSigSpawnArguments,
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
// KeyPairs
//

export const addKeyPair = (wallet: Wallet, keypair: KeyPair): Wallet => ({
  ...wallet,
  crypto: {
    ...wallet.crypto,
    keys: [...wallet.crypto.keys, keypair],
  },
});

// TODO: editKeyPair, removeKeyPair
// TODO: addAccount, editAccount, removeAccount

export const generateNewKeyPair = (wallet: Wallet, name?: string): Wallet => {
  const index = wallet.crypto.accounts.length;
  return addKeyPair(
    wallet,
    createKeyPair(name || `Account ${index}`, wallet.crypto.mnemonic, index)
  );
};

//
// Contacts
//

export const addContact = (wallet: Wallet, contact: Contact): Wallet => ({
  ...wallet,
  crypto: {
    ...wallet.crypto,
    contacts: [...wallet.crypto.contacts, contact],
  },
});

// TODO: editContact, removeContact

//
// Derive Account from KeyPair
//

export const computeAddress = <TK extends StdTemplateKeys>(
  hrp: string,
  templateKey: TK,
  spawnArguments: AnySpawnArguments
): Bech32Address => {
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
export const decryptWallet = async (
  crypto: WalletSecretsEncrypted,
  password: string
): Promise<WalletSecrets> => {
  const dc = new TextDecoder();
  const key = await pbkdf2Key(
    password,
    fromHexString(crypto.kdfparams.salt),
    crypto.kdfparams.dklen,
    crypto.kdfparams.iterations
  );
  try {
    const decryptedRaw = dc.decode(
      await decrypt(
        key,
        fromHexString(crypto.cipherParams.iv),
        fromHexString(crypto.cipherText)
      )
    );
    const decrypted = JSON.parse(decryptedRaw) as WalletSecrets;
    return decrypted;
  } catch (err) {
    throw new Error('Wrong password');
  }
};

export const encryptWallet = async (
  secrets: WalletSecrets,
  password: string
): Promise<WalletSecretsEncrypted> => {
  const ec = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await pbkdf2Key(password, salt);
  const plaintext = ec.encode(JSON.stringify(secrets));
  const iv = await constructAesGcmIv(key, plaintext);
  const cipherText = await encrypt(key, iv, plaintext);
  return {
    cipher: 'AES-GCM',
    cipherText: toHexString(cipherText),
    cipherParams: {
      iv: toHexString(iv),
    },
    kdf: 'PBKDF2',
    kdfparams: {
      dklen: KDF_DKLEN,
      hash: 'SHA-512',
      salt: toHexString(salt),
      iterations: KDF_ITERATIONS,
    },
  };
};

export const safeKeyForAccount = (acc: AccountWithAddress) =>
  `${acc.address}_${acc.displayName.replace(/\s/g, '_')}`;
