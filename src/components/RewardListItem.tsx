import {
  Card,
  CardBody,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react';

import { Reward } from '../types/reward';
import { formatTimestamp } from '../utils/datetime';
import { epochByLayer, timestampByLayer } from '../utils/layers';
import { formatSmidge } from '../utils/smh';

import ExplorerButton from './ExplorerButton';

type RewardListItemProps = {
  reward: Reward;
  genesisTime: number;
  layerDurationSec: number;
  layersPerEpoch: number;
};

function RewardListItem({
  reward,
  genesisTime,
  layerDurationSec,
  layersPerEpoch,
}: RewardListItemProps): JSX.Element {
  return (
    <Card mb={2} _hover={{ bgColor: 'spacemesh.850' }}>
      <CardBody p={2}>
        <Flex alignItems="baseline">
          <Stat flex={2}>
            <StatLabel fontSize="x-small" color="#F0F0F0EE">
              Reward
            </StatLabel>
            <StatNumber fontSize="sm" color="brand.green">
              {formatSmidge(reward.rewardForLayer + reward.rewardForFees)}
              <Flex mb={1}>
                <Text flex={1} fontSize="xx-small" color="#B9B9B9" pr={2}>
                  {formatTimestamp(
                    timestampByLayer(
                      genesisTime,
                      layerDurationSec,
                      reward.layerPaid
                    )
                  )}{' '}
                  (Layer {reward.layerPaid} in Epoch{' '}
                  {epochByLayer(layersPerEpoch, reward.layerPaid)})
                </Text>
              </Flex>
            </StatNumber>
          </Stat>
          <Stat flex={1} color="#B9B9B9">
            <StatLabel fontSize="x-small">For layer</StatLabel>
            <StatNumber fontSize="sm" pr={2}>
              {formatSmidge(reward.rewardForLayer)}
            </StatNumber>
          </Stat>
          <Stat color="#B9B9B9" flex={1}>
            <StatLabel fontSize="x-small">For fees</StatLabel>
            <StatNumber fontSize="sm" pr={2}>
              {formatSmidge(reward.rewardForFees)}
            </StatNumber>
          </Stat>

          <ExplorerButton
            dataType="rewards"
            value={`0x${reward.smesher}/${reward.layerPaid}`}
            v2
            mt="auto"
            mb="auto"
          />
        </Flex>
      </CardBody>
    </Card>
  );
}

export default RewardListItem;
