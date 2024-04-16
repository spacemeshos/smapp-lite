import { useState } from 'react';

import { CheckCircleIcon, CopyIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Divider,
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
import { O } from '@mobily/ts-belt';
import { IconWorldSearch } from '@tabler/icons-react';
import { useCopyToClipboard } from '@uidotdev/usehooks';

import useNetworks from '../store/useNetworks';
import { Transaction } from '../types/tx';
import { DEFAULT_EXPLORER_URL } from '../utils/constants';
import getExplorerUrl, { ExplorerDataType } from '../utils/getExplorerUrl';
import { toHexString } from '../utils/hexString';
import { formatSmidge } from '../utils/smh';
import {
  formatTxState,
  getDestinationAddress,
  getStatusColor,
  isSelfSpawnTransaction,
  isSpendTransaction,
} from '../utils/tx';
import { formatTimestamp } from '../utils/datetime';
import { epochByLayer, timestampByLayer } from '../utils/layers';

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
  const { getCurrentNetwork } = useNetworks();

  const explorerUrl = O.mapWithDefault(
    getCurrentNetwork(),
    DEFAULT_EXPLORER_URL,
    (net) => net.explorerUrl
  );

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
          <IconButton
            as="a"
            aria-label="Open in explorer"
            size="xs"
            href={getExplorerUrl(explorerUrl, explorer, value)}
            target="_blank"
            icon={<IconWorldSearch size={14} />}
            ml={1}
          />
        )}
      </Flex>
    </Box>
  );
}

Row.defaultProps = {
  isCopyable: false,
  render: (value: string) => value,
};

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
  const { getCurrentNetwork } = useNetworks();
  const explorerUrl = O.mapWithDefault(
    getCurrentNetwork(),
    DEFAULT_EXPLORER_URL,
    (net) => net.explorerUrl
  );

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
                  value={formatTimestamp(
                    timestampByLayer(genesisTime, layerDurationSec, tx.layer)
                  )}
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
                      value={tx.layer.toString()}
                      explorer="layers"
                    />
                  </Box>
                  <Box flex={1} pl={4}>
                    <Row
                      label="Epoch"
                      value={epochByLayer(layersPerEpoch, tx.layer).toString()}
                      explorer="epochs"
                    />
                  </Box>
                </Flex>
              </>
            )}
          </DrawerBody>
          <DrawerFooter>
            {tx === null ? null : (
              <Button
                as="a"
                href={getExplorerUrl(explorerUrl, 'txs', tx.id)}
                target="_blank"
                leftIcon={<IconWorldSearch />}
                w="100%"
              >
                Open in Explorer
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Portal>
  );
}

export default TxDetails;
