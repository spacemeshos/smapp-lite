const { subtle } = crypto;

export const KDF_DKLEN = 256;
export const KDF_ITERATIONS = 120000;

export const pbkdf2Key = async (
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

export const constructAesGcmIv = async (
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
  key: CryptoKey,
  iv: Uint8Array,
  plaintext: Uint8Array
): Promise<Uint8Array> => {
  const ciphertext = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
    },
    key,
    plaintext
  );
  return new Uint8Array(ciphertext);
};

export const decrypt = async (
  key: CryptoKey,
  iv: Uint8Array,
  ciphertext: Uint8Array
): Promise<Uint8Array> => {
  const plaintext = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
    },
    key,
    ciphertext
  );
  return new Uint8Array(plaintext);
};
