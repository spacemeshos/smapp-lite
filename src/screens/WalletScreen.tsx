import { useState } from 'react';

import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Icon,
  IconButton,
  Spacer,
  Spinner,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { O, pipe } from '@mobily/ts-belt';
import {
  IconLockOpen2,
  IconQrcode,
  IconRefresh,
  IconSend,
} from '@tabler/icons-react';

import AccountSelection from '../components/AccountSelection';
import CopyButton from '../components/CopyButton';
import HardwareWalletConnect from '../components/HardwareWalletConnect';
import LockWallet from '../components/LockWallet';
import MainMenu from '../components/MainMenu';
import NetworkSelection from '../components/NetworksSeletion';
import NodeStatusBadge from '../components/NodeStatusBadge';
import PasswordAlert from '../components/PasswordAlert';
import ReceiveModal from '../components/Receive';
import RewardsList from '../components/RewardsList';
import SendTxModal from '../components/sendTx/SendTxModal';
import TxDetails from '../components/TxDetails';
import TxList from '../components/TxList';
import useDataRefresher from '../hooks/useDataRefresher';
import { useCurrentHRP } from '../hooks/useNetworkSelectors';
import useVaultBalance from '../hooks/useVaultBalance';
import { useCurrentAccount } from '../hooks/useWalletSelectors';
import useAccountData from '../store/useAccountData';
import useNetworks from '../store/useNetworks';
import { Transaction } from '../types/tx';
import { formatSmidge } from '../utils/smh';

function WalletScreen(): JSX.Element {
  const { isLoading, refreshData } = useDataRefresher();

  const { getCurrentNetwork } = useNetworks();
  const { getAccountData } = useAccountData();
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

  const sendTxDisclosure = useDisclosure();
  const receiveModalDisclosure = useDisclosure();

  const hrp = useCurrentHRP();
  const currentAccount = useCurrentAccount(hrp);

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

  const refreshIconSize = useBreakpointValue(
    { base: '20px', md: '24px' },
    { ssr: false }
  );

  const unlockedBalance = useVaultBalance(
    currentAccount,
    currentNetwork,
    BigInt(balance)
  );

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="flex-start"
      flexGrow={1}
      w="100%"
      pl={{ base: 0, md: 8 }}
      pr={{ base: 0, md: 8 }}
    >
      <Flex flexDir="column" alignItems="start" mb={2} w="100%">
        <Flex alignItems="center" flexDir="row" w="100%">
          <NetworkSelection />
          <Spacer />
          <HardwareWalletConnect />
          <MainMenu />
          <LockWallet />
        </Flex>
        <NodeStatusBadge />
      </Flex>
      <Divider />

      <Box w="100%" mt={4}>
        <AccountSelection />
        {O.mapWithDefault(
          currentAccount,
          <Text color="yellow">Please switch account to view balance.</Text>,
          (account) => (
            <Flex alignItems="center">
              <Spacer />
              <Text
                fontSize={{ base: '12px', md: '16px' }}
                wordBreak="break-word"
              >
                {account.address}
              </Text>
              <CopyButton value={account.address} />
              <Spacer />
            </Flex>
          )
        )}
      </Box>

      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      {O.mapWithDefault(accountData, <></>, ([account, network]) => (
        <Flex
          w="100%"
          maxW="5xl"
          flexGrow={1}
          h="100%"
          flexDir="column"
          align="center"
        >
          {O.mapWithDefault(
            currentAccount,
            <Text color="yellow">Please switch account to view balance.</Text>,
            () => (
              <Flex alignItems="center">
                <Text
                  as="b"
                  fontSize={{ base: '32px', md: '40px' }}
                  title={`${balance} Smidge`}
                >
                  {formatSmidge(balance)}
                </Text>
                <IconButton
                  ml={4}
                  width={{ base: '21px', md: '27px' }}
                  variant="whiteOutline"
                  disabled={isLoading}
                  icon={
                    isLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      <IconRefresh width={refreshIconSize} />
                    )
                  }
                  aria-label="Refresh balance"
                  onClick={() => refreshData()}
                  verticalAlign="text-bottom"
                />
              </Flex>
            )
          )}
          {O.mapWithDefault(
            unlockedBalance,
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <></>,
            ({ available }) => (
              <Text
                fontSize="md"
                color="green.300"
                title={`${available} Smidge`}
              >
                <Icon
                  as={IconLockOpen2}
                  display="inline-block"
                  boxSize={4}
                  mr={1}
                  mb={-0.5}
                />
                {formatSmidge(available)} available
              </Text>
            )
          )}
          <ButtonGroup
            mt={{ base: 4, md: 6 }}
            mb={2}
            w="full"
            justifyContent="center"
          >
            <Button
              flexDirection="row"
              onClick={sendTxDisclosure.onOpen}
              h="48px"
              w="full"
              maxW="223px"
              variant="white"
            >
              <IconSend />
              Send
            </Button>
            <Button
              flexDirection="row"
              onClick={receiveModalDisclosure.onOpen}
              h="48px"
              w="full"
              maxW="223px"
              variant="white"
            >
              <IconQrcode />
              Receive
            </Button>
            {/* <Button w="25%" h={14} flexDirection="column" p={2}>
              <IconWritingSign />
              Sign
            </Button>
            <Button w="25%" h={14} flexDirection="column" p={2}>
              <IconUserScan />
              Verify
            </Button> */}
          </ButtonGroup>
          <Tabs
            w="100%"
            display="flex"
            flexGrow={1}
            flexDirection="column"
            borderRadius={6}
            position="relative"
          >
            <TabList h={14} justifyContent="center" border="none">
              <Tab>Transactions</Tab>
              <Tab>Rewards</Tab>
            </TabList>
            <TabPanels display="flex" flex={1} flexDir="column">
              <TxList
                txs={account.transactions}
                account={account}
                network={network}
                openTxDetails={openTxDetails}
              />
              <RewardsList
                rewards={account.rewards}
                account={account}
                network={network}
              />
            </TabPanels>
          </Tabs>
          <TxDetails
            hrp={hrp}
            disclosure={txDisclosure}
            tx={selectedTx}
            onClose={closeTxDetails}
            genesisTime={network.genesisTime}
            layerDurationSec={network.layerDuration}
            layersPerEpoch={network.layersPerEpoch}
          />
        </Flex>
      ))}
      <PasswordAlert />
      <SendTxModal
        isOpen={sendTxDisclosure.isOpen}
        onClose={sendTxDisclosure.onClose}
      />
      {currentAccount && (
        <ReceiveModal
          account={currentAccount}
          isOpen={receiveModalDisclosure.isOpen}
          onClose={receiveModalDisclosure.onClose}
        />
      )}
    </Flex>
  );
}

export default WalletScreen;
