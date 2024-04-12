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
