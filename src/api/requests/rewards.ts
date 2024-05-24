import { Bech32Address } from '../../types/common';
import { Reward } from '../../types/reward';
import { fromBase64 } from '../../utils/base64';
import { toHexString } from '../../utils/hexString';
import { RewardsListSchema } from '../schemas/rewards';

export const fetchRewardsChunk = (
  rpc: string,
  address: Bech32Address,
  limit = 100,
  offset = 0
) =>
  fetch(`${rpc}/spacemesh.v2alpha1.RewardService/List`, {
    method: 'POST',
    body: JSON.stringify({
      coinbase: address,
      limit,
      offset,
    }),
  })
    .then((r) => r.json())
    .then(RewardsListSchema.parse)
    .then(({ rewards }) =>
      rewards.map(
        ({ v1 }): Reward => ({
          layerPaid: v1.layer,
          rewardForLayer: BigInt(v1.layerReward),
          rewardForFees: BigInt(BigInt(v1.total) - BigInt(v1.layerReward)),
          coinbase: v1.coinbase,
          smesher: toHexString(fromBase64(v1.smesher)),
        })
      )
    );

export const fetchRewardsByAddress = async (
  rpc: string,
  address: Bech32Address
) => {
  const fetchNextChunk = async (page: number): Promise<Reward[]> => {
    const PER_PAGE = 100;
    const res = await fetchRewardsChunk(
      rpc,
      address,
      PER_PAGE,
      page * PER_PAGE
    );
    if (res.length === 100) {
      return [...res, ...(await fetchNextChunk(page + 1))];
    }
    return res;
  };

  return fetchNextChunk(0);
};
