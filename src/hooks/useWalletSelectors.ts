import { useMemo } from 'react';

import { O } from '@mobily/ts-belt';
import { StdTemplateKeys } from '@spacemesh/sm-codec';

import useWallet from '../store/useWallet';
import { Account, AccountWithAddress, KeyPairType } from '../types/wallet';
import {
  isMultiSigAccount,
  isSingleSigAccount,
  isVaultAccount,
  isVestingAccount,
} from '../utils/account';
import { AnySpawnArguments } from '../utils/templates';
import { computeAddress } from '../utils/wallet';

export const useAccountsList = (hrp: string): AccountWithAddress[] => {
  const { wallet } = useWallet();
  const accs = wallet?.accounts;
  return useMemo(() => {
    const accounts: Account<AnySpawnArguments>[] = accs ?? [];
    return accounts.map((acc) => ({
      ...acc,
      address: computeAddress(
        hrp,
        acc.templateAddress as StdTemplateKeys,
        acc.spawnArguments
      ),
    }));
  }, [accs, hrp]);
};

export const useCurrentAccount = (
  hrp: string
): O.Option<AccountWithAddress> => {
  const { selectedAccount } = useWallet();
  const accounts = useAccountsList(hrp);
  const acc = accounts[selectedAccount];
  return O.fromNullable(acc);
};

export const useIsLedgerAccount = () => {
  const { wallet } = useWallet();
  return (account: AccountWithAddress) => {
    if (!wallet) return false;
    // TODO
    if (isSingleSigAccount(account)) {
      const key = wallet.keychain.find(
        (k) => k.publicKey === account.spawnArguments.PublicKey
      );
      return key?.type === KeyPairType.Hardware;
    }
    if (isMultiSigAccount(account) || isVestingAccount(account)) {
      const keys = wallet.keychain.filter((k) =>
        account.spawnArguments.PublicKeys.includes(k.publicKey)
      );
      return keys.some((k) => k.type === KeyPairType.Hardware);
    }
    if (isVaultAccount(account)) {
      // It has no key, so it cannot be ledger
      return false;
    }

    // Any other cases are unexpected and default to `false`
    return false;
  };
};
