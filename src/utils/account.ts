import { StdPublicKeys } from '@spacemesh/sm-codec';

import { AccountWithAddress, SafeKeyWithType } from '../types/wallet';

import {
  AnySpawnArguments,
  MultiSigSpawnArguments,
  SingleSigSpawnArguments,
  VaultSpawnArguments,
  VestingSpawnArguments,
} from './templates';

export const isSingleSigAccount = (
  acc: AccountWithAddress
): acc is AccountWithAddress<SingleSigSpawnArguments> =>
  acc.templateAddress === StdPublicKeys.SingleSig;

export const isMultiSigAccount = (
  acc: AccountWithAddress
): acc is AccountWithAddress<MultiSigSpawnArguments> =>
  acc.templateAddress === StdPublicKeys.MultiSig;

export const isVaultAccount = (
  acc: AccountWithAddress
): acc is AccountWithAddress<VaultSpawnArguments> =>
  acc.templateAddress === StdPublicKeys.Vault;

export const isVestingAccount = (
  acc: AccountWithAddress
): acc is AccountWithAddress<VestingSpawnArguments> =>
  acc.templateAddress === StdPublicKeys.Vesting;

export const isAnyMultiSig = <T extends AnySpawnArguments>(
  account: AccountWithAddress<T>
): boolean =>
  account.templateAddress === StdPublicKeys.MultiSig ||
  account.templateAddress === StdPublicKeys.Vesting;

export const isAnyAccount = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  account: any
): account is AccountWithAddress<AnySpawnArguments> =>
  isSingleSigAccount(account) ||
  isMultiSigAccount(account) ||
  isVestingAccount(account) ||
  isVaultAccount(account);

export const extractRequiredSignatures = <T extends AnySpawnArguments>(
  account: AccountWithAddress<T>
): 0 | number => {
  // Zero is a special value for SingleSig
  if (
    account.templateAddress === StdPublicKeys.MultiSig ||
    account.templateAddress === StdPublicKeys.Vesting
  ) {
    const mSigAcc = account as AccountWithAddress<MultiSigSpawnArguments>;
    return mSigAcc.spawnArguments.Required;
  }
  return 0;
};

export const extractEligibleKeys = <T extends AnySpawnArguments>(
  account: AccountWithAddress<T>,
  accountList: AccountWithAddress<AnySpawnArguments>[],
  keychain: SafeKeyWithType[],
  excludeRefs: number[] = []
): SafeKeyWithType[] => {
  if (account.templateAddress === StdPublicKeys.SingleSig) {
    const typedAcc = account as AccountWithAddress<SingleSigSpawnArguments>;
    return (keychain || []).filter(
      (kp) => kp.publicKey === typedAcc.spawnArguments.PublicKey
    );
  }
  if (account.templateAddress === StdPublicKeys.Vault) {
    const typedAcc = account as AccountWithAddress<VaultSpawnArguments>;
    const ownerAcc = accountList.find(
      (acc) => acc.address === typedAcc.spawnArguments.Owner
    );
    return ownerAcc ? extractEligibleKeys(ownerAcc, accountList, keychain) : [];
  }
  if (
    account.templateAddress === StdPublicKeys.MultiSig ||
    account.templateAddress === StdPublicKeys.Vesting
  ) {
    const typedAcc = account as AccountWithAddress<MultiSigSpawnArguments>;
    const keys = typedAcc.spawnArguments.PublicKeys.filter(
      (k, i) => !excludeRefs.includes(i)
    );
    return (keychain || []).filter((kp) => keys.includes(kp.publicKey));
  }
  return [];
};

const zeroOrMore = (n: bigint): bigint => (n >= 0n ? n : 0n);
export const getVaultUnlockedAmount = (
  args: VaultSpawnArguments,
  currentLayer: number,
  currentBalance: bigint
) => {
  const vestingPeriod = BigInt(args.VestingEnd) - BigInt(args.VestingStart);
  const layersPassed = BigInt(currentLayer) - BigInt(args.VestingStart);
  const vestedLayers =
    layersPassed < vestingPeriod ? layersPassed : vestingPeriod;
  const vestingPerLayer = BigInt(args.TotalAmount) / vestingPeriod;
  const totalUnlocked = vestedLayers * vestingPerLayer;
  const alreadySpent = BigInt(args.TotalAmount) - currentBalance;
  const available = totalUnlocked - alreadySpent;
  return {
    totalUnlocked: zeroOrMore(totalUnlocked),
    available: zeroOrMore(available),
  };
};
export const getKeysByAccount = (
  acc: AccountWithAddress,
  keys: SafeKeyWithType[]
) => {
  switch (acc.templateAddress) {
    case StdPublicKeys.SingleSig: {
      const pk = (acc.spawnArguments as SingleSigSpawnArguments).PublicKey;
      return keys.filter((k) => k.publicKey === pk);
    }
    case StdPublicKeys.MultiSig:
    case StdPublicKeys.Vesting: {
      const pks = (acc.spawnArguments as MultiSigSpawnArguments).PublicKeys;
      return keys.filter((k) => pks.includes(k.publicKey));
    }
    case StdPublicKeys.Vault: {
      const pk = (acc.spawnArguments as VaultSpawnArguments).Owner;
      return keys.filter((k) => k.publicKey === pk);
    }
    default: {
      throw new Error('Unknown account type');
    }
  }
};
