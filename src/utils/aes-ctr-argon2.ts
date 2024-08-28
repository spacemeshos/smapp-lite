import * as aes from 'aes-js';
import * as cryptoJS from 'crypto-js';
import { argon2id } from 'hash-wasm';

import { HexString } from '../types/common';

import { fromHexString, toHexString } from './hexString';

export const CIPHER = 'AES-256-CTR';
export const KDF = 'ARGON2';

//
const ARGON2_ITERATIONS = 7;
const ARGON2_MEMORY = 2 ** 16; // 64MB
const ARGON2_PARALLELISM = 1;
const ARGON2_HASH_LENGTH = 32; // 256 bits

//
export type Argon2Encrypted = {
  cipher: typeof CIPHER;
  cipherParams: { iv: HexString };
  kdf: typeof KDF;
  kdfparams: {
    salt: HexString;
    iterations: number;
    memorySize: number;
    parallelism: number;
  };
  cipherText: HexString;
  mac: HexString;
};

export const isArgon2Encrypted = (data: unknown): data is Argon2Encrypted =>
  typeof data === 'object' &&
  data !== null &&
  'cipher' in data &&
  data.cipher === CIPHER &&
  'cipherParams' in data &&
  'kdf' in data &&
  data.kdf === KDF &&
  'kdfparams' in data &&
  'cipherText' in data &&
  'mac' in data;

//
export const getRandomBytes = (length: number): Uint8Array =>
  crypto.getRandomValues(new Uint8Array(length));

//
export const encrypt = async (
  plaintext: string,
  password: string,
  iterations = ARGON2_ITERATIONS,
  memorySize = ARGON2_MEMORY,
  parallelism = ARGON2_PARALLELISM
): Promise<Argon2Encrypted> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const argon2key = await argon2id({
    password,
    salt,
    iterations,
    memorySize,
    parallelism,
    outputType: 'binary',
    hashLength: ARGON2_HASH_LENGTH,
  });
  const plainTextBytes = aes.utils.utf8.toBytes(plaintext);
  const aesIV = getRandomBytes(16); // 128-bit initial vector (salt)
  // eslint-disable-next-line new-cap
  const aesCTR = new aes.ModeOfOperation.ctr(argon2key, new aes.Counter(aesIV));
  const cipherTextBytes = aesCTR.encrypt(plainTextBytes);
  const cipherTextHex = toHexString(cipherTextBytes);
  const argon2keyHex = toHexString(argon2key);
  const hmac = cryptoJS.HmacSHA256(plaintext, argon2keyHex);

  return {
    kdf: KDF,
    kdfparams: {
      salt: toHexString(salt),
      iterations,
      memorySize,
      parallelism,
    },
    cipher: CIPHER,
    cipherParams: { iv: toHexString(aesIV) },
    cipherText: cipherTextHex,
    mac: hmac.toString(),
  };
};

const decryptHmac = (plaintext: string, key: Uint8Array) => {
  try {
    return cryptoJS.HmacSHA256(plaintext, toHexString(key));
  } catch (err) {
    throw new Error('MAC does not match: wrong password');
  }
};

export const decrypt = async (
  encryptedMsg: Argon2Encrypted,
  password: string
): Promise<string> => {
  const salt = fromHexString(encryptedMsg.kdfparams.salt);
  const argon2key = await argon2id({
    ...encryptedMsg.kdfparams,
    password,
    salt,
    outputType: 'binary',
    hashLength: ARGON2_HASH_LENGTH,
  });

  // eslint-disable-next-line new-cap
  const aesCTR = new aes.ModeOfOperation.ctr(
    argon2key,
    new aes.Counter(fromHexString(encryptedMsg.cipherParams.iv))
  );
  const decryptedBytes = aesCTR.decrypt(fromHexString(encryptedMsg.cipherText));
  const decryptedPlaintext = aes.utils.utf8.fromBytes(decryptedBytes);
  const hmac = decryptHmac(decryptedPlaintext, argon2key);
  if (hmac.toString() !== encryptedMsg.mac) {
    throw new Error('MAC does not match: wrong password');
  }
  return decryptedPlaintext;
};
