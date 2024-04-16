import { useState } from 'react';

import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  ListItem,
  OrderedList,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { O, pipe } from '@mobily/ts-belt';
import {
  IconCake,
  IconQrcode,
  IconRefresh,
  IconSend,
  IconUserScan,
  IconWritingSign,
} from '@tabler/icons-react';

import AccountSelection from '../components/AccountSelection';
import LockWallet from '../components/LockWallet';
import MainMenu from '../components/MainMenu';
import NetworkSelection from '../components/NetworksSeletion';
import NodeStatusBadge from '../components/NodeStatusBadge';
import TxDetails from '../components/TxDetails';
import TxListItem from '../components/TxListItem';
import useAccountHandlers from '../hooks/useAccountHandlers';
import useDataRefresher from '../hooks/useDataRefresher';
import useAccountData from '../store/useAccountData';
import useNetworks from '../store/useNetworks';
import useWallet from '../store/useWallet';
import { Transaction } from '../types/tx';
import { DEFAULT_HRP } from '../utils/constants';
import { formatSmidge } from '../utils/smh';

function WalletScreen(): JSX.Element {
  useDataRefresher();

  const { getCurrentAccount } = useWallet();
  const { getCurrentNetwork } = useNetworks();
  const { getAccountData } = useAccountData();
  const { fetchAccountState } = useAccountHandlers();
  const currentNetwork = getCurrentNetwork();

  const txDisclosure = useDisclosure();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const openTxDetails = (tx: Transaction) => {
    setSelectedTx(tx);
    txDisclosure.onOpen();
  };
  const closeTxDetails = () => {
    setSelectedTx(null);
    txDisclosure.onClose();
  };

  const hrp = O.mapWithDefault(currentNetwork, DEFAULT_HRP, (net) => net.hrp);
  const currentAccount = getCurrentAccount(hrp);

  const accountData = pipe(
    O.zip(currentNetwork, currentAccount),
    O.flatMap(([net, acc]) => getAccountData(net.genesisID, acc.address)),
    O.zip(currentNetwork)
  );
  const balance = O.mapWithDefault(
    accountData,
    '0',
    ([account]) => account.state.current.balance
  );

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      flexGrow={1}
      width="100%"
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
        borderRadius={6}
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

      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      {O.mapWithDefault(accountData, <></>, ([account, network]) => (
        <>
          <ButtonGroup mt={2} mb={2} w="100%">
            <Button w="20%" h={14} flexDirection="column" p={2}>
              <IconSend />
              Send
            </Button>
            <Button w="20%" h={14} flexDirection="column" p={2}>
              <IconCake />
              Spawn
            </Button>
            <Button w="20%" h={14} flexDirection="column" p={2}>
              <IconQrcode />
              Receive
            </Button>
            <Button w="20%" h={14} flexDirection="column" p={2}>
              <IconWritingSign />
              Sign
            </Button>
            <Button w="20%" h={14} flexDirection="column" p={2}>
              <IconUserScan />
              Verify
            </Button>
          </ButtonGroup>
          <Tabs
            w="100%"
            display="flex"
            flexGrow={1}
            flexDirection="column"
            bgColor="blackAlpha.400"
            borderRadius={6}
            colorScheme="green"
          >
            <TabList h={14}>
              <Tab>Transactions</Tab>
              <Tab>Rewards</Tab>
            </TabList>
            <TabPanels height={1} flexGrow={1} overflow="auto">
              <TabPanel>
                {account.transactions.length === 0 && (
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
                {account.transactions.reverse().map((tx) => (
                  <TxListItem
                    key={tx.id}
                    tx={tx}
                    host={account.address}
                    onClick={openTxDetails}
                    genesisTime={network.genesisTime}
                    layerDurationSec={network.layerDuration}
                    layersPerEpoch={network.layersPerEpoch}
                  />
                ))}
              </TabPanel>
              <TabPanel>Rewards....</TabPanel>
            </TabPanels>
          </Tabs>
          <TxDetails
            disclosure={txDisclosure}
            tx={selectedTx}
            onClose={closeTxDetails}
            genesisTime={network.genesisTime}
            layerDurationSec={network.layerDuration}
            layersPerEpoch={network.layersPerEpoch}
          />
        </>
      ))}
    </Flex>
  );
}

export default WalletScreen;
