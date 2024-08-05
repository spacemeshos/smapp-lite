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
    <Card mb={2} bgColor="spacemesh.850" _hover={{ bgColor: 'spacemesh.900' }}>
      <CardBody p={2}>
        <Flex alignItems="baseline">
          <Stat flex={2}>
            <StatLabel fontSize="x-small" color="#F0F0F0EE">
              Reward
            </StatLabel>
            <StatNumber fontSize="sm" color="brand.green">
              {formatSmidge(reward.rewardForLayer + reward.rewardForFees)}
            </StatNumber>
          </Stat>
          <Stat flex={1} color="#B9B9B9">
            <StatLabel fontSize="x-small">For layer</StatLabel>
            <StatNumber fontSize="sm">
              {formatSmidge(reward.rewardForLayer)}
            </StatNumber>
          </Stat>
          <Stat color="#B9B9B9" flex={1}>
            <StatLabel fontSize="x-small">For fees</StatLabel>
            <StatNumber fontSize="sm">
              {formatSmidge(reward.rewardForFees)}
            </StatNumber>
          </Stat>
        </Flex>
        <Flex mb={1}>
          <Text flex={1} fontSize="xx-small" color="#B9B9B9">
            {formatTimestamp(
              timestampByLayer(genesisTime, layerDurationSec, reward.layerPaid)
            )}{' '}
            (Layer {reward.layerPaid} in Epoch{' '}
            {epochByLayer(layersPerEpoch, reward.layerPaid)})
          </Text>
          <ExplorerButton
            dataType="rewards"
            value={`0x${reward.smesher}/${reward.layerPaid}`}
            v2
            ml={1}
          />
        </Flex>
      </CardBody>
    </Card>
  );
}

export default RewardListItem;
