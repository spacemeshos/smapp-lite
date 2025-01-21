import { Box, Card, CardBody, Flex, Icon, Text } from '@chakra-ui/react';
import { Athena, StdMethods } from '@spacemesh/sm-codec';
import {
  IconArrowBigLeftLinesFilled,
  IconArrowBigRightLinesFilled,
  IconArrowNarrowDown,
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconQuestionMark,
  IconStackPush,
} from '@tabler/icons-react';

import { Bech32Address } from '../types/common';
import { Transaction } from '../types/tx';
import { getAbbreviatedHexString } from '../utils/abbr';
import { formatTimestampTx } from '../utils/datetime';
import { epochByLayer, timestampByLayer } from '../utils/layers';
import { formatSmidge } from '../utils/smh';
import { getStatusColor, getTxBalance, getTxType, TxType } from '../utils/tx';

type TxListItemProps = {
  tx: Transaction;
  host: Bech32Address;
  onClick: (tx: Transaction) => void;
  genesisTime: number;
  layerDurationSec: number;
  layersPerEpoch: number;
};

function TxIcon({ tx, host }: { tx: Transaction; host: Bech32Address }) {
  const color = getStatusColor(tx.state);
  const IconComponent = (() => {
    switch (tx.template.method) {
      case Athena.Wallet.METHODS_HEX.SPAWN:
      case StdMethods.Spawn:
        return IconArrowNarrowDown;
      case Athena.Wallet.METHODS_HEX.SPEND:
      case StdMethods.Spend: {
        switch (getTxType(tx, host)) {
          case TxType.Received:
            return IconArrowNarrowRight;
          case TxType.Spent:
          case TxType.Self:
          default:
            return IconArrowNarrowLeft;
        }
      }
      case StdMethods.Drain: {
        switch (getTxType(tx, host)) {
          case TxType.Received:
          case TxType.Self:
            return IconArrowBigRightLinesFilled;
          case TxType.Spent:
          default:
            return IconArrowBigLeftLinesFilled;
        }
      }
      case Athena.Wallet.METHODS_HEX.DEPLOY:
        return IconStackPush;
      default:
        return IconQuestionMark;
    }
  })();

  return (
    <Icon
      as={IconComponent}
      color={color}
      mr={2}
      mb={1}
      boxSize={4}
      verticalAlign="bottom"
    />
  );
}

function TxListItem({
  tx,
  host,
  onClick,
  genesisTime,
  layerDurationSec,
  layersPerEpoch,
}: TxListItemProps): JSX.Element {
  const txBalance = getTxBalance(tx, host);
  const fee =
    tx.gas.maxGas && tx.gas.price
      ? formatSmidge(-1n * BigInt(tx.gas.maxGas) * BigInt(tx.gas.price))
      : 'Unknown fee';
  return (
    <Card
      variant="list"
      _hover={{ cursor: 'pointer', bgColor: 'brand.modalGreen' }}
      borderBottom="2px solid"
      borderColor="brand.modalGreen"
      onClick={() => onClick(tx)}
    >
      <CardBody p={4}>
        <Flex>
          <Box flex={1}>
            <Text fontSize="sm" mb={1} color="brand.lightGray">
              <TxIcon tx={tx} host={host} />
              {getAbbreviatedHexString(tx.id)}
              <Text
                as="span"
                fontSize="xx-small"
                textTransform="uppercase"
                color="brand.gray"
                ml={2}
              >
                {tx.template.methodName}
              </Text>
            </Text>
            <Text fontSize="xx-small" color="brand.darkGray" mt={1}>
              {tx.layer ? (
                <>
                  {formatTimestampTx(
                    timestampByLayer(genesisTime, layerDurationSec, tx.layer)
                  )}{' '}
                  | (Layer {tx.layer} in Epoch{' '}
                  {epochByLayer(layersPerEpoch, tx.layer)})
                </>
              ) : (
                'Waiting for the transaction to be processed...'
              )}
            </Text>
          </Box>
          <Flex flexDirection="column" textAlign="right">
            <Text
              as="b"
              flex={1}
              color={
                // eslint-disable-next-line no-nested-ternary
                txBalance === null || txBalance === BigInt(0)
                  ? 'gray'
                  : txBalance < BigInt(0)
                  ? 'red.600'
                  : 'brand.green'
              }
            >
              {txBalance !== null && formatSmidge(txBalance)}
            </Text>
            <Text color="brand.gray" fontSize="xx-small" title="Fee" mb="2px">
              {fee}
            </Text>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
}

export default TxListItem;
