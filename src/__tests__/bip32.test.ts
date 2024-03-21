import Bip32KeyDerivation from '../utils/bip32';

describe('bip32', () => {
  it('createPath', () => {
    expect(Bip32KeyDerivation.createPath(0)).toEqual("m/44'/540'/0'/0'/0'");
    expect(Bip32KeyDerivation.createPath(2)).toEqual("m/44'/540'/0'/0'/2'");
  });
  it('deriveFromPath', () => {
    const seed = new Uint8Array(64).fill(0);
    const seed2 = new Uint8Array(64).fill(1);

    const keypair0 = Bip32KeyDerivation.deriveFromPath(
      "m/44'/540'/0'/0'/0'",
      seed
    );
    const keypair01 = Bip32KeyDerivation.deriveFromPath(
      "m/44'/540'/0'/0'/0'",
      seed
    );
    const keypair2 = Bip32KeyDerivation.deriveFromPath(
      "m/44'/540'/0'/0'/2'",
      seed
    );
    const keypair3 = Bip32KeyDerivation.deriveFromPath(
      "m/44'/540'/0'/0'/0'",
      seed2
    );

    expect(keypair0.secretKey).toEqual(keypair01.secretKey);
    expect(keypair0.secretKey).not.toEqual(keypair2.secretKey);
    expect(keypair0.secretKey).not.toEqual(keypair3.secretKey);
  });
});
