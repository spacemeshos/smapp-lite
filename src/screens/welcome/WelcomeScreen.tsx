import { Link } from 'react-router-dom';

import { Button, Image, Text } from '@chakra-ui/react';

import logo from '../../assets/logo_white.svg';

function WelcomeScreen(): JSX.Element {
  return (
    <>
      <Image src={logo} />
      <Text fontSize="md" mb={4}>
        Spacemesh Wallet
      </Text>
      <Button as={Link} to="/create">
        Create new wallet
      </Button>
      <Button as={Link} to="/recover">
        Recover from mnemonics
      </Button>
      <Button as={Link} to="/import">
        Import wallet file
      </Button>
    </>
  );
}

export default WelcomeScreen;
