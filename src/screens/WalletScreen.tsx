import { Box, Flex, Text } from '@chakra-ui/react';

import useWallet from '../store/useWallet';

function WalletScreen(): JSX.Element {
  const { wallet } = useWallet();
  return (
    <Box>
      <Flex
        as="header"
        direction="column"
        alignItems="center"
        justifyContent="center"
        h="100vh"
        fontSize="3xl"
      >
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
