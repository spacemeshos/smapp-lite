import { Link } from 'react-router-dom';

import { Button, Image, Text } from '@chakra-ui/react';

import logo from '../../assets/logo_white.svg';

function WelcomeScreen(): JSX.Element {
  return (
    <>
      <Image src={logo} width={200} mb={8} />

      <Button as={Link} to="/create" width={280} mb={4} size="lg">
        Create new Wallet
      </Button>
      <Button as={Link} to="/create/recover" width={280} mb={4} size="lg">
        Recover your Wallet
      </Button>
      <Button as={Link} to="/import" width={280} mb={4} size="lg">
        Import Wallet file
      </Button>

      <Text fontSize="sm" width={290} textAlign="center">
        The app securely stores your encrypted Wallet file on your device.
      </Text>
    </>
  );
}

export default WelcomeScreen;
