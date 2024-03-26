import { Outlet } from 'react-router-dom';

import { Box, Flex } from '@chakra-ui/react';

function WelcomeWrapper(): JSX.Element {
  return (
    <Box>
      <Flex direction="column" alignItems="center" justifyContent="center">
        <Outlet />
      </Flex>
    </Box>
  );
}

export default WelcomeWrapper;
