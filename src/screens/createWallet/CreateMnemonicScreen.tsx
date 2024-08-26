import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Image,
  SimpleGrid,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import { useCopyToClipboard } from '@uidotdev/usehooks';

import logo from '../../assets/logo_white.svg';
import BackButton from '../../components/BackButton';
import useWallet from '../../store/useWallet';

import { useWalletCreation } from './WalletCreationContext';

function CreateMnemonicScreen(): JSX.Element {
  const { generateMnemonic } = useWallet();
  const ctx = useWalletCreation();
  const [mnemonic, setMnemonic] = useState(ctx.mnemonic || generateMnemonic());
  const [isCopied, setIsCopied] = useState(false);
  const [, copy] = useCopyToClipboard();
  const navigate = useNavigate();
  const columns = useBreakpointValue({ base: 2, md: 3 }) ?? 2;

  let timeout: ReturnType<typeof setTimeout>;

  const regenerateMnemonic = () => {
    setMnemonic(generateMnemonic());
  };
  const onCopyClick = () => {
    clearTimeout(timeout);
    copy(mnemonic);
    setIsCopied(true);
    timeout = setTimeout(() => {
      setIsCopied(false);
    }, 5000);
  };

  return (
    <Flex
      flexDir="column"
      alignItems="center"
      w={{ base: '100%', md: '75%' }}
      maxW="4xl"
    >
      <Image src={logo} width={200} my={8} />

      <Card
        fontSize="sm"
        marginY={4}
        padding={0}
        w={{ base: '100%', md: '90%' }}
      >
        <CardHeader pb={0} textAlign="center">
          <Text
            color="brand.green"
            mb={4}
            textAlign="center"
            fontSize={{ base: '24px', md: '30px' }}
            fontFamily="Univers63"
          >
            Create a new wallet
          </Text>
          <Text
            as="b"
            textAlign="center"
            color="brand.lightGray"
            fontSize={{ base: '16px', md: '20px' }}
            fontFamily="Univers65"
          >
            Please, save the mnemonic to the safe place and do not share with
            anyone.
          </Text>
        </CardHeader>
        <Text
          as="u"
          onClick={regenerateMnemonic}
          paddingX={4}
          paddingY={2}
          textAlign="center"
          cursor="pointer"
        >
          Generate new mnemonics
        </Text>
        <CardBody paddingY={10}>
          <SimpleGrid columns={columns} spacing="0px">
            {mnemonic.split(' ').map((word, idx) => {
              const isLeftColumn = idx % columns === 0;
              const isRightColumn = (idx + 1) % columns === 0;
              const isTopRow = idx < columns;
              const isBottomRow = idx >= mnemonic.split(' ').length - columns;

              return (
                <Box
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${idx}_${word}`}
                  borderTopWidth={isTopRow ? '0px' : '1px'}
                  borderBottomWidth={isBottomRow ? '0px' : '1px'}
                  borderLeftWidth={isLeftColumn ? '0px' : '1px'}
                  borderRightWidth={isRightColumn ? '0px' : '1px'}
                  borderColor="whiteAlpha.400"
                  p={{ base: 2, md: 4 }}
                >
                  <Text
                    as="span"
                    color="whiteAlpha.400"
                    fontFamily="Univers55"
                    fontSize={{ base: '12px', md: '14px' }}
                  >
                    {idx + 1}.{' '}
                  </Text>
                  {word}
                </Box>
              );
            })}
          </SimpleGrid>
        </CardBody>

        <CardFooter pt={0} flexDirection="column">
          <Flex flexDir="column" display={{ base: 'flex', md: 'none' }}>
            <Button
              variant="ghostWhite"
              onClick={onCopyClick}
              width="100%"
              disabled={isCopied}
              as="u"
            >
              {isCopied ? 'Copied to clipboard!' : 'Copy to clipboard'}
            </Button>
          </Flex>
        </CardFooter>
      </Card>

      <Flex width="100%" justifyContent="space-between">
        <BackButton />
        <Flex flexDir="column" display={{ base: 'none', md: 'flex' }}>
          <Button
            variant="ghostWhite"
            onClick={onCopyClick}
            width="100%"
            disabled={isCopied}
            as="u"
          >
            {isCopied ? 'Copied to clipboard!' : 'Copy to clipboard'}
          </Button>
        </Flex>
        <Button
          rightIcon={<IconArrowNarrowRight />}
          paddingX={4}
          paddingY={2}
          onClick={() => {
            ctx.setMnemonic(mnemonic);
            navigate('/create/verify-mnemonic');
          }}
          variant="solid"
        >
          Next step
        </Button>
      </Flex>
    </Flex>
  );
}

export default CreateMnemonicScreen;
