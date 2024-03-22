import { Box, Button, Flex, Image, Text } from '@chakra-ui/react';

import logo from '../assets/logo_white.svg';
import ThemeToggleButton from '../components/ThemeToggleButton';
import useWallet from '../store/useWallet';

function WelcomeScreen(): JSX.Element {
  const { createWallet } = useWallet();
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
        <Image src={logo} />
        <Text fontSize="md" mb={4}>
          Spacemesh Wallet
        </Text>
        <Button
          onClick={() => {
            createWallet('qwe');
          }}
        >
          Create new wallet
        </Button>
        <Button>Recover from mnemonics</Button>
        <Button>Import wallet file</Button>
      </Flex>
      <ThemeToggleButton pos="fixed" bottom="2" right="2" />
    </Box>
  );
}

export default WelcomeScreen;
