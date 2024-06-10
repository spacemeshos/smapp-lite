import { StdPublicKeys } from '@spacemesh/sm-codec';

import { AccountWithAddress } from '../types/wallet';

import {
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
