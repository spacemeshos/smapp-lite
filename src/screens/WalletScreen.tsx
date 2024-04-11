import { useMemo } from 'react';

import {
  Box,
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
} from '@chakra-ui/react';
import { IconRefresh } from '@tabler/icons-react';

import LockWallet from '../components/LockWallet';
import MainMenu from '../components/MainMenu';
import NetworkSelection from '../components/NetworksSeletion';
import useAccountData from '../store/useAccountData';
import useAccountHandlers from '../store/useAccountHandlers';
import useDataRefresher from '../store/useDataRefresher';
import useNetworks from '../store/useNetworks';
import useWallet from '../store/useWallet';
import { Account } from '../types/wallet';
import { getAbbreviatedAddress } from '../utils/address';

const renderAccountName = (acc: Account): string =>
  acc.displayName
    ? `${acc.displayName} (${getAbbreviatedAddress(acc.address)})`
    : acc.address;

function WalletScreen(): JSX.Element {
  const { listAccounts, currentAccount, selectAccount } = useWallet();
  const { getCurrentHRP } = useNetworks();
  const { states } = useAccountData();
  const { fetchAccountState } = useAccountHandlers();

  const hrp = getCurrentHRP();
  const accounts = useMemo(() => listAccounts(hrp), [listAccounts, hrp]);

  useDataRefresher();

  return (
    <Box>
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        h="100vh"
        fontSize="3xl"
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          fontSize="sm"
        >
          <NetworkSelection />
          <Box>
            <MainMenu />
            <LockWallet />
          </Box>
        </Flex>
        <Box
          mt={2}
          p={4}
          w="100%"
          fontSize="sm"
          bgColor="blackAlpha.400"
          borderRadius={8}
        >
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
                value={String(currentAccount)}
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

          <Text fontWeight="bold" color="green.300">
            {accounts[currentAccount]?.displayName || 'Unknown account'}
          </Text>
          <Text>{accounts[currentAccount]?.address}</Text>
          <Text fontSize="3xl" mt={4}>
            {states[accounts[currentAccount]?.address]?.current?.balance} SMH
            {accounts[currentAccount] && (
              <IconButton
                ml={2}
                size="sm"
                variant="outline"
                icon={<IconRefresh width={18} />}
                aria-label="Refresh balance"
                onClick={() =>
                  fetchAccountState(accounts[currentAccount].address)
                }
              />
            )}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default WalletScreen;
