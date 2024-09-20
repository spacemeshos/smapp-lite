import { HexString } from './common';

export type SignedMessage = {
  publicKey: HexString;
  text: string;
  signature: HexString;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isSignedMessage = (data: any): data is SignedMessage =>
  data &&
  typeof data.publicKey === 'string' &&
  typeof data.text === 'string' &&
  typeof data.signature === 'string';
