// -------------------
// Units
// -------------------

export enum CoinUnits {
  SMH = 'SMH',
  Smidge = 'Smidge',
}

export const toSMH = (smidge: bigint): string => {
  const integer = smidge / BigInt(10) ** BigInt(9);
  const fractional = smidge % BigInt(10) ** BigInt(9);
  return fractional !== 0n
    ? `${String(integer)}.${String(fractional).slice(0, 3)}`
    : String(integer);
};

export const toSmidge = (smh: bigint): string =>
  String(smh * BigInt(10) ** BigInt(9));

const packValueAndUnit = (value: string, unit: CoinUnits) => ({
  value,
  unit,
});

export const parseSmidge = (a: bigint | string | number) => {
  const amount = BigInt(a);
  const absAmount = amount < BigInt(0) ? -amount : amount;
  // If amount is "falsy" (0 | undefined | null)
  if (amount === BigInt(0)) return packValueAndUnit('0', CoinUnits.SMH);
  // Show `23.053 SMH` for big amount 1
  if (absAmount >= BigInt(10) ** BigInt(9))
    return packValueAndUnit(toSMH(amount), CoinUnits.SMH);
  // Or `6739412 Smidge` (without dot) for small amount
  if (!Number.isNaN(Number(amount)))
    return packValueAndUnit(String(amount), CoinUnits.Smidge);
  // Show `0 SMH` for zero amount and NaN
  return packValueAndUnit('0', CoinUnits.SMH);
};

export const formatSmidge = (amount: bigint | string | number): string => {
  const { value, unit } = parseSmidge(amount);
  return `${value} ${unit}`;
};
