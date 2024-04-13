import { Link } from 'react-router-dom';

import { Button, Image, Text } from '@chakra-ui/react';

import logo from '../../assets/logo_white.svg';

function WelcomeScreen(): JSX.Element {
  return (
    <>
      <Image src={logo} width={200} mb={8} />

      <Button as={Link} to="/create" width="100%" mb={4} size="lg">
        Create new wallet
      </Button>
      <Button as={Link} to="/create/recover" width="100%" mb={4} size="lg">
        Recover from mnemonics
      </Button>
      <Button as={Link} to="/import" width="100%" mb={4} size="lg">
        Import wallet file
      </Button>

      <Text fontSize="sm" width={290} textAlign="center">
        Application stores wallet file encrypted with AES-GCM on your local
        machine.
      </Text>
    </>
  );
}

export default WelcomeScreen;
