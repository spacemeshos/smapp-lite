import * as z from 'zod';

import { AmountSchema, Base64Schema } from './common';

export const GenesisTimeResponseSchema = z.object({
  unixtime: AmountSchema,
});

export const GenesisIDResponseSchema = z.object({
  genesisId: Base64Schema,
});
