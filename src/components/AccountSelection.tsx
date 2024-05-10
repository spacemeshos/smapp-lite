import { useMemo } from 'react';

import {
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from '@chakra-ui/react';
import { O } from '@mobily/ts-belt';

import useNetworks from '../store/useNetworks';
import useWallet from '../store/useWallet';
import { AccountWithAddress } from '../types/wallet';
import { getAbbreviatedAddress } from '../utils/abbr';
import { DEFAULT_HRP } from '../utils/constants';

const renderAccountName = (acc: AccountWithAddress): string =>
  acc.displayName
    ? `${acc.displayName} (${getAbbreviatedAddress(acc.address)})`
    : acc.address;

function AccountSelection(): JSX.Element {
  const { listAccounts, selectedAccount, selectAccount } = useWallet();
  const { getCurrentNetwork } = useNetworks();
  const currentNetwork = getCurrentNetwork();

  const hrp = O.mapWithDefault(currentNetwork, DEFAULT_HRP, (net) => net.hrp);
  const accounts = useMemo(() => listAccounts(hrp), [listAccounts, hrp]);

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="outline"
        ml={2}
        mb={2}
        textTransform="uppercase"
        fontSize="xx-small"
        float="right"
      >
        Switch
      </MenuButton>
      <MenuList minWidth={240}>
        <MenuOptionGroup
          type="radio"
          value={String(selectedAccount)}
          onChange={(val) =>
            typeof val === 'string' && selectAccount(parseInt(val, 10))
          }
        >
          {accounts.map((acc, idx) => (
            <MenuItemOption key={acc.address} value={String(idx)}>
              {renderAccountName(acc)}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
}

export default AccountSelection;
