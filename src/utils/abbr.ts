/* eslint-disable import/prefer-default-export */
export const getAbbreviatedAddress = (address: string) =>
  `${address.split('1')[0]}1...${address.slice(-4)}`;

export const getAbbreviatedTxID = (txID: string) =>
  `${txID.slice(0, txID.startsWith('0x') ? 6 : 4)}...${txID.slice(-4)}`;
