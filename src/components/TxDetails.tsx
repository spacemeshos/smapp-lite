import { CheckCircleIcon } from '@chakra-ui/icons';
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
  Text,
  UseDisclosureReturn,
} from '@chakra-ui/react';

import { Transaction } from '../types/tx';
import { generateAddress } from '../utils/bech32';
import { formatTimestamp } from '../utils/datetime';
import { ExplorerDataType } from '../utils/getExplorerUrl';
import { toHexString } from '../utils/hexString';
import { epochByLayer, timestampByLayer } from '../utils/layers';
import { formatSmidge } from '../utils/smh';
import {
  formatTxState,
  getDestinationAddress,
  getStatusColor,
  isDrainTransaction,
  isMultiSigSpawnTransaction,
  isSingleSigSpawnTransaction,
  isSpendTransaction,
  isVaultSpawnTransaction,
  isVestingSpawnTransaction,
} from '../utils/tx';

import CopyButton from './CopyButton';
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
  return (
    <Box mb={2}>
      <Text fontSize="xx-small" color="gray" userSelect="none">
        {label}
      </Text>
      <Flex flexDirection="row" fontSize="sm">
        <Text flex={1} wordBreak="break-word" pr={1}>
          {value}
        </Text>
        {isCopyable && <CopyButton value={value} withOutline />}
        {explorer && (
          <ExplorerButton dataType={explorer} value={value} ml={1} />
        )}
      </Flex>
    </Box>
  );
}

const renderTxSpecificData = (hrp: string, tx: Transaction) => {
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
  if (isSingleSigSpawnTransaction(tx)) {
    return (
      <Row
        label="PublicKey"
        value={toHexString(tx.parsed.PublicKey, true)}
        isCopyable
      />
    );
  }
  if (isMultiSigSpawnTransaction(tx) || isVestingSpawnTransaction(tx)) {
    return (
      <>
        <Row
          label="Required signatures"
          value={String(tx.parsed.Required)}
          isCopyable
        />
        <Row
          label="Public Keys"
          value={tx.parsed.PublicKeys.map((x) => toHexString(x, true)).join(
            ', '
          )}
          isCopyable
        />
      </>
    );
  }
  if (isVaultSpawnTransaction(tx)) {
    return (
      <>
        <Row
          label="Owner"
          value={generateAddress(tx.parsed.Owner, hrp)}
          isCopyable
        />
        <Row label="Total Amount" value={formatSmidge(tx.parsed.TotalAmount)} />
        <Row
          label="Initial Unlocked Amount"
          value={formatSmidge(tx.parsed.InitialUnlockAmount)}
        />
        <Row
          label="Vesting Start (Layer)"
          value={String(tx.parsed.VestingStart)}
        />
        <Row label="Vesting End (Layer)" value={String(tx.parsed.VestingEnd)} />
      </>
    );
  }
  if (isDrainTransaction(tx)) {
    return (
      <>
        <Row
          label="Vault"
          value={generateAddress(tx.parsed.Vault, hrp)}
          isCopyable
        />
        <Row label="Amount" value={formatSmidge(tx.parsed.Amount)} />
        <Row
          label="Destination"
          value={generateAddress(tx.parsed.Destination, hrp)}
          isCopyable
        />
      </>
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
  hrp: string;
};

function TxDetails({
  disclosure,
  onClose,
  tx,
  genesisTime,
  layerDurationSec,
  layersPerEpoch,
  hrp,
}: TxDetailsProps): JSX.Element | null {
  return (
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
                {renderTxSpecificData(hrp, tx)}
              </Box>
              <Flex mt={6}>
                <Box flex={1} pr={4}>
                  <Row
                    label="Fee"
                    value={formatSmidge(
                      BigInt(tx.gas.maxGas) * BigInt(tx.gas.price)
                    )}
                  />
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
  );
}

export default TxDetails;
