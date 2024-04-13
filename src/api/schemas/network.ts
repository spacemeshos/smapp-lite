/* eslint-disable import/prefer-default-export */
import * as z from 'zod';

import { Base64Schema, DurationSchema } from './common';

export const NetworkInfoResponseSchema = z.object({
  genesisTime: z.string().datetime(),
  layerDuration: DurationSchema,
  genesisId: Base64Schema,
  hrp: z.string(),
  effectiveGenesisLayer: z.number(),
  layersPerEpoch: z.number(),
});
