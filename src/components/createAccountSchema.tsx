import { z } from 'zod';

import { StdPublicKeys } from '@spacemesh/sm-codec';

import { Bech32AddressSchema } from '../api/schemas/address';
import { PublicKeySchema } from '../api/schemas/common';
import { AnySpawnArguments } from '../utils/templates';

const DisplayNameSchema = z.string().min(2);
const SingleSigSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.SingleSig),
  PublicKey: PublicKeySchema,
});
const MultiSigSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.MultiSig),
  Required: z.number().min(0).max(10),
  PublicKeys: z
    .array(PublicKeySchema)
    .min(1, 'MultiSig account requires at least two parties'),
});
const VaultSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.Vault),
  Owner: Bech32AddressSchema,
  TotalAmount: z.string().min(0),
  InitialUnlockAmount: z.string().min(0),
  VestingStart: z.number().min(0),
  VestingEnd: z.number().min(0),
});
const VestingSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.Vesting),
  Required: z.number().min(0).max(10),
  PublicKeys: z
    .array(PublicKeySchema)
    .min(1, 'Vesting account requires at least two parties'),
});
export const FormSchema = z.discriminatedUnion('templateAddress', [
  SingleSigSchema,
  MultiSigSchema,
  VaultSchema,
  VestingSchema,
]);
export type FormValues = z.infer<typeof FormSchema>;
export const extractSpawnArgs = (data: FormValues): AnySpawnArguments => {
  let args;
  args = SingleSigSchema.safeParse(data);
  if (args.success) {
    return { PublicKey: args.data.PublicKey };
  }
  args = MultiSigSchema.safeParse(data);
  if (args.success) {
    return args.data;
  }
  args = VestingSchema.safeParse(data);
  if (args.success) {
    return args.data;
  }
  args = VaultSchema.safeParse(data);
  if (args.success) {
    return args.data;
  }

  throw new Error('Cannot get required inputs to create an account');
};
