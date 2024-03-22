import { Outlet } from 'react-router-dom';

import { Box, Flex } from '@chakra-ui/react';

function WelcomeWrapper(): JSX.Element {
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
        <Outlet />
      </Flex>
    </Box>
  );
}

export default WelcomeWrapper;
