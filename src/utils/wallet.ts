import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import {
  StdTemplateKeys,
  StdTemplates,
  TemeplateArgumentsMap,
} from '@spacemesh/sm-codec';

import { Bech32Address } from '../types/common';
import {
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

  const firstKey = createKeyPair('Account 0', mnemonic, 0);
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

const transformSpawnArgs = <TK extends StdTemplateKeys>(
  spawnArguments: TemeplateArgumentsMap[TK][0],
  templateKey: TK,
  args: TemeplateArgumentsMap[TK][0]
): TemeplateArgumentsMap[TK][0] => {
  switch (templateKey) {
    case TemplateKey.SingleSig:
      return {
        PublicKey: fromHexString(
          (args as unknown as SingleSigSpawnArguments).PublicKey
        ),
      };
    case TemplateKey.MultiSig:
      return {
        ...args,
        PublicKeys: (args as unknown as MultiSigSpawnArguments).PublicKeys.map(
          fromHexString
        ),
      };
    default:
      return args;
  }
};

export const computeAddress = <TK extends StdTemplateKeys>(
  hrp: string,
  templateKey: TK,
  spawnArguments: TemeplateArgumentsMap[TK][0]
): Bech32Address => {
  const tpl = StdTemplates[templateKey].methods[0];
  const args = transformSpawnArgs(spawnArguments, templateKey, spawnArguments);
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
