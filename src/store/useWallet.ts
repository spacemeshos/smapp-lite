import { create } from 'zustand';

import {
  Contact,
  KeyPair,
  Wallet,
  WalletFile,
  WalletMeta,
} from '../types/wallet';
import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from '../utils/localStorage';
import {
  createWallet,
  decryptWallet,
  encryptWallet,
  generateMnemonic,
} from '../utils/wallet';

type WalletData = {
  meta: WalletMeta;
  keychain: Omit<KeyPair, 'secretKey'>[];
  contacts: Contact[];
};

type WalletState = {
  wallet: null | WalletData;
};

type WalletActions = {
  generateMnemonic: () => string;
  createWallet: (
    password: string,
    existingMnemonic?: string,
    name?: string
  ) => void;
  unlockWallet: (password: string) => Promise<boolean>;
  lockWallet: () => void;
  wipeWallet: () => void;
};

type WalletSelectors = {
  hasWallet: () => boolean;
  isWalletUnlocked: () => boolean;
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
    wallet: null,
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
    unlockWallet: async (password) => {
      const file = loadFromLocalStorage<null | WalletFile>(WALLET_STORE_KEY);
      if (!file || !file.crypto) {
        throw new Error(
          'Cannot unlock wallet: No wallet stored in local storage'
        );
      }

      try {
        const secrets = await decryptWallet(file.crypto, password);
        set({
          wallet: extractData({
            meta: file.meta,
            crypto: secrets,
          }),
        });
        return true;
      } catch (err) {
        return false;
      }
    },
    lockWallet: () => set({ wallet: null }),
    wipeWallet: () => {
      removeFromLocalStorage(WALLET_STORE_KEY);
      set({ wallet: null });
    },
    hasWallet: () => {
      const file = loadFromLocalStorage<null | WalletFile>(WALLET_STORE_KEY);
      return !!(file && file.crypto);
    },
    isWalletUnlocked: () => {
      const state = get();
      return !!state.wallet;
    },
  })
);

export default useWallet;
