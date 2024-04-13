import { Outlet } from 'react-router-dom';

import { Flex } from '@chakra-ui/react';

import { WalletCreationProvider } from './WalletCreationContext';

function WelcomeWrapper(): JSX.Element {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      w="100%"
    >
      <WalletCreationProvider>
        <Outlet />
      </WalletCreationProvider>
    </Flex>
  );
}

export default WelcomeWrapper;
