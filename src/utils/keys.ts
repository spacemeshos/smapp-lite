import { HexString, isHexString } from '../types/common';
import {
  ForeignKey,
  KeyOrigin,
  KeyPair,
  KeyPairType,
  LocalKey,
  SafeKey,
} from '../types/wallet';

// Guard utils
/* eslint-disable @typescript-eslint/no-explicit-any */

const hasPublicKey = (a: any): a is { publicKey: HexString } =>
  typeof a.publicKey === 'string' && isHexString(a.publicKey);

const hasSecretKey = (a: any): a is { secretKey: HexString } =>
  typeof a.secretKey === 'string' && isHexString(a.secretKey);

const hasOrigin = (a: any): a is { origin: KeyOrigin } =>
  typeof a.origin === 'number';

// Guards
export const isAnyKey = (a: any): a is KeyPair => hasPublicKey(a);

export const isSafeKey = (a: any): a is SafeKey =>
  isAnyKey(a) && !hasSecretKey(a);

export const isForeignKey = (a: any): a is ForeignKey =>
  isSafeKey(a) && hasOrigin(a);

export const isLocalKey = (a: any): a is LocalKey =>
  isAnyKey(a) && hasSecretKey(a);

// Utils

export const ensafeKeyPair = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  secretKey,
  ...safeKeyPair
}: KeyPair): SafeKey => safeKeyPair;

export const getKeyPairType = (key: KeyPair) =>
  isLocalKey(key) ? KeyPairType.Software : KeyPairType.Hardware;
