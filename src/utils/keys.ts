import { HexString, isHexString } from '../types/common';
import { ForeignKey, KeyMeta, KeyOrigin, KeyPair, LocalKey, SafeKey } from '../types/wallet';

import Bip32KeyDerivation from './bip32';

// Guard utils
/* eslint-disable @typescript-eslint/no-explicit-any */

const hasKeyMeta = (a: any): a is KeyMeta =>
  typeof a.displayName === 'string' &&
  a.displayName.length > 0 &&
  typeof a.created === 'string' &&
  a.created.length > 0;

const hasPath = (a: any): a is { path: string } =>
  typeof a.path === 'string' &&
  new RegExp(
    // eslint-disable-next-line max-len
    `^m/${Bip32KeyDerivation.BIP_PROPOSAL}'/${Bip32KeyDerivation.COIN_TYPE}'/\\d{0,3}'/\\d{0,3}'/\\d{0,3}'$`
  ).test(a.path);

const hasPublicKey = (a: any): a is { publicKey: HexString } =>
  typeof a.publicKey === 'string' && isHexString(a.publicKey);

const hasSecretKey = (a: any): a is { secretKey: HexString } =>
  typeof a.secretKey === 'string' && isHexString(a.secretKey);

const hasOrigin = (a: any): a is { origin: KeyOrigin } =>
  typeof a.origin === 'number';

// Guards
export const isAnyKey = (a: any): a is KeyPair =>
  hasKeyMeta(a) && hasPath(a) && hasPublicKey(a);

export const isSafeKey = (a: any): a is SafeKey =>
  isAnyKey(a) && !hasSecretKey(a);

export const isForeignKey = (a: any): a is ForeignKey =>
  isSafeKey(a) && hasOrigin(a);

export const isLocalKey = (a: any): a is LocalKey =>
  isAnyKey(a) && hasSecretKey(a);
