import { Link } from 'react-router-dom';

import { Button, Flex, Image, Text } from '@chakra-ui/react';
import { IconArrowNarrowRight } from '@tabler/icons-react';

import logo from '../../assets/logo_white.svg';

function WelcomeScreen(): JSX.Element {
  return (
    <Flex flexDir="column" alignItems="center" minH="80vh">
      <Image src={logo} width={200} my={8} />

      <Flex
        flexDir="column"
        alignItems="center"
        justifyContent="center"
        px={{ base: 4, md: 24 }}
        py={12}
        textAlign="center"
        flex="1"
      >
        <Text
          fontSize={{ base: '20px', md: '30px' }}
          fontFamily="Univers63"
          color="brand.green"
        >
          THE OFFICIAL
        </Text>
        <Text
          fontSize={{ base: '35px', md: '45px' }}
          fontFamily="Univers93"
          color="brand.green"
          mt={2}
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
          fontFamily="Univers55"
          fontWeight={400}
        >
          Create new wallet
        </Button>

        <Text
          fontSize="sm"
          color="brand.lightAlphaGray"
          fontFamily="Univers45"
          fontWeight={300}
        >
          Already have one?
        </Text>

        <Flex gap={2} justifyContent="flex-end" alignItems="center">
          <Text
            as={Link}
            to="/create/recover"
            color="brand.lightAlphaGray"
            fontFamily="Univers55"
            fontWeight={400}
            fontSize="sm"
            textDecoration="underline"
          >
            Recover your Wallet
          </Text>
          <Text
            color="brand.lightAlphaGray"
            fontFamily="Univers55"
            fontWeight={400}
            fontSize="sm"
          >
            or
          </Text>
          <Text
            as={Link}
            to="/import"
            color="brand.lightAlphaGray"
            fontFamily="Univers55"
            fontWeight={400}
            fontSize="sm"
            textDecoration="underline"
          >
            Import Wallet file
          </Text>
        </Flex>

        <Text width={340} pt={8}>
          <Text
            as="b"
            color="brand.lightAlphaGray"
            fontFamily="Univers65"
            fontWeight={700}
            fontSize={{ base: '13px', md: '16px' }}
          >
            The app securely stores your encrypted Wallet file on your device.
          </Text>
        </Text>
      </Flex>
    </Flex>
  );
}

export default WelcomeScreen;
