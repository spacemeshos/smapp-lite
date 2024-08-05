import { Link } from 'react-router-dom';
import { Button, Flex, Image, Text } from '@chakra-ui/react';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import logo from '../../assets/logo_white.svg';

function WelcomeScreen(): JSX.Element {
  return (
    <Flex flexDir="column" alignItems="center" height="100%">
      <Image src={logo} width={200} my={8} />

      <Flex
        justifySelf="center"
        bg="spacemesh.850"
        justifyItems="center"
        px={[0, 24]}
        py={12}
        alignItems="center"
        flexDir="column"
        marginY={4}
      >
        <Text
          fontSize={['20px', '30px']}
          textAlign="center"
          fontFamily="Univers63"
          color="brand.green"
        >
          THE OFFICIAL
        </Text>
        <Text
          fontSize={['35px', '45px']}
          textAlign="center"
          fontFamily="Univers93"
          color="brand.green"
        >
          SPACEMESH WALLET
        </Text>

        <Button
          as={Link}
          to="/create"
          width={280}
          size="lg"
          my={10}
          rightIcon={<IconArrowNarrowRight />}
        >
          Create new wallet
        </Button>

        <Text fontSize="sm" textAlign="center">
          Already have one?
        </Text>

        <Flex gap={2}>
          <Text as={Link} to="/create/recover" fontSize="sm" textAlign="center">
            <Text as="u">Recover your Wallet </Text>
          </Text>
          <Text fontSize="sm" textAlign="center">
            or
          </Text>
          <Text as={Link} to="/import" fontSize="sm" textAlign="center">
            <Text as="u"> Import Wallet file</Text>
          </Text>
        </Flex>

        <Text fontSize="sm" width={290} textAlign="center" pt={30}>
          <Text as="b">
            The app securely stores your encrypted Wallet file on your device.
          </Text>
        </Text>
      </Flex>
    </Flex>
  );
}

export default WelcomeScreen;
