import { bech32 } from 'bech32';

import { Bech32Address } from '../types/common';

import { toHexString } from './hexString';

export enum TemplateAddresses {
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

export const getTemplateName = (address: Bech32Address): TemplateName => {
  const pk = toHexString(bech32.fromWords(bech32.decode(address).words));
  switch (pk) {
    case TemplateAddresses.SingleSig:
      return TemplateName.SingleSig;
    case TemplateAddresses.MultiSig:
      return TemplateName.MultiSig;
    case TemplateAddresses.Vesting:
      return TemplateName.Vesting;
    case TemplateAddresses.Vault:
      return TemplateName.Vault;
    default:
      return TemplateName.Unknown;
  }
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
