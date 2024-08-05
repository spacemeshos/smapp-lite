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
  SimpleGrid,
  Text,
  Image,
} from '@chakra-ui/react';
import { useCopyToClipboard } from '@uidotdev/usehooks';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import BackButton from '../../components/BackButton';
import useWallet from '../../store/useWallet';

import { useWalletCreation } from './WalletCreationContext';
import logo from '../../assets/logo_white.svg';

function CreateMnemonicScreen(): JSX.Element {
  const { generateMnemonic } = useWallet();
  const ctx = useWalletCreation();
  const [mnemonic, setMnemonic] = useState(ctx.mnemonic || generateMnemonic());
  const [isCopied, setIsCopied] = useState(false);
  const [, copy] = useCopyToClipboard();
  const navigate = useNavigate();

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
    <Flex flexDir="column" alignItems="center">
      <Image src={logo} width={200} my={8} />

      <Card fontSize="sm" marginY={4} paddingX={[10, 20]} paddingY={[5]}>
        <CardHeader pb={0}>
          <Text
            fontSize="28px"
            color="brand.green"
            mb={4}
            textAlign="center"
            fontFamily="Univers65"
          >
            Create a new wallet
          </Text>
          <Text as="b" fontSize="16px" textAlign="center">
            Please, save the mnemonic to the safe place and do not share with
            anyone.
          </Text>
        </CardHeader>
        <CardBody paddingY={10}>
          <SimpleGrid columns={[2, null, 3]} spacing="0px">
            {mnemonic.split(' ').map((word, idx) => (
              <Box
                // eslint-disable-next-line react/no-array-index-key
                key={`${idx}_${word}`}
                borderWidth={1}
                borderColor="spacemesh.900"
                bg="spacemesh.850"
                p={2}
              >
                <Text as="span" fontSize="xx-small">
                  {idx + 1}.{' '}
                </Text>
                {word}
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
        <CardFooter pt={0} flexDirection="column">
          <Button
            variant="white"
            onClick={onCopyClick}
            width="100%"
            disabled={isCopied}
          >
            {isCopied ? 'Copied to clipboard!' : 'Copy to clipboard'}
          </Button>
          <Text
            as="u"
            onClick={regenerateMnemonic}
            pt={2}
            pb={2}
            pl={4}
            pr={4}
            textAlign="center"
            cursor="pointer"
          >
            Generate new mnemonics
          </Text>
        </CardFooter>
      </Card>

      <Flex width="100%" justifyContent="space-between">
        <BackButton />
        <Button
          rightIcon={<IconArrowNarrowRight />}
          pt={2}
          pb={2}
          pl={4}
          pr={4}
          onClick={() => {
            ctx.setMnemonic(mnemonic);
            navigate('/create/verify-mnemonic');
          }}
        >
          Next step
        </Button>
      </Flex>
    </Flex>
  );
}

export default CreateMnemonicScreen;
