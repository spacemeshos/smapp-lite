import { useState } from 'react';

import {
  Box,
  Button,
  ButtonGroup,
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

  const unlockedBalance = useVaultBalance(
    currentAccount,
    currentNetwork,
    BigInt(balance)
  );

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      flexGrow={1}
    >
      <Flex
        // justifyContent="space-between"
        alignItems="center"
        width="100%"
        fontSize="sm"
      >
        <NetworkSelection />
        <HardwareWalletConnect />
        <Spacer />
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
              <Text>
                {account.address}
                <CopyButton value={account.address} />
              </Text>
              <Text fontSize="3xl" mt={4} title={`${balance} Smidge`}>
                {formatSmidge(balance)}
                <IconButton
                  ml={2}
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                  icon={
                    isLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      <IconRefresh width={18} />
                    )
                  }
                  aria-label="Refresh balance"
                  onClick={() => refreshData()}
                  verticalAlign="text-bottom"
                />
              </Text>
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
            </>
          )
        )}
      </Box>

      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      {O.mapWithDefault(accountData, <></>, ([account, network]) => (
        <>
          <ButtonGroup mt={2} mb={2} w="100%">
            <Button
              w="50%"
              h={14}
              flexDirection="column"
              p={2}
              onClick={sendTxDisclosure.onOpen}
            >
              <IconSend />
              Send
            </Button>
            <Button
              w="50%"
              h={14}
              flexDirection="column"
              p={2}
              onClick={receiveModalDisclosure.onOpen}
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
            bgColor="blackAlpha.400"
            borderRadius={6}
            colorScheme="green"
            position="relative"
          >
            <Box
              borderBottomRadius={6}
              bgGradient="linear(to-b, rgba(0,0,0,0), blackAlpha.400)"
              w="100%"
              h="100px"
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              userSelect="none"
            />
            <TabList h={14}>
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
        </>
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
