import fileDownload from 'js-file-download';
import { create } from 'zustand';

import { O } from '@mobily/ts-belt';
import { StdTemplateKeys, TemeplateArgumentsMap } from '@spacemesh/sm-codec';

import {
  Account,
  AccountWithAddress,
  AnyKey,
  Contact,
  SafeKey,
  Wallet,
  WalletFile,
  WalletMeta,
} from '../types/wallet';
import { DEFAULT_HRP } from '../utils/constants';
import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from '../utils/localStorage';
import {
  computeAddress,
  createWallet,
  decryptWallet,
  encryptWallet,
  generateMnemonic,
} from '../utils/wallet';
import { isLegacySecrets, migrateSecrets } from '../utils/wallet.legacy';

type WalletData = {
  meta: WalletMeta;
  keychain: SafeKey[];
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
  unlockSecrets: (password: string) => Promise<Wallet>;
  showMnemonics: (password: string) => Promise<string>;
};

type WalletSelectors = {
  hasWallet: () => boolean;
  isWalletUnlocked: () => boolean;
  listKeys: () => SafeKey[];
  listSecretKeys: (password: string) => Promise<AnyKey[]>;
  listAccounts: (hrp?: string) => AccountWithAddress[];
  getCurrentAccount: (hrp?: string) => O.Option<AccountWithAddress>;
};

const WALLET_STORE_KEY = 'wallet-file';

const extractData = (wallet: Wallet): WalletData => ({
  meta: wallet.meta,
  keychain: wallet.crypto.keys.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ secretKey, ...safeKeyPair }) => safeKeyPair
  ),
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
        !state.wallet?.keychain?.length ||
        state.wallet?.keychain.length <= index
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
    unlockSecrets: async (password) => {
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
      const wallet = await get().unlockSecrets(password);
      return wallet.crypto.mnemonic;
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
    listKeys: () => get().wallet?.keychain ?? [],
    listSecretKeys: async (password: string) => {
      const secrets = await get().unlockSecrets(password);
      return secrets.crypto.keys;
    },
    listAccounts: (hrp = DEFAULT_HRP) => {
      const accounts = get().wallet?.accounts ?? <Account[]>[];
      return accounts.map((acc) => ({
        ...acc,
        address: computeAddress(
          hrp,
          acc.templateAddress as StdTemplateKeys,
          acc.spawnArguments as TemeplateArgumentsMap[StdTemplateKeys][0]
        ),
      }));
    },
    getCurrentAccount: (hrp = DEFAULT_HRP) => {
      const state = get();
      const acc = state.listAccounts(hrp)[state.selectedAccount];
      return O.fromNullable(acc);
    },
  })
);

export default useWallet;
