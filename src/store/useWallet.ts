import fileDownload from 'js-file-download';
import { create } from 'zustand';

import * as bip39 from '@scure/bip39';
import { StdTemplateKeys } from '@spacemesh/sm-codec';

import { HexString } from '../types/common';
import {
  Account,
  AnyKey,
  Contact,
  ForeignKey,
  KeyOrigin,
  LocalKey,
  SafeKey,
  SafeKeyWithType,
  Wallet,
  WalletFile,
  WalletMeta,
} from '../types/wallet';
import Bip32KeyDerivation from '../utils/bip32';
import { getISODate } from '../utils/datetime';
import { toHexString } from '../utils/hexString';
import { ensafeKeyPair, getKeyPairType, isLocalKey } from '../utils/keys';
import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from '../utils/localStorage';
import { AnySpawnArguments } from '../utils/templates';
import {
  createWallet,
  decryptWallet,
  encryptWallet,
  generateMnemonic,
} from '../utils/wallet';
import { isLegacySecrets, migrateSecrets } from '../utils/wallet.legacy';

type WalletData = {
  meta: WalletMeta;
  keychain: SafeKeyWithType[];
  accounts: Account[];
  contacts: Contact[];
};

type WalletState = {
  selectedAccount: number;
  wallet: null | WalletData;
};

type WalletActions = {
  generateMnemonic: () => string;
  createWallet: (
    password: string,
    existingMnemonic?: string,
    name?: string
  ) => void;
  openWallet: (wallet: WalletFile, password: string) => Promise<boolean>;
  unlockWallet: (password: string) => Promise<boolean>;
  lockWallet: () => void;
  wipeWallet: () => void;
  selectAccount: (index: number) => void;
  exportWalletFile: () => void;
  // Operations with secrets
  loadWalletWithSecrets: (password: string) => Promise<Wallet>;
  showMnemonics: (password: string) => Promise<string>;
  addKeyPair: (keypair: AnyKey, password: string) => void;
  addForeignKey: (
    key: { displayName: string; path: string; publicKey: HexString },
    password: string
  ) => void;
  createKeyPair: (
    displayName: string,
    path: string,
    password: string
  ) => Promise<SafeKey>;
  importKeyPair: (
    displayName: string,
    secretKey: HexString,
    password: string
  ) => Promise<SafeKey>;
  revealSecretKey: (
    publicKey: HexString,
    password: string
  ) => Promise<HexString>;
  createAccount: <T extends AnySpawnArguments>(
    displayName: string,
    templateAddress: StdTemplateKeys,
    spawnArguments: T,
    password: string
  ) => Promise<Account<T>>;
};

type WalletSelectors = {
  hasWallet: () => boolean;
  isWalletUnlocked: () => boolean;
  listSecretKeys: (password: string) => Promise<AnyKey[]>;
};

const WALLET_STORE_KEY = 'wallet-file';

const extractData = (wallet: Wallet): WalletData => ({
  meta: wallet.meta,
  keychain: wallet.crypto.keys.map((k) => ({
    ...ensafeKeyPair(k),
    type: getKeyPairType(k),
  })),
  accounts: wallet.crypto.accounts,
  contacts: wallet.crypto.contacts,
});

const useWallet = create<WalletState & WalletActions & WalletSelectors>(
  (set, get) => ({
    selectedAccount: 0,
    wallet: null,
    // Actions
    generateMnemonic: () => generateMnemonic(),
    createWallet: async (password: string, existingMnemonic, name) => {
      const wallet = createWallet(existingMnemonic, name);
      const crypto = await encryptWallet(wallet.crypto, password);
      const file: WalletFile = {
        meta: wallet.meta,
        crypto,
      };
      saveToLocalStorage(WALLET_STORE_KEY, file);

      set({
        wallet: extractData(wallet),
      });
    },
    openWallet: async (wallet: WalletFile, password: string) => {
      try {
        const secrets = await decryptWallet(wallet.crypto, password);
        const migratedSecrets = migrateSecrets(secrets);
        set({
          wallet: extractData({
            meta: wallet.meta,
            crypto: migratedSecrets,
          }),
        });
        const secretsToStore = isLegacySecrets(secrets)
          ? await encryptWallet(migratedSecrets, password)
          : wallet.crypto;

        saveToLocalStorage(WALLET_STORE_KEY, {
          meta: wallet.meta,
          crypto: secretsToStore,
        });
        return true;
      } catch (err) {
        return false;
      }
    },
    unlockWallet: async (password) => {
      const file = loadFromLocalStorage<null | WalletFile>(WALLET_STORE_KEY);
      if (!file || !file.crypto) {
        throw new Error(
          'Cannot unlock wallet: No wallet stored in local storage'
        );
      }
      return get().openWallet(file, password);
    },
    lockWallet: () => set({ wallet: null }),
    wipeWallet: () => {
      removeFromLocalStorage(WALLET_STORE_KEY);
      set({ wallet: null });
    },
    selectAccount: (index) => {
      const state = get();
      if (
        !state.wallet?.accounts?.length ||
        state.wallet?.accounts.length <= index
      ) {
        throw new Error('Account index out of bounds');
      }
      set({ selectedAccount: index });
    },
    exportWalletFile: () => {
      const file = loadFromLocalStorage<null | WalletFile>(WALLET_STORE_KEY);
      if (!file) {
        throw new Error('No wallet to export');
      }
      return fileDownload(
        JSON.stringify(file),
        'wallet.json',
        'application/json'
      );
    },
    // Operations with secrets
    loadWalletWithSecrets: async (password) => {
      const wallet = loadFromLocalStorage<null | WalletFile>(WALLET_STORE_KEY);
      if (!wallet || !wallet.crypto) {
        throw new Error(
          'Cannot unlock wallet: No wallet stored in local storage'
        );
      }
      return {
        meta: wallet.meta,
        crypto: await decryptWallet(wallet.crypto, password),
      };
    },
    showMnemonics: async (password) => {
      const wallet = await get().loadWalletWithSecrets(password);
      return wallet.crypto.mnemonic;
    },
    addKeyPair: async (keypair, password) => {
      const wallet = await get().loadWalletWithSecrets(password);
      // Preparing secret part of the wallet
      const newSecrets = {
        ...wallet.crypto,
        keys: [...wallet.crypto.keys, keypair],
      };
      // Updating App state
      set({
        wallet: extractData({
          meta: wallet.meta,
          crypto: newSecrets,
        }),
      });
      // Saving a wallet file in the storage
      saveToLocalStorage(WALLET_STORE_KEY, {
        ...wallet,
        crypto: await encryptWallet(newSecrets, password),
      });
    },
    addForeignKey: async (key, password) => {
      const newKeyPair: ForeignKey = {
        ...key,
        created: getISODate(),
        origin: KeyOrigin.Ledger,
      };
      return get().addKeyPair(newKeyPair, password);
    },
    createKeyPair: async (displayName, path, password) => {
      const wallet = await get().loadWalletWithSecrets(password);
      // Creating new key pair
      const seed = await bip39.mnemonicToSeedSync(wallet.crypto.mnemonic);
      const keys = Bip32KeyDerivation.deriveFromPath(path, seed);
      const kp: LocalKey = {
        displayName,
        created: getISODate(),
        path,
        publicKey: toHexString(keys.publicKey),
        secretKey: toHexString(keys.secretKey),
      };
      await get().addKeyPair(kp, password);
      return ensafeKeyPair(kp);
    },
    importKeyPair: async (displayName, secretKey, password) => {
      const trimmed = secretKey.replace(/^0x/, '');
      const kp: LocalKey = {
        displayName,
        created: getISODate(),
        publicKey: trimmed.slice(64),
        secretKey: trimmed,
      };
      await get().addKeyPair(kp, password);
      return ensafeKeyPair(kp);
    },
    revealSecretKey: async (publicKey, password) => {
      const wallet = await get().loadWalletWithSecrets(password);
      const kp = wallet.crypto.keys.find((k) => k.publicKey === publicKey);
      if (!kp) {
        throw new Error(`Cannot find a key pair by public key "${publicKey}"`);
      }
      if (!isLocalKey(kp)) {
        throw new Error('Cannot reveal secret key for a foreign key');
      }
      return kp.secretKey;
    },
    createAccount: async (
      displayName,
      templateAddress,
      spawnArguments,
      password
    ) => {
      const acc = {
        displayName,
        templateAddress,
        spawnArguments,
      };
      const wallet = await get().loadWalletWithSecrets(password);
      // Preparing secret part of the wallet
      const newSecrets = {
        ...wallet.crypto,
        accounts: [...wallet.crypto.accounts, acc],
      };
      // Updating App state
      set({
        wallet: extractData({
          meta: wallet.meta,
          crypto: newSecrets,
        }),
      });
      // Saving a wallet file in the storage
      saveToLocalStorage(WALLET_STORE_KEY, {
        ...wallet,
        crypto: await encryptWallet(newSecrets, password),
      });

      return acc;
    },
    // Selectors
    hasWallet: () => {
      const file = loadFromLocalStorage<null | WalletFile>(WALLET_STORE_KEY);
      return !!(file && file.crypto);
    },
    isWalletUnlocked: () => {
      const state = get();
      return !!state.wallet;
    },
    listSecretKeys: async (password: string) => {
      const secrets = await get().loadWalletWithSecrets(password);
      return secrets.crypto.keys;
    },
  })
);

export default useWallet;
