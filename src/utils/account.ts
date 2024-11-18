import { Athena, StdPublicKeys } from '@spacemesh/sm-codec';

import { HexString } from '../types/common';
import { AccountWithAddress, SafeKeyWithType } from '../types/wallet';

import {
  AnySpawnArguments,
  AthenaSpawnArguments,
  MultiSigSpawnArguments,
  SingleSigSpawnArguments,
  VaultSpawnArguments,
  VestingSpawnArguments,
} from './templates';

export const isSingleSigAccount = (
  acc: AccountWithAddress
): acc is AccountWithAddress<SingleSigSpawnArguments> =>
  acc.templateAddress === StdPublicKeys.SingleSig && !acc.isAthena;

export const isAthenaWalletAccount = (
  acc: AccountWithAddress
): acc is AccountWithAddress<AthenaSpawnArguments> =>
  acc.templateAddress === Athena.Wallet.TEMPLATE_PUBKEY_HEX && !!acc.isAthena;

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

const accumulatedVestedAtLayer = (args: VaultSpawnArguments, layer: number) => {
  if (layer < args.VestingStart) return 0n;
  if (layer >= args.VestingEnd) return BigInt(args.TotalAmount);

  const vestingPeriod = BigInt(args.VestingEnd) - BigInt(args.VestingStart);
  const layersPassed = BigInt(layer) - BigInt(args.VestingStart) + 1n;
  const vestedLayers =
    layersPassed < vestingPeriod ? zeroOrMore(layersPassed) : vestingPeriod;
  const vestedPerLayer = BigInt(args.TotalAmount) / vestingPeriod;
  return vestedLayers * vestedPerLayer;
};

const vestAtLayer = (args: VaultSpawnArguments, layer: number) => {
  if (layer < BigInt(args.VestingStart) || layer > BigInt(args.VestingEnd))
    return 0n;

  const prevLayerVested = accumulatedVestedAtLayer(args, layer - 1);
  const curLayerVested = accumulatedVestedAtLayer(args, layer);
  return curLayerVested - prevLayerVested;
};

const unlockedAtLayer = (args: VaultSpawnArguments, layer: number) => {
  const acc = accumulatedVestedAtLayer(args, layer - 1);
  const vest = vestAtLayer(args, layer);
  return acc + vest;
};

export const getVaultUnlockedAmount = (
  args: VaultSpawnArguments,
  layer: number,
  balanceAtLayer: bigint
) => {
  const totalUnlocked = unlockedAtLayer(args, layer);
  const alreadySpent = BigInt(args.TotalAmount) - balanceAtLayer;
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

export const getUsedPublicKeys = (
  accounts: AccountWithAddress[],
  keys: SafeKeyWithType[]
): Set<HexString> => {
  const set = new Set<HexString>();
  accounts.forEach((acc) => {
    getKeysByAccount(acc, keys).forEach((k) => set.add(k.publicKey));
  });
  return set;
};

export function findUnusedKey(
  keys: SafeKeyWithType[],
  accounts: AccountWithAddress[]
): SafeKeyWithType | null;
export function findUnusedKey(
  keys: SafeKeyWithType[],
  usedPublicKeys: Set<HexString>
): SafeKeyWithType | null;
export function findUnusedKey(
  keys: SafeKeyWithType[],
  findIn: AccountWithAddress[] | Set<HexString>
): SafeKeyWithType | null {
  const usedKeys =
    findIn instanceof Set ? findIn : getUsedPublicKeys(findIn, keys);
  return keys.find((k) => !usedKeys.has(k.publicKey)) || null;
}
