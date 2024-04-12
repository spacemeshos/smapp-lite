/* eslint-disable import/prefer-default-export */
import * as z from 'zod';

import { NumberSchema } from './common';
import { BigIntStringSchema } from './strNumber';

export const NodeStatusSchema = z.object({
  status: z.object({
    connectedPeers: BigIntStringSchema,
    isSynced: z.boolean(),
    syncedLayer: NumberSchema,
    topLayer: NumberSchema,
    verifiedLayer: NumberSchema,
  }),
});
