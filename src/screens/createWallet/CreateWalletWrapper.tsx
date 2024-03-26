import { Outlet } from 'react-router-dom';

import { Box, Flex } from '@chakra-ui/react';

import { WalletCreationProvider } from './WalletCreationContext';

function WelcomeWrapper(): JSX.Element {
  return (
    <Box>
      <Flex direction="column" alignItems="center" justifyContent="center">
        <WalletCreationProvider>
          <Outlet />
        </WalletCreationProvider>
      </Flex>
    </Box>
  );
}

export default WelcomeWrapper;
