import { bech32 } from 'bech32';

import {
  StdPublicKeys,
  StdTemplateKeys,
  TemeplateArgumentsMap,
} from '@spacemesh/sm-codec';

import { Bech32Address, HexString } from '../types/common';

import { fromHexString, toHexString } from './hexString';

export const TemplateKey = StdPublicKeys;

export enum TemplateName {
  Unknown = 'Unknown Template',
  SingleSig = 'Single Signature',
  MultiSig = 'Multiple Signatures',
  Vesting = 'Vesting Account',
  Vault = 'Vault',
}

export type SingleSigSpawnArguments = {
  PublicKey: HexString;
};

export type MultiSigSpawnArguments = {
  Required: number;
  PublicKeys: HexString[];
};

export type VaultSpawnArguments = {
  Owner: HexString;
  TotalAmount: number;
  InitialUnlockAmount: number;
  VestingStart: number;
  VestingEnd: number;
};

export type AnySpawnArguments =
  | SingleSigSpawnArguments
  | MultiSigSpawnArguments
  | VaultSpawnArguments;
//
// Utils
//

export const getTemplateNameByKey = (key: HexString): TemplateName => {
  switch (key) {
    case TemplateKey.SingleSig:
      return TemplateName.SingleSig;
    case TemplateKey.MultiSig:
      return TemplateName.MultiSig;
    case TemplateKey.Vesting:
      return TemplateName.Vesting;
    case TemplateKey.Vault:
      return TemplateName.Vault;
    default:
      return TemplateName.Unknown;
  }
};

export const getTemplateNameByAddress = (
  address: Bech32Address
): TemplateName => {
  const pk = toHexString(bech32.fromWords(bech32.decode(address).words));
  return getTemplateNameByKey(pk);
};

export enum MethodName {
  Unknown = 'Unknown Method',
  SelfSpawn = 'Self Spawn',
  Spend = 'Spend',
  Drain = 'Drain',
}

export const MethodNamesMap: { [key: number]: MethodName } = {
  0: MethodName.SelfSpawn,
  16: MethodName.Spend,
  17: MethodName.Drain,
};

export const getMethodName = (methodSelector: number) =>
  MethodNamesMap[methodSelector] ?? MethodName.Unknown;

export const convertSpawnArgumentsForEncoding = <T extends StdTemplateKeys>(
  tpl: T,
  spawnArgs: AnySpawnArguments
): TemeplateArgumentsMap[T][0] => {
  if (tpl === StdPublicKeys.SingleSig) {
    const args = spawnArgs as SingleSigSpawnArguments;
    return {
      PublicKey: fromHexString(args.PublicKey),
    };
  }
  if (tpl === StdPublicKeys.MultiSig || tpl === StdPublicKeys.Vesting) {
    const args = spawnArgs as MultiSigSpawnArguments;
    return {
      Required: BigInt(args.Required),
      PublicKeys: args.PublicKeys.map(fromHexString),
    };
  }
  if (tpl === StdPublicKeys.Vault) {
    const args = spawnArgs as VaultSpawnArguments;
    return {
      Owner: fromHexString(args.Owner),
      TotalAmount: BigInt(args.TotalAmount),
      InitialUnlockAmount: BigInt(args.InitialUnlockAmount),
      VestingStart: BigInt(args.VestingStart),
      VestingEnd: BigInt(args.VestingEnd),
    };
  }

  throw new Error('Cannot convert spawn arguments: Unknown template key');
};
