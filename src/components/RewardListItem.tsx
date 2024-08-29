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
      py={1}
      _hover={{ cursor: 'pointer', bgColor: 'brand.modalGreen' }}
      borderBottom="2px solid"
      borderColor="brand.modalGreen"
    >
      <CardBody p={2}>
        <Flex alignItems="baseline">
          <Stat flex={2}>
            <StatLabel fontSize="x-small" color="brand.gray">
              Reward
            </StatLabel>
            <StatNumber fontSize="sm" color="brand.green">
              {formatSmidge(reward.rewardForLayer + reward.rewardForFees)}
              <Flex mb={1}>
                <Text
                  flex={1}
                  fontSize="xx-small"
                  color="brand.darkGray"
                  pr={2}
                >
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
          <Stat flex={1} color="brand.gray">
            <StatLabel fontSize="x-small">For layer</StatLabel>
            <StatNumber fontSize="sm" pr={2}>
              {formatSmidge(reward.rewardForLayer)}
            </StatNumber>
          </Stat>
          <Stat color="brand.gray" flex={1}>
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
