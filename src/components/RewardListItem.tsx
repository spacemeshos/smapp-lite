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
    <Card
      mb={2}
      bgColor="whiteAlpha.100"
      _hover={{ bgColor: 'whiteAlpha.300' }}
    >
      <CardBody p={2}>
        <Flex mb={1}>
          <Text flex={1} fontSize="sm" color="gray">
            {formatTimestamp(
              timestampByLayer(genesisTime, layerDurationSec, reward.layerPaid)
            )}{' '}
            (Layer {reward.layerPaid} in Epoch{' '}
            {epochByLayer(layersPerEpoch, reward.layerPaid)})
          </Text>
          <ExplorerButton
            dataType="rewards"
            value={`${reward.smesher}/${reward.layerPaid}`}
            ml={1}
          />
        </Flex>

        <Flex alignItems="baseline">
          <Stat flex={2}>
            <StatLabel fontSize="xx-small">Reward</StatLabel>
            <StatNumber fontSize="sm" color="green">
              {formatSmidge(reward.rewardForLayer + reward.rewardForFees)}
            </StatNumber>
          </Stat>
          <Stat color="gray" flex={1}>
            <StatLabel fontSize="xx-small">For layer</StatLabel>
            <StatNumber fontSize="sm">
              {formatSmidge(reward.rewardForLayer)}
            </StatNumber>
          </Stat>
          <Stat color="gray" flex={1}>
            <StatLabel fontSize="xx-small">For fees</StatLabel>
            <StatNumber fontSize="sm">
              {formatSmidge(reward.rewardForFees)}
            </StatNumber>
          </Stat>
        </Flex>
      </CardBody>
    </Card>
  );
}

export default RewardListItem;
