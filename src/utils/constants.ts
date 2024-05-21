import { AccountStates } from '../types/account';

export const MINUTE = 60 * 1000;

export const DEFAULT_HRP = 'sm';

export const DEFAULT_ACCOUNT_STATES: AccountStates = {
  current: {
    balance: '0',
    nonce: '0',
  },
  projected: {
    balance: '0',
    nonce: '0',
  },
};

export const DEFAULT_EXPLORER_URL = 'https://explorer.spacemesh.io';

export const BUTTON_ICON_SIZE = 16;

export const MAX_MULTISIG_AMOUNT = 10;
