import * as z from 'zod';

import { AddressSchema, AmountSchema, IdSchema, NumberSchema } from './common';
import { BigIntStringSchema, BigIntValueSchema } from './strNumber';

export const AccountRewardSchema = z.object({
  layer: NumberSchema,
  layerComputed: NumberSchema,
  total: AmountSchema,
  layerReward: AmountSchema,
  coinbase: AddressSchema,
  smesher: IdSchema,
});

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

export const RewardsResponseSchema = z.object({
  totalResults: z.number(),
  accountItem: z.array(
    z.object({
      reward: AccountRewardSchema,
    })
  ),
});
