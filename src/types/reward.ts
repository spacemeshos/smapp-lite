import { Bech32Address, BigIntString, HexString } from './common';

export type Reward = {
  layerPaid: number;
  rewardForLayer: BigIntString;
  rewardForFees: BigIntString;
  coinbase: Bech32Address;
  smesher: HexString;
};
