import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

const WalletCreationContext = createContext({
  mnemonic: '',
  password: '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setMnemonic: (mnemonic: string): void => {
    throw new Error('setMnemonic was called outside of WalletCreationProvider');
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setPassword: (password: string): void => {
    throw new Error('setPassword was called outside of WalletCreationProvider');
  },
});

export function WalletCreationProvider({
  children,
}: PropsWithChildren): JSX.Element {
  const [{ mnemonic, password }, setWalletData] = useState({
    mnemonic: '',
    password: '',
  });

  const setMnemonic = (newMnemonic: string) =>
    setWalletData({ password, mnemonic: newMnemonic });

  const setPassword = (newPassword: string) =>
    setWalletData({ mnemonic, password: newPassword });

  const contextState = useMemo(
    () => ({
      mnemonic,
      password,
      setMnemonic,
      setPassword,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mnemonic, password]
  );

  return (
    <WalletCreationContext.Provider value={contextState}>
      {children}
    </WalletCreationContext.Provider>
  );
}

export const useWalletCreation = () => useContext(WalletCreationContext);
