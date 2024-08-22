import * as aes from 'aes-js';

import { HexString } from '../types/common';

import { fromHexString, toHexString } from './hexString';

const { subtle } = crypto;

export const CIPHER = 'AES-GCM';
export const KDF = 'PBKDF2';

//
const KDF_DKLEN = 256;
const KDF_ITERATIONS = 120000;

//
export interface GCMEncrypted {
  cipher: typeof CIPHER;
  cipherParams: {
    iv: HexString;
  };
  kdf: typeof KDF;
  kdfparams: {
    dklen: number;
    hash: 'SHA-512';
    iterations: number;
    salt: HexString;
  };
  cipherText: string;
}

export const isGCMEncrypted = (data: unknown): data is GCMEncrypted =>
  typeof data === 'object' &&
  data !== null &&
  'cipher' in data &&
  data.cipher === CIPHER &&
  'cipherParams' in data &&
  'kdf' in data &&
  data.kdf === KDF &&
  'kdfparams' in data &&
  'cipherText' in data;

//
const pbkdf2Key = async (
  pass: string,
  salt: Uint8Array,
  dklen = KDF_DKLEN,
  iterations = KDF_ITERATIONS
): Promise<CryptoKey> => {
  const ec = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    ec.encode(pass),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const key = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-512',
      salt,
      iterations,
    },
    keyMaterial,
    { name: 'AES-GCM', length: dklen },
    true,
    ['encrypt', 'decrypt']
  );
  return key;
};

const constructAesGcmIv = async (
  key: CryptoKey,
  input: Uint8Array
): Promise<Uint8Array> => {
  if (key.algorithm.name !== 'AES-GCM') {
    throw new Error('Key is not an AES-GCM key');
  }
  const rawKey = await subtle.exportKey('raw', key);
  const hmacKey = await subtle.importKey(
    'raw',
    rawKey,
    { name: 'HMAC', hash: 'SHA-512' },
    true,
    ['sign']
  );
  const iv = new Uint8Array(
    await subtle.sign({ name: 'HMAC' }, hmacKey, input)
  );
  return iv.slice(0, 12); // IV is 12 bytes
};

export const encrypt = async (
  plaintext: string,
  password: string,
  dklen = KDF_DKLEN,
  iterations = KDF_ITERATIONS
): Promise<GCMEncrypted> => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await pbkdf2Key(password, salt);
  const plainTextBytes = aes.utils.utf8.toBytes(plaintext);
  const iv = await constructAesGcmIv(key, plainTextBytes);
  const cipherText = new Uint8Array(
    await subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128,
      },
      key,
      plainTextBytes
    )
  );

  return {
    cipher: CIPHER,
    cipherText: toHexString(cipherText),
    cipherParams: {
      iv: toHexString(iv),
    },
    kdf: KDF,
    kdfparams: {
      hash: 'SHA-512',
      salt: toHexString(salt),
      dklen,
      iterations,
    },
  };
};

export const decrypt = async (
  encryptedMessage: GCMEncrypted,
  password: string
): Promise<string> => {
  const dc = new TextDecoder();
  const salt = fromHexString(encryptedMessage.kdfparams.salt);
  const iv = fromHexString(encryptedMessage.cipherParams.iv);
  const cipherText = fromHexString(encryptedMessage.cipherText);
  const key = await pbkdf2Key(password, salt);
  const decryptedBytes = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
    },
    key,
    cipherText
  );
  return dc.decode(decryptedBytes);
};
