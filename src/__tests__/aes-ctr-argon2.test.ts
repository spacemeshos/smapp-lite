import { decrypt, encrypt } from '../utils/aes-ctr-argon2';

// Polyfill for browser's crypto
// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require('crypto');

Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => crypto.randomBytes(arr.length),
  },
});

describe('AES-CTR-Argon2', () => {
  const ENCRYPTED_FIXTURE = {
    kdf: 'ARGON2',
    kdfparams: {
      salt: '4ae49fea810d755484e6d5fbddc8b6df',
      iterations: 64,
      memorySize: 65536,
      parallelism: 1,
    },
    cipher: 'AES-256-CTR',
    cipherParams: { iv: '811e60e5e564774b16806a0bdf671e2b' },
    cipherText: 'd0e97cd11c2bb1b1f7102b',
    mac: 'd0fcd7eaf6ee6404c02be79f97fc5898fe1cf7fd167d95a20b01c5a950c62778',
  } as const;

  it('should encrypt', async () => {
    const encryptedMsg = await encrypt('hello world', 'pass@123');
    expect(encryptedMsg).toHaveProperty('kdf');
    expect(encryptedMsg).toHaveProperty('kdfparams');
    expect(encryptedMsg).toHaveProperty('cipher');
    expect(encryptedMsg).toHaveProperty('cipherParams');
    expect(encryptedMsg).toHaveProperty('cipherText');
    expect(encryptedMsg).toHaveProperty('mac');
  });
  it('should decrypt', async () => {
    const decrypted = await decrypt(ENCRYPTED_FIXTURE, 'pass@123');
    expect(decrypted).toBe('hello world');
  });
  it('should encrypt and decrypt', async () => {
    const encryptedMsg = await encrypt('hello world', 'pass@123');
    const decryptedPlainText = await decrypt(encryptedMsg, 'pass@123');
    expect(decryptedPlainText).toBe('hello world');
  });
  it('should fail on wrong password', async () => {
    await expect(() =>
      decrypt(ENCRYPTED_FIXTURE, 'wrong!Pass')
    ).rejects.toThrow();
  });
});
