import { z } from 'zod';

import { AddressSchema, NumberSchema } from './common';
import { BigIntStringSchema } from './strNumber';

// Common stuff

export const TransactionIdSchema = z.string().nonempty();

export const NestedTransactionIdSchema = z.object({ id: TransactionIdSchema });

export const NonceSchema = z.object({
  counter: z.string(),
  bitfield: z.number(),
});

export type Nonce = z.infer<typeof NonceSchema>;

export const LimitsSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export type Limits = z.infer<typeof LimitsSchema>;

// Response objects

export const TransactionSchema = z.object({
  id: TransactionIdSchema,
  principal: AddressSchema,
  template: AddressSchema,
  method: z.number(),
  nonce: NonceSchema,
  limits: LimitsSchema,
  maxGas: BigIntStringSchema,
  gasPrice: BigIntStringSchema,
  maxSpend: BigIntStringSchema,
  raw: z.string(),
});

export const TransactionStateEnumSchema = z.enum([
  'TRANSACTION_STATE_UNSPECIFIED',
  'TRANSACTION_STATE_REJECTED',
  'TRANSACTION_STATE_INSUFFICIENT_FUNDS',
  'TRANSACTION_STATE_CONFLICTING',
  'TRANSACTION_STATE_MEMPOOL',
  'TRANSACTION_STATE_MESH',
  'TRANSACTION_STATE_PROCESSED',
]);

export const TransactionStateSchema = z.object({
  id: NestedTransactionIdSchema,
  state: TransactionStateEnumSchema,
});

// Responses

export const MeshTransactionsResponseSchema = z.object({
  data: z.array(
    z.object({
      meshTransaction: z.object({
        transaction: TransactionSchema,
        layerId: NumberSchema,
      }),
    })
  ),
  totalResults: z.number(),
});
export type MeshTransactionsResponse = z.infer<
  typeof MeshTransactionsResponseSchema
>;

export const TransactionStatesResponseSchema = z.object({
  transactionsState: z.array(TransactionStateSchema),
  transactions: z.array(TransactionSchema),
});
export type TransactionStatesResponse = z.infer<
  typeof TransactionStatesResponseSchema
>;

// TS Types

export type TransactionResponse = z.infer<typeof TransactionSchema>;
export type TransactionState = z.infer<typeof TransactionStateEnumSchema>;

export type WithLayer = { layer: number };

export type WithState = { state: TransactionState };
