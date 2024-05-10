import {
  Account,
  KeyPair,
  WalletSecrets,
  WalletSecretsLegacy,
} from '../types/wallet';

import { TemplateKey } from './templates';

export const isLegacySecrets = (
  secrets: WalletSecrets | WalletSecretsLegacy
): secrets is WalletSecretsLegacy => !Object.hasOwn(secrets, 'keys');

const migrateAccounts = (keys: KeyPair): Account => ({
  displayName: keys.displayName,
  templateAddress: TemplateKey.SingleSig,
  spawnArguments: {
    PublicKey: keys.publicKey,
  },
});

export const migrateSecrets = (
  old: WalletSecrets | WalletSecretsLegacy
): WalletSecrets => {
  if (!isLegacySecrets(old)) {
    return old;
  }

  return {
    mnemonic: old.mnemonic,
    keys: old.accounts,
    accounts: old.accounts.map(migrateAccounts),
    contacts: old.contacts,
  };
};
