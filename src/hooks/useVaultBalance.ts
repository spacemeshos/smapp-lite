import { useEffect, useMemo, useState } from 'react';

import { O, pipe } from '@mobily/ts-belt';
import { StdPublicKeys } from '@spacemesh/sm-codec';

import { Network } from '../types/networks';
import { AccountWithAddress } from '../types/wallet';
import { getVaultUnlockedAmount } from '../utils/account';
import { getCurrentTimeUTC } from '../utils/datetime';
import { layerByTimestamp } from '../utils/layers';
import { AnySpawnArguments, VaultSpawnArguments } from '../utils/templates';

const useVaultBalance = (
  currentAccount: O.Option<AccountWithAddress<AnySpawnArguments>>,
  currentNetwork: O.Option<Network>,
  balance: bigint
) => {
  const [now, setNow] = useState(getCurrentTimeUTC());

  useEffect(() => {
    let t: ReturnType<typeof setInterval> | null = null;
    O.map(currentNetwork, (net) => {
      t = setInterval(
        () => setNow(getCurrentTimeUTC()),
        net.layerDuration * 1000
      );
      return t;
    });
    return () => {
      if (t) {
        clearInterval(t);
      }
    };
  }, [currentNetwork]);

  return useMemo(
    () =>
      pipe(
        O.flatMap(currentAccount, (acc) =>
          acc.templateAddress === StdPublicKeys.Vault
            ? O.Some(acc.spawnArguments as VaultSpawnArguments)
            : O.None
        ),
        O.zip(currentNetwork),
        O.map(([args, net]) =>
          getVaultUnlockedAmount(
            args,
            // Calculate unlocked amount for the next layer
            layerByTimestamp(net.genesisTime, net.layerDuration, now) + 1,
            balance
          )
        )
      ),
    [balance, currentAccount, currentNetwork, now]
  );
};

export default useVaultBalance;
