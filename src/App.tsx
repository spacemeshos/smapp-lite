import { useState } from 'react';

import { Box, Button, Flex, Link, Spinner, Text } from '@chakra-ui/react';

import ThemeToggleButton from './components/ThemeToggleButton';

function App(): JSX.Element {
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
        <Spinner speed="1s" size="xl" mb={4} />
        <Text fontSize="sm">Spacemesh Wallet is loading...</Text>
      </Flex>
      <ThemeToggleButton pos="fixed" bottom="2" right="2" />
    </Box>
  );
}

export default App;
