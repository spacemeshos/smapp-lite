// eslint-disable-next-line import/prefer-default-export
export const normalizeMnemonic = (input: string): string =>
  input
    .replace(/^(\d{0,2}\.)?\s/gm, '')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ');
