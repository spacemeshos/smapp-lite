import * as z from 'zod';

import { Bech32AddressSchema } from './address';
import { BigIntStringSchema } from './strNumber';

export const AccountStateSchema = z.object({
  counter: BigIntStringSchema,
  balance: BigIntStringSchema,
  layer: z.number(),
});

export const AccountDataSchema = z.object({
  address: Bech32AddressSchema,
  current: AccountStateSchema,
  projected: AccountStateSchema,
});

export const BalanceResponseSchema = z.object({
  accounts: z.array(AccountDataSchema),
});
