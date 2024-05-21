import { O } from '@mobily/ts-belt';
import { StdTemplateKeys } from '@spacemesh/sm-codec';

import useWallet from '../store/useWallet'
import { Account, AccountWithAddress } from '../types/wallet';
import { AnySpawnArguments } from '../utils/templates';
import { computeAddress } from '../utils/wallet';

export const useAccountsList = (hrp: string): AccountWithAddress[] => {
  const { wallet } = useWallet();
  const accounts: Account<AnySpawnArguments>[] = wallet?.accounts ?? [];
  return accounts.map((acc) => ({
    ...acc,
    address: computeAddress(
      hrp,
      acc.templateAddress as StdTemplateKeys,
      acc.spawnArguments
    ),
  }));
};

export const useCurrentAccount = (
  hrp: string
): O.Option<AccountWithAddress> => {
  const { selectedAccount } = useWallet();
  const accounts = useAccountsList(hrp);
  const acc = accounts[selectedAccount];
  return O.fromNullable(acc);
};
