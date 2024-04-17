import { useRef } from 'react';

import { ListItem, OrderedList, TabPanel, Text } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Account } from '../types/account';
import { Network } from '../types/networks';
import { Transaction } from '../types/tx';

import TxListItem from './TxListItem';

type TxListProps = {
  txs: Transaction[];
  account: Account;
  network: Network;
  openTxDetails: (tx: Transaction) => void;
};

function TxList({
  txs,
  account,
  network,
  openTxDetails,
}: TxListProps): JSX.Element {
  const parentRef = useRef<HTMLDivElement>(null);

  const virt = useVirtualizer({
    count: txs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 82.5,
  });

  return (
    <TabPanel ref={parentRef} flexGrow={1} height={1} overflow="auto">
      <div
        style={{
          height: `${virt.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {txs.length === 0 && (
          <>
            <Text color="grey">
              No transactions yet.
              <br />
              <br />
              To send transactions you need to:
            </Text>
            <OrderedList color="grey">
              <ListItem>have some tokens on the balance,</ListItem>
              <ListItem>initiate a spawn transaction first.</ListItem>
            </OrderedList>
          </>
        )}
        {virt.getVirtualItems().map((virtualItem) => {
          const tx = txs[txs.length - 1 - virtualItem.index];
          if (!tx) return null;
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virt.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <TxListItem
                tx={tx}
                host={account.address}
                onClick={openTxDetails}
                genesisTime={network.genesisTime}
                layerDurationSec={network.layerDuration}
                layersPerEpoch={network.layersPerEpoch}
              />
            </div>
          );
        })}
      </div>
    </TabPanel>
  );
}

export default TxList;
