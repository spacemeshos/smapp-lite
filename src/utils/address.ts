/* eslint-disable import/prefer-default-export */
export const getAbbreviatedAddress = (address: string) =>
  `${address.split('1')[0]}1...${address.slice(-4)}`;
