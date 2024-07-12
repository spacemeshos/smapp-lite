import {
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from '@chakra-ui/react';

import { useCurrentHRP } from '../hooks/useNetworkSelectors';
import { useAccountsList } from '../hooks/useWalletSelectors';
import useWallet from '../store/useWallet';
import { AccountWithAddress } from '../types/wallet';
import { getAbbreviatedAddress } from '../utils/abbr';
import { safeKeyForAccount } from '../utils/wallet';

const renderAccountName = (acc: AccountWithAddress): string =>
  acc.displayName
    ? `${acc.displayName} (${getAbbreviatedAddress(acc.address)})`
    : acc.address;

function AccountSelection(): JSX.Element {
  const { selectedAccount, selectAccount } = useWallet();
  const hrp = useCurrentHRP();
  const accounts = useAccountsList(hrp);

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
      <MenuList minWidth={240} maxW="100vw" maxH="80vh" overflow="auto">
        <MenuOptionGroup
          type="radio"
          value={String(selectedAccount)}
          onChange={(val) =>
            typeof val === 'string' && selectAccount(parseInt(val, 10))
          }
        >
          {accounts.map((acc, idx) => (
            <MenuItemOption key={safeKeyForAccount(acc)} value={String(idx)}>
              {renderAccountName(acc)}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
}

export default AccountSelection;
