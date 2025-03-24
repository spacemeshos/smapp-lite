import { bech32 } from 'bech32';

import {
  Athena,
  MultiSigTemplate,
  SingleSigTemplate,
  StdMethods,
  StdPublicKeys,
  StdTemplateKeys,
  TemeplateArgumentsMap,
  VaultTemplate,
  VestingTemplate,
} from '@spacemesh/sm-codec';
import { METHODS_HEX } from '@spacemesh/sm-codec/lib/athena/wallet';

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
  AthenaWallet = 'Athena.Wallet',
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
  TotalAmount: string;
  InitialUnlockAmount: string;
  VestingStart: number;
  VestingEnd: number;
};

export type AthenaSpawnArguments = {
  Nonce: number;
  Balance: number;
  PublicKey: HexString;
};

export type AnySpawnArguments =
  | SingleSigSpawnArguments
  | MultiSigSpawnArguments
  | VaultSpawnArguments
  | AthenaSpawnArguments;

export enum MethodName {
  Unknown = 'Unknown Method',
  Spawn = 'Spawn',
  Spend = 'Spend',
  Drain = 'Drain',
  Deploy = 'Deploy',
}

export enum MethodSelectors {
  Spawn = StdMethods.Spawn,
  Spend = StdMethods.Spend,
  Drain = StdMethods.Drain,
}

export enum MethodSelectorStrings {
  Spawn = '0',
  Spend = '16',
  Drain = '17',
  Deploy = 'e24cc333', // Athena
}

export const MethodNamesMap = {
  [MethodSelectors.Spawn]: MethodName.Spawn,
  [MethodSelectors.Spend]: MethodName.Spend,
  [MethodSelectors.Drain]: MethodName.Drain,
  [METHODS_HEX.SPAWN]: MethodName.Spawn,
  [METHODS_HEX.SPEND]: MethodName.Spend,
  [METHODS_HEX.DEPLOY]: MethodName.Deploy,
} as const;

export const TemplateMethodsMap = {
  [StdPublicKeys.SingleSig]: [
    MethodSelectorStrings.Spawn,
    MethodSelectorStrings.Spend,
    METHODS_HEX.DEPLOY,
  ],
  [StdPublicKeys.MultiSig]: [
    MethodSelectorStrings.Spawn,
    MethodSelectorStrings.Spend,
  ],
  [StdPublicKeys.Vault]: [
    MethodSelectorStrings.Spawn,
    MethodSelectorStrings.Spend,
  ],
  [StdPublicKeys.Vesting]: [
    MethodSelectorStrings.Spawn,
    MethodSelectorStrings.Spend,
    MethodSelectorStrings.Drain,
  ],
};

//
// Utils
//

export const athenaSuffix = (key: HexString): string => `A${key}`;
export const parseTemplateKey = (key: string): HexString =>
  key?.[0] === 'A' ? key.slice(1) : key;

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
    case athenaSuffix(Athena.Wallet.TEMPLATE_PUBKEY_HEX):
      return TemplateName.AthenaWallet;
    default:
      return TemplateName.Unknown;
  }
};

export const getTemplateNameByAddress = (
  address: Bech32Address,
  isAthena = false
): TemplateName => {
  const pk = toHexString(bech32.fromWords(bech32.decode(address).words));
  return getTemplateNameByKey(isAthena ? athenaSuffix(pk) : pk);
};

export const getMethodName = (methodSelector: number | HexString) =>
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
  method: string
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
      if (method === MethodSelectorStrings.Spawn) {
        return SingleSigTemplate.methods[0];
      }
      if (method === MethodSelectorStrings.Spend) {
        return SingleSigTemplate.methods[16];
      }
      return throwUnsupportedMethodError();
    }
    case StdPublicKeys.MultiSig: {
      if (method === MethodSelectorStrings.Spawn) {
        return MultiSigTemplate.methods[0];
      }
      if (method === MethodSelectorStrings.Spend) {
        return MultiSigTemplate.methods[16];
      }
      return throwUnsupportedMethodError();
    }
    case StdPublicKeys.Vault: {
      if (method === MethodSelectorStrings.Spawn) {
        return VaultTemplate.methods[0];
      }
      if (method === MethodSelectorStrings.Spend) {
        return VaultTemplate.methods[16];
      }
      return throwUnsupportedMethodError();
    }
    case StdPublicKeys.Vesting: {
      if (method === MethodSelectorStrings.Spawn) {
        return VestingTemplate.methods[0];
      }
      if (method === MethodSelectorStrings.Spend) {
        return VestingTemplate.methods[16];
      }
      if (method === MethodSelectorStrings.Drain) {
        return VestingTemplate.methods[17];
      }
      return throwUnsupportedMethodError();
    }
    default: {
      throw new Error(`Unknown template: ${templateAddress}`);
    }
  }
};
