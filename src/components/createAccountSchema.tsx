import { z } from 'zod';

import { StdPublicKeys } from '@spacemesh/sm-codec';

import { Bech32AddressSchema } from '../api/schemas/address';
import { HexStringSchema } from '../api/schemas/common';
import { AnySpawnArguments } from '../utils/templates';

const DisplayNameSchema = z.string().min(2);
const SingleSigSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.SingleSig),
  publicKey: HexStringSchema,
});
const MultiSigSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.MultiSig),
  required: z.number().min(0).max(10),
  publicKeys: z
    .array(HexStringSchema)
    .min(1, 'MultiSig account requires at least two parties'),
});
const VaultSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.Vault),
  owner: Bech32AddressSchema,
  totalAmount: z.string().min(0),
  initialUnlockAmount: z.string().min(0),
  vestingStart: z.number().min(0),
  vestingEnd: z.number().min(0),
});
const VestingSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.Vesting),
  required: z.number().min(0).max(10),
  publicKeys: z
    .array(HexStringSchema)
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
    return { PublicKey: args.data.publicKey };
  }
  args = MultiSigSchema.safeParse(data);
  if (args.success) {
    return { Required: args.data.required, PublicKeys: args.data.publicKeys };
  }
  args = VestingSchema.safeParse(data);
  if (args.success) {
    return { Required: args.data.required, PublicKeys: args.data.publicKeys };
  }
  args = VaultSchema.safeParse(data);
  if (args.success) {
    return {
      Owner: args.data.owner,
      TotalAmount: args.data.totalAmount,
      InitialUnlockAmount: args.data.initialUnlockAmount,
      VestingStart: args.data.vestingStart,
      VestingEnd: args.data.vestingEnd,
    };
  }

  throw new Error('Cannot get required inputs to create an account');
};
