import parse from 'parse-duration';
import { z } from 'zod';

import { isValid } from '../../utils/base64';

import { Bech32AddressSchema } from './address';
import { BigIntStringSchema } from './strNumber';

export const NumberSchema = z.object({
  number: z.number(),
});

export const AmountSchema = z.object({
  value: BigIntStringSchema,
});

export const AddressSchema = z.object({
  address: Bech32AddressSchema,
});

export const IdSchema = z.object({
  id: z.string(), // Bytes as HexString
});

export const Base64Schema = z.string().refine(isValid);

export const DurationSchema = z
  .string()
  .refine((x) => typeof parse(x) === 'number');
