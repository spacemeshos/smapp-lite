import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { O, pipe } from '@mobily/ts-belt';
import { IconRefresh } from '@tabler/icons-react';

import AccountSelection from '../components/AccountSelection';
import LockWallet from '../components/LockWallet';
import MainMenu from '../components/MainMenu';
import NetworkSelection from '../components/NetworksSeletion';
import NodeStatusBadge from '../components/NodeStatusBadge';
import useAccountHandlers from '../hooks/useAccountHandlers';
import useDataRefresher from '../hooks/useDataRefresher';
import useAccountData from '../store/useAccountData';
import useNetworks from '../store/useNetworks';
import useWallet from '../store/useWallet';
import { DEFAULT_HRP } from '../utils/constants';
import { formatSmidge } from '../utils/smh';

function WalletScreen(): JSX.Element {
  useDataRefresher();

  const { getCurrentAccount } = useWallet();
  const { getCurrentNetwork } = useNetworks();
  const { getAccountData } = useAccountData();
  const { fetchAccountState } = useAccountHandlers();

  const currentNetwork = getCurrentNetwork();
  const hrp = O.mapWithDefault(currentNetwork, DEFAULT_HRP, (net) => net.hrp);

  const currentAccount = getCurrentAccount(hrp);
  const accountData = pipe(
    O.zip(currentNetwork, currentAccount),
    O.flatMap(([net, acc]) => getAccountData(net.genesisID, acc.address))
  );
  const balance = O.mapWithDefault(
    accountData,
    '0',
    (data) => data.state.current.balance
  );

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

        <NodeStatusBadge />

        <Box
          mt={2}
          p={4}
          w="100%"
          fontSize="sm"
          bgColor="blackAlpha.400"
          borderRadius={8}
        >
          <AccountSelection />

          <Text fontWeight="bold" color="green.300">
            {O.mapWithDefault(
              currentAccount,
              'No account',
              (acc) => acc.displayName
            )}
          </Text>
          {O.mapWithDefault(
            currentAccount,
            <Text color="yellow">Please switch account to view balance.</Text>,
            (account) => (
              <>
                <Text>{account.address}</Text>
                <Text fontSize="3xl" mt={4}>
                  {formatSmidge(balance)}
                  <IconButton
                    ml={2}
                    size="sm"
                    variant="outline"
                    icon={<IconRefresh width={18} />}
                    aria-label="Refresh balance"
                    onClick={() => fetchAccountState(account.address)}
                  />
                </Text>
              </>
            )
          )}
        </Box>
      </Flex>
    </Box>
  );
}

export default WalletScreen;
