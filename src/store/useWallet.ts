import fileDownload from 'js-file-download';
import { create } from 'zustand';

import { O } from '@mobily/ts-belt';

import {
  Account,
  Contact,
  KeyPair,
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
  createWallet,
  decryptWallet,
  deriveAccount,
  encryptWallet,
  generateMnemonic,
} from '../utils/wallet';

type WalletData = {
  meta: WalletMeta;
  keychain: Omit<KeyPair, 'secretKey'>[];
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
  importWallet: (wallet: WalletFile, password: string) => Promise<boolean>;
  lockWallet: () => void;
  wipeWallet: () => void;
  selectAccount: (index: number) => void;
  exportWalletFile: () => void;
};

type WalletSelectors = {
  hasWallet: () => boolean;
  isWalletUnlocked: () => boolean;
  listAccounts: (hrp?: string) => Account[];
  getCurrentAccount: (hrp?: string) => O.Option<Account>;
};

const WALLET_STORE_KEY = 'wallet-file';

const extractData = (wallet: Wallet): WalletData => ({
  meta: wallet.meta,
  keychain: wallet.crypto.accounts.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ secretKey, ...safeKeyPair }) => safeKeyPair
  ),
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
        set({
          wallet: extractData({
            meta: wallet.meta,
            crypto: secrets,
          }),
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
      return get().importWallet(file, password);
    },
    importWallet: async (wallet: WalletFile, password: string) => {
      const success = await get().openWallet(wallet, password);
      if (success) {
        saveToLocalStorage(WALLET_STORE_KEY, wallet);
      }
      return success;
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
    // Selectors
    hasWallet: () => {
      const file = loadFromLocalStorage<null | WalletFile>(WALLET_STORE_KEY);
      return !!(file && file.crypto);
    },
    isWalletUnlocked: () => {
      const state = get();
      return !!state.wallet;
    },
    listAccounts: (hrp = DEFAULT_HRP) => {
      const keychain = get().wallet?.keychain ?? [];
      return keychain.map((keypair) => deriveAccount(hrp, keypair));
    },
    getCurrentAccount: (hrp = DEFAULT_HRP) => {
      const state = get();
      const keypair = state.wallet?.keychain[state.selectedAccount];
      return O.fromNullable(keypair ? deriveAccount(hrp, keypair) : null);
    },
  })
);

export default useWallet;
