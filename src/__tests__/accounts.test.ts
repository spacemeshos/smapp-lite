import { getVaultUnlockedAmount } from '../utils/account';

describe('getVaultUnlockedAmount', () => {
  describe('Vesting 0-100 [Current: 50]', () => {
    const args = {
      Owner: 'someOwner',
      TotalAmount: '1000000',
      VestingStart: 0,
      VestingEnd: 100,
      InitialUnlockAmount: '250000',
    };
    it('No incomes / drains', () => {
      const r = getVaultUnlockedAmount(args, 50, 1000000n);
      expect(r.available).toBe(510000n);
      expect(r.totalUnlocked).toBe(510000n);
    });
    it('With income', () => {
      const r = getVaultUnlockedAmount(args, 50, 1000000n + 2000n);
      expect(r.available).toBe(512000n); // <-- unlocked + income
      expect(r.totalUnlocked).toBe(510000n);
    });
    it('With drain', () => {
      const r = getVaultUnlockedAmount(args, 50, 1000000n - 20000n);
      expect(r.available).toBe(490000n); // <-- unlocked - drain
      expect(r.totalUnlocked).toBe(510000n);
    });
    it('With income and drain', () => {
      const r = getVaultUnlockedAmount(args, 50, 1000000n - 20000n + 2000n);
      expect(r.available).toBe(492000n); // <-- unlocked - drain + income
      expect(r.totalUnlocked).toBe(510000n);
    });
  });
  describe('Vesting 100-200 [Current: 39]', () => {
    const args = {
      Owner: 'someOwner',
      TotalAmount: '1000000',
      VestingStart: 100,
      VestingEnd: 200,
      InitialUnlockAmount: '250000',
    };
    it('No incomes / drains', () => {
      const r = getVaultUnlockedAmount(args, 39, 1000000n);
      expect(r.available).toBe(0n);
      expect(r.totalUnlocked).toBe(0n);
    });
    it('With income', () => {
      const r = getVaultUnlockedAmount(args, 39, 1000000n + 2000n);
      expect(r.available).toBe(2000n); // <-- income
      expect(r.totalUnlocked).toBe(0n);
    });
  });
  describe('Vesting 100-200 [Current: 127]', () => {
    const args = {
      Owner: 'someOwner',
      TotalAmount: '1000000',
      VestingStart: 100,
      VestingEnd: 200,
      InitialUnlockAmount: '250000',
    };
    it('No incomes / drains', () => {
      const r = getVaultUnlockedAmount(args, 127, 1000000n);
      expect(r.available).toBe(280000n);
      expect(r.totalUnlocked).toBe(280000n);
    });
    it('With income', () => {
      const r = getVaultUnlockedAmount(args, 127, 1000000n + 2000n);
      expect(r.available).toBe(282000n); // <-- unlocked + income
      expect(r.totalUnlocked).toBe(280000n);
    });
    it('With drain', () => {
      const r = getVaultUnlockedAmount(args, 127, 1000000n - 20000n);
      expect(r.available).toBe(260000n); // <-- unlocked - drain
      expect(r.totalUnlocked).toBe(280000n);
    });
    it('With income and drain', () => {
      const r = getVaultUnlockedAmount(args, 127, 1000000n - 20000n + 2000n);
      expect(r.available).toBe(262000n); // <-- unlocked - drain + income
      expect(r.totalUnlocked).toBe(280000n);
    });
  });
  describe('Rounding: 1 million / 300 layers', () => {
    const args = {
      Owner: 'someOwner',
      TotalAmount: '1000000',
      VestingStart: 0,
      VestingEnd: 300,
      InitialUnlockAmount: '250000',
    };
    it('Layer 0', () => {
      const r = getVaultUnlockedAmount(args, 0, 1000000n);
      expect(r.available).toBe(3333n);
      expect(r.totalUnlocked).toBe(3333n);
    });
    it('Layer 1', () => {
      const r = getVaultUnlockedAmount(args, 1, 1000000n);
      expect(r.available).toBe(6666n);
      expect(r.totalUnlocked).toBe(6666n);
    });
    it('Layer 5', () => {
      const r = getVaultUnlockedAmount(args, 5, 1000000n);
      expect(r.available).toBe(19998n);
      expect(r.totalUnlocked).toBe(19998n);
    });
    it('Layer 6', () => {
      const r = getVaultUnlockedAmount(args, 6, 1000000n);
      expect(r.available).toBe(23331n);
      expect(r.totalUnlocked).toBe(23331n);
    });
    it('Layer 100', () => {
      const r = getVaultUnlockedAmount(args, 100, 1000000n);
      expect(r.available).toBe(336633n);
      expect(r.totalUnlocked).toBe(336633n);
    });
    it('Layer 298', () => {
      const r = getVaultUnlockedAmount(args, 298, 1000000n);
      expect(r.available).toBe(996567n);
      expect(r.totalUnlocked).toBe(996567n);
    });
    it('Layer 299', () => {
      const r = getVaultUnlockedAmount(args, 299, 1000000n);
      expect(r.available).toBe(999900n);
      expect(r.totalUnlocked).toBe(999900n);
    });
    it('Layer 300', () => {
      const r = getVaultUnlockedAmount(args, 300, 1000000n);
      expect(r.available).toBe(1000000n);
      expect(r.totalUnlocked).toBe(1000000n);
    });
    it('Layer 301', () => {
      const r = getVaultUnlockedAmount(args, 301, 1000000n);
      expect(r.available).toBe(1000000n);
      expect(r.totalUnlocked).toBe(1000000n);
    });
  });
});
