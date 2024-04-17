import { Bech32Address } from '../../types/common';
import { Reward } from '../../types/reward';
import { RewardsResponseSchema } from '../schemas/globalState';

// eslint-disable-next-line import/prefer-default-export
export const fetchRewardsByAddress = async (
  rpc: string,
  address: Bech32Address
) =>
  fetch(`${rpc}/v1/globalstate/accountdataquery`, {
    method: 'POST',
    body: JSON.stringify({
      filter: {
        account_id: {
          address,
        },
        account_data_flags: 2,
      },
    }),
  })
    .then((r) => r.json())
    .then(RewardsResponseSchema.parse)
    .then((x) =>
      x.accountItem.map(
        ({ reward }): Reward => ({
          layerPaid: reward.layer.number,
          rewardForLayer: BigInt(reward.layerReward.value),
          rewardForFees: BigInt(
            BigInt(reward.total.value) - BigInt(reward.layerReward.value)
          ),
          coinbase: reward.coinbase.address,
          smesher: reward.smesher.id,
        })
      )
    );
