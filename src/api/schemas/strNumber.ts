import { z } from 'zod';

export const BigIntStringSchema = z.custom<string>((a) => {
  if (typeof a !== 'string') return false;
  try {
    return BigInt(a).toString() === a;
  } catch (err) {
    return false;
  }
});

export const BigIntValueSchema = z.object({
  value: BigIntStringSchema,
});
