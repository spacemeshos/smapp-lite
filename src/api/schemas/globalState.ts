import * as z from 'zod';

import { AddressSchema } from './common';
import { BigIntStringSchema, BigIntValueSchema } from './strNumber';

export const AccountStateSchema = z.object({
  counter: BigIntStringSchema,
  balance: BigIntValueSchema,
});

export const AccountDataSchema = z.object({
  accountId: AddressSchema,
  stateCurrent: AccountStateSchema,
  stateProjected: AccountStateSchema,
});

export const BalanceResponseSchema = z.object({
  totalResults: z.number().min(1),
  accountItem: z
    .array(
      z.object({
        accountWrapper: AccountDataSchema,
      })
    )
    .min(1),
});
