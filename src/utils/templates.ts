import { bech32 } from 'bech32';

import { Bech32Address, HexString } from '../types/common';

import { toHexString } from './hexString';

export enum TemplateKey {
  SingleSig = '000000000000000000000000000000000000000000000001',
  MultiSig = '000000000000000000000000000000000000000000000002',
  Vesting = '000000000000000000000000000000000000000000000003',
  Vault = '000000000000000000000000000000000000000000000004',
}

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
  TotalAmount: bigint;
  InitialUnlockAmount: bigint;
  VestingStart: number;
  VestingEnd: number;
};

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
