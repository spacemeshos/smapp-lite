import { useRef } from 'react';

import { Link, TabPanel, Text } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Account } from '../types/account';
import { Network } from '../types/networks';
import { Reward } from '../types/reward';

import RewardListItem from './RewardListItem';

type RewardsListProps = {
  rewards: Reward[];
  account: Account;
  network: Network;
};

function RewardsList({
  rewards,
  account,
  network,
}: RewardsListProps): JSX.Element {
  const parentRef = useRef<HTMLDivElement>(null);

  const virt = useVirtualizer({
    count: rewards.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
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
        {account.rewards.length === 0 && (
          <Text color="grey">
            No rewards for this account.
            <br />
            Check out{' '}
            <Link
              as="a"
              href="https://docs.spacemesh.io/docs/start"
              target="_blank"
            >
              Smesher&apos;s guide
            </Link>{' '}
            if you want to start smeshing.
          </Text>
        )}
        {virt.getVirtualItems().map((virtualItem) => {
          const reward = rewards[rewards.length - 1 - virtualItem.index];
          if (!reward) return null;

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
              <RewardListItem
                key={`${reward.smesher}_${reward.layerPaid}`}
                reward={reward}
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

export default RewardsList;
