import { Argon2Encrypted } from '../utils/aes-ctr-argon2';
import { GCMEncrypted } from '../utils/aes-gcm';
import { AnySpawnArguments } from '../utils/templates';

import { Bech32Address } from './common';

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

export type ForeignKey = SafeKey & { path: string; origin: KeyOrigin };
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
  isAthena?: boolean;
}

export type AccountWithAddress<T = AnySpawnArguments> = Account<T> & {
  address: Bech32Address;
};

export interface Contact {
  address: Bech32Address;
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

export type WalletSecretsEncrypted = GCMEncrypted | Argon2Encrypted;

// Encrypted Wallet representation on the filesystem
export interface WalletFile {
  meta: WalletMeta;
  crypto: WalletSecretsEncrypted;
}
