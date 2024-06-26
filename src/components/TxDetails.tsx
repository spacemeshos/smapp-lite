import { useState } from 'react';

import { CheckCircleIcon, CopyIcon } from '@chakra-ui/icons';
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Portal,
  Text,
  Tooltip,
  UseDisclosureReturn,
} from '@chakra-ui/react';
import { useCopyToClipboard } from '@uidotdev/usehooks';

import { Transaction } from '../types/tx';
import { formatTimestamp } from '../utils/datetime';
import { ExplorerDataType } from '../utils/getExplorerUrl';
import { toHexString } from '../utils/hexString';
import { epochByLayer, timestampByLayer } from '../utils/layers';
import { formatSmidge } from '../utils/smh';
import {
  formatTxState,
  getDestinationAddress,
  getStatusColor,
  isSelfSpawnTransaction,
  isSpendTransaction,
} from '../utils/tx';

import ExplorerButton from './ExplorerButton';

type RowProps =
  | {
      label: string;
      value: string;
      isCopyable?: boolean;
      explorer?: ExplorerDataType;
    }
  | {
      label: string;
      value: JSX.Element;
      isCopyable: false;
      explorer: undefined;
    };

function Row({ label, value, isCopyable, explorer }: RowProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [, copy] = useCopyToClipboard();

  let timeout: ReturnType<typeof setTimeout>;

  return (
    <Box mb={2}>
      <Text fontSize="xx-small" color="gray" userSelect="none">
        {label}
      </Text>
      <Flex flexDirection="row" fontSize="sm">
        <Text flex={1} wordBreak="break-word" pr={1}>
          {value}
        </Text>
        {isCopyable && (
          <Tooltip label="Copied" isOpen={isCopied}>
            <IconButton
              aria-label="Copy to clipboard"
              size="xs"
              onClick={() => {
                clearTimeout(timeout);
                copy(value);
                setIsCopied(true);
                timeout = setTimeout(() => {
                  setIsCopied(false);
                }, 5000);
              }}
              disabled={isCopied}
              icon={<CopyIcon />}
              ml={1}
            />
          </Tooltip>
        )}
        {explorer && (
          <ExplorerButton dataType={explorer} value={value} ml={1} />
        )}
      </Flex>
    </Box>
  );
}

const renderTxSpecificData = (tx: Transaction) => {
  if (isSpendTransaction(tx)) {
    const destination = getDestinationAddress(tx, tx.principal);
    if (!destination) {
      throw new Error(`Cannot calculate destination address for Tx ${tx.id}`);
    }
    return (
      <>
        <Row
          label="Recipient"
          value={destination}
          isCopyable
          explorer="accounts"
        />
        <Row label="Amount" value={formatSmidge(tx.parsed.Amount)} />
      </>
    );
  }
  if (isSelfSpawnTransaction(tx)) {
    return (
      <Row
        label="PublicKey"
        value={toHexString(tx.parsed.PublicKey, true)}
        isCopyable
      />
    );
  }

  return null;
};

type TxDetailsProps = {
  tx: Transaction | null;
  disclosure: UseDisclosureReturn;
  onClose: () => void;
  genesisTime: number;
  layerDurationSec: number;
  layersPerEpoch: number;
};

function TxDetails({
  disclosure,
  onClose,
  tx,
  genesisTime,
  layerDurationSec,
  layersPerEpoch,
}: TxDetailsProps): JSX.Element | null {
  return (
    <Portal>
      <Drawer placement="right" isOpen={disclosure.isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />

          <DrawerHeader>Transaction details</DrawerHeader>

          <DrawerBody>
            {tx === null ? (
              <Text>No transaction selected</Text>
            ) : (
              <>
                <Row
                  label="Datetime"
                  value={
                    tx.layer
                      ? formatTimestamp(
                          timestampByLayer(
                            genesisTime,
                            layerDurationSec,
                            tx.layer
                          )
                        )
                      : formatTimestamp(Date.now())
                  }
                />
                <Row label="ID" value={tx.id} isCopyable explorer="txs" />
                <Text fontSize="sm">
                  <CheckCircleIcon
                    color={getStatusColor(tx.state)}
                    mr={2}
                    mb={1}
                  />
                  {formatTxState(tx.state)}
                </Text>
                {tx.state === 'TRANSACTION_STATE_REJECTED' && tx.message && (
                  <Text
                    fontSize="xs"
                    _firstLetter={{ textTransform: 'capitalize' }}
                  >
                    {tx.message}
                  </Text>
                )}

                <Box mt={6}>
                  <Row
                    label="Principal"
                    value={tx.principal}
                    isCopyable
                    explorer="accounts"
                  />
                  <Row
                    label="Transaction type"
                    value={`${tx.template.name}.${tx.template.methodName}`}
                  />
                  {renderTxSpecificData(tx)}
                </Box>
                <Flex mt={6}>
                  <Box flex={1} pr={4}>
                    <Row label="Fee" value={formatSmidge(tx.gas.maxGas)} />
                  </Box>
                  <Box flex={1} pl={4}>
                    <Row label="Nonce" value={tx.nonce.counter.toString()} />
                  </Box>
                </Flex>
                <Flex>
                  <Box flex={1} pr={4}>
                    <Row
                      label="Layer"
                      value={tx.layer ? tx.layer.toString() : 'Waiting...'}
                      explorer="layers"
                    />
                  </Box>
                  <Box flex={1} pl={4}>
                    <Row
                      label="Epoch"
                      value={
                        tx.layer
                          ? epochByLayer(layersPerEpoch, tx.layer).toString()
                          : 'Waiting...'
                      }
                      explorer="epochs"
                    />
                  </Box>
                </Flex>
              </>
            )}
          </DrawerBody>
          <DrawerFooter>
            {tx === null ? null : (
              <ExplorerButton full dataType="txs" value={tx.id} />
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Portal>
  );
}

export default TxDetails;
