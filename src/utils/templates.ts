import { bech32 } from 'bech32';

import {
  MultiSigTemplate,
  SingleSigTemplate,
  StdMethods,
  StdPublicKeys,
  StdTemplateKeys,
  TemeplateArgumentsMap,
  VaultTemplate,
  VestingTemplate,
} from '@spacemesh/sm-codec';

import { Bech32Address, HexString } from '../types/common';

import { getWords } from './bech32';
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

export type VestingSpawnArguments = MultiSigSpawnArguments;

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

export enum MethodName {
  Unknown = 'Unknown Method',
  Spawn = 'Spawn',
  Spend = 'Spend',
  Drain = 'Drain',
}

export enum MethodSelectors {
  Spawn = StdMethods.Spawn,
  Spend = StdMethods.Spend,
  Drain = StdMethods.Drain,
}

export const MethodNamesMap = {
  [MethodSelectors.Spawn]: MethodName.Spawn,
  [MethodSelectors.Spend]: MethodName.Spend,
  [MethodSelectors.Drain]: MethodName.Drain,
} as const;

export const TemplateMethodsMap = {
  [StdPublicKeys.SingleSig]: [MethodSelectors.Spawn, MethodSelectors.Spend],
  [StdPublicKeys.MultiSig]: [MethodSelectors.Spawn, MethodSelectors.Spend],
  [StdPublicKeys.Vault]: [MethodSelectors.Spawn, MethodSelectors.Spend],
  [StdPublicKeys.Vesting]: [MethodSelectors.Spawn, MethodSelectors.Drain],
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

export const getMethodName = (methodSelector: number) =>
  MethodNamesMap[methodSelector as keyof typeof MethodNamesMap] ??
  MethodName.Unknown;

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
      Owner: getWords(args.Owner),
      TotalAmount: BigInt(args.TotalAmount),
      InitialUnlockAmount: BigInt(args.InitialUnlockAmount),
      VestingStart: BigInt(args.VestingStart),
      VestingEnd: BigInt(args.VestingEnd),
    };
  }

  throw new Error('Cannot convert spawn arguments: Unknown template key');
};

export const getTemplateMethod = (
  templateAddress: HexString,
  method: number
) => {
  const throwUnsupportedMethodError = () => {
    throw new Error(
      `Template ${getTemplateNameByKey(
        templateAddress
      )} does not supported method ${method}`
    );
  };

  switch (templateAddress) {
    case StdPublicKeys.SingleSig: {
      if (method === MethodSelectors.Spawn) {
        return SingleSigTemplate.methods[0];
      }
      if (method === MethodSelectors.Spend) {
        return SingleSigTemplate.methods[16];
      }
      return throwUnsupportedMethodError();
    }
    case StdPublicKeys.MultiSig: {
      if (method === MethodSelectors.Spawn) {
        return MultiSigTemplate.methods[0];
      }
      if (method === MethodSelectors.Spend) {
        return MultiSigTemplate.methods[16];
      }
      return throwUnsupportedMethodError();
    }
    case StdPublicKeys.Vault: {
      if (method === MethodSelectors.Spawn) {
        return VaultTemplate.methods[0];
      }
      if (method === MethodSelectors.Spend) {
        return VaultTemplate.methods[16];
      }
      return throwUnsupportedMethodError();
    }
    case StdPublicKeys.Vesting: {
      if (method === MethodSelectors.Spawn) {
        return VestingTemplate.methods[0];
      }
      if (method === MethodSelectors.Drain) {
        return VestingTemplate.methods[17];
      }
      return throwUnsupportedMethodError();
    }
    default: {
      throw new Error(`Unknown template: ${templateAddress}`);
    }
  }
};
