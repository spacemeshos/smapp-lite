import { AnySpawnArguments } from '../utils/templates';

import { Bech32Address, HexString } from './common';

export type KeyMeta = {
  displayName: string;
  created: string;
};

export enum KeyOrigin {
  Unknown = 0,
  Ledger = 1,
}

export type KeyPair = {
  publicKey: string;
  path?: string;
  secretKey?: string;
} & KeyMeta;

export type SafeKey = Omit<KeyPair, 'secretKey'>;

export type ForeignKey = SafeKey & { origin: KeyOrigin };
export type LocalKey = KeyPair & { secretKey: string };
export type AnyKey = SafeKey | ForeignKey | LocalKey;

// Only for App state
export enum KeyPairType {
  Software = 'Software',
  Hardware = 'Hardware',
}
export type SafeKeyWithType = SafeKey & { type: KeyPairType };

export interface Account<T = AnySpawnArguments> {
  displayName: string;
  templateAddress: string;
  spawnArguments: T;
}

export type AccountWithAddress<T = AnySpawnArguments> = Account<T> & {
  address: Bech32Address;
};

export interface Contact {
  address: string;
  nickname: string;
}

export interface WalletMeta {
  displayName: string;
  created: string;
}

export interface WalletSecretsLegacy {
  mnemonic: string;
  accounts: KeyPair[];
  contacts: Contact[];
}

export interface WalletSecrets {
  mnemonic: string;
  keys: KeyPair[];
  accounts: Account[];
  contacts: Contact[];
}

export interface Wallet {
  meta: WalletMeta;
  crypto: WalletSecrets;
}

export interface WalletSecretsEncrypted {
  cipher: 'AES-GCM';
  cipherParams: {
    iv: HexString;
  };
  kdf: 'PBKDF2';
  kdfparams: {
    dklen: number;
    hash: 'SHA-512';
    iterations: number;
    salt: HexString;
  };
  cipherText: string;
}

// Encrypted Wallet representation on the filesystem
export interface WalletFile {
  meta: WalletMeta;
  crypto: WalletSecretsEncrypted;
}
