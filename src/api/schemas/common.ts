import parse from 'parse-duration';
import { z } from 'zod';

import { isHexString } from '../../types/common';
import { isValid } from '../../utils/base64';

export const HexStringSchema = z.custom<string>((str) => {
  if (typeof str !== 'string') return false;
  return isHexString(str);
});

export const Base64Schema = z.string().refine(isValid);

export const DurationSchema = z
  .string()
  .refine((x) => typeof parse(x) === 'number');
