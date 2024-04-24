import { Outlet } from 'react-router-dom';

import { Flex } from '@chakra-ui/react';

function WelcomeWrapper(): JSX.Element {
  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      w="100%"
    >
      <Outlet />
    </Flex>
  );
}

export default WelcomeWrapper;
