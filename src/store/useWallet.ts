import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  Account,
  Contact,
  KeyPair,
  Wallet,
  WalletFile,
  WalletMeta,
} from '../types/wallet';
import { removeFromLocalStorage } from '../utils/localStorage';
import { createWallet } from '../utils/wallet';

import { createSelectors } from './createSelectors';

type WalletData = {
  meta: WalletMeta;
  keychain: Omit<KeyPair, 'secretKey'>[];
  contacts: Contact[];
};

type WalletState = {
  wallet: null | WalletData;
};

type WalletActions = {
  createWallet: (existingMnemonic?: string, name?: string) => void;
  unlockWallet: (password: string) => void;
  lockWallet: () => void;
  wipeWallet: () => void;
};

const WALLET_STORE_KEY = 'wallet-file';

const useWallet = create<WalletState & WalletActions>((set, get) => ({
  wallet: null,
  createWallet: (existingMnemonic, name) => {
    const wallet = createWallet(existingMnemonic, name);
    set({
      wallet: {
        meta: wallet.meta,
        keychain: wallet.crypto.accounts.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ secretKey, ...safeKeyPair }) => safeKeyPair
        ),
        contacts: wallet.crypto.contacts,
      },
    });
  },
  unlockWallet: (password) => {
    // TODO
  },
  lockWallet: () => set({ wallet: null }),
  wipeWallet: () => {
    removeFromLocalStorage(WALLET_STORE_KEY);
    set({ wallet: null });
  },
}));

export default createSelectors(useWallet);
