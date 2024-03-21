import { HexString } from './common';

export interface KeyPair {
  displayName: string;
  created: string;
  path: string;
  publicKey: string;
  secretKey: string;
}

export interface Account {
  displayName: string;
  address: string;
}

export interface Contact {
  address: string;
  nickname: string;
}

export interface WalletMeta {
  displayName: string;
  created: string;
}

export interface WalletSecrets {
  mnemonic: string;
  accounts: KeyPair[];
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
