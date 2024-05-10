import { Bech32Address, HexString } from './common';

export type KeyMeta = {
  displayName: string;
  created: string;
};

export type KeyPair = {
  path: string;
  publicKey: string;
  secretKey?: string;
} & KeyMeta;

export type ForeignKey = KeyPair & { secretKey: never };
export type FullKey = Required<KeyPair>;

export interface Account<T = Record<string, unknown>> {
  displayName: string;
  templateAddress: string;
  spawnArguments: T;
}

export type AccountWithAddress<T = Record<string, unknown>> = Account<T> & {
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
