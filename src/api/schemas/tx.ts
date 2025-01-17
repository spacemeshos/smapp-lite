import { z } from 'zod';

import { Bech32Address } from '../../types/common';

import { Bech32AddressSchema } from './address';
import { Base64Schema, HexStringSchema } from './common';
import { BigIntStringSchema } from './strNumber';

// Common stuff

export const TransactionIdSchema = z.string().min(1);

export const NestedTransactionIdSchema = z.object({ id: TransactionIdSchema });

export const NonceSchema = z.object({
  counter: z.string(),
  bitfield: z.number().optional(),
});

export type Nonce = z.infer<typeof NonceSchema>;

// Response objects

export const TransactionTemplateMethodType = z.enum([
  'TRANSACTION_TYPE_UNSPECIFIED',
  'TRANSACTION_TYPE_SINGLE_SIG_SEND',
  'TRANSACTION_TYPE_SINGLE_SIG_SPAWN',
  'TRANSACTION_TYPE_SINGLE_SIG_SELFSPAWN',
  'TRANSACTION_TYPE_MULTI_SIG_SEND',
  'TRANSACTION_TYPE_MULTI_SIG_SPAWN',
  'TRANSACTION_TYPE_MULTI_SIG_SELFSPAWN',
  'TRANSACTION_TYPE_VESTING_SPAWN',
  'TRANSACTION_TYPE_VAULT_SPAWN',
  'TRANSACTION_TYPE_DRAIN_VAULT',
]);

export const TransactionSchema = z.object({
  id: TransactionIdSchema,
  type: TransactionTemplateMethodType,
  principal: Bech32AddressSchema,
  template: Bech32AddressSchema,
  method: z.union([z.number(), HexStringSchema]),
  nonce: NonceSchema,
  maxGas: BigIntStringSchema,
  gasPrice: BigIntStringSchema,
  maxSpend: BigIntStringSchema,
  raw: z.string(),
});

export const TransactionResultStatusSchema = z.enum([
  'TRANSACTION_STATUS_UNSPECIFIED',
  'TRANSACTION_STATUS_SUCCESS',
  'TRANSACTION_STATUS_FAILURE',
  'TRANSACTION_STATUS_INVALID',
]);

export const TransactionResultSchema = z.object({
  status: TransactionResultStatusSchema,
  message: z.string(),
  gasConsumed: BigIntStringSchema,
  fee: BigIntStringSchema,
  block: Base64Schema,
  layer: z.number(),
  touchedAddresses: z.array(Bech32AddressSchema),
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

export const TransactionResponseObjectSchema = z.object({
  tx: TransactionSchema,
  txResult: z.nullable(TransactionResultSchema),
  txState: z.nullable(TransactionStateEnumSchema),
});

// Responses

export const TransactionResponseSchema = z.object({
  transactions: z.array(TransactionResponseObjectSchema),
});

// TS Types

export type TransactionResponseObject = z.infer<typeof TransactionSchema>;

export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;
export type TransactionState = z.infer<typeof TransactionStateEnumSchema>;
export type TransactionResultStatus = z.infer<
  typeof TransactionResultStatusSchema
>;

export type WithExtraData = {
  layer: number;
  state: TransactionState;
  touched?: Bech32Address[];
  message?: string;
};

export const EstimateGasResponseSchema = z.object({
  recommendedMaxGas: BigIntStringSchema,
});

export const SubmitTxResponseSchema = z.object({
  txId: z.string().min(1),
});
