import { Box, Flex, Text } from '@chakra-ui/react';

import LockWallet from '../components/LockWallet';
import MainMenu from '../components/MainMenu';
import NetworkSelection from '../components/NetworksSeletion';
import useWallet from '../store/useWallet';

function WalletScreen(): JSX.Element {
  const { wallet } = useWallet();
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
        <Text fontSize="md" mb={4}>
          Wallet
        </Text>
        {wallet?.keychain.map((kp) => (
          <Text key={kp.path} fontSize="sm">
            {kp.publicKey}
          </Text>
        ))}
      </Flex>
    </Box>
  );
}

export default WalletScreen;
