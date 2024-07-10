import { CheckCircleIcon } from '@chakra-ui/icons';
import { Box, Card, CardBody, Flex, Text } from '@chakra-ui/react';

import { Bech32Address } from '../types/common';
import { Transaction } from '../types/tx';
import { getAbbreviatedHexString } from '../utils/abbr';
import { formatTimestamp } from '../utils/datetime';
import { epochByLayer, timestampByLayer } from '../utils/layers';
import { formatSmidge } from '../utils/smh';
import { getStatusColor, getTxBalance } from '../utils/tx';

type TxListItemProps = {
  tx: Transaction;
  host: Bech32Address;
  onClick: (tx: Transaction) => void;
  genesisTime: number;
  layerDurationSec: number;
  layersPerEpoch: number;
};

function TxListItem({
  tx,
  host,
  onClick,
  genesisTime,
  layerDurationSec,
  layersPerEpoch,
}: TxListItemProps): JSX.Element {
  const txBalance = getTxBalance(tx, host);
  return (
    <Card
      mb={2}
      bgColor="whiteAlpha.100"
      _hover={{ cursor: 'pointer', bgColor: 'whiteAlpha.300' }}
      onClick={() => onClick(tx)}
    >
      <CardBody p={2}>
        <Flex>
          <Box flex={1}>
            <Text fontSize="sm" mb={1}>
              {getAbbreviatedHexString(tx.id)}
            </Text>
            <Text>
              <CheckCircleIcon color={getStatusColor(tx.state)} mr={2} mb={1} />
              {tx.template.methodName}
            </Text>
            <Text fontSize="xx-small" color="gray" mt={1}>
              {tx.layer ? (
                <>
                  {formatTimestamp(
                    timestampByLayer(genesisTime, layerDurationSec, tx.layer)
                  )}{' '}
                  (Layer {tx.layer} in Epoch{' '}
                  {epochByLayer(layersPerEpoch, tx.layer)})
                </>
              ) : (
                'Waiting for the transaction to be processed...'
              )}
            </Text>
          </Box>
          <Flex flexDirection="column" textAlign="right">
            <Text
              flex={1}
              color={
                // eslint-disable-next-line no-nested-ternary
                txBalance === null || txBalance === BigInt(0)
                  ? 'gray'
                  : txBalance < BigInt(0)
                  ? 'red.600'
                  : 'green'
              }
            >
              {txBalance !== null && formatSmidge(txBalance)}
            </Text>
            <Text color="gray" fontSize="xx-small" title="Fee" mb="2px">
              {formatSmidge(-1n * BigInt(tx.gas.maxGas) * BigInt(tx.gas.price))}
            </Text>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
}

export default TxListItem;
