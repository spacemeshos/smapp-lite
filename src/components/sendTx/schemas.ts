import { z } from 'zod';

import { StdPublicKeys } from '@spacemesh/sm-codec';

import { Bech32AddressSchema } from '../../api/schemas/address';
import { HexStringSchema } from '../../api/schemas/common';
import { BigIntMin, BigIntStringSchema } from '../../api/schemas/strNumber';
import { Bech32Address } from '../../types/common';
import { MethodSelectors } from '../../utils/templates';

// Tx schemas

export const SpendSchema = z.object({
  methodSelector: z.literal(MethodSelectors.Spend),
  Destination: Bech32AddressSchema,
  Amount: BigIntStringSchema.and(BigIntMin(0n)),
});

export type SpendPayload = z.infer<typeof SpendSchema>;

export const DrainSchema = z.object({
  methodSelector: z.literal(MethodSelectors.Drain),
  Vault: Bech32AddressSchema,
  Destination: Bech32AddressSchema,
  Amount: BigIntStringSchema.and(BigIntMin(0n)),
});

export type DrainPayload = z.infer<typeof DrainSchema>;

export const SingleSigSpawnSchema = z.object({
  methodSelector: z.literal(MethodSelectors.Spawn),
  PublicKey: HexStringSchema,
});

export type SingleSigSpawnPayload = z.infer<typeof SingleSigSpawnSchema>;

export const MultiSigSpawnSchema = z.object({
  methodSelector: z.literal(MethodSelectors.Spawn),
  Required: z.number().min(0).max(10),
  PublicKeys: z
    .array(HexStringSchema)
    .min(1, 'MultiSig account requires at least two parties'),
});

export type MultiSigSpawnPayload = z.infer<typeof MultiSigSpawnSchema>;

export const VaultSpawnSchema = z.object({
  methodSelector: z.literal(MethodSelectors.Spawn),
  Owner: Bech32AddressSchema,
  TotalAmount: BigIntStringSchema.and(BigIntMin(0n)),
  InitialUnlockAmount: BigIntStringSchema.and(BigIntMin(0n)),
  VestingStart: z.number().min(0),
  VestingEnd: z.number().min(0),
});

export type VaultSpawnPayload = z.infer<typeof VaultSpawnSchema>;

export const VestingSpawnSchema = z.object({
  methodSelector: z.literal(MethodSelectors.Spawn),
  Required: z.number().min(0).max(10),
  PublicKeys: z
    .array(HexStringSchema)
    .min(1, 'Vesting account requires at least two parties'),
});

export type VestingSpawnPayload = z.infer<typeof VestingSpawnSchema>;

// Tx schemas by template addr

export const CommonTxFields = {
  gasPrice: z
    .number({ message: 'Required field' })
    .int('Only integer values accepted')
    .min(1),
  nonce: z
    .number({ message: 'Required field' })
    .int('Only integer values accepted')
    .min(0),
};

export const SingleSigSchema = z.object({
  templateAddress: z.literal(StdPublicKeys.SingleSig),
  payload: z.discriminatedUnion('methodSelector', [
    SingleSigSpawnSchema,
    SpendSchema,
  ]),
  ...CommonTxFields,
});

export type SingleSigTx = z.infer<typeof SingleSigSchema>;

export const MultiSigSchema = z.object({
  templateAddress: z.literal(StdPublicKeys.MultiSig),
  payload: z.discriminatedUnion('methodSelector', [
    MultiSigSpawnSchema,
    SpendSchema,
  ]),
  ...CommonTxFields,
});

export type MultiSigTx = z.infer<typeof MultiSigSchema>;

export const VaultSchema = z.object({
  templateAddress: z.literal(StdPublicKeys.Vault),
  payload: z.discriminatedUnion('methodSelector', [
    VaultSpawnSchema,
    SpendSchema,
  ]),
  ...CommonTxFields,
});

export type VaultTx = z.infer<typeof VaultSchema>;

export const VestingSchema = z.object({
  templateAddress: z.literal(StdPublicKeys.Vesting),
  payload: z.discriminatedUnion('methodSelector', [
    VestingSpawnSchema,
    SpendSchema,
    DrainSchema,
  ]),
  ...CommonTxFields,
});

export type VestingTx = z.infer<typeof VestingSchema>;

// Form schema

export const FormSchema = z.discriminatedUnion('templateAddress', [
  SingleSigSchema,
  MultiSigSchema,
  VaultSchema,
  VestingSchema,
]);

export type FormValues = z.infer<typeof FormSchema>;

export type TxArgs<T> = {
  templateAddress: Bech32Address;
  payload: T;
  nonce: number;
  gasPrice: number;
};
