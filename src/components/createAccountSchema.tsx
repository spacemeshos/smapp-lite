import { z } from 'zod';

import { Athena, StdPublicKeys } from '@spacemesh/sm-codec';

import { Bech32AddressSchema } from '../api/schemas/address';
import { PublicKeySchema } from '../api/schemas/common';
import { CREATE_NEW_KEY_LITERAL } from '../utils/constants';
import { AnySpawnArguments } from '../utils/templates';

const PublicKeyOrNewSchema = z.union([
  PublicKeySchema,
  z.literal(CREATE_NEW_KEY_LITERAL),
]);

const DisplayNameSchema = z.string().min(2);
const SingleSigSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.SingleSig),
  PublicKey: PublicKeyOrNewSchema,
});
const MultiSigSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(StdPublicKeys.MultiSig),
  Required: z.number().min(0).max(10),
  PublicKeys: z
    .array(PublicKeyOrNewSchema)
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
    .array(PublicKeyOrNewSchema)
    .min(1, 'Vesting account requires at least two parties'),
});

const MainAccountSchemas = z.discriminatedUnion('templateAddress', [
  SingleSigSchema,
  MultiSigSchema,
  VaultSchema,
  VestingSchema,
]);

const AthenaWalletSchema = z.object({
  displayName: DisplayNameSchema,
  templateAddress: z.literal(`A${Athena.Wallet.TEMPLATE_PUBKEY_HEX}`),
  PublicKey: PublicKeySchema,
});

const AthenaAccountSchemas = z.discriminatedUnion('templateAddress', [
  AthenaWalletSchema,
]);

type MainAccountSchemas = z.infer<typeof MainAccountSchemas>;
type AthenaAccountSchemas = z.infer<typeof AthenaAccountSchemas>;

type FormData = { isAthena: boolean } & (
  | MainAccountSchemas
  | AthenaAccountSchemas
);

export const FormSchema = z.custom<FormData>((data) => {
  if (Object.hasOwn(data, 'isAthena') && data.isAthena) {
    return AthenaAccountSchemas.parse(data);
  }
  return MainAccountSchemas.parse(data);
});

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
  args = AthenaWalletSchema.safeParse(data);
  if (args.success) {
    return {
      PublicKey: args.data.PublicKey,
    };
  }

  throw new Error('Cannot get required inputs to create an account');
};
